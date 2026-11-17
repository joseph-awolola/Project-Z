import { Router } from "express";
import crypto from "crypto";
import { prisma } from "./db.js";
import { signup, login, requireAuth, requireRole, publicUser } from "./auth.js";
import {
  pending,
  startSubscriptionGrant,
  finishSubscriptionGrant,
} from "./openPayments.js";
import { runBilling, chargeOne } from "./billing.js";
import { sendSubscriptionConfirmed } from "./email.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const router = Router();
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// never send tokens to the browser
const safeSub = ({ accessToken, manageUrl, ...rest }) => rest;

// ---------- Auth ----------
router.post("/api/auth/signup", wrap(signup));
router.post("/api/auth/login", wrap(login));
router.get("/api/me", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

// ---------- Businesses (public) ----------
router.get("/api/businesses", wrap(async (req, res) => {
  const list = await prisma.business.findMany({
    include: { owner: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ businesses: list });
}));

router.get("/api/businesses/:id", wrap(async (req, res) => {
  const b = await prisma.business.findUnique({
    where: { id: req.params.id },
    include: { owner: { select: { name: true } } },
  });
  if (!b) return res.status(404).json({ error: "Business not found" });
  res.json({ business: b });
}));

// ---------- Owner ----------
router.post("/api/businesses", requireAuth, requireRole("OWNER"), wrap(async (req, res) => {
  const { name, feeMinor } = req.body || {};
  if (!name || !Number.isInteger(feeMinor) || feeMinor <= 0) {
    return res.status(400).json({ error: "name and a positive integer feeMinor are required" });
  }
  const business = await prisma.business.create({
    data: { name, feeMinor, ownerId: req.user.id },
  });
  res.status(201).json({ business });
}));

router.get("/api/owner/businesses", requireAuth, requireRole("OWNER"), wrap(async (req, res) => {
  const list = await prisma.business.findMany({
    where: { ownerId: req.user.id },
    include: { _count: { select: { subscriptions: true } } },
  });
  res.json({ businesses: list });
}));

async function ownedBusiness(req, res) {
  const b = await prisma.business.findUnique({ where: { id: req.params.id } });
  if (!b || b.ownerId !== req.user.id) {
    res.status(404).json({ error: "Business not found" });
    return null;
  }
  return b;
}

router.get("/api/owner/businesses/:id/members", requireAuth, requireRole("OWNER"), wrap(async (req, res) => {
  if (!(await ownedBusiness(req, res))) return;
  const subs = await prisma.subscription.findMany({
    where: { businessId: req.params.id },
    include: {
      member: { select: { name: true, email: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  res.json({ members: subs.map(safeSub) });
}));

router.get("/api/owner/businesses/:id/payments", requireAuth, requireRole("OWNER"), wrap(async (req, res) => {
  if (!(await ownedBusiness(req, res))) return;
  const payments = await prisma.payment.findMany({
    where: { subscription: { businessId: req.params.id } },
    include: { subscription: { select: { member: { select: { name: true, email: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ payments });
}));

// ---------- Member ----------
// Returns the wallet approval URL; the frontend sends the browser there.
router.post("/api/businesses/:id/subscribe", requireAuth, requireRole("MEMBER"), wrap(async (req, res) => {
  const business = await prisma.business.findUnique({ where: { id: req.params.id } });
  if (!business) return res.status(404).json({ error: "Business not found" });

  const already = await prisma.subscription.findFirst({
    where: { memberId: req.user.id, businessId: business.id, status: "ACTIVE" },
  });
  if (already) return res.status(409).json({ error: "Already subscribed to this business" });

  const nonce = crypto.randomUUID();
  const redirectUrl = await startSubscriptionGrant({
    memberWalletUrl: req.user.walletUrl,
    feeMinor: business.feeMinor,
    nonce,
    meta: { memberId: req.user.id, businessId: business.id },
  });
  res.json({ redirectUrl });
}));

// The wallet sends the member's browser back here after they approve.
router.get("/subscriptions/callback", wrap(async (req, res) => {
  const { interact_ref, pid } = req.query;
  const back = (status, reason = "") =>
    res.redirect(`${FRONTEND_URL}/subscription/result?status=${status}${reason ? `&reason=${reason}` : ""}`);

  const p = pending.get(pid);
  if (!p || !interact_ref) return back("error", "rejected_or_expired");

  try {
    const grant = await finishSubscriptionGrant(p, interact_ref);
    const sub = await prisma.subscription.create({
      data: {
        memberId: p.memberId,
        businessId: p.businessId,
        memberWallet: p.memberWalletId,
        feeMinor: p.feeMinor,
        accessToken: grant.access_token.value,
        manageUrl: grant.access_token.manage,
        nextChargeAt: new Date(),
      },
    });
    pending.delete(pid);
    const full = await prisma.subscription.findUnique({
    where: { id: sub.id },
    include: { member: true, business: { include: { owner: true } } },
    });
    sendSubscriptionConfirmed(full).catch(console.error);
    chargeOne(sub.id).catch(console.error); // first charge right away
    back("success");
  } catch (err) {
    console.error("Callback failed:", err);
    back("error", "grant_failed");
  }
}));

router.get("/api/subscriptions/mine", requireAuth, requireRole("MEMBER"), wrap(async (req, res) => {
  const subs = await prisma.subscription.findMany({
    where: { memberId: req.user.id },
    include: {
      business: { select: { name: true, feeMinor: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ subscriptions: subs.map(safeSub) });
}));

router.post("/api/subscriptions/:id/cancel", requireAuth, requireRole("MEMBER"), wrap(async (req, res) => {
  const sub = await prisma.subscription.findUnique({ where: { id: req.params.id } });
  if (!sub || sub.memberId !== req.user.id) return res.status(404).json({ error: "Subscription not found" });
  const updated = await prisma.subscription.update({
    where: { id: sub.id },
    data: { status: "CANCELLED" },
  });
  res.json({ subscription: safeSub(updated) });
}));

// ---------- Demo helper ----------
// Charges every active subscription now (caps will make repeat charges FAIL)
router.get("/api/billing/run", wrap(async (req, res) => {
  const count = await runBilling({ force: true });
  res.json({ processed: count });
}));

export default router;