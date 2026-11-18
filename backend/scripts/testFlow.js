// Run the whole flow against your running API, no frontend needed.
//   Terminal 1: npm start
//   Terminal 2: node --env-file=.env scripts/testFlow.js
import readline from "readline/promises";

const API = "http://localhost:3000";
const stamp = Date.now();

const [local, domain] = process.env.EMAIL_USER.split("@");

async function call(method, path, body, token) {
  const res = await fetch(API + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`FAILED ${method} ${path} -> ${res.status}`, data);
    process.exit(1);
  }
  return data;
}

// 1. Owner (receives money) and member (pays) sign up with DIFFERENT wallets
const owner = await call("POST", "/api/auth/signup", {
  name: "Test Gym Owner",
  email: `${local}+o${stamp}@${domain}`,
  password: "password123",
  role: "OWNER",
  walletUrl: process.env.OWNER_WALLET_URL,
});
console.log("Owner signed up");

const member = await call("POST", "/api/auth/signup", {
  name: "Test Member",
  email: `${local}+m${stamp}@${domain}`,
  password: "password123",
  role: "MEMBER",
  walletUrl: process.env.MEMBER_WALLET_URL,
});
console.log("Member signed up");

// 2. Owner creates a business with a 25.00 monthly fee
const { business } = await call(
  "POST",
  "/api/businesses",
  { name: "Test Gym", feeMinor: 2500 },
  owner.token
);
console.log("Business created:", business.id);

// 3. Member subscribes -> get the wallet approval link
const { redirectUrl } = await call(
  "POST",
  `/api/businesses/${business.id}/subscribe`,
  null,
  member.token
);
console.log("\nOpen this link in your browser and approve:\n");
console.log(redirectUrl);
console.log(
  "\n(After approving you'll be redirected to a frontend URL that won't load yet. That's fine.)"
);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
await rl.question("\nPress Enter once you've approved... ");
rl.close();

// 4. Give the automatic first charge a moment, then look at the results
await new Promise((r) => setTimeout(r, 5000));

const mine = await call("GET", "/api/subscriptions/mine", null, member.token);
console.log("\nMember's subscriptions:");
console.dir(mine.subscriptions, { depth: 4 });

const members = await call(
  "GET",
  `/api/owner/businesses/${business.id}/payments`,
  null,
  owner.token
);
console.log("\nOwner's payment log:");
console.dir(members.payments, { depth: 4 });