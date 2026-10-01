import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user.model";
import Offering from "@/models/offering.model";
import { sendAccessRequestNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { offeringId, offeringName, userEmail, userName, userPhone } = body;

    if (!offeringName && !offeringId) {
      return NextResponse.json(
        { error: "Offering identifier or name is required." },
        { status: 400 }
      );
    }

    // Try resolving authenticated Clerk user
    let clerkUser: any = null;
    try {
      clerkUser = await currentUser();
    } catch {
      // Not authenticated or Clerk request outside auth context
    }

    let resolvedEmail = userEmail?.trim()?.toLowerCase();
    let resolvedName = userName?.trim();
    let resolvedPhone = userPhone?.trim();
    let investorStatus = "Accredited (Investor Portal)";

    if (clerkUser) {
      const primaryEmail = clerkUser.emailAddresses?.find(
        (e: any) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress;

      if (primaryEmail) {
        resolvedEmail = primaryEmail.toLowerCase();
      }

      const clerkFullName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
      if (clerkFullName) {
        resolvedName = clerkFullName;
      }

      if (clerkUser.phoneNumbers?.[0]?.phoneNumber && !resolvedPhone) {
        resolvedPhone = clerkUser.phoneNumbers[0].phoneNumber;
      }
    }

    // Lookup user in MongoDB for extra profile info if email is present
    if (resolvedEmail) {
      try {
        await dbConnect();
        const dbUser = await User.findOne({ email: resolvedEmail }).lean();
        if (dbUser) {
          if (!resolvedName && dbUser.name) {
            resolvedName = dbUser.name;
          }
          if (!resolvedPhone && dbUser.phoneNumber) {
            resolvedPhone = dbUser.phoneNumber;
          }
          if (dbUser.investorStatus) {
            investorStatus = dbUser.investorStatus;
          }
        }
      } catch (dbErr) {
        console.warn("DB user lookup warning in access request:", dbErr);
      }
    }

    if (!resolvedEmail) {
      return NextResponse.json(
        { error: "An email address is required to submit an access request." },
        { status: 400 }
      );
    }

    // Fetch offering display name if not passed
    let finalOfferingName = offeringName;
    if (!finalOfferingName && offeringId) {
      try {
        await dbConnect();
        const offDoc = await Offering.findOne({ offeringId }).lean();
        if (offDoc?.name) {
          finalOfferingName = offDoc.name;
        }
      } catch {
        finalOfferingName = offeringId;
      }
    }

    // Send email notification to all admins
    const emailResult = await sendAccessRequestNotification({
      userName: resolvedName || undefined,
      userEmail: resolvedEmail,
      userPhone: resolvedPhone || undefined,
      investorStatus,
      offeringId: offeringId || "active-allocation",
      offeringName: finalOfferingName || "Active Allocation",
    });

    return NextResponse.json({
      success: true,
      message: `Access request for ${finalOfferingName} sent to administrators.`,
      emailResult,
    });
  } catch (error: any) {
    console.error("Failed to process access request:", error);
    return NextResponse.json(
      { error: "Failed to process access request", message: error.message },
      { status: 500 }
    );
  }
}
