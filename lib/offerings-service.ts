import { dbConnect } from "@/lib/dbConnect";
import Offering, { IOffering } from "@/models/offering.model";

export const DEFAULT_SEED_OFFERINGS: Partial<IOffering>[] = [
  {
    offeringId: "micro1-inc",
    name: "Micro1 Inc.",
    badge: "Active SPV Allocation",
    roundType: "Direct Equity SPV",
    description:
      "Micro1 provides AI-driven technical hiring and engineer vetting infrastructure, powering developer teams at top hyper-growth tech companies.",
    closingDate: "Oct 8, 2026",
    valuation: "<$4B",
    valuationSub: "Pre-money round",
    fundingGoal: "$125K",
    goalSub: "Allocation cap",
    minCheck: "$5K",
    minCheckSub: "USD accredited entry",
    minCheckNum: 5000,
    eligibility: "Accredited",
    eligibilitySub: "SEC 506(c)",
    status: "active",
    pastStatusText: "Funded & Closed",
    pastBadge: "Direct SPV",
    displayOrder: 1,
  },
  {
    offeringId: "cursor-anysphere",
    name: "Cursor (Anysphere)",
    badge: "Series A/B SPV Allocation",
    roundType: "Growth SPV Series",
    description:
      "Cursor (Anysphere) is the AI-first code editor and development environment transforming software creation with autonomous developer agent infrastructure.",
    closingDate: "Oct 15, 2026",
    valuation: "$2.5B",
    valuationSub: "Series A/B round",
    fundingGoal: "$150K",
    goalSub: "Allocation cap",
    minCheck: "$5K",
    minCheckSub: "USD accredited entry",
    minCheckNum: 5000,
    eligibility: "Accredited",
    eligibilitySub: "SEC 506(c)",
    status: "active",
    pastStatusText: "Funded & Closed",
    pastBadge: "Series A/B SPV",
    displayOrder: 2,
  },
  {
    offeringId: "scale-ai",
    name: "Scale AI",
    badge: "Series F SPV",
    roundType: "Series F SPV",
    description:
      "Foundational AI data infrastructure and model validation platform.",
    closingDate: "Closed",
    valuation: "$14.0B",
    valuationSub: "Series F round",
    fundingGoal: "$250K",
    goalSub: "Allocation cap",
    minCheck: "$10K",
    minCheckSub: "USD accredited entry",
    minCheckNum: 10000,
    eligibility: "Accredited",
    eligibilitySub: "SEC 506(c)",
    status: "closed",
    pastStatusText: "Distributed",
    pastBadge: "Series F SPV",
    displayOrder: 3,
  },
  {
    offeringId: "xai",
    name: "xAI",
    badge: "Series B SPV",
    roundType: "Series B SPV",
    description:
      "Frontier artificial intelligence research, Grok models, and supercomputing clusters.",
    closingDate: "Closed",
    valuation: "$24.0B",
    valuationSub: "Series B round",
    fundingGoal: "$500K",
    goalSub: "Allocation cap",
    minCheck: "$25K",
    minCheckSub: "USD accredited entry",
    minCheckNum: 25000,
    eligibility: "Accredited",
    eligibilitySub: "SEC 506(c)",
    status: "closed",
    pastStatusText: "Distributed",
    pastBadge: "Series B SPV",
    displayOrder: 4,
  },
  {
    offeringId: "neuralink",
    name: "Neuralink",
    badge: "Direct SPV",
    roundType: "Direct SPV",
    description:
      "Brain-computer interface (BCI) technology restoring autonomy and neural function.",
    closingDate: "Closed",
    valuation: "$7.0B",
    valuationSub: "Direct SPV round",
    fundingGoal: "$200K",
    goalSub: "Allocation cap",
    minCheck: "$10K",
    minCheckSub: "USD accredited entry",
    minCheckNum: 10000,
    eligibility: "Accredited",
    eligibilitySub: "SEC 506(c)",
    status: "closed",
    pastStatusText: "Distributed",
    pastBadge: "Direct SPV",
    displayOrder: 5,
  },
];

/**
 * Ensures MongoDB is initialized with default offerings and purges any duplicate documents.
 */
export async function ensureOfferingsSeeded() {
  await dbConnect();

  // 1. Upsert default seed offerings
  for (const seed of DEFAULT_SEED_OFFERINGS) {
    if (!seed.offeringId) continue;
    await Offering.findOneAndUpdate(
      { offeringId: seed.offeringId },
      { $setOnInsert: seed },
      { upsert: true, new: true }
    );
  }

  // 2. Clean up any historical duplicate documents from previous parallel seeding runs
  try {
    const allDocs = await Offering.find({}).sort({ updatedAt: -1, createdAt: -1 });
    const seen = new Set<string>();
    const idsToDelete: any[] = [];

    for (const doc of allDocs) {
      if (!doc.offeringId) continue;
      if (seen.has(doc.offeringId)) {
        idsToDelete.push(doc._id);
      } else {
        seen.add(doc.offeringId);
      }
    }

    if (idsToDelete.length > 0) {
      await Offering.deleteMany({ _id: { $in: idsToDelete } });
    }
  } catch (err) {
    console.error("Error cleaning duplicate offerings:", err);
  }
}

/**
 * Returns all offerings grouped into active and past categories.
 */
export async function getLiveOfferings() {
  await ensureOfferingsSeeded();
  const allOfferings = await Offering.find({})
    .sort({ displayOrder: 1, createdAt: -1 })
    .lean();

  // Deduplicate by offeringId
  const uniqueMap = new Map<string, any>();
  for (const off of allOfferings) {
    if (off.offeringId && !uniqueMap.has(off.offeringId)) {
      uniqueMap.set(off.offeringId, off);
    }
  }
  const uniqueOfferings = Array.from(uniqueMap.values());

  const activeOfferings = uniqueOfferings.filter((o) => o.status === "active");
  const pastOfferings = uniqueOfferings.filter((o) => o.status === "closed");

  return { activeOfferings, pastOfferings, allOfferings: uniqueOfferings };
}
