import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user.model";

export const PROFILE_NOTIFICATION_TO =
  process.env.PROFILE_NOTIFICATION_TO || "parthasureshm@gmail.com";

/**
 * Retrieves all admin email addresses to receive administrative alerts.
 * Aggregates configured admin emails from environment variables and all registered
 * admins in MongoDB (`role: 'admin'`).
 */
export async function getAdminNotificationEmails(): Promise<string[]> {
  const emailSet = new Set<string>();

  // 1. Process environment variables (PROFILE_NOTIFICATION_TO, ADMIN_EMAILS, etc.)
  const envEmails = [
    process.env.PROFILE_NOTIFICATION_TO,
    process.env.ADMIN_EMAILS,
    process.env.ADMIN_EMAIL,
  ].filter(Boolean) as string[];

  for (const raw of envEmails) {
    const split = raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0 && e.includes("@"));
    split.forEach((e) => emailSet.add(e));
  }

  // 2. Query all admin users from MongoDB
  try {
    await dbConnect();
    const adminDocs = await User.find({ role: "admin" })
      .select("email")
      .lean();

    for (const doc of adminDocs) {
      if (doc.email) {
        const cleaned = doc.email.trim().toLowerCase();
        if (cleaned.length > 0 && cleaned.includes("@")) {
          emailSet.add(cleaned);
        }
      }
    }
  } catch (err) {
    console.error("Failed to query admin users for email notifications:", err);
  }

  // 3. Fallback to default if no emails found
  if (emailSet.size === 0) {
    emailSet.add("parthasureshm@gmail.com");
  }

  return Array.from(emailSet);
}

export async function sendProfileUpdateNotification(user: Record<string, any>) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = Number(process.env.SMTP_PORT || 587);

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn(
      "Profile update notification skipped: SMTP_HOST, SMTP_USER, and SMTP_PASS must be configured."
    );
    return { sent: false, reason: "missing_smtp_configuration" };
  }

  const recipientEmails = await getAdminNotificationEmails();
  if (recipientEmails.length === 0) {
    return { sent: false, reason: "no_recipients_found" };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const fullName =
    user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Investor";

  const userDetails = {
    Name: fullName,
    Email: user.email,
    "First Name": user.firstName || "",
    "Middle Name": user.middleName || "",
    "Last Name": user.lastName || "",
    Phone: user.phoneNumber || "",
    "Investor Status": user.investorStatus || "",
    Citizenship: user.citizenship || "",
    Avatar: user.avatar || "",
    "Created At": user.createdAt ? new Date(user.createdAt).toISOString() : "",
    "Updated At": user.updatedAt ? new Date(user.updatedAt).toISOString() : "",
  };

  const detailRows = Object.entries(userDetails)
    .map(([label, value]) => `${label}: ${value || "N/A"}`)
    .join("\n");

  const subject = `Investor Profile Updated – ${fullName}`;

  const logoPath = path.join(process.cwd(), "public", "apexkrishnalogo.png");
  const logoAttachment = fs.existsSync(logoPath)
    ? {
        filename: "apexkrishnalogo.png",
        path: logoPath,
        cid: "apexKrishLogo",
      }
    : null;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || smtpUser,
    to: recipientEmails,
    subject,
    text: `Investor profile updated\n\n${detailRows}`,
    html: `
      <div style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif; color:#1a1a1a;">
        <div style="max-width:700px; margin:0 auto; background:#ffffff; border:1px solid #e7e7e7; border-radius:12px; overflow:hidden;">
          <div style="padding:24px 32px 16px; border-bottom:1px solid #ececec; background:#ffffff;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td align="left" valign="middle" style="padding:0;">
                  ${
                    logoAttachment
                      ? `<img src="cid:apexKrishLogo" alt="Apex Krish Capital" width="180" style="display:block; max-width:180px; height:auto; border:0;" />`
                      : ""
                  }
                </td>
              </tr>
            </table>
          </div>

          <div style="padding:32px; background:#ffffff;">
            <div style="font-size:12px; letter-spacing:1.5px; text-transform:uppercase; color:#7a7a7a; font-weight:bold; margin-bottom:12px;">
              Investor Profile Update
            </div>

            <h2 style="margin:0 0 12px; font-size:28px; line-height:1.3; color:#111827; font-weight:700;">
              Investor profile successfully updated
            </h2>

            <p style="margin:0 0 22px; font-size:15px; line-height:1.7; color:#3f3f46;">
              The following investor profile details were saved in the system for <strong>${fullName}</strong>.
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; background:#fafafa; border:1px solid #ececec; border-radius:10px; overflow:hidden;">
              <tbody>
                ${Object.entries(userDetails)
                  .map(([label, value]) => {
                    const safeValue = value || "N/A";
                    return `
                      <tr>
                        <td style="padding:12px 16px; border-bottom:1px solid #ececec; font-size:13px; color:#52525b; width:180px; font-weight:600; background:#f8fafc;">
                          ${label}
                        </td>
                        <td style="padding:12px 16px; border-bottom:1px solid #ececec; font-size:13px; color:#1f2937; line-height:1.5;">
                          ${safeValue}
                        </td>
                      </tr>
                    `;
                  })
                  .join("")}
              </tbody>
            </table>

            <p style="margin:20px 0 0; font-size:12px; line-height:1.7; color:#6b7280;">
              This notification was generated automatically by the Apex Krish Capital investor profile system and dispatched to all administrator accounts.
            </p>
          </div>
        </div>
      </div>
    `,
    attachments: logoAttachment ? [logoAttachment] : undefined,
  });

  return { sent: true, to: recipientEmails };
}

