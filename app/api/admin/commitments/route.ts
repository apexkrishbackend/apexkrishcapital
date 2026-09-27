import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Commitment from "@/models/commitment.model";
import User from "@/models/user.model";
import { OFFERINGS_CATALOG } from "@/lib/constants/offerings";
import { logAdminAction } from "@/lib/audit-logger";
import { getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const offeringFilter = searchParams.get("offeringId");
    const typeFilter = searchParams.get("type");
    const statusFilter = searchParams.get("status");
    const search = searchParams.get("search")?.trim().toLowerCase();

    // Query all records for accurate global metrics & breakdown calculation
    const allRecords = await Commitment.find({})
      .populate("userId", "name email phoneNumber investorStatus citizenship verificationStatus")
      .sort({ createdAt: -1 })
      .lean();

    const allFormatted = allRecords.map((record: any) => {
      const user = record.userId || {};
      return {
        id: record._id.toString(),
        userId: user._id ? user._id.toString() : record.userId?.toString(),
        userName: record.userName || user.name || "Anonymous Investor",
        userEmail: record.userEmail || user.email,
        userPhone: user.phoneNumber || null,
        investorStatus: user.investorStatus || "Accredited",
        citizenship: user.citizenship || "US",
        userVerificationStatus: user.verificationStatus || "pending verification",
        offeringId: record.offeringId,
        offeringTitle: record.offeringTitle,
        type: record.type, // 'interest' | 'commitment'
        amount: record.amount || null,
        status: record.status || "active",
        notes: record.notes || "",
        createdAt: record.createdAt?.toISOString() || null,
        updatedAt: record.updatedAt?.toISOString() || null,
      };
    });

    // Compute Per-Offering Breakdowns using OFFERINGS_CATALOG + any additional discovered offerings
    const catalogMap = new Map<string, any>();
    OFFERINGS_CATALOG.forEach((offering) => {
      catalogMap.set(offering.id, {
        offeringId: offering.id,
        title: offering.title,
        companyName: offering.companyName,
        roundName: offering.roundName,
        description: offering.description,
        targetAllocation: offering.targetAllocation,
        minCheckSize: offering.minCheckSize,
        valuation: offering.valuation,
        status: offering.status,
        category: offering.category,
        committedCapital: 0,
        commitmentsCount: 0,
        interestsCount: 0,
        wiresReceivedCapital: 0,
        allocatedCapital: 0,
        percentFilled: 0,
        averageCheckSize: 0,
        isOversubscribed: false,
        oversubscribedAmount: 0,
      });
    });

    allFormatted.forEach((item) => {
      if (!catalogMap.has(item.offeringId)) {
        catalogMap.set(item.offeringId, {
          offeringId: item.offeringId,
          title: item.offeringTitle,
          companyName: item.offeringTitle,
          roundName: "Direct Syndicate",
          description: "",
          targetAllocation: 100000,
          minCheckSize: 5000,
          valuation: "—",
          status: "active",
          category: "Direct SPV",
          committedCapital: 0,
          commitmentsCount: 0,
          interestsCount: 0,
          wiresReceivedCapital: 0,
          allocatedCapital: 0,
          percentFilled: 0,
          averageCheckSize: 0,
          isOversubscribed: false,
          oversubscribedAmount: 0,
        });
      }

      const offering = catalogMap.get(item.offeringId);
      if (item.type === "commitment" && item.status !== "cancelled") {
        const amount = item.amount || 0;
        offering.committedCapital += amount;
        offering.commitmentsCount += 1;

        if (item.status === "wire_received") {
          offering.wiresReceivedCapital += amount;
        } else if (item.status === "allocated") {
          offering.allocatedCapital += amount;
        }
      } else if (item.type === "interest" && item.status !== "cancelled") {
        offering.interestsCount += 1;
      }
    });

    // Compute ratios
    const offeringBreakdowns = Array.from(catalogMap.values()).map((offering) => {
      const percent = offering.targetAllocation > 0
        ? Math.round((offering.committedCapital / offering.targetAllocation) * 100)
        : 0;
      const avgCheck = offering.commitmentsCount > 0
        ? Math.round(offering.committedCapital / offering.commitmentsCount)
        : 0;
      const isOver = offering.committedCapital > offering.targetAllocation;
      const overAmount = isOver ? offering.committedCapital - offering.targetAllocation : 0;

      return {
        ...offering,
        percentFilled: percent,
        averageCheckSize: avgCheck,
        isOversubscribed: isOver,
        oversubscribedAmount: overAmount,
      };
    });

    // Global Stats
    const totalCommittedCapital = allFormatted
      .filter((c) => c.type === "commitment" && c.status !== "cancelled" && c.amount)
      .reduce((sum, c) => sum + (c.amount || 0), 0);

    const totalCommitmentsCount = allFormatted.filter(
      (c) => c.type === "commitment" && c.status !== "cancelled"
    ).length;

    const totalInterestsCount = allFormatted.filter(
      (c) => c.type === "interest" && c.status !== "cancelled"
    ).length;

    const totalWiresReceivedCapital = allFormatted
      .filter((c) => c.type === "commitment" && c.status === "wire_received" && c.amount)
      .reduce((sum, c) => sum + (c.amount || 0), 0);

    const totalAllocatedCapital = allFormatted
      .filter((c) => c.type === "commitment" && c.status === "allocated" && c.amount)
      .reduce((sum, c) => sum + (c.amount || 0), 0);

    // Apply filters to records returned for the table if query params exist
    let filteredCommitments = allFormatted;

    if (offeringFilter && offeringFilter !== "all") {
      filteredCommitments = filteredCommitments.filter(
        (c) => c.offeringId === offeringFilter
      );
    }

    if (typeFilter && typeFilter !== "all") {
      filteredCommitments = filteredCommitments.filter(
        (c) => c.type === typeFilter
      );
    }

    if (statusFilter && statusFilter !== "all") {
      filteredCommitments = filteredCommitments.filter(
        (c) => c.status === statusFilter
      );
    }

    if (search) {
      filteredCommitments = filteredCommitments.filter((c) => {
        const nameMatch = c.userName.toLowerCase().includes(search);
        const emailMatch = c.userEmail.toLowerCase().includes(search);
        const phoneMatch = c.userPhone ? c.userPhone.toLowerCase().includes(search) : false;
        const offeringMatch = c.offeringTitle.toLowerCase().includes(search);
        const amountMatch = c.amount ? c.amount.toString().includes(search) : false;
        return nameMatch || emailMatch || phoneMatch || offeringMatch || amountMatch;
      });
    }

    return NextResponse.json({
      commitments: filteredCommitments,
      allCommitments: allFormatted,
      offerings: offeringBreakdowns,
      stats: {
        totalCommittedCapital,
        totalCommitmentsCount,
        totalInterestsCount,
        totalWiresReceivedCapital,
        totalAllocatedCapital,
        activeOfferingsCount: offeringBreakdowns.filter((o) => o.status === "active").length,
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch admin commitments:", error);
    return NextResponse.json(
      { error: "Unable to fetch commitments" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Commitment ID is required" }, { status: 400 });
    }

    const validStatuses = ["active", "wire_received", "allocated", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    await dbConnect();

    const updateFields: Record<string, any> = {};
    if (status) updateFields.status = status;
    if (typeof notes === "string") updateFields.notes = notes;

    const updated = await Commitment.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Commitment not found" }, { status: 404 });
    }

    // Record immutable audit entry
    await logAdminAction({
      adminUserId: userId,
      adminEmail: (sessionClaims as any)?.email || undefined,
      action: "commitment_status_updated",
      targetEntity: "commitment",
      targetId: id,
      ipAddress: getClientIp(req),
      userAgent: req.headers.get("user-agent") || undefined,
      details: {
        newStatus: status,
        notesUpdated: typeof notes === "string",
      },
    });

    return NextResponse.json({
      success: true,
      commitment: {
        id: updated._id.toString(),
        status: updated.status,
        notes: updated.notes,
      },
    });
  } catch (error: any) {
    console.error("Failed to update commitment status:", error);
    return NextResponse.json(
      { error: "Failed to update commitment" },
      { status: 500 }
    );
  }
}
