import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user.model";
import Commitment from "@/models/commitment.model";

export async function GET() {
  try {
    const { userId: clerkUserId, sessionClaims } = await auth();
    const isAdmin = sessionClaims?.metadata?.role === "admin";

    if (!clerkUserId) {
      return NextResponse.json({
        isSignedIn: false,
        verificationStatus: null,
        interactions: {},
      });
    }

    const clerkUser = await currentUser();
    const email =
      clerkUser?.primaryEmailAddress?.emailAddress ||
      clerkUser?.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return NextResponse.json({
        isSignedIn: true,
        verificationStatus: isAdmin ? "verified" : null,
        interactions: {},
      });
    }

    await dbConnect();

    const dbUser = await User.findOne({ email: email.toLowerCase().trim() });
    let verificationStatus = dbUser?.verificationStatus || "pending verification";

    if (isAdmin || dbUser?.role === "admin") {
      verificationStatus = "verified";
    }

    const isProfileSaved = !!(
      dbUser &&
      dbUser.firstName &&
      dbUser.lastName &&
      dbUser.phoneNumber &&
      dbUser.investorStatus
    );

    const interactionsMap: Record<
      string,
      { type: "interest" | "commitment"; amount?: number | null }
    > = {};

    if (dbUser) {
      const commitments = await Commitment.find({
        userId: dbUser._id,
        status: "active",
      }).lean();

      commitments.forEach((item) => {
        interactionsMap[item.offeringId] = {
          type: item.type,
          amount: item.amount,
        };
      });
    }

    return NextResponse.json({
      isSignedIn: true,
      isAdmin: !!(isAdmin || dbUser?.role === "admin"),
      verificationStatus,
      isProfileSaved,
      interactions: interactionsMap,
    });
  } catch (error: any) {
    console.error("Failed to fetch user interactions:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

