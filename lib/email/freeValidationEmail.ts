import { resolveTransport } from "./transport";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface FreeValidationResult {
  stage: string;
  verdict: string;
  firstAsset: string;
  firstAssetReason?: string;
  nextSteps: string[];
  warning: string;
}

function resultEmailHtml(
  firstName: string,
  locale: string,
  result: FreeValidationResult,
  platformUrl: string
): string {
  const safeName = escapeHtml(firstName || "Founder");
  const safeStage = escapeHtml(result.stage);
  const safeVerdict = escapeHtml(result.verdict);
  const safeFirstAsset = escapeHtml(result.firstAsset);
  const safeFirstAssetReason = result.firstAssetReason ? escapeHtml(result.firstAssetReason) : "";
  const safeWarning = escapeHtml(result.warning);
  const stepsHtml = result.nextSteps
    .map(
      (step, i) =>
        `<tr>
          <td style="padding:6px 0;vertical-align:top;width:28px;color:#7ec850;font-weight:700;font-size:15px;">${i + 1}.</td>
          <td style="padding:6px 0;vertical-align:top;color:#374151;font-size:15px;line-height:1.6;">${escapeHtml(step)}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Free Validation Results</title></head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

        <!-- Logo / Brand -->
        <tr><td style="padding-bottom:24px;text-align:center;">
          <span style="font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4a8c5c;">BizSproutAI</span>
        </td></tr>

        <!-- Stage badge -->
        <tr><td style="background:#1a3a2a;border-radius:16px 16px 0 0;padding:28px 32px 12px;">
          <span style="display:inline-block;background:#7ec850;color:#1a3a2a;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:4px 12px;border-radius:999px;">${safeStage}</span>
        </td></tr>

        <!-- Verdict -->
        <tr><td style="background:#1a3a2a;padding:0 32px 20px;">
          <p style="margin:12px 0 0;color:#fff;font-size:20px;font-weight:600;line-height:1.3;">
            Hey ${safeName} — here are your free validation results.
          </p>
          <p style="margin:10px 0 0;color:rgba(255,255,255,0.8);font-size:15px;line-height:1.6;">${safeVerdict}</p>
        </td></tr>

        <!-- First asset -->
        <tr><td style="background:#1a3a2a;padding:0 32px 20px;">
          <div style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px 18px;">
            <p style="margin:0 0 4px;color:#7ec850;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">Recommended first asset</p>
            <p style="margin:0;color:#fff;font-size:15px;font-weight:600;">${safeFirstAsset}</p>
            ${safeFirstAssetReason ? `<p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:13px;">${safeFirstAssetReason}</p>` : ""}
          </div>
        </td></tr>

        <!-- Next steps -->
        <tr><td style="background:#1a3a2a;padding:0 32px 20px;">
          <p style="margin:0 0 10px;color:#7ec850;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">Your next 4 steps</p>
          <table cellpadding="0" cellspacing="0" width="100%">${stepsHtml}</table>
        </td></tr>

        <!-- Warning -->
        <tr><td style="background:#1a3a2a;padding:0 32px 28px;border-radius:0 0 0 0;">
          <div style="background:rgba(251,191,36,0.07);border:1px solid rgba(251,191,36,0.3);border-radius:12px;padding:14px 18px;">
            <p style="margin:0 0 4px;color:#fbbf24;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">One mistake to avoid</p>
            <p style="margin:0;color:rgba(255,255,255,0.8);font-size:14px;line-height:1.6;">${safeWarning}</p>
          </div>
        </td></tr>

        <!-- CTA -->
        <tr><td style="background:#fff;border-radius:0 0 16px 16px;padding:28px 32px 32px;text-align:center;">
          <p style="margin:0 0 6px;color:#6b7280;font-size:13px;">Ready to go further?</p>
          <p style="margin:0 0 20px;color:#1a3a2a;font-size:17px;font-weight:700;">Unlock your full sprint inside BizSproutAI</p>
          <a href="${platformUrl}" style="display:inline-block;background:#1a3a2a;color:#fff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:999px;text-decoration:none;">Get My Full Sprint →</a>
          <p style="margin:20px 0 0;color:#9ca3af;font-size:12px;">You're receiving this because you completed a free validation on BizSproutAI.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function abandonedEmailHtml(
  firstName: string,
  locale: string,
  validateUrl: string
): string {
  const safeName = escapeHtml(firstName || "Founder");
  return `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Finish Your Free Validation</title></head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr><td style="padding-bottom:24px;text-align:center;">
          <span style="font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4a8c5c;">BizSproutAI</span>
        </td></tr>
        <tr><td style="background:#fff;border-radius:16px;padding:32px;">
          <p style="margin:0 0 8px;color:#1a3a2a;font-size:20px;font-weight:700;">Hey ${safeName} — your free validation is waiting.</p>
          <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6;">You started a free business validation but didn't get your results. Your stage, recommended first asset, and 4 next steps are still waiting — it only takes a minute to finish.</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${validateUrl}" style="display:inline-block;background:#1a3a2a;color:#fff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:999px;text-decoration:none;">Finish My Free Validation →</a>
          </div>
          <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">Free · No account needed · Under a minute</p>
        </td></tr>
        <tr><td style="padding-top:20px;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">You're receiving this because you started a free validation on BizSproutAI.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendFreeValidationResultEmail(
  to: string,
  firstName: string,
  locale: string,
  result: FreeValidationResult
): Promise<{ sent: boolean; error: string | null }> {
  const t = resolveTransport();
  if (!t) return { sent: false, error: "Email transport not configured (check EMAIL_PROVIDER and credentials)" };

  const platformUrl = `https://validate.bizsproutai.com/${locale}`;

  try {
    await t.transport.sendMail({
      from: `"BizSproutAI" <${t.from}>`,
      to,
      subject: `Your free validation results — ${result.stage}`,
      html: resultEmailHtml(firstName, locale, result, platformUrl),
    });
    return { sent: true, error: null };
  } catch (err) {
    return { sent: false, error: String(err) };
  }
}

export async function sendFreeValidationOwnerAlert(
  email: string,
  firstName: string,
  result: FreeValidationResult
): Promise<{ sent: boolean; error: string | null }> {
  const t = resolveTransport();
  if (!t) return { sent: false, error: "Email transport not configured" };

  const ownerEmail =
    process.env.LEADS_TO_EMAIL ??
    process.env.IONOS_OWNER_EMAIL ??
    process.env.HOSTINGER_FROM_EMAIL;
  if (!ownerEmail) return { sent: false, error: "Owner email not configured (set LEADS_TO_EMAIL)" };

  try {
    await t.transport.sendMail({
      from: `"BizSproutAI Leads" <${t.from}>`,
      to: ownerEmail,
      subject: `New free validation lead: ${escapeHtml(firstName || email)} — ${escapeHtml(result.stage)}`,
      html: `<p><strong>Email:</strong> ${escapeHtml(email)}</p>
<p><strong>Name:</strong> ${escapeHtml(firstName || "(not provided)")}</p>
<p><strong>Stage:</strong> ${escapeHtml(result.stage)}</p>
<p><strong>Verdict:</strong> ${escapeHtml(result.verdict)}</p>
<p><strong>First Asset:</strong> ${escapeHtml(result.firstAsset)}</p>`,
    });
    return { sent: true, error: null };
  } catch (err) {
    return { sent: false, error: String(err) };
  }
}

export async function sendFreeValidationAbandonedReminder(
  to: string,
  firstName: string,
  locale: string
): Promise<{ sent: boolean; error: string | null }> {
  const t = resolveTransport();
  if (!t) return { sent: false, error: "Email transport not configured" };

  const validateUrl = `https://validate.bizsproutai.com/${locale}/validate`;

  try {
    await t.transport.sendMail({
      from: `"BizSproutAI" <${t.from}>`,
      to,
      subject: "Your free validation is still waiting — finish in under a minute",
      html: abandonedEmailHtml(firstName, locale, validateUrl),
    });
    return { sent: true, error: null };
  } catch (err) {
    return { sent: false, error: String(err) };
  }
}
