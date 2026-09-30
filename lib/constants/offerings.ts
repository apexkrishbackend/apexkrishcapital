export interface OfferingConfig {
  id: string;
  title: string;
  companyName: string;
  roundName: string;
  description: string;
  targetAllocation: number; // Target dollar cap in USD (e.g. 125000)
  minCheckSize: number;     // Minimum check size in USD (e.g. 5000)
  valuation: string;        // e.g. "$500M" or "$14.0B"
  status: "active" | "closing_soon" | "funded" | "upcoming";
  category: "AI Infrastructure" | "Frontier Tech" | "Direct SPV" | "Secondary";
  closingDate?: string;
}

export const OFFERINGS_CATALOG: OfferingConfig[] = [
  {
    id: "micro1-inc",
    title: "Micro1 Inc.",
    companyName: "Micro1 Inc.",
    roundName: "Direct SPV Series",
    description: "AI-powered developer vetting platform & pre-IPO talent infrastructure engine.",
    targetAllocation: 125000,
    minCheckSize: 5000,
    valuation: "<$4B",
    status: "active",
    category: "AI Infrastructure",
    closingDate: "2026-10-08",
  },
  {
    id: "scale-ai",
    title: "Scale AI",
    companyName: "Scale AI",
    roundName: "Series F SPV Secondary",
    description: "Foundational AI data infrastructure and enterprise model validation platform.",
    targetAllocation: 250000,
    minCheckSize: 10000,
    valuation: "$14.0B",
    status: "funded",
    category: "AI Infrastructure",
  },
  {
    id: "xai",
    title: "xAI",
    companyName: "xAI",
    roundName: "Series B Direct SPV",
    description: "Frontier AI research, Grok foundational models, and Colossus supercluster infrastructure.",
    targetAllocation: 500000,
    minCheckSize: 25000,
    valuation: "$24.0B",
    status: "funded",
    category: "Frontier Tech",
  },
  {
    id: "neuralink",
    title: "Neuralink",
    companyName: "Neuralink",
    roundName: "Direct SPV",
    description: "Brain-computer interface (BCI) restoring autonomy and pioneering human-AI integration.",
    targetAllocation: 200000,
    minCheckSize: 10000,
    valuation: "$7.0B",
    status: "funded",
    category: "Frontier Tech",
  },
];

export function getOfferingById(id: string): OfferingConfig | undefined {
  return OFFERINGS_CATALOG.find((o) => o.id === id);
}
