import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Offering from "@/models/offering.model";
import Commitment from "@/models/commitment.model";
import { logAdminAction } from "@/lib/audit-logger";
import { getClientIp } from "@/lib/rate-limit";
import { ensureOfferingsSeeded } from "@/lib/offerings-service";

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    const clerkUser = await currentUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (sessionClaims?.metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      offeringId: rawOfferingId,
      badge,
      roundType,
      description,
      valuation,
      valuationSub,
      fundingGoal,
      goalSub,
      minCheck,
      minCheckSub,
      minCheckNum,
      eligibility,
      eligibilitySub,
      closingDate,
    } = body;

    if (!name || !description || !valuation) {
      return NextResponse.json(
        { error: "Company name, description, and valuation are required." },
        { status: 400 }
      );
    }

    // Generate safe slug for offeringId if not provided
    const safeOfferingId = (
      rawOfferingId ||
      name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    ).trim();

    await dbConnect();
    await ensureOfferingsSeeded();

    // Check for duplicate offeringId
    const existing = await Offering.findOne({ offeringId: safeOfferingId });
    if (existing) {
      return NextResponse.json(
        { error: `An offering with identifier '${safeOfferingId}' already exists.` },
        { status: 409 }
      );
    }

    const newOffering = await Offering.create({
      offeringId: safeOfferingId,
      name: name.trim(),
      badge: badge?.trim() || "Active SPV Allocation",
      roundType: roundType?.trim() || "Direct Equity SPV",
      description: description.trim(),
      valuation: valuation.trim(),
      valuationSub: valuationSub?.trim() || "Pre-money round",
      fundingGoal: fundingGoal?.trim() || "$123K",
      goalSub: goalSub?.trim() || "Allocation cap",
      minCheck: minCheck?.trim() || "$5K",
      minCheckSub: minCheckSub?.trim() || "USD accredited entry",
      minCheckNum: Number(minCheckNum) || 5000,
      eligibility: eligibility?.trim() || "Accredited",
      eligibilitySub: eligibilitySub?.trim() || "SEC 506(c)",
      closingDate: closingDate?.trim() || "Open",
      status: "active",
      pastStatusText: "Funded & Closed",
      pastBadge: roundType?.trim() || "Direct SPV",
      displayOrder: 0,
    });

    const adminEmail =
      clerkUser?.primaryEmailAddress?.emailAddress ||
      clerkUser?.emailAddresses?.[0]?.emailAddress ||
      undefined;

    await logAdminAction({
      adminUserId: userId,
      adminEmail,
      action: "offering_created",
      targetEntity: "offering",
      targetId: safeOfferingId,
      ipAddress: getClientIp(req),
      userAgent: req.headers.get("user-agent") || undefined,
      details: {
        offeringName: newOffering.name,
        valuation: newOffering.valuation,
        fundingGoal: newOffering.fundingGoal,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Offering '${newOffering.name}' created successfully.`,
      offering: newOffering,
    });
  } catch (error: any) {
    console.error("Failed to create offering:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    const clerkUser = await currentUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (sessionClaims?.metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const body = await req.json();
    const { offeringId, status, pastStatusText, closingDate, ...otherUpdates } = body;

    if (!offeringId) {
      return NextResponse.json({ error: "Offering ID is required." }, { status: 400 });
    }

    await dbConnect();
    await ensureOfferingsSeeded();

    const updatePayload: Record<string, any> = { ...otherUpdates };
    if (status) updatePayload.status = status;
    if (pastStatusText) updatePayload.pastStatusText = pastStatusText;
    if (closingDate) updatePayload.closingDate = closingDate;

    // If closing offering, record the close date and month/year
    if (status === "closed") {
      const now = new Date();
      const monthYear = now.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      updatePayload.closedAt = updatePayload.closedAt || now;
      updatePayload.closedMonthYear = updatePayload.closedMonthYear || monthYear;
      if (!closingDate) {
        updatePayload.closingDate = monthYear;
      }
      if (!pastStatusText) {
        updatePayload.pastStatusText = "Funded & Closed";
      }
    }

    const updatedOffering = await Offering.findOneAndUpdate(
      { offeringId },
      { $set: updatePayload },
      { new: true }
    );

    if (!updatedOffering) {
      return NextResponse.json({ error: "Offering not found." }, { status: 404 });
    }

    const adminEmail =
      clerkUser?.primaryEmailAddress?.emailAddress ||
      clerkUser?.emailAddresses?.[0]?.emailAddress ||
      undefined;

    await logAdminAction({
      adminUserId: userId,
      adminEmail,
      action: status === "closed" ? "offering_closed" : "offering_updated",
      targetEntity: "offering",
      targetId: offeringId,
      ipAddress: getClientIp(req),
      userAgent: req.headers.get("user-agent") || undefined,
      details: {
        offeringName: updatedOffering.name,
        newStatus: updatedOffering.status,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        status === "closed"
          ? `Offering '${updatedOffering.name}' closed and moved to Past Offerings.`
          : `Offering '${updatedOffering.name}' updated successfully.`,
      offering: updatedOffering,
    });
  } catch (error: any) {
    console.error("Failed to update offering:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    const clerkUser = await currentUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (sessionClaims?.metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    let offeringId = searchParams.get("offeringId");

    if (!offeringId) {
      try {
        const body = await req.json();
        offeringId = body.offeringId;
      } catch {}
    }

    if (!offeringId) {
      return NextResponse.json({ error: "Offering ID is required." }, { status: 400 });
    }

    await dbConnect();

    // Clean match by ID, slug, or normalized name
    const rawId = offeringId.trim();
    const normalizedId = rawId.toLowerCase().replace(/[^a-z0-9]/g, "");

    const deletedDocs = await Offering.find({
      $or: [
        { offeringId: rawId },
        { offeringId: rawId.toLowerCase() },
        { offeringId: normalizedId },
        { name: new RegExp(`^${rawId}$`, "i") },
      ],
    });

    await Offering.deleteMany({
      $or: [
        { offeringId: rawId },
        { offeringId: rawId.toLowerCase() },
        { offeringId: normalizedId },
        { name: new RegExp(`^${rawId}$`, "i") },
      ],
    });

    // Cascade delete all commitments and interests associated with this deleted offering
    const allMatchingOfferingIds = Array.from(
      new Set([
        rawId,
        rawId.toLowerCase(),
        normalizedId,
        ...deletedDocs.map((d: any) => d.offeringId),
      ].filter(Boolean))
    );

    await Commitment.deleteMany({
      $or: [
        { offeringId: { $in: allMatchingOfferingIds } },
        { offeringTitle: new RegExp(`^${rawId}$`, "i") },
        ...deletedDocs.map((d: any) => ({ offeringTitle: new RegExp(`^${d.name}$`, "i") })),
      ],
    });

    const deletedName = deletedDocs[0]?.name || rawId;

    const adminEmail =
      clerkUser?.primaryEmailAddress?.emailAddress ||
      clerkUser?.emailAddresses?.[0]?.emailAddress ||
      undefined;

    await logAdminAction({
      adminUserId: userId,
      adminEmail,
      action: "offering_deleted",
      targetEntity: "offering",
      targetId: rawId,
      ipAddress: getClientIp(req),
      userAgent: req.headers.get("user-agent") || undefined,
      details: {
        offeringName: deletedName,
        status: "deleted",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Offering '${deletedName}' deleted successfully.`,
      deletedOfferingId: rawId,
    });
  } catch (error: any) {
    console.error("Failed to delete offering:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
