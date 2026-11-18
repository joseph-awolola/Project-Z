import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// "$ilp.interledger-test.dev/abc" -> "https://ilp.interledger-test.dev/abc"
export function normalizeWallet(url) {
  let u = String(url || "").trim();
  if (u.startsWith("$")) u = "https://" + u.slice(1);
  return u.replace(/\/+$/, "");
}

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

function publicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

export async function signup(req, res) {
  const { name, email, password, role, walletUrl } = req.body || {};
  if (!name || !email || !password || !walletUrl) {
    return res.status(400).json({ error: "name, email, password and walletUrl are required" });
  }
  if (!["OWNER", "MEMBER"].includes(role)) {
    return res.status(400).json({ error: "role must be OWNER or MEMBER" });
  }
  const lower = String(email).toLowerCase();
  if (await prisma.user.findUnique({ where: { email: lower } })) {
    return res.status(409).json({ error: "Email already registered" });
  }
  const user = await prisma.user.create({
    data: {
      name,
      email: lower,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      walletUrl: normalizeWallet(walletUrl),
    },
  });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body || {};
  const user = await prisma.user.findUnique({
    where: { email: String(email || "").toLowerCase() },
  });
  if (!user || !(await bcrypt.compare(String(password || ""), user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export const requireRole = (role) => (req, res, next) =>
  req.user.role === role
    ? next()
    : res.status(403).json({ error: `Only ${role.toLowerCase()}s can do this` });

export { publicUser };