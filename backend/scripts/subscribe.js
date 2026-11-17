import express from "express";
import crypto from "crypto";
import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import {
  createAuthenticatedClient,
  isPendingGrant,
} from "@interledger/open-payments";

const app = express();
const PORT = 3000;
const CALLBACK_URL = process.env.CALLBACK_URL; // http://localhost:3000/subscriptions/callback

const prisma = new PrismaClient();

// Grants waiting for the member to approve (short-lived, fine in memory)
const pending = new Map(); // nonce -> { memberWallet, fee, continueUri, continueToken }

const client = await createAuthenticatedClient({
  walletAddressUrl: process.env.OWNER_WALLET_URL,
  privateKey: process.env.OP_PRIVATE_KEY_PATH,
  keyId: process.env.OP_KEY_ID,
});

// ---------------------------------------------------------------
// Step 1: member clicks "Subscribe"
// Test with: http://localhost:3000/subscribe
// ---------------------------------------------------------------
app.get("/subscribe", async (req, res) => {
  try {
    const walletUrl = req.query.wallet || process.env.MEMBER_WALLET_URL;
    const fee = req.query.fee || "2500"; // minor units: 2500 = 25.00
    console.log("member wallet:", walletUrl);

    const memberWallet = await client.walletAddress.get({ url: walletUrl });
    const nonce = crypto.randomUUID();

    const grant = await client.grant.request(
      { url: memberWallet.authServer },
      {
        access_token: {
          access: [
            {
              type: "outgoing-payment",
              actions: ["list", "read", "create"],
              identifier: memberWallet.id,
              limits: {
                debitAmount: {
                  value: fee,
                  assetCode: memberWallet.assetCode,
                  assetScale: memberWallet.assetScale,
                },
                // 12 monthly cycles starting now
                interval: `R12/${new Date().toISOString()}/P1M`,
              },
            },
          ],
        },
        interact: {
          start: ["redirect"],
          finish: { method: "redirect", uri: CALLBACK_URL, nonce },
        },
      }
    );

    if (!isPendingGrant(grant)) {
      return res.status(500).send("Expected an interactive grant");
    }

    pending.set(nonce, {
      memberWallet,
      fee,
      continueUri: grant.continue.uri,
      continueToken: grant.continue.access_token.value,
    });

    res.redirect(grant.interact.redirect); // member approves in their wallet
  } catch (err) {
    console.error("Subscribe failed:", err);
    res.status(500).send("Subscribe failed, check the terminal");
  }
});

// ---------------------------------------------------------------
// Step 2: wallet sends the member back here after approval
// ---------------------------------------------------------------
app.get("/subscriptions/callback", async (req, res) => {
  try {
    const { interact_ref } = req.query;
    if (!interact_ref) return res.status(400).send("Missing interact_ref");

    // Single test member: take the most recent pending grant.
    // With several members, store the nonce in a cookie/session instead.
    const entry = [...pending.entries()].pop();
    if (!entry) return res.status(404).send("No pending subscription");
    const [nonce, p] = entry;

    const grant = await client.grant.continue(
      { url: p.continueUri, accessToken: p.continueToken },
      { interact_ref }
    );

    await prisma.subscription.create({
      data: {
        memberWallet: p.memberWallet.id,
        feeMinor: Number(p.fee),
        accessToken: grant.access_token.value,
        manageUrl: grant.access_token.manage,
        nextChargeAt: new Date(), // due now, so the first charge runs on the next billing run
      },
    });
    pending.delete(nonce);

    console.log("Subscription saved:", nonce);
    res.send("Subscription active");
  } catch (err) {
    console.error("Callback failed:", err);
    res.status(500).send("Callback failed, check the terminal");
  }
});

// ---------------------------------------------------------------
// Charging: one payment for one subscription
// ---------------------------------------------------------------
async function chargeSubscription(sub) {
  const memberWallet = await client.walletAddress.get({ url: sub.memberWallet });
  const fee = String(sub.feeMinor);
  const ownerWallet = await client.walletAddress.get({
    url: process.env.OWNER_WALLET_URL,
  });

  // 1. Incoming payment on the owner's wallet (the receiver)
  const incomingGrant = await client.grant.request(
    { url: ownerWallet.authServer },
    {
      access_token: {
        access: [
          { type: "incoming-payment", actions: ["create", "read", "complete"] },
        ],
      },
    }
  );
  const incomingPayment = await client.incomingPayment.create(
    {
      url: ownerWallet.resourceServer,
      accessToken: incomingGrant.access_token.value,
    },
    {
      walletAddress: ownerWallet.id,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    }
  );

  // 2. Quote on the member's wallet (needs its own non-interactive grant)
  const quoteGrant = await client.grant.request(
    { url: memberWallet.authServer },
    {
      access_token: {
        access: [{ type: "quote", actions: ["create", "read"] }],
      },
    }
  );
  const quote = await client.quote.create(
    {
      url: memberWallet.resourceServer,
      accessToken: quoteGrant.access_token.value,
    },
    {
      walletAddress: memberWallet.id,
      receiver: incomingPayment.id,
      method: "ilp",
      debitAmount: {
        value: fee,
        assetCode: memberWallet.assetCode,
        assetScale: memberWallet.assetScale,
      },
    }
  );

  // 3. Outgoing payment using the stored subscription token
  return client.outgoingPayment.create(
    { url: memberWallet.resourceServer, accessToken: sub.accessToken },
    { walletAddress: memberWallet.id, quoteId: quote.id }
  );
}

// ---------------------------------------------------------------
// Billing: charge every subscription that is due, record the result
// ---------------------------------------------------------------
async function runBilling({ force = false } = {}) {
  const due = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      ...(force ? {} : { nextChargeAt: { lte: new Date() } }),
    },
  });

  for (const sub of due) {
    try {
      const p = await chargeSubscription(sub);
      await prisma.payment.create({
        data: {
          subscriptionId: sub.id,
          status: "SUCCESS",
          amountMinor: sub.feeMinor,
          opPaymentId: p.id,
        },
      });
      const next = new Date(sub.nextChargeAt);
      next.setMonth(next.getMonth() + 1);
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { nextChargeAt: next },
      });
      console.log("Charged:", sub.id);
      // TODO: success email
    } catch (err) {
  const reason = `${err.description || err.message} | status=${err.status} code=${err.code}`;
  await prisma.payment.create({
    data: {
      subscriptionId: sub.id,
      status: "FAILED",
      amountMinor: sub.feeMinor,
      error: reason,
    },
  });
  console.error("Charge failed:", sub.id, reason, err.details);
}
  }
  return due.length;
}

// Scheduler: check for due subscriptions every hour, on the hour
cron.schedule("0 * * * *", () => runBilling());

// Manual trigger for the demo: http://localhost:3000/billing/run
app.get("/billing/run", async (req, res) => {
  try {
    const count = await runBilling({ force: true });
    res.send(`Processed ${count} subscription(s), check the terminal`);
  } catch (err) {
    console.error("Billing run failed:", err);
    res.status(500).send("Billing run failed, check the terminal");
  }
});

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));