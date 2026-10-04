import { dbConnect } from "@/lib/dbConnect";
import Offering, { IOffering } from "@/models/offering.model";
import DealLink from "@/models/deal-link.model";

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
    fundingGoal: "$123K",
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
    badge: "Series A/B SPV Allocation",
    name: "Cursor (Anysphere)",
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
    closingDate: "Jul 2026",
    closedMonthYear: "Jul 2026",
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
    closingDate: "Dec 2024",
    closedMonthYear: "Dec 2024",
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
    closingDate: "Nov 2024",
    closedMonthYear: "Nov 2024",
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
 * Ensures MongoDB is initialized with default offerings only if none exist,
 * and purges duplicate documents.
 */
export async function ensureOfferingsSeeded() {
  await dbConnect();

  const count = await Offering.countDocuments();
  if (count === 0) {
    for (const seed of DEFAULT_SEED_OFFERINGS) {
      if (!seed.offeringId) continue;
      await Offering.create(seed);
    }
  } else {
    // Keep micro1-inc allocation synchronized if previously seeded with $125K
    try {
      await Offering.updateMany(
        { offeringId: "micro1-inc", fundingGoal: "$125K" },
        { $set: { fundingGoal: "$123K" } }
      );
      // Sync past seed offerings with clean closedMonthYear
      await Offering.updateOne(
        { offeringId: "scale-ai" },
        { $set: { closedMonthYear: "Jul 2026", closingDate: "Jul 2026" } }
      );
      await Offering.updateOne(
        { offeringId: "xai" },
        { $set: { closedMonthYear: "Dec 2024", closingDate: "Dec 2024" } }
      );
      await Offering.updateOne(
        { offeringId: "neuralink" },
        { $set: { closedMonthYear: "Nov 2024", closingDate: "Nov 2024" } }
      );
    } catch {
      // ignore
    }
  }

  // Clean up any historical duplicate documents from parallel runs
  try {
    const allDocs = await Offering.find({}).sort({ updatedAt: -1, createdAt: -1 });
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    const idsToDelete: any[] = [];

    for (const doc of allDocs) {
      const normalizedName = doc.name?.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
      const normalizedId = doc.offeringId?.toLowerCase().trim().replace(/[^a-z0-9]/g, "");

      if (!normalizedId || !normalizedName) continue;

      if (seenIds.has(normalizedId) || seenNames.has(normalizedName)) {
        idsToDelete.push(doc._id);
      } else {
        seenIds.add(normalizedId);
        seenNames.add(normalizedName);
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

  let dealLinks: any[] = [];
  try {
    dealLinks = await DealLink.find({}).lean();
  } catch {
    // ignore
  }
  const dealLinkMap = new Map<string, string>();
  for (const dl of dealLinks) {
    if (dl.offeringId && dl.thirdPartyUrl) {
      dealLinkMap.set(dl.offeringId.toLowerCase().trim(), dl.thirdPartyUrl);
    }
  }

  // Deduplicate by both offeringId and normalized company name
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const uniqueOfferings: any[] = [];

  for (const off of allOfferings) {
    const normId = off.offeringId?.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    const normName = off.name?.toLowerCase().trim().replace(/[^a-z0-9]/g, "");

    if (normId && normName && !seenIds.has(normId) && !seenNames.has(normName)) {
      seenIds.add(normId);
      seenNames.add(normName);
      const thirdPartyUrl =
        off.thirdPartyUrl ||
        dealLinkMap.get(off.offeringId?.toLowerCase().trim()) ||
        "";
      uniqueOfferings.push({
        ...off,
        thirdPartyUrl,
      });
    }
  }

  const activeOfferings = uniqueOfferings.filter((o) => o.status === "active");
  const pastOfferings = uniqueOfferings.filter((o) => o.status === "closed");

  return { activeOfferings, pastOfferings, allOfferings: uniqueOfferings };
}
