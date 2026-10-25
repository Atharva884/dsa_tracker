// Sends transactional emails through the Resend HTTP API.
// Render's free tier blocks outbound SMTP, so an HTTP API is used instead.
const RESEND_URL = "https://api.resend.com/emails";

exports.sendPasswordResetEmail = async function (to, name, resetLink) {
  if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM) {
    throw new Error("Email is not configured on the server.");
  }

  const greeting = name ? `Hi ${name},` : "Hi,";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; color: #111;">
      <h2>Reset your DSA Tracker password</h2>
      <p>${greeting}</p>
      <p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 30 minutes.</p>
      <p style="margin: 28px 0;">
        <a href="${resetLink}" style="background: #7c3aed; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none;">Reset password</a>
      </p>
      <p>If the button doesn't work, paste this link into your browser:<br/><a href="${resetLink}">${resetLink}</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>`;

  const response = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: [to],
      subject: "Reset your DSA Tracker password",
      html,
      text: `${greeting}\n\nReset your DSA Tracker password using this link (expires in 30 minutes):\n${resetLink}\n\nIf you didn't request this, ignore this email.`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend error ${response.status}: ${body}`);
  }
};
