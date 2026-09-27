import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Commitment from "@/models/commitment.model";
import DealLink from "@/models/deal-link.model";
import BroadcastLog, { IBroadcastRecipient } from "@/models/broadcast-log.model";
import User from "@/models/user.model";
import {
  sendBroadcastEmail,
  generateWhatsAppLink,
  cleanPhoneNumber,
} from "@/lib/broadcast";
import { broadcastSchema } from "@/lib/validations/schemas";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/audit-logger";

export async function GET(req: NextRequest) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const offeringId = searchParams.get("offeringId");
  const audience = searchParams.get("audience") || "interests_only";
  const verifiedOnly = searchParams.get("verifiedOnly") === "true";

  if (!offeringId) {
    return NextResponse.json(
      { error: "Offering ID is required" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    // Fetch stored deal link
    const dealLink = await DealLink.findOne({ offeringId }).lean();
    const currentUrl = dealLink?.thirdPartyUrl || "";

    const userMap = new Map<string, any>();

    if (audience === "all_platform_investors") {
      // Query all users from User collection
      const allUsers = await User.find({ role: "user" })
        .select("name email phoneNumber verificationStatus investorStatus citizenship")
        .lean();

      allUsers.forEach((u: any) => {
        if (verifiedOnly && u.verificationStatus !== "verified") return;
        const uId = u._id ? u._id.toString() : u.id;
        if (!uId) return;

        const phone = u.phoneNumber || null;
        const hasValidPhone = !!cleanPhoneNumber(phone);
        const userName = u.name || "Investor";

        userMap.set(uId, {
          userId: uId,
          userName,
          userEmail: u.email,
          userPhone: phone,
          hasValidPhone,
          verificationStatus: u.verificationStatus || "pending verification",
          type: "interest",
          amount: null,
          offeringId,
          offeringTitle: offeringId,
          whatsAppLink: hasValidPhone
            ? generateWhatsAppLink(phone, {
                userName,
                offeringTitle: offeringId,
                thirdPartyUrl: currentUrl,
              })
            : null,
        });
      });
    } else {
      // Query commitments and populate user profile
      const records = await Commitment.find({
        offeringId,
        status: { $ne: "cancelled" },
      })
        .populate("userId", "name email phoneNumber verificationStatus investorStatus citizenship")
        .lean();

      // Apply verified filter if enabled
      const filteredByVerification = verifiedOnly
        ? records.filter((r: any) => {
            const user = r.userId || {};
            return user.verificationStatus === "verified";
          })
        : records;

      // Apply audience filter
      const audienceFiltered = filteredByVerification.filter((r: any) => {
        if (audience === "commitments_only") return r.type === "commitment";
        if (audience === "interests_only" || audience === "all_interested") return r.type === "interest";
        // 'all_deal_lps' or 'all_verified' includes both commitment & interest
        return true;
      });

      // Deduplicate by user ID
      audienceFiltered.forEach((r: any) => {
        const u = r.userId || {};
        const uId = u._id ? u._id.toString() : r.userId?.toString();
        if (!uId) return;

        const existing = userMap.get(uId);
        if (!existing || (r.amount && (!existing.amount || r.amount > existing.amount))) {
          const phone = u.phoneNumber || r.userPhone || null;
          const hasValidPhone = !!cleanPhoneNumber(phone);
          const userName = r.userName || u.name || "Investor";

          userMap.set(uId, {
            userId: uId,
            userName,
            userEmail: r.userEmail || u.email,
            userPhone: phone,
            hasValidPhone,
            verificationStatus: u.verificationStatus || "pending verification",
            type: r.type,
            amount: r.amount || null,
            offeringId: r.offeringId,
            offeringTitle: r.offeringTitle,
            whatsAppLink: hasValidPhone
              ? generateWhatsAppLink(phone, {
                  userName,
                  offeringTitle: r.offeringTitle || offeringId,
                  thirdPartyUrl: currentUrl,
                })
              : null,
          });
        }
      });
    }

    const recipients = Array.from(userMap.values());

    return NextResponse.json({
      offeringId,
      thirdPartyUrl: dealLink?.thirdPartyUrl || "",
      instructions: dealLink?.instructions || "",
      totalRecipients: recipients.length,
      recipientsWithEmail: recipients.filter((r) => !!r.userEmail).length,
      recipientsWithPhone: recipients.filter((r) => r.hasValidPhone).length,
      recipients,
    });
  } catch (error: any) {
    console.error("Failed to preview broadcast recipients:", error);
    return NextResponse.json(
      { error: "Failed to preview broadcast audience" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  // Rate limit: 10 broadcasts per 5 minutes per admin
  const limiter = rateLimit(`admin_broadcast_${userId}`, {
    limit: 10,
    windowMs: 5 * 60 * 1000,
  });

  if (!limiter.success) {
    return NextResponse.json(
      { error: `Broadcast rate limit exceeded. Please wait ${limiter.reset}s before dispatching again.` },
      { status: 429 }
    );
  }

  try {
    const rawBody = await req.json();
    const validation = broadcastSchema.safeParse(rawBody);

    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || "Invalid broadcast payload.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const {
      offeringId,
      offeringTitle,
      targetAudience,
      verifiedOnly,
      thirdPartyUrl,
      subject,
      customMessage,
      channel,
      sendEmail,
      sendWhatsApp,
    } = validation.data;

    const shouldSendEmail = channel === "email" || channel === "both" || sendEmail === true;
    const shouldSendWhatsApp = channel === "whatsapp" || channel === "both" || sendWhatsApp === true;
    const trimmedUrl = thirdPartyUrl.trim();

    await dbConnect();

    // Persist or update the link in DealLink collection
    await DealLink.findOneAndUpdate(
      { offeringId },
      {
        $set: {
          thirdPartyUrl: trimmedUrl,
          updatedBy: userId,
        },
      },
      { upsert: true }
    );

    const userMap = new Map<string, any>();

    if (targetAudience === "all_platform_investors") {
      const allUsers = await User.find({ role: "user" })
        .select("name email phoneNumber verificationStatus investorStatus citizenship")
        .lean();

      allUsers.forEach((u: any) => {
        if (verifiedOnly && u.verificationStatus !== "verified") return;
        const uId = u._id ? u._id.toString() : u.id;
        if (!uId) return;

        userMap.set(uId, {
          userId: uId,
          userName: u.name || "Investor",
          userEmail: u.email,
          userPhone: u.phoneNumber || null,
          verificationStatus: u.verificationStatus || "pending verification",
          type: "interest",
          amount: null,
        });
      });
    } else {
      // Fetch commitments for this offering
      const records = await Commitment.find({
        offeringId,
        status: { $ne: "cancelled" },
      })
        .populate("userId", "name email phoneNumber verificationStatus investorStatus citizenship")
        .lean();

      // Apply verification filter if requested
      const filteredByVerification = verifiedOnly
        ? records.filter((r: any) => {
            const user = r.userId || {};
            return user.verificationStatus === "verified";
          })
        : records;

      // Apply audience filter
      const audienceFiltered = filteredByVerification.filter((r: any) => {
        if (targetAudience === "commitments_only") return r.type === "commitment";
        if (targetAudience === "interests_only" || targetAudience === "all_interested") return r.type === "interest";
        return true;
      });

      // Deduplicate by user ID
      audienceFiltered.forEach((r: any) => {
        const u = r.userId || {};
        const uId = u._id ? u._id.toString() : r.userId?.toString();
        if (!uId) return;

        const existing = userMap.get(uId);
        if (!existing || (r.amount && (!existing.amount || r.amount > existing.amount))) {
          userMap.set(uId, {
            userId: uId,
            userName: r.userName || u.name || "Investor",
            userEmail: r.userEmail || u.email,
            userPhone: u.phoneNumber || r.userPhone || null,
            verificationStatus: u.verificationStatus || "pending verification",
            type: r.type,
            amount: r.amount || null,
          });
        }
      });
    }

    const uniqueRecipients = Array.from(userMap.values());

    if (uniqueRecipients.length === 0) {
      return NextResponse.json(
        {
          error:
            "No investors found matching the selected target audience criteria.",
        },
        { status: 400 }
      );
    }

    const emailSubject =
      subject ||
      `Priority Access: ${offeringTitle || offeringId} SPV Subscription & Closing Portal`;

    const broadcastResults: IBroadcastRecipient[] = [];
    const whatsappRoster: Array<{
      userId: string;
      userName: string;
      userEmail: string;
      userPhone: string | null;
      whatsAppLink: string | null;
      emailStatus: string;
      verificationStatus: string;
      type: "commitment" | "interest";
      amount: number | null;
    }> = [];

    let emailsSent = 0;
    let whatsappProcessed = 0;

    // Process each target investor
    for (const recipient of uniqueRecipients) {
      let emailStatus: "sent" | "failed" | "skipped" = "skipped";
      let whatsappStatus: "sent" | "link_generated" | "failed" | "skipped" = "skipped";
      let errorMsg: string | undefined;
      let whatsAppLink: string | null = null;

      // 1. Send Email (if enabled)
      if (shouldSendEmail && recipient.userEmail) {
        const emailRes = await sendBroadcastEmail({
          to: recipient.userEmail,
          userName: recipient.userName,
          offeringTitle: offeringTitle || offeringId,
          type: recipient.type,
          amount: recipient.amount,
          thirdPartyUrl: trimmedUrl,
          customMessage,
          subject: emailSubject,
        });

        if (emailRes.success) {
          emailStatus = "sent";
          emailsSent += 1;
        } else {
          emailStatus = "failed";
          errorMsg = emailRes.error;
        }
      }

      // 2. Generate WhatsApp Link (always generated for phone holders so admin can use immediately on screen)
      if (recipient.userPhone) {
        whatsAppLink = generateWhatsAppLink(recipient.userPhone, {
          userName: recipient.userName,
          offeringTitle: offeringTitle || offeringId,
          thirdPartyUrl: trimmedUrl,
          customMessage,
        });

        if (whatsAppLink) {
          whatsappStatus = "link_generated";
          if (shouldSendWhatsApp) {
            whatsappProcessed += 1;
          }
        }
      }

      broadcastResults.push({
        userId: recipient.userId,
        userName: recipient.userName,
        userEmail: recipient.userEmail,
        userPhone: recipient.userPhone,
        type: recipient.type,
        amount: recipient.amount,
        emailStatus,
        whatsappStatus,
        error: errorMsg,
      });

      whatsappRoster.push({
        userId: recipient.userId,
        userName: recipient.userName,
        userEmail: recipient.userEmail,
        userPhone: recipient.userPhone,
        whatsAppLink,
        emailStatus,
        verificationStatus: recipient.verificationStatus,
        type: recipient.type,
        amount: recipient.amount,
      });
    }

    // Persist audit record in BroadcastLog
    await BroadcastLog.create({
      offeringId,
      offeringTitle: offeringTitle || offeringId,
      adminUserId: userId,
      targetAudience,
      thirdPartyUrl: trimmedUrl,
      subject: emailSubject,
      customMessage,
      totalRecipients: uniqueRecipients.length,
      emailsSent,
      whatsappProcessed: shouldSendWhatsApp ? whatsappProcessed : 0,
      recipients: broadcastResults,
    });

    // Record immutable admin audit log
    await logAdminAction({
      adminUserId: userId,
      adminEmail: (sessionClaims as any)?.email || undefined,
      action: "broadcast_dispatched",
      targetEntity: "offering",
      targetId: offeringId,
      ipAddress: getClientIp(req),
      userAgent: req.headers.get("user-agent") || undefined,
      details: {
        offeringTitle: offeringTitle || offeringId,
        targetAudience,
        totalRecipients: uniqueRecipients.length,
        emailsSent,
        whatsappProcessed: shouldSendWhatsApp ? whatsappProcessed : 0,
      },
    });

    let message = "";
    if (shouldSendEmail && shouldSendWhatsApp) {
      message = `Dispatched ${emailsSent} emails and prepared ${whatsappRoster.filter(w => !!w.whatsAppLink).length} WhatsApp links.`;
    } else if (shouldSendEmail) {
      message = `Dispatched ${emailsSent} email broadcast(s) successfully.`;
    } else {
      message = `Generated WhatsApp links for ${whatsappRoster.filter(w => !!w.whatsAppLink).length} investor(s).`;
    }

    return NextResponse.json({
      success: true,
      message,
      totalRecipients: uniqueRecipients.length,
      emailsSent,
      whatsappProcessed: whatsappRoster.filter(w => !!w.whatsAppLink).length,
      whatsappRoster,
    });
  } catch (error: any) {
    console.error("Broadcast execution error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute broadcast." },
      { status: 500 }
    );
  }
}