export async function sendAccessRequestNotification(params: {
  userName?: string;
  userEmail: string;
  userPhone?: string;
  investorStatus?: string;
  offeringId: string;
  offeringName: string;
}) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = Number(process.env.SMTP_PORT || 587);

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn(
      "Access request notification skipped: SMTP_HOST, SMTP_USER, and SMTP_PASS must be configured."
    );
    return { sent: false, reason: "missing_smtp_configuration" };
  }

  const recipientEmails = await getAdminNotificationEmails();
  if (recipientEmails.length === 0) {
    return { sent: false, reason: "no_recipients_found" };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const displayName =
    params.userName && params.userName.trim().length > 0
      ? params.userName.trim()
      : params.userEmail;

  const subject = `Allocation Access Request: ${displayName} requested access to ${params.offeringName}`;

  const requestDetails = {
    "Investor Name": params.userName || "N/A",
    "Investor Email": params.userEmail,
    "Phone Number": params.userPhone || "N/A",
    "Investor Status": params.investorStatus || "N/A",
    "Requested Allocation": params.offeringName,
    "Offering ID": params.offeringId,
    "Requested At": new Date().toLocaleString("en-US", { timeZoneName: "short" }),
  };

  const detailRows = Object.entries(requestDetails)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");

  const logoPath = path.join(process.cwd(), "public", "apexkrishnalogo.png");
  const logoAttachment = fs.existsSync(logoPath)
    ? {
        filename: "apexkrishnalogo.png",
        path: logoPath,
        cid: "apexKrishLogo",
      }
    : null;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || smtpUser,
    to: recipientEmails,
    subject,
    text: `New Allocation Access Request\n\n${displayName} has requested access to ${params.offeringName}.\n\n${detailRows}`,
    html: `
      <div style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif; color:#1a1a1a;">
        <div style="max-width:700px; margin:0 auto; background:#ffffff; border:1px solid #e7e7e7; border-radius:12px; overflow:hidden;">
          <div style="padding:24px 32px 16px; border-bottom:1px solid #ececec; background:#ffffff;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td align="left" valign="middle" style="padding:0;">
                  ${
                    logoAttachment
                      ? `<img src="cid:apexKrishLogo" alt="Apex Krish Capital" width="180" style="display:block; max-width:180px; height:auto; border:0;" />`
                      : ""
                  }
                </td>
              </tr>
            </table>
          </div>

          <div style="padding:32px; background:#ffffff;">
            <div style="font-size:12px; letter-spacing:1.5px; text-transform:uppercase; color:#059669; font-weight:bold; margin-bottom:12px;">
              New Allocation Access Request
            </div>

            <h2 style="margin:0 0 12px; font-size:26px; line-height:1.3; color:#111827; font-weight:700;">
              Access Request: ${params.offeringName}
            </h2>

            <p style="margin:0 0 22px; font-size:15px; line-height:1.7; color:#3f3f46;">
              <strong>${displayName}</strong> (<a href="mailto:${params.userEmail}" style="color:#2563eb; text-decoration:underline;">${params.userEmail}</a>) has requested access to the active allocation for <strong>${params.offeringName}</strong>.
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; background:#fafafa; border:1px solid #ececec; border-radius:10px; overflow:hidden;">
              <tbody>
                ${Object.entries(requestDetails)
                  .map(([label, value]) => {
                    return `
                      <tr>
                        <td style="padding:12px 16px; border-bottom:1px solid #ececec; font-size:13px; color:#52525b; width:180px; font-weight:600; background:#f8fafc;">
                          ${label}
                        </td>
                        <td style="padding:12px 16px; border-bottom:1px solid #ececec; font-size:13px; color:#1f2937; line-height:1.5;">
                          ${value}
                        </td>
                      </tr>
                    `;
                  })
                  .join("")}
              </tbody>
            </table>

            <p style="margin:24px 0 0; font-size:12px; line-height:1.7; color:#6b7280;">
              This notification was generated automatically by the Apex Krish Capital investment portal upon receiving an access request.
            </p>
          </div>
        </div>
      </div>
    `,
    attachments: logoAttachment ? [logoAttachment] : undefined,
  });

  return { sent: true, to: recipientEmails };
}
