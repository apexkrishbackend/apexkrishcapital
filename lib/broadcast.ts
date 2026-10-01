import fs from "fs";
import path from "path";
import nodemailer, { Transporter } from "nodemailer";

export interface BroadcastEmailPayload {
  to: string;
  userName: string;
  offeringTitle: string;
  type: "commitment" | "interest";
  amount?: number | null;
  thirdPartyUrl?: string | null;
  customMessage?: string;
  subject?: string;
  attachment?: {
    filename: string;
    content: string; // base64 encoded content
    contentType?: string;
  } | null;
}

export function cleanPhoneNumber(phone?: string | null): string | null {
  if (!phone) return null;
  // Strip all non-digits except a leading +
  const digits = phone.replace(/[^\d+]/g, "");
  // If it starts with +, remove + for wa.me URL
  const cleanDigits = digits.replace(/^\+/, "");
  return cleanDigits.length >= 7 ? cleanDigits : null;
}

export function generateWhatsAppMessage(payload: {
  userName: string;
  offeringTitle: string;
  thirdPartyUrl?: string | null;
  customMessage?: string;
}): string {
  const greeting = payload.userName ? `Dear ${payload.userName},` : "Hello,";
  const custom = payload.customMessage
    ? `\n\n${payload.customMessage.trim()}`
    : "";
  const portal = payload.thirdPartyUrl
    ? `\n\n👉 *Access Closing Portal:* ${payload.thirdPartyUrl}`
    : "";

  return (
    `*Apex Krish Capital | SPV Deal Update*\n\n` +
    `${greeting}\n\n` +
    `You are receiving this priority investor update regarding *${payload.offeringTitle}*.` +
    `${custom}` +
    `${portal}\n\n` +
    `_Confidential & Proprietary. For verified syndicate participants only._\n` +
    `Apex Krish Capital Syndicate Desk`
  );
}

export function generateWhatsAppLink(
  phone: string,
  payload: {
    userName: string;
    offeringTitle: string;
    thirdPartyUrl?: string | null;
    customMessage?: string;
  }
): string | null {
  const cleanPhone = cleanPhoneNumber(phone);
  if (!cleanPhone) return null;

  const text = generateWhatsAppMessage(payload);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter;

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = Number(process.env.SMTP_PORT || 587);

  if (!smtpHost || !smtpUser || !smtpPass) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return cachedTransporter;
}

