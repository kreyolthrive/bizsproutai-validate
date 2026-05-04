import { resolveTransport } from "./transport";

const OWNER_EMAIL = "bizsproutai@gmail.com";

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL ?? "noreply@validate.bizsproutai.com";
}

// When EMAIL_PROVIDER is not "resend", send owner notification via the
// configured nodemailer transport (gmail or ionos) instead of Resend API.
async function sendOwnerViaTransport(data: LeadNotificationData): Promise<{ sent: boolean; error: string | null }> {
  const t = resolveTransport();
  if (!t) return { sent: false, error: "No email transport configured" };

  const subject = data.completed
    ? `New free validation lead — ${data.email}`
    : `New partial lead (email only) — ${data.email}`;

  const lines = [
    `<p><strong>Email:</strong> ${data.email}</p>`,
    `<p><strong>Name:</strong> ${data.firstName || "(not provided)"}</p>`,
    `<p><strong>Status:</strong> ${data.completed ? "✅ Completed validation" : "⚠️ Partial — email only"}</p>`,
    `<p><strong>Timestamp:</strong> ${data.timestamp}</p>`,
    data.stage ? `<p><strong>Stage:</strong> ${data.stage}</p>` : "",
    data.verdict ? `<p><strong>Verdict:</strong> ${data.verdict}</p>` : "",
    data.firstAsset ? `<p><strong>First Asset:</strong> ${data.firstAsset}</p>` : "",
    data.idea ? `<p><strong>Idea:</strong> ${data.idea}</p>` : "",
    data.audience ? `<p><strong>Audience:</strong> ${data.audience}</p>` : "",
  ].join("");

  try {
    await t.transport.sendMail({
      from: `"BizSproutAI Leads" <${t.from}>`,
      to: OWNER_EMAIL,
      subject,
      html: `<div style="font-family:Arial,sans-serif;">${lines}</div>`,
    });
    return { sent: true, error: null };
  } catch (err) {
    return { sent: false, error: String(err) };
  }
}

interface LeadNotificationData {
  email: string;
  firstName: string;
  stage?: string;
  verdict?: string;
  firstAsset?: string;
  idea?: string;
  audience?: string;
  completed: boolean;
  timestamp: string;
}

export async function sendOwnerNotification(
  data: LeadNotificationData
): Promise<{ sent: boolean; error: string | null }> {
  // Route to nodemailer transport when not explicitly using Resend
  if (process.env.EMAIL_PROVIDER !== "resend") {
    return sendOwnerViaTransport(data);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[resend] RESEND_API_KEY not set — owner notification skipped");
    return { sent: false, error: "RESEND_API_KEY not configured" };
  }

  const subject = data.completed
    ? `New free validation lead — ${data.email}`
    : `New partial lead (email only) — ${data.email}`;

  const rows: [string, string][] = [
    ["Email", data.email],
    ["Name", data.firstName || "(not provided)"],
    ["Status", data.completed ? "✅ Completed validation" : "⚠️ Partial — email only"],
    ["Timestamp", data.timestamp],
  ];
  if (data.stage) rows.push(["Stage", data.stage]);
  if (data.verdict) rows.push(["Verdict", data.verdict]);
  if (data.firstAsset) rows.push(["First Asset", data.firstAsset]);
  if (data.idea) rows.push(["Business Idea", data.idea]);
  if (data.audience) rows.push(["Audience", data.audience]);

  const tableRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 10px;font-weight:600;color:#374151;white-space:nowrap;">${k}</td><td style="padding:6px 10px;color:#111827;">${v}</td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9fafb;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#1a3a2a;padding:20px 28px;">
      <p style="margin:0;color:#7ec850;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">BizSproutAI</p>
      <p style="margin:6px 0 0;color:#fff;font-size:18px;font-weight:700;">${subject}</p>
    </div>
    <div style="padding:24px 28px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        ${tableRows}
      </table>
    </div>
    <div style="padding:16px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;">
      <a href="https://validate.bizsproutai.com/en" style="color:#1a3a2a;font-size:13px;">View platform →</a>
    </div>
  </div>
</body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `BizSproutAI Leads <${getFromEmail()}>`,
        to: [OWNER_EMAIL],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[resend] Owner notification failed (${res.status}):`, text);
      return { sent: false, error: `HTTP ${res.status}: ${text}` };
    }

    console.log(`[resend] Owner notification sent for ${data.email} (completed=${data.completed})`);
    return { sent: true, error: null };
  } catch (err) {
    console.error("[resend] Owner notification error:", err);
    return { sent: false, error: String(err) };
  }
}
