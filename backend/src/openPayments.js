import {
  createAuthenticatedClient,
  isPendingGrant,
} from "@interledger/open-payments";

const CALLBACK_URL = process.env.CALLBACK_URL; // http://localhost:3000/subscriptions/callback

// The platform's own identity, used to sign requests
export const client = await createAuthenticatedClient({
  walletAddressUrl: process.env.PLATFORM_WALLET_URL || process.env.OWNER_WALLET_URL,
  privateKey: process.env.OP_PRIVATE_KEY_PATH,
  keyId: process.env.OP_KEY_ID,
});

// Grants waiting for the member to approve: nonce -> details
// (short-lived; lost on restart, which just means the member re-subscribes)
export const pending = new Map();

// Ask the member's wallet for a monthly spending limit. Returns the URL
// the member must be sent to in order to approve it.
export async function startSubscriptionGrant({ memberWalletUrl, feeMinor, nonce, meta }) {
  const memberWallet = await client.walletAddress.get({ url: memberWalletUrl });

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
                value: String(feeMinor),
                assetCode: memberWallet.assetCode,
                assetScale: memberWallet.assetScale,
              },
              interval: `R12/${new Date().toISOString()}/P1M`,
            },
          },
        ],
      },
      interact: {
        start: ["redirect"],
        // pid lets the callback find the right pending grant
        finish: { method: "redirect", uri: `${CALLBACK_URL}?pid=${nonce}`, nonce },
      },
    }
  );

  if (!isPendingGrant(grant)) throw new Error("Expected an interactive grant");

  pending.set(nonce, {
    ...meta,
    memberWalletId: memberWallet.id,
    feeMinor,
    continueUri: grant.continue.uri,
    continueToken: grant.continue.access_token.value,
  });

  return grant.interact.redirect;
}

// After the member approves: exchange the approval for the access token
export async function finishSubscriptionGrant(p, interactRef) {
  return client.grant.continue(
    { url: p.continueUri, accessToken: p.continueToken },
    { interact_ref: interactRef }
  );
}

// One payment: member's wallet -> business owner's wallet.
// `sub` must include business.owner.
export async function chargeSubscription(sub) {
  const memberWallet = await client.walletAddress.get({ url: sub.memberWallet });
  const receiverWallet = await client.walletAddress.get({
    url: sub.business.owner.walletUrl,
  });

  // 1. Incoming payment on the receiver's wallet
  const incomingGrant = await client.grant.request(
    { url: receiverWallet.authServer },
    {
      access_token: {
        access: [{ type: "incoming-payment", actions: ["create", "read", "complete"] }],
      },
    }
  );
  const incomingPayment = await client.incomingPayment.create(
    {
      url: receiverWallet.resourceServer,
      accessToken: incomingGrant.access_token.value,
    },
    {
      walletAddress: receiverWallet.id,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    }
  );

  // 2. Quote on the member's wallet
  const quoteGrant = await client.grant.request(
    { url: memberWallet.authServer },
    { access_token: { access: [{ type: "quote", actions: ["create", "read"] }] } }
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
        value: String(sub.feeMinor),
        assetCode: memberWallet.assetCode,
        assetScale: memberWallet.assetScale,
      },
    }
  );

  // 3. Outgoing payment with the member's subscription token
  return client.outgoingPayment.create(
    { url: memberWallet.resourceServer, accessToken: sub.accessToken },
    { walletAddress: memberWallet.id, quoteId: quote.id }
  );
}