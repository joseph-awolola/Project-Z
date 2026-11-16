import "dotenv/config";
import readline from "readline/promises";
import { createAuthenticatedClient, isFinalizedGrant } from "@interledger/open-payments";

const client = await createAuthenticatedClient({
  walletAddressUrl: process.env.MEMBER_WALLET_URL,
  privateKey: process.env.OP_PRIVATE_KEY_PATH,
  keyId: process.env.OP_KEY_ID,
});

const receiver = await client.walletAddress.get({ url: process.env.OWNER_WALLET_URL });
const sender = await client.walletAddress.get({ url: process.env.MEMBER_WALLET_URL });

// 1. Incoming payment grant + incoming payment (owner's wallet)
const ipGrant = await client.grant.request(
  { url: receiver.authServer },
  { access_token: { access: [{ type: "incoming-payment", actions: ["read", "create"] }] } }
);
if (!isFinalizedGrant(ipGrant)) throw new Error("Incoming grant not finalized");

const incoming = await client.incomingPayment.create(
  { url: receiver.resourceServer, accessToken: ipGrant.access_token.value },
  {
    walletAddress: receiver.id,
    incomingAmount: { value: "1000", assetCode: receiver.assetCode, assetScale: receiver.assetScale },
  }
);

// 2. Quote grant + quote (member's wallet)
const quoteGrant = await client.grant.request(
  { url: sender.authServer },
  { access_token: { access: [{ type: "quote", actions: ["create", "read"] }] } }
);
const quote = await client.quote.create(
  { url: sender.resourceServer, accessToken: quoteGrant.access_token.value },
  { method: "ilp", walletAddress: sender.id, receiver: incoming.id }
);

// 3. Outgoing payment grant (needs member approval)
const opGrant = await client.grant.request(
  { url: sender.authServer },
  {
    access_token: {
      access: [{
        type: "outgoing-payment",
        actions: ["read", "create"],
        identifier: sender.id,
        limits: { debitAmount: quote.debitAmount },
      }],
    },
    interact: {
      start: ["redirect"],
      finish: { method: "redirect", uri: process.env.CALLBACK_URL, nonce: crypto.randomUUID() },
    },
  }
);
console.log("Open this URL and approve:", opGrant.interact.redirect);
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const interactRef = await rl.question("Paste interact_ref from the redirect URL: ");
rl.close();

const finalGrant = await client.grant.continue(
  { url: opGrant.continue.uri, accessToken: opGrant.continue.access_token.value },
  { interact_ref: interactRef }
);

// 4. Outgoing payment
const outgoing = await client.outgoingPayment.create(
  { url: sender.resourceServer, accessToken: finalGrant.access_token.value },
  { walletAddress: sender.id, quoteId: quote.id }
);
console.log("Outgoing payment:", outgoing);