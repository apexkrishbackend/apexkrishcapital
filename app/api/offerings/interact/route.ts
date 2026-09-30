import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user.model";
import Commitment from "@/models/commitment.model";
import Offering from "@/models/offering.model";

// Minimum investments map per offering
const OFFERING_MINIMUMS: Record<string, { title: string; minAmount: number }> = {
  "micro1-inc": {
    title: "Micro1 Inc. - Direct Shares",
    minAmount: 5000,
  },
  "cursor-anysphere": {
    title: "Cursor (Anysphere) - Series A/B SPV",
    minAmount: 5000,
  },
};

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId, sessionClaims } = await auth();
    const clerkUser = await currentUser();
    const isAdmin = sessionClaims?.metadata?.role === "admin";

    if (!clerkUserId || !clerkUser) {
      return NextResponse.json(
        { error: "Please sign in to interact with this offering." },
        { status: 401 }
      );
    }

    const email =
      clerkUser.primaryEmailAddress?.emailAddress ||
      clerkUser.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "No primary email associated with your account." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check user in database and verify their status
    let dbUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (!dbUser && isAdmin) {
      const adminName =
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        email.split("@")[0];
      dbUser = await User.create({
        email: email.toLowerCase().trim(),
        name: adminName,
        role: "admin",
        verificationStatus: "verified",
      });
    }

    if (!dbUser) {
      return NextResponse.json(
        {
          error:
            "Please complete your investor profile before interacting with offerings.",
          code: "PROFILE_REQUIRED",
        },
        { status: 403 }
      );
    }

    const isUserVerified =
      isAdmin ||
      dbUser.role === "admin" ||
      dbUser.verificationStatus === "verified";

    if (!isUserVerified) {
      return NextResponse.json(
        {
          error:
            "Your investor account is currently pending verification by our administrative team. Once verified, you will be able to commit capital and express interest.",
          code: "VERIFICATION_REQUIRED",
          verificationStatus: dbUser.verificationStatus || "pending verification",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { offeringId, type, amount } = body;

    if (!offeringId || !type) {
      return NextResponse.json(
        { error: "Offering ID and interaction type are required." },
        { status: 400 }
      );
    }

    if (type !== "interest" && type !== "commitment") {
      return NextResponse.json(
        { error: "Invalid interaction type. Must be 'interest' or 'commitment'." },
        { status: 400 }
      );
    }

    // Look up offering from DB or fallback catalog
    const dbOffering = await Offering.findOne({ offeringId }).lean();
    const offeringInfo = {
      title: dbOffering?.name || OFFERING_MINIMUMS[offeringId]?.title || offeringId,
      minAmount: dbOffering?.minCheckNum || OFFERING_MINIMUMS[offeringId]?.minAmount || 5000,
    };

    let parsedAmount: number | null = null;

    if (type === "commitment") {
      parsedAmount = Number(amount);
      if (!parsedAmount || isNaN(parsedAmount)) {
        return NextResponse.json(
          { error: "Please provide a valid commitment amount in dollars." },
          { status: 400 }
        );
      }

      if (parsedAmount < offeringInfo.minAmount) {
        return NextResponse.json(
          {
            error: `Commitment amount must be at least $${offeringInfo.minAmount.toLocaleString()} USD for this offering.`,
          },
          { status: 400 }
        );
      }
    }

    const userName =
      dbUser.name ||
      `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
      email.split("@")[0];

    // Upsert commitment / interest
    const record = await Commitment.findOneAndUpdate(
      {
        userId: dbUser._id,
        offeringId,
      },
      {
        userId: dbUser._id,
        userEmail: email.toLowerCase().trim(),
        userName,
        offeringId,
        offeringTitle: offeringInfo.title,
        type,
        amount: parsedAmount,
        status: "active",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      message:
        type === "commitment"
          ? `Commitment of $${parsedAmount?.toLocaleString()} recorded successfully.`
          : "Interest expressed successfully.",
      record,
    });
  } catch (error: any) {
    console.error("Failed to process offering interaction:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

