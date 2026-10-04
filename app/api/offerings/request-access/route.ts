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
    const {
      offeringId,
      offeringName,
      userEmail,
      email,
      userName,
      name,
      fullName,
      userPhone,
      phone,
      citizenship,
      investorStatus,
      contactPreferences,
    } = body;

    // Try resolving authenticated Clerk user
    let clerkUser: any = null;
    try {
      clerkUser = await currentUser();
    } catch {
      // Not authenticated or Clerk request outside auth context
    }

    let resolvedEmail = (userEmail || email)?.trim()?.toLowerCase();
    let resolvedName = (fullName || userName || name)?.trim();
    let resolvedPhone = (userPhone || phone)?.trim();
    let resolvedCitizenship = citizenship?.trim() || "United States";
    let resolvedInvestorStatus = investorStatus?.trim() || "Accredited Investor";
    let resolvedContactPreferences = contactPreferences || ["Email"];

    if (clerkUser) {
      const primaryEmail = clerkUser.emailAddresses?.find(
        (e: any) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress;

      if (primaryEmail && !resolvedEmail) {
        resolvedEmail = primaryEmail.toLowerCase();
      }

      const clerkFullName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
      if (clerkFullName && !resolvedName) {
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
          if (dbUser.investorStatus && !investorStatus) {
            resolvedInvestorStatus = dbUser.investorStatus;
          }
        }
      } catch (dbErr) {
        console.warn("DB user lookup warning in access request:", dbErr);
      }
    }

    if (!resolvedEmail || !resolvedEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required to submit an access request." },
        { status: 400 }
      );
    }

    if (!resolvedName) {
      return NextResponse.json(
        { error: "Full name is required to submit an access request." },
        { status: 400 }
      );
    }

    // Fetch offering display name if passed
    let finalOfferingName = offeringName || "Apex Krish Capital Deal Room";
    if (offeringId && offeringId !== "general-access" && (!offeringName || offeringName === "Active Allocation")) {
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

    // Dispatch email notification to all admins in the background without blocking the user response
    sendAccessRequestNotification({
      userName: resolvedName || undefined,
      userEmail: resolvedEmail,
      userPhone: resolvedPhone || undefined,
      citizenship: resolvedCitizenship,
      investorStatus: resolvedInvestorStatus,
      contactPreferences: resolvedContactPreferences,
      offeringId: offeringId || "general-access",
      offeringName: finalOfferingName,
    }).catch((emailErr) => {
      console.error("Background access request email error:", emailErr);
    });

    return NextResponse.json({
      success: true,
      message: `Access request successfully submitted.`,
    });
  } catch (error: any) {
    console.error("Failed to process access request:", error);
    return NextResponse.json(
      { error: "Failed to process access request", message: error.message },
      { status: 500 }
    );
  }
}