export async function sendBroadcastEmail(payload: BroadcastEmailPayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const transporter = getTransporter();

  if (!transporter) {
    return {
      success: false,
      error: "SMTP configuration missing (SMTP_HOST, SMTP_USER, SMTP_PASS).",
    };
  }

  try {

    const logoPath = path.join(process.cwd(), "public", "apexkrishnalogo.png");
    const logoAttachment = fs.existsSync(logoPath)
      ? {
          filename: "apexkrishnalogo.png",
          path: logoPath,
          cid: "apexKrishLogo",
        }
      : null;

    const emailSubject =
      payload.subject ||
      `Action Required: ${payload.offeringTitle} SPV Allocation & Investor Update`;

    const hasThirdPartyUrl = !!(payload.thirdPartyUrl && payload.thirdPartyUrl.trim().length > 0);

    const htmlContent = `
      <div style="margin:0; padding:0; background-color:#f4f6f8; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#18181b;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f6f8; padding:32px 12px;">
          <tr>
            <td align="center">
              <div style="max-width:620px; width:100%; margin:0 auto; background:#ffffff; border:1px solid #e4e4e7; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px -2px rgba(0,0,0,0.05); text-align:left;">
                
                <!-- BRAND HEADER -->
                <div style="padding:28px 32px 20px; border-bottom:1px solid #f4f4f5; background:#ffffff;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td align="left" valign="middle">
                        ${
                          logoAttachment
                            ? `<img src="cid:apexKrishLogo" alt="Apex Krish Capital" width="160" style="display:block; max-width:160px; height:auto; border:0;" />`
                            : `<span style="font-size:18px; font-weight:700; color:#18181b; letter-spacing:-0.5px;">APEX KRISH CAPITAL</span>`
                        }
                      </td>
                      <td align="right" valign="middle">
                        <span style="font-size:10px; font-family:monospace; font-weight:700; text-transform:uppercase; letter-spacing:1px; background:#ecfdf5; color:#059669; padding:4px 10px; border-radius:999px; border:1px solid #a7f3d0;">
                          Verified Allocation
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- BODY CONTENT -->
                <div style="padding:32px;">
                  <div style="font-size:11px; font-family:monospace; letter-spacing:1.5px; text-transform:uppercase; color:#71717a; font-weight:700; margin-bottom:8px;">
                    SPV Syndicate & Investor Allocation
                  </div>

                  <h1 style="margin:0 0 16px; font-size:24px; line-height:1.3; color:#09090b; font-weight:700; letter-spacing:-0.5px;">
                    ${payload.offeringTitle}
                  </h1>

                  <p style="margin:0 0 18px; font-size:15px; line-height:1.6; color:#3f3f46;">
                    Dear <strong>${payload.userName}</strong>,
                  </p>

                  <p style="margin:0 0 20px; font-size:14px; line-height:1.6; color:#52525b;">
                    As a verified syndicate participant with an active ${
                      payload.type === "commitment" && payload.amount
                        ? `commitment of <strong>$${payload.amount.toLocaleString()} USD</strong>`
                        : "allocation request"
                    } in <strong>${payload.offeringTitle}</strong>, here is an important update from the syndicate desk.
                  </p>

                  ${
                    payload.customMessage
                      ? `
                    <div style="margin:20px 0; padding:18px 20px; background:#fafafa; border-left:4px solid #18181b; border-radius:0 8px 8px 0; font-size:13.5px; line-height:1.6; color:#27272a;">
                      <div style="font-size:10.5px; font-family:monospace; font-weight:700; text-transform:uppercase; color:#71717a; margin-bottom:4px;">
                        Note from Syndicate Lead:
                      </div>
                      ${payload.customMessage.replace(/\n/g, "<br />")}
                    </div>
                  `
                      : ""
                  }

                  ${
                    payload.attachment
                      ? `
                    <div style="margin:20px 0; padding:14px 18px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; font-size:13px; color:#166534;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="font-size:18px; width:28px; vertical-align:middle;">📎</td>
                          <td style="vertical-align:middle;">
                            <div style="font-weight:700; color:#15803d; font-size:13.5px;">Attached Document</div>
                            <div style="color:#166534; font-size:12px; margin-top:2px;">${payload.attachment.filename} (attached to this email)</div>
                          </td>
                        </tr>
                      </table>
                    </div>
                  `
                      : ""
                  }

                  ${
                    hasThirdPartyUrl
                      ? `
                    <!-- ACTION BUTTON -->
                    <div style="margin:30px 0 24px; text-align:center;">
                      <a href="${payload.thirdPartyUrl}" target="_blank" style="display:inline-block; background:#09090b; color:#ffffff; font-size:14px; font-weight:600; text-decoration:none; padding:14px 32px; border-radius:10px; letter-spacing:0.2px; box-shadow:0 2px 8px rgba(0,0,0,0.15);">
                        Open Subscription & Closing Portal →
                      </a>
                    </div>

                    <p style="margin:0 0 16px; font-size:12px; line-height:1.5; color:#a1a1aa; text-align:center;">
                      Or copy this direct secure link into your browser:<br />
                      <a href="${payload.thirdPartyUrl}" target="_blank" style="color:#2563eb; word-break:break-all; text-decoration:underline;">
                        ${payload.thirdPartyUrl}
                      </a>
                    </p>
                  `
                      : ""
                  }

                  <!-- SECURITY NOTICE -->
                  <div style="margin-top:28px; padding-top:20px; border-top:1px solid #f4f4f5; font-size:11.5px; line-height:1.6; color:#a1a1aa;">
                    <strong>Fiduciary Notice:</strong> This link is strictly intended for <strong>${payload.to}</strong>. Allocations are non-transferable and subject to 506(c) accredited investor verification.
                  </div>
                </div>

                <!-- FOOTER -->
                <div style="padding:18px 32px; background:#fafafa; border-top:1px solid #f4f4f5; text-align:center; font-size:11px; color:#a1a1aa;">
                  Apex Krish Capital • Private Market Syndication • 10% Performance Carry Structure
                </div>

              </div>
            </td>
          </tr>
        </table>
      </div>
    `;

    const attachmentsList: any[] = [];
    if (logoAttachment) {
      attachmentsList.push(logoAttachment);
    }
    if (payload.attachment && payload.attachment.content) {
      // Strip potential Data URI header e.g. "data:application/pdf;base64,"
      const rawBase64 = payload.attachment.content.replace(/^data:[^;]+;base64,/, "");
      attachmentsList.push({
        filename: payload.attachment.filename,
        content: rawBase64,
        encoding: "base64",
        contentType: payload.attachment.contentType,
      });
    }

    const plainTextBody = [
      emailSubject,
      `Dear ${payload.userName},`,
      payload.customMessage || "",
      hasThirdPartyUrl ? `Closing Portal: ${payload.thirdPartyUrl}` : "",
      payload.attachment ? `Attached: ${payload.attachment.filename}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || "syndicate@apexkrishcapital.com",
      to: payload.to,
      subject: emailSubject,
      text: plainTextBody,
      html: htmlContent,
      attachments: attachmentsList,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Failed to send broadcast email to", payload.to, error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}

