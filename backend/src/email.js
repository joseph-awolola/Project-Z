import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, // a Gmail app password, not your login password
  },
});

const CURRENCY = process.env.CURRENCY || "EUR";
const money = (minor) => `${(minor / 100).toFixed(2)} ${CURRENCY}`;

async function send(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Recurring Pay" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent:", subject, "->", to);
  } catch (err) {
    // an email problem must never break billing
    console.error("Email failed:", subject, "->", to, err.message);
  }
}

// `sub` must include member and business.owner
export async function sendSubscriptionConfirmed(sub) {
  const { member, business } = sub;
  await send(
    member.email,
    `You're subscribed to ${business.name}`,
    `<p>Hi ${member.name},</p>
     <p>You're now subscribed to <b>${business.name}</b> at <b>${money(sub.feeMinor)}</b> per month.
     Your payments are charged automatically from your wallet, and you'll get an email each time.</p>`
  );
  await send(
    business.owner.email,
    `New member: ${member.name}`,
    `<p>${member.name} (${member.email}) subscribed to <b>${business.name}</b> at ${money(sub.feeMinor)} per month.</p>`
  );
}

export async function sendPaymentSuccess(sub) {
  const { member, business } = sub;
  const next = new Date(sub.nextChargeAt);
  next.setMonth(next.getMonth() + 1);
  await send(
    member.email,
    `Payment received: ${business.name}`,
    `<p>Hi ${member.name},</p>
     <p>We charged <b>${money(sub.feeMinor)}</b> for your <b>${business.name}</b> membership.
     Your next payment is due on ${next.toDateString()}.</p>`
  );
  await send(
    business.owner.email,
    `Payment received from ${member.name}`,
    `<p>${member.name} paid <b>${money(sub.feeMinor)}</b> for <b>${business.name}</b>. The payment is verified and recorded.</p>`
  );
}

export async function sendPaymentFailed(sub, reason) {
  const { member, business } = sub;
  await send(
    member.email,
    `Payment failed: ${business.name}`,
    `<p>Hi ${member.name},</p>
     <p>We couldn't collect your <b>${money(sub.feeMinor)}</b> payment for <b>${business.name}</b>.
     This usually means your wallet's monthly limit was reached or the approval needs renewing.
     Please check your wallet or subscribe again.</p>`
  );
  await send(
    business.owner.email,
    `Payment failed for ${member.name}`,
    `<p>The payment from ${member.name} (${member.email}) for <b>${business.name}</b> failed and has been recorded.</p>
     <p>Reason: ${reason}</p>`
  );
}