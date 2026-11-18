import cron from "node-cron";
import { prisma } from "./db.js";
import { chargeSubscription } from "./openPayments.js";
import { sendPaymentSuccess, sendPaymentFailed } from "./email.js";

const withRelations = { business: { include: { owner: true } }, member: true };

async function processSubscription(sub) {
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
    sendPaymentSuccess(sub).catch(console.error);
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
    console.error("Charge failed:", sub.id, reason);
    sendPaymentFailed(sub, reason).catch(console.error);  }
}

// Charge every active subscription that is due (or all of them with force)
export async function runBilling({ force = false } = {}) {
  const due = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      ...(force ? {} : { nextChargeAt: { lte: new Date() } }),
    },
    include: withRelations,
  });
  for (const sub of due) await processSubscription(sub);
  return due.length;
}

// Charge one subscription right away (used after a member subscribes)
export async function chargeOne(subscriptionId) {
  const sub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: withRelations,
  });
  if (sub && sub.status === "ACTIVE") await processSubscription(sub);
}

export function startScheduler() {
  cron.schedule("0 * * * *", () => runBilling().catch(console.error)); // hourly
}