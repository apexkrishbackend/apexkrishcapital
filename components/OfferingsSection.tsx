"use client";

import { useState, useEffect, useId } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Calendar,
  CalendarDays,
  DollarSign,
  CheckCircle2,
  Lock,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  Plus,
  ChevronLeft,
  ChevronRight,
  Archive,
  Sparkles,
  ShieldAlert,
  Building,
  Layers,
  Trash2,
  Send,
  FileText,
  Paperclip,
  Upload,
  X,
  ExternalLink,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ActiveOffering = {
  id?: string;
  offeringId: string;
  name: string;
  badge: string;
  roundType?: string;
  description: string;
  closingDate: string;
  valuation: string;
  valuationSub?: string;
  fundingGoal: string;
  goalSub?: string;
  minCheck: string;
  minCheckSub?: string;
  minCheckNum: number;
  eligibility: string;
  eligibilitySub?: string;
  thirdPartyUrl?: string;
  status: "active" | "closed";
  pastStatusText?: string;
  pastBadge?: string;
  closedAt?: Date | string;
  closedMonthYear?: string;
  updatedAt?: Date | string;
};

type UserInteraction = {
  type: "interest" | "commitment";
  amount?: number | null;
};

function formatClosedMonthYear(offering: ActiveOffering): string {
  if (offering.closedMonthYear && offering.closedMonthYear !== "Closed" && offering.closedMonthYear !== "Open") {
    return offering.closedMonthYear;
  }
  if (offering.closedAt) {
    try {
      const d = new Date(offering.closedAt);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
    } catch {}
  }
  if (offering.closingDate && offering.closingDate !== "Closed" && offering.closingDate !== "Open") {
    const cleaned = offering.closingDate.replace(/\d+,\s*/, "").replace(/^\d{1,2}\s+/, "").trim();
    if (cleaned && cleaned !== "Closed" && cleaned !== "Open") return cleaned;
  }
  if (offering.offeringId === "scale-ai") return "Jul 2026";
  if (offering.offeringId === "xai") return "Dec 2024";
  if (offering.offeringId === "neuralink") return "Nov 2024";
  if (offering.updatedAt) {
    try {
      const d = new Date(offering.updatedAt);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
    } catch {}
  }
  return "Closed";
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function deduplicateOfferings(items: ActiveOffering[]): ActiveOffering[] {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const result: ActiveOffering[] = [];

  for (const item of items) {
    const normId = item.offeringId?.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    const normName = item.name?.toLowerCase().trim().replace(/[^a-z0-9]/g, "");

    if (normId && normName && !seenIds.has(normId) && !seenNames.has(normName)) {
      seenIds.add(normId);
      seenNames.add(normName);
      result.push(item);
    }
  }
  return result;
}

const FALLBACK_ACTIVE_OFFERINGS: ActiveOffering[] = [
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
  },
];

const FALLBACK_PAST_OFFERINGS: ActiveOffering[] = [
  {
    offeringId: "scale-ai",
    name: "Scale AI",
    badge: "Series F SPV",
    roundType: "Series F SPV",
    description: "Foundational AI data infrastructure and model validation platform.",
    closingDate: "Jul 2026",
    closedMonthYear: "Jul 2026",
    valuation: "$14.0B",
    valuationSub: "Series F round",
    fundingGoal: "$250K",
    minCheck: "$10K",
    minCheckNum: 10000,
    eligibility: "Accredited",
    status: "closed",
    pastStatusText: "Distributed",
    pastBadge: "Series F SPV",
  },
  {
    offeringId: "xai",
    name: "xAI",
    badge: "Series B SPV",
    roundType: "Series B SPV",
    description: "Frontier artificial intelligence research, Grok models, and supercomputing clusters.",
    closingDate: "Dec 2024",
    closedMonthYear: "Dec 2024",
    valuation: "$24.0B",
    valuationSub: "Series B round",
    fundingGoal: "$500K",
    minCheck: "$25K",
    minCheckNum: 25000,
    eligibility: "Accredited",
    status: "closed",
    pastStatusText: "Distributed",
    pastBadge: "Series B SPV",
  },
  {
    offeringId: "neuralink",
    name: "Neuralink",
    badge: "Direct SPV",
    roundType: "Direct SPV",
    description: "Brain-computer interface (BCI) technology restoring autonomy and neural function.",
    closingDate: "Nov 2024",
    closedMonthYear: "Nov 2024",
    valuation: "$7.0B",
    valuationSub: "Direct SPV round",
    fundingGoal: "$200K",
    minCheck: "$10K",
    minCheckNum: 10000,
    eligibility: "Accredited",
    status: "closed",
    pastStatusText: "Distributed",
    pastBadge: "Direct SPV",
  },
];

type OfferingsSectionProps = {
  initialVerificationStatus?: string | null;
  isSignedIn?: boolean;
};

export default function OfferingsSection({
  initialVerificationStatus,
  isSignedIn: initialIsSignedIn,
}: OfferingsSectionProps) {
  const { isLoaded: isClerkLoaded, isSignedIn: clerkIsSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState<"current" | "past">("current");
  const [activeOfferings, setActiveOfferings] = useState<ActiveOffering[]>(FALLBACK_ACTIVE_OFFERINGS);
  const [pastOfferings, setPastOfferings] = useState<ActiveOffering[]>(FALLBACK_PAST_OFFERINGS);
  const [selectedOfferingIndex, setSelectedOfferingIndex] = useState(0);

  const [isSignedIn, setIsSignedIn] = useState(initialIsSignedIn ?? false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(
    initialVerificationStatus ?? null
  );
  const [interactions, setInteractions] = useState<Record<string, UserInteraction>>({});
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(true);

  // Commit Dialog State
  const [commitModalOpen, setCommitModalOpen] = useState(false);
  const [commitAmount, setCommitAmount] = useState("5000");
  const [commitError, setCommitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Admin Actions State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreatingOffering, setIsCreatingOffering] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<ActiveOffering | null>(null);
  const [isSavingOffering, setIsSavingOffering] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [closingOfferingId, setClosingOfferingId] = useState<string | null>(null);
  const [deletingOfferingId, setDeletingOfferingId] = useState<string | null>(null);
  const [expressingInterestId, setExpressingInterestId] = useState<string | null>(null);

  // Edit Offering Form State
  const [editOfferingForm, setEditOfferingForm] = useState({
    offeringId: "",
    name: "",
    badge: "Active SPV Allocation",
    roundType: "Direct Equity SPV",
    valuation: "",
    valuationSub: "Pre-money round",
    fundingGoal: "$150K",
    goalSub: "Allocation cap",
    minCheck: "$5K",
    minCheckSub: "USD accredited entry",
    minCheckNum: 5000,
    closingDate: "",
    description: "",
    eligibility: "Accredited",
    eligibilitySub: "SEC 506(c)",
    thirdPartyUrl: "",
    status: "active" as "active" | "closed",
    pastStatusText: "Funded & Closed",
    pastBadge: "Direct SPV",
  });

  // Admin Broadcast State
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastOffering, setBroadcastOffering] = useState<ActiveOffering | null>(null);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastCustomMessage, setBroadcastCustomMessage] = useState("");
  const [broadcastAttachment, setBroadcastAttachment] = useState<{
    filename: string;
    content: string; // base64
    contentType?: string;
    size?: number;
  } | null>(null);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);
  const [broadcastRecipientCount, setBroadcastRecipientCount] = useState<number | null>(null);
  const [isLoadingAudiencePreview, setIsLoadingAudiencePreview] = useState(false);

  // New Offering Form State
  const [newOfferingForm, setNewOfferingForm] = useState({
    name: "",
    offeringId: "",
    badge: "Active SPV Allocation",
    roundType: "Direct Equity SPV",
    valuation: "",
    valuationSub: "Pre-money round",
    fundingGoal: "$150K",
    goalSub: "Allocation cap",
    minCheck: "$5K",
    minCheckSub: "USD accredited entry",
    minCheckNum: 5000,
    closingDate: "",
    description: "",
    eligibility: "Accredited",
    thirdPartyUrl: "",
  });

  // Fetch live offerings from MongoDB
  async function loadOfferings() {
    try {
      const res = await fetch("/api/offerings", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.activeOfferings) && data.activeOfferings.length > 0) {
          setActiveOfferings(deduplicateOfferings(data.activeOfferings));
        }
        if (Array.isArray(data.pastOfferings) && data.pastOfferings.length > 0) {
          setPastOfferings(deduplicateOfferings(data.pastOfferings));
        }
      }
    } catch (err) {
      console.warn("Could not fetch live offerings, using fallback:", err);
    }
  }

  useEffect(() => {
    loadOfferings();
  }, []);

  // Fetch current user state & interactions when clerk auth state changes
  useEffect(() => {
    if (!isClerkLoaded) return;

    if (!clerkIsSignedIn) {
      setIsSignedIn(false);
      setIsAdmin(false);
      setVerificationStatus(null);
      setInteractions({});
      setIsLoadingInteractions(false);
      return;
    }

    let isMounted = true;

    async function loadInteractions() {
      setIsLoadingInteractions(true);
      try {
        const res = await fetch("/api/offerings/my-interactions", {
          cache: "no-store",
        });
        const data = await res.json();
        if (isMounted && res.ok) {
          setIsSignedIn(!!data.isSignedIn);
          setIsAdmin(!!data.isAdmin);
          setVerificationStatus(data.verificationStatus);
          setInteractions(data.interactions || {});
        }
      } catch (err) {
        console.error("Failed to load user interactions:", err);
      } finally {
        if (isMounted) setIsLoadingInteractions(false);
      }
    }

    loadInteractions();
    return () => {
      isMounted = false;
    };
  }, [isClerkLoaded, clerkIsSignedIn]);

  const isVerified = isSignedIn && (verificationStatus === "verified" || isAdmin);
  const isPending = isSignedIn && !isVerified;

  // Selected offering in the active deal carousel/tabs
  const currentOffering =
    activeOfferings[selectedOfferingIndex] || activeOfferings[0] || FALLBACK_ACTIVE_OFFERINGS[0];

  // Handle "I'm Interested" action
  async function handleExpressInterest(offeringId: string, offeringName: string) {
    if (!isSignedIn) return;
    if (!isVerified) return;

    setExpressingInterestId(offeringId);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/offerings/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offeringId, type: "interest" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to record interest.");
      }

      setInteractions((prev) => ({
        ...prev,
        [offeringId]: { type: "interest", amount: null },
      }));

      setSuccessMessage(`Interest recorded for ${offeringName}. Our syndicate partners will keep you updated on allocations.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || "Failed to record interest.");
    } finally {
      setExpressingInterestId(null);
    }
  }

  // Open Commit Modal for a specific offering
  function openCommitModal(offering: ActiveOffering) {
    const userInteraction = interactions[offering.offeringId];
    if (userInteraction?.amount) {
      setCommitAmount(userInteraction.amount.toString());
    } else {
      setCommitAmount(offering.minCheckNum?.toString() || "5000");
    }
    setCommitError(null);
    setCommitModalOpen(true);
  }

  // Handle Commit Capital action
  async function handleCommitSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCommitError(null);

    const amountNum = Number(commitAmount);
    const minAmount = currentOffering.minCheckNum || 5000;

    if (isNaN(amountNum) || amountNum < minAmount) {
      setCommitError(`Minimum investment is $${minAmount.toLocaleString()} USD.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/offerings/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offeringId: currentOffering.offeringId,
          type: "commitment",
          amount: amountNum,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit commitment.");
      }

      setInteractions((prev) => ({
        ...prev,
        [currentOffering.offeringId]: { type: "commitment", amount: amountNum },
      }));

      setCommitModalOpen(false);
      setSuccessMessage(`Commitment of $${amountNum.toLocaleString()} USD for ${currentOffering.name} submitted successfully.`);
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      setCommitError(err.message || "Unable to submit commitment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Admin: Create New Offering
  async function handleCreateOfferingSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);

    if (!newOfferingForm.name.trim() || !newOfferingForm.valuation.trim() || !newOfferingForm.description.trim()) {
      setCreateError("Please provide company name, valuation, and summary description.");
      return;
    }

    setIsCreatingOffering(true);

    try {
      const res = await fetch("/api/admin/offerings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOfferingForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create offering.");
      }

      setCreateModalOpen(false);
      setSuccessMessage(`New offering '${data.offering.name}' created and published to live offerings.`);
      setTimeout(() => setSuccessMessage(null), 6000);

      // Reload live offerings and focus the new one
      await loadOfferings();
      setSelectedOfferingIndex(0);

      // Reset form
      setNewOfferingForm({
        name: "",
        offeringId: "",
        badge: "Active SPV Allocation",
        roundType: "Direct Equity SPV",
        valuation: "",
        valuationSub: "Pre-money round",
        fundingGoal: "$150K",
        goalSub: "Allocation cap",
        minCheck: "$5K",
        minCheckSub: "USD accredited entry",
        minCheckNum: 5000,
        closingDate: "",
        description: "",
        eligibility: "Accredited",
        thirdPartyUrl: "",
      });
    } catch (err: any) {
      setCreateError(err.message || "Failed to create offering.");
    } finally {
      setIsCreatingOffering(false);
    }
  }

  // Admin: Open Edit Offering Modal
  function openEditModal(offering: ActiveOffering) {
    setEditingOffering(offering);
    setEditOfferingForm({
      offeringId: offering.offeringId,
      name: offering.name || "",
      badge: offering.badge || "Active SPV Allocation",
      roundType: offering.roundType || "Direct Equity SPV",
      valuation: offering.valuation || "",
      valuationSub: offering.valuationSub || "Pre-money round",
      fundingGoal: offering.fundingGoal || "$150K",
      goalSub: offering.goalSub || "Allocation cap",
      minCheck: offering.minCheck || "$5K",
      minCheckSub: offering.minCheckSub || "USD accredited entry",
      minCheckNum: offering.minCheckNum || 5000,
      closingDate: offering.closingDate || "",
      description: offering.description || "",
      eligibility: offering.eligibility || "Accredited",
      eligibilitySub: offering.eligibilitySub || "SEC 506(c)",
      thirdPartyUrl: offering.thirdPartyUrl || "",
      status: offering.status || "active",
      pastStatusText: offering.pastStatusText || "Funded & Closed",
      pastBadge: offering.pastBadge || offering.roundType || "Direct SPV",
    });
    setEditError(null);
    setEditModalOpen(true);
  }

  // Admin: Save Edited Offering Details
  async function handleEditOfferingSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEditError(null);

    if (
      !editOfferingForm.name.trim() ||
      !editOfferingForm.valuation.trim() ||
      !editOfferingForm.description.trim()
    ) {
      setEditError("Please provide company name, valuation, and summary description.");
      return;
    }

    setIsSavingOffering(true);

    try {
      const res = await fetch("/api/admin/offerings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editOfferingForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update offering.");
      }

      setEditModalOpen(false);
      setSuccessMessage(`Offering '${editOfferingForm.name}' updated successfully.`);
      setTimeout(() => setSuccessMessage(null), 6000);

      // Reload live offerings from MongoDB
      await loadOfferings();
    } catch (err: any) {
      setEditError(err.message || "Failed to update offering.");
    } finally {
      setIsSavingOffering(false);
    }
  }

  // Admin: Close Active Offering and move to past offerings
  async function handleCloseOffering(offering: ActiveOffering) {
    const nowStr = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const confirmClose = window.confirm(
      `Are you sure you want to close '${offering.name}'? It will be immediately archived and moved to Past Offerings as closed in ${nowStr}.`
    );
    if (!confirmClose) return;

    setClosingOfferingId(offering.offeringId);

    // Optimistic UI updates
    const closedDeal: ActiveOffering = {
      ...offering,
      status: "closed",
      closedMonthYear: nowStr,
      closingDate: nowStr,
      pastStatusText: "Funded & Closed",
    };
    setActiveOfferings((prev) => prev.filter((o) => o.offeringId !== offering.offeringId));
    setPastOfferings((prev) => [closedDeal, ...prev.filter((o) => o.offeringId !== offering.offeringId)]);
    setSelectedOfferingIndex(0);

    try {
      const res = await fetch("/api/admin/offerings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offeringId: offering.offeringId,
          status: "closed",
          pastStatusText: "Funded & Closed",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to close offering.");
      }

      setSuccessMessage(`'${offering.name}' has been closed and moved to Past Offerings.`);
      setTimeout(() => setSuccessMessage(null), 6000);

      // Reload live offerings in background
      await loadOfferings();
    } catch (err: any) {
      alert(err.message || "Failed to close offering.");
      await loadOfferings();
    } finally {
      setClosingOfferingId(null);
    }
  }

  // Admin: Delete Offering (Active or Past)
  async function handleDeleteOffering(offering: ActiveOffering) {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete '${offering.name}' from offerings? This cannot be undone.`
    );
    if (!confirmDelete) return;

    setDeletingOfferingId(offering.offeringId);

    // Optimistic UI removal
    setActiveOfferings((prev) => prev.filter((o) => o.offeringId !== offering.offeringId));
    setPastOfferings((prev) => prev.filter((o) => o.offeringId !== offering.offeringId));
    setSelectedOfferingIndex(0);

    try {
      const res = await fetch(`/api/admin/offerings?offeringId=${encodeURIComponent(offering.offeringId)}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete offering.");
      }

      setSuccessMessage(`'${offering.name}' has been permanently deleted.`);
      setTimeout(() => setSuccessMessage(null), 6000);

      // Reload live offerings in background
      await loadOfferings();
    } catch (err: any) {
      alert(err.message || "Failed to delete offering.");
      await loadOfferings();
    } finally {
      setDeletingOfferingId(null);
    }
  }

  // Admin: Broadcast Deal to Verified Investors
  async function fetchAudiencePreview(offeringId: string) {
    setIsLoadingAudiencePreview(true);
    try {
      const res = await fetch(
        `/api/admin/broadcast?offeringId=${encodeURIComponent(offeringId)}&audience=all_verified&verifiedOnly=true`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setBroadcastRecipientCount(data.totalRecipients ?? 0);
      }
    } catch (e) {
      console.warn("Failed to preview broadcast audience count:", e);
    } finally {
      setIsLoadingAudiencePreview(false);
    }
  }

  function openBroadcastModal(offering: ActiveOffering) {
    setBroadcastOffering(offering);
    setBroadcastSubject(`Priority SPV Update: ${offering.name} (${offering.valuation} Round)`);
    setBroadcastCustomMessage("");
    setBroadcastAttachment(null);
    setBroadcastError(null);
    setBroadcastModalOpen(true);
    fetchAudiencePreview(offering.offeringId);
  }

  function handleBroadcastFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setBroadcastError("File size exceeds 20MB limit. Please attach a smaller file.");
      return;
    }

    setBroadcastError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBroadcastAttachment({
        filename: file.name,
        content: result,
        contentType: file.type || "application/octet-stream",
        size: file.size,
      });
    };
    reader.onerror = () => {
      setBroadcastError("Failed to read attached file.");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleRemoveBroadcastAttachment() {
    setBroadcastAttachment(null);
  }

  async function handleBroadcastSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!broadcastOffering) return;

    if (!broadcastSubject.trim()) {
      setBroadcastError("Subject line is required.");
      return;
    }

    setIsSendingBroadcast(true);
    setBroadcastError(null);

    try {
      const payload: any = {
        offeringId: broadcastOffering.offeringId,
        offeringTitle: broadcastOffering.name,
        targetAudience: "all_verified",
        verifiedOnly: true,
        subject: broadcastSubject.trim(),
        customMessage: broadcastCustomMessage.trim(),
        thirdPartyUrl: "",
        channel: "email",
        sendEmail: true,
      };

      if (broadcastAttachment) {
        payload.attachment = {
          filename: broadcastAttachment.filename,
          content: broadcastAttachment.content,
          contentType: broadcastAttachment.contentType,
        };
      }

      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch email broadcast.");
      }

      const sentCount = data.emailsSent || data.totalRecipients || 0;
      setBroadcastModalOpen(false);
      setSuccessMessage(
        `Email broadcast successfully dispatched to ${sentCount} verified investor${
          sentCount === 1 ? "" : "s"
        }${broadcastAttachment ? ` with attachment '${broadcastAttachment.filename}'` : ""}.`
      );
      setTimeout(() => setSuccessMessage(null), 8000);
    } catch (err: any) {
      setBroadcastError(err.message || "Failed to dispatch broadcast.");
    } finally {
      setIsSendingBroadcast(false);
    }
  }

  const activeInteraction = interactions[currentOffering.offeringId];
  const isExpressing = expressingInterestId === currentOffering.offeringId;
  const isClosingThis = closingOfferingId === currentOffering.offeringId;

  return (
    <section id="offerings" className="space-y-8 py-6 scroll-mt-24">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>PRIVATE SYNDICATE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Current & Past Offerings
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Direct SPV allocations into high-conviction frontier technology growth rounds.
          </p>
        </div>

        {/* Tab Switcher & Admin Action */}
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {isAdmin && (
            <Button
              onClick={() => setCreateModalOpen(true)}
              size="sm"
              className="h-8 px-3 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>Add Offering</span>
            </Button>
          )}

          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs font-medium">
            <button
              onClick={() => setActiveTab("current")}
              className={cn(
                "flex items-center gap-2 rounded-md px-3.5 py-1.5 font-medium transition cursor-pointer",
                activeTab === "current"
                  ? "bg-card text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Current Deals ({activeOfferings.length})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={cn(
                "flex items-center gap-2 rounded-md px-3.5 py-1.5 font-medium transition cursor-pointer",
                activeTab === "past"
                  ? "bg-card text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Past Deals ({pastOfferings.length})
            </button>
          </div>
        </div>
      </div>

      {/* Global Success Banner */}
      {successMessage && (
        <div className="animate-in fade-in slide-in-from-top-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-xs">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

      {/* TAB CONTENT: CURRENT OFFERINGS (COMPACT SINGLE-CARD VIEW WITH DEAL SELECTOR) */}
      {activeTab === "current" && (
        <div className="space-y-4">
          {/* HORIZONTAL DEAL SELECTOR (Prevents vertical stacking & keeps page compact) */}
          {activeOfferings.length > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                {activeOfferings.map((offering, idx) => (
                  <button
                    key={`${offering.offeringId || idx}-${idx}`}
                    onClick={() => setSelectedOfferingIndex(idx)}
                    className={cn(
                      "px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-2 border",
                      selectedOfferingIndex === idx
                        ? "bg-card text-foreground border-foreground shadow-xs"
                        : "bg-background/60 text-muted-foreground border-border/80 hover:text-foreground hover:bg-background"
                    )}
                  >
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        selectedOfferingIndex === idx ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"
                      )}
                    />
                    <span>{offering.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono bg-muted/60 px-1.5 py-0.5 rounded">
                      {offering.fundingGoal}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-muted-foreground shrink-0 px-2 sm:px-0">
                <span className="text-[11px] font-medium">
                  Deal {selectedOfferingIndex + 1} of {activeOfferings.length}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7 rounded-md"
                    onClick={() =>
                      setSelectedOfferingIndex((prev) =>
                        prev === 0 ? activeOfferings.length - 1 : prev - 1
                      )
                    }
                  >
                    <ChevronLeft className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7 rounded-md"
                    onClick={() =>
                      setSelectedOfferingIndex((prev) =>
                        prev === activeOfferings.length - 1 ? 0 : prev + 1
                      )
                    }
                  >
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* MAIN SELECTED ACTIVE OFFERING CARD */}
          {currentOffering && (
            <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 sm:p-8 shadow-xs relative">
              {/* Admin Bar for this Offering */}
              {isAdmin && (
                <div className="mb-6 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-semibold">
                    <ShieldAlert className="size-4 shrink-0 text-amber-500" />
                    <span>Admin Controls · Managing {currentOffering.name}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(currentOffering)}
                      className="h-8 px-3 rounded-lg text-xs font-bold text-foreground hover:bg-background border-border cursor-pointer inline-flex items-center gap-1.5 shrink-0 shadow-2xs"
                      title="Edit offering details and parameters"
                    >
                      <Pencil className="size-3.5" />
                      <span>Edit Offering</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openBroadcastModal(currentOffering)}
                      className="h-8 px-3 rounded-lg text-xs font-bold text-primary hover:text-primary hover:bg-primary/10 border-primary/30 cursor-pointer inline-flex items-center gap-1.5 shrink-0 shadow-2xs"
                      title="Broadcast email update & documents to verified investors"
                    >
                      <Send className="size-3.5" />
                      <span>Broadcast</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isClosingThis}
                      onClick={() => handleCloseOffering(currentOffering)}
                      className="h-8 px-3 rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                    >
                      {isClosingThis ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Archive className="size-3.5" />
                      )}
                      <span>Close Deal</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Top Badge Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border text-xs">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 uppercase tracking-wider text-[11px]">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Active Offering
                  </span>
                  <span className="text-muted-foreground hidden sm:inline">·</span>
                  <span className="text-muted-foreground font-medium hidden sm:inline">
                    {currentOffering.roundType || currentOffering.badge}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-3.5" />
                  <span>
                    Closing:{" "}
                    <strong className="text-foreground font-semibold">
                      {currentOffering.closingDate || "Open"}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Main Info */}
              <div className="mt-7 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-5">
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
                      {currentOffering.badge}
                    </p>
                    <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                      {currentOffering.name}
                    </h3>
                  </div>

                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {currentOffering.description}
                  </p>

                  {/* Key Offering Terms Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
                    <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                        Valuation
                      </span>
                      <p className="text-xl font-bold text-foreground tabular-nums">
                        {currentOffering.valuation}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {currentOffering.valuationSub || "Pre-money"}
                      </span>
                    </div>

                    <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                        Funding Goal
                      </span>
                      <p className="text-xl font-bold text-foreground tabular-nums">
                        {currentOffering.fundingGoal}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {currentOffering.goalSub || "Allocation cap"}
                      </span>
                    </div>

                    <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                        Minimum Check
                      </span>
                      <p className="text-xl font-bold text-foreground tabular-nums">
                        {currentOffering.minCheck}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {currentOffering.minCheckSub || "USD entry"}
                      </span>
                    </div>

                    <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                        Eligibility
                      </span>
                      <p className="text-xl font-bold text-foreground">
                        {currentOffering.eligibility}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {currentOffering.eligibilitySub || "SEC 506(c)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Box / Status Panel */}
                <div className="lg:col-span-5 rounded-2xl border border-border bg-muted/30 p-6 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Participation Status
                    </span>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="size-3.5" />
                        Verified Investor
                      </span>
                    ) : isSignedIn ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
                        <AlertCircle className="size-3.5" />
                        Verification Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold">
                        <Lock className="size-3.5" />
                        Public Preview
                      </span>
                    )}
                  </div>

                  {/* State-specific CTA / Notice */}
                  {!isSignedIn ? (
                    <div className="space-y-4 pt-1">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        To express interest or commit capital to {currentOffering.name}, sign in with your accredited account or request syndicate access.
                      </p>
                      <div className="flex flex-col gap-2.5">
                        <Button asChild className="w-full h-11 rounded-full font-bold text-sm tracking-wide shadow-xs">
                          <Link href="/sign-in">Log in to participate</Link>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent("open-expandable-screen", {
                                detail: { layoutId: "request-access-portal" },
                              })
                            );
                          }}
                          className="w-full h-11 rounded-full font-bold text-sm tracking-wide border-border hover:bg-muted cursor-pointer"
                        >
                          <Sparkles className="size-4 text-blue-500 mr-2" />
                          <span>Request Access</span>
                        </Button>
                      </div>
                    </div>
                  ) : isPending ? (
                    <div className="space-y-4 pt-1">
                      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-300 leading-relaxed space-y-2">
                        <div className="flex items-center gap-2 font-bold">
                          <AlertCircle className="size-4 shrink-0 text-amber-500" />
                          Verification in Review
                        </div>
                        <p className="text-xs">
                          Your accredited profile is pending admin approval. Once approved, you can commit capital directly.
                        </p>
                      </div>

                      {/* Direct Contact Admin Options */}
                      <div className="rounded-xl border border-border bg-card p-3.5 space-y-2.5 text-xs">
                        <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider block">
                          Contact Admin / Expedite:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <a
                            href="mailto:syndicate@apexkrishcapital.com?subject=Accredited%20Investor%20Verification%20Inquiry"
                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition font-medium text-xs text-center"
                          >
                            <Mail className="size-3.5 text-muted-foreground shrink-0" />
                            <span>Email Admin</span>
                          </a>
                          <a
                            href="tel:7208456839"
                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition font-medium text-xs text-center"
                          >
                            <Phone className="size-3.5 text-muted-foreground shrink-0" />
                            <span>720-845-6839</span>
                          </a>
                        </div>
                      </div>

                      <Button asChild variant="outline" className="w-full h-11 rounded-full text-xs font-bold uppercase tracking-wider">
                        <Link href="/profile">Review Investor Profile</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-1">
                      {/* User has committed or expressed interest banner */}
                      {activeInteraction?.type === "commitment" ? (
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-300 space-y-1.5">
                          <span className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">
                            Active Allocation Request
                          </span>
                          <p className="text-xl font-bold text-foreground">
                            ${activeInteraction.amount?.toLocaleString()} USD Committed
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Our closing team will provide wire instructions and subscription documents prior to the deadline.
                          </p>
                        </div>
                      ) : activeInteraction?.type === "interest" ? (
                        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-blue-900 dark:text-blue-300 space-y-1 text-sm">
                          <div className="flex items-center gap-2 font-bold">
                            <CheckCircle2 className="size-4 text-blue-500" />
                            Interest Recorded
                          </div>
                          <p className="text-xs text-muted-foreground">
                            You are on the priority list. You can also formalize your dollar commitment below.
                          </p>
                        </div>
                      ) : null}

                      {/* Action Buttons for Verified User */}
                      <div className="flex flex-col gap-2.5 w-full">
                        {currentOffering.thirdPartyUrl && (
                          <a
                            href={currentOffering.thirdPartyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full h-11 px-4 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs inline-flex items-center justify-center gap-2 transition"
                          >
                            <span>Proceed to SPV Platform</span>
                            <ExternalLink className="size-3.5" />
                          </a>
                        )}

                        <Button
                          onClick={() => openCommitModal(currentOffering)}
                          variant={currentOffering.thirdPartyUrl ? "outline" : "default"}
                          className="w-full h-11 px-4 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs inline-flex items-center justify-center gap-2"
                        >
                          <DollarSign className="size-4" />
                          <span>
                            {activeInteraction?.type === "commitment" ? "Update Commitment" : "Commit Capital"}
                          </span>
                        </Button>

                        {activeInteraction?.type !== "commitment" && (
                          <Button
                            variant={activeInteraction?.type === "interest" ? "secondary" : "outline"}
                            onClick={() => handleExpressInterest(currentOffering.offeringId, currentOffering.name)}
                            disabled={isExpressing}
                            className="w-full h-11 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2"
                          >
                            {isExpressing ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : activeInteraction?.type === "interest" ? (
                              <CheckCircle2 className="size-4 text-primary" />
                            ) : null}
                            <span>
                              {activeInteraction?.type === "interest" ? "Interested ✓" : "I'm Interested"}
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PAST OFFERINGS */}
      {activeTab === "past" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pastOfferings.map((offering, idx) => {
            const closedDateText = formatClosedMonthYear(offering);
            return (
              <div
                key={`${offering.offeringId || idx}-${idx}`}
                className="rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-border text-xs font-bold">
                    <span className="uppercase tracking-wider px-2.5 py-1 rounded-md bg-muted/60 text-foreground border border-border">
                      {offering.pastBadge || offering.roundType || "Direct SPV"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="size-3 text-emerald-500" />
                      {offering.pastStatusText || "Funded & Closed"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{offering.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                      {offering.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                    <div className="rounded-xl bg-muted/40 border border-border/70 p-3 space-y-1">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-bold">
                        Valuation
                      </span>
                      <p className="text-base sm:text-lg font-bold text-foreground">
                        {offering.valuation}
                      </p>
                    </div>

                    <div className="rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 p-3 space-y-1">
                      <span className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block font-bold flex items-center gap-1">
                        <CalendarDays className="size-3 text-emerald-500" /> Closed On
                      </span>
                      <p className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-300">
                        {closedDateText}
                      </p>
                    </div>
                  </div>

                  {/* Admin Actions for Past Offering */}
                  {isAdmin && (
                    <div className="pt-3 border-t border-border/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <ShieldAlert className="size-3.5 text-amber-500 shrink-0" />
                        Admin
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(offering)}
                          className="h-8 px-2.5 rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center gap-1 text-foreground hover:bg-background border-border"
                          title="Edit past offering parameters"
                        >
                          <Pencil className="size-3" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={deletingOfferingId === offering.offeringId}
                          onClick={() => handleDeleteOffering(offering)}
                          className="h-8 px-2.5 rounded-lg text-xs font-semibold text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                        >
                          {deletingOfferingId === offering.offeringId ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COMMIT CAPITAL MODAL */}
      {commitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card text-card-foreground p-6 sm:p-7 shadow-xl space-y-5 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {interactions[currentOffering.offeringId]?.type === "commitment"
                    ? "Update Allocation Commitment"
                    : "Capital Commitment"}
                </span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">
                  {currentOffering.name} SPV Series
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCommitModalOpen(false)}
                className="size-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Terms reminder */}
            <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Minimum Investment:</span>
                <strong className="text-foreground">${(currentOffering.minCheckNum || 5000).toLocaleString()} USD</strong>
              </div>
              <div className="flex justify-between">
                <span>Funding Deadline:</span>
                <strong className="text-foreground">{currentOffering.closingDate || "Open"}</strong>
              </div>
              <div className="flex justify-between">
                <span>Valuation:</span>
                <strong className="text-foreground">{currentOffering.valuation} USD</strong>
              </div>
            </div>

            <form onSubmit={handleCommitSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Commitment Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-base">
                    $
                  </span>
                  <input
                    type="number"
                    min={currentOffering.minCheckNum || 5000}
                    step="1000"
                    value={commitAmount}
                    onChange={(e) => {
                      setCommitAmount(e.target.value);
                      if (commitError) setCommitError(null);
                    }}
                    placeholder={(currentOffering.minCheckNum || 5000).toString()}
                    className="w-full h-12 pl-8 pr-4 rounded-xl border border-input bg-background text-base font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary tabular-nums"
                  />
                </div>
              </div>

              {/* Amount Quick Presets */}
              <div className="flex flex-wrap gap-2">
                {[currentOffering.minCheckNum || 5000, 10000, 25000, 50000].map((preset, idx) => (
                  <button
                    key={`${preset}-${idx}`}
                    type="button"
                    onClick={() => setCommitAmount(preset.toString())}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer",
                      Number(commitAmount) === preset
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    ${preset.toLocaleString()}
                  </button>
                ))}
              </div>

              {commitError && (
                <p className="text-xs font-medium text-destructive flex items-center gap-1.5">
                  <AlertCircle className="size-3.5 shrink-0" />
                  {commitError}
                </p>
              )}

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                By submitting this commitment, you express binding intent to participate in this SPV subject to receipt of formal subscription agreements and closing verification.
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCommitModalOpen(false)}
                  className="rounded-xl text-xs uppercase tracking-wider"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl text-xs font-semibold uppercase tracking-wider shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-2" />
                      Recording...
                    </>
                  ) : interactions[currentOffering.offeringId]?.type === "commitment" ? (
                    "Update Commitment"
                  ) : (
                    "Confirm Commitment"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN: CREATE NEW OFFERING MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card text-card-foreground p-6 sm:p-7 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                  Admin Deal Desk
                </span>
                <h3 className="text-xl font-bold text-foreground mt-0.5">
                  Create New SPV Offering
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="size-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateOfferingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Company Name *
                  </label>
                  <input
                    required
                    value={newOfferingForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setNewOfferingForm((prev) => ({
                        ...prev,
                        name,
                        offeringId: prev.offeringId ? prev.offeringId : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                      }));
                    }}
                    placeholder="e.g. Anthropic, SpaceX"
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Unique Identifier (Slug)
                  </label>
                  <input
                    value={newOfferingForm.offeringId}
                    onChange={(e) =>
                      setNewOfferingForm((prev) => ({ ...prev, offeringId: e.target.value }))
                    }
                    placeholder="e.g. anthropic-spv"
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Pre-Money Valuation *
                  </label>
                  <input
                    required
                    value={newOfferingForm.valuation}
                    onChange={(e) =>
                      setNewOfferingForm((prev) => ({ ...prev, valuation: e.target.value }))
                    }
                    placeholder="e.g. $40B, <$4B, $2.5B"
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Allocation Cap / Goal
                  </label>
                  <input
                    value={newOfferingForm.fundingGoal}
                    onChange={(e) =>
                      setNewOfferingForm((prev) => ({ ...prev, fundingGoal: e.target.value }))
                    }
                    placeholder="e.g. $250K, $500K"
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Minimum Check (USD)
                  </label>
                  <input
                    type="number"
                    value={newOfferingForm.minCheckNum}
                    onChange={(e) => {
                      const num = Number(e.target.value) || 5000;
                      setNewOfferingForm((prev) => ({
                        ...prev,
                        minCheckNum: num,
                        minCheck: `$${num >= 1000 ? num / 1000 + "K" : num}`,
                      }));
                    }}
                    placeholder="5000"
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary tabular-nums"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Funding Deadline
                  </label>
                  <input
                    value={newOfferingForm.closingDate}
                    onChange={(e) =>
                      setNewOfferingForm((prev) => ({ ...prev, closingDate: e.target.value }))
                    }
                    placeholder="e.g. Nov 15, 2026"
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Round Type / Series
                  </label>
                  <input
                    value={newOfferingForm.roundType}
                    onChange={(e) =>
                      setNewOfferingForm((prev) => ({ ...prev, roundType: e.target.value }))
                    }
                    placeholder="e.g. Series D Direct SPV"
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Offering Badge
                  </label>
                  <input
                    value={newOfferingForm.badge}
                    onChange={(e) =>
                      setNewOfferingForm((prev) => ({ ...prev, badge: e.target.value }))
                    }
                    placeholder="e.g. Growth SPV Allocation"
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center justify-between">
                  <span>Third-Party Application / SPV Portal URL (Optional)</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Carta, Assure, AngelList, etc.</span>
                </label>
                <input
                  type="url"
                  value={newOfferingForm.thirdPartyUrl}
                  onChange={(e) =>
                    setNewOfferingForm((prev) => ({ ...prev, thirdPartyUrl: e.target.value }))
                  }
                  placeholder="https://app.carta.com/spvs/... or https://assure.co/..."
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Summary Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newOfferingForm.description}
                  onChange={(e) =>
                    setNewOfferingForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Provide a concise 1-2 sentence description of the company's core technology and market value proposition."
                  className="w-full p-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl text-xs uppercase tracking-wider"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingOffering}
                  className="rounded-xl text-xs font-semibold uppercase tracking-wider shadow-xs"
                >
                  {isCreatingOffering ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-2" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Offering"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN: EDIT OFFERING MODAL */}
      {editModalOpen && editingOffering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card text-card-foreground p-6 sm:p-7 shadow-2xl space-y-5 my-8">
            <div className="flex items-start justify-between gap-4 pb-3.5 border-b border-border">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider mb-1">
                  <ShieldAlert className="size-3" />
                  <span>Admin Syndicate Desk · Edit Offering</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Edit Details: {editingOffering.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update live terms, third-party portal link, valuation, or status.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted cursor-pointer transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {editError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditOfferingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Offering Status *
                  </label>
                  <select
                    value={editOfferingForm.status}
                    onChange={(e) =>
                      setEditOfferingForm((prev) => ({
                        ...prev,
                        status: e.target.value as "active" | "closed",
                      }))
                    }
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="active">Active Allocation (Live Carousel)</option>
                    <option value="closed">Closed / Distributed (Past Offerings)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Identifier (Slug)
                  </label>
                  <input
                    disabled
                    value={editOfferingForm.offeringId}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-muted text-sm font-mono text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Company Name *
                  </label>
                  <input
                    required
                    value={editOfferingForm.name}
                    onChange={(e) =>
                      setEditOfferingForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Micro1 Inc."
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Pre-Money Valuation *
                  </label>
                  <input
                    required
                    value={editOfferingForm.valuation}
                    onChange={(e) =>
                      setEditOfferingForm((prev) => ({ ...prev, valuation: e.target.value }))
                    }
                    placeholder="e.g. $40B, <$4B, $2.5B"
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Allocation Cap / Goal
                  </label>
                  <input
                    value={editOfferingForm.fundingGoal}
                    onChange={(e) =>
                      setEditOfferingForm((prev) => ({ ...prev, fundingGoal: e.target.value }))
                    }
                    placeholder="e.g. $250K, $500K"
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Min Check (USD)
                  </label>
                  <input
                    type="number"
                    value={editOfferingForm.minCheckNum}
                    onChange={(e) => {
                      const num = Number(e.target.value) || 5000;
                      setEditOfferingForm((prev) => ({
                        ...prev,
                        minCheckNum: num,
                        minCheck: `$${num >= 1000 ? num / 1000 + "K" : num}`,
                      }));
                    }}
                    placeholder="5000"
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary tabular-nums"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Deadline / Closing Date
                  </label>
                  <input
                    value={editOfferingForm.closingDate}
                    onChange={(e) =>
                      setEditOfferingForm((prev) => ({ ...prev, closingDate: e.target.value }))
                    }
                    placeholder="e.g. Nov 15, 2026"
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Round Type / Series
                  </label>
                  <input
                    value={editOfferingForm.roundType}
                    onChange={(e) =>
                      setEditOfferingForm((prev) => ({ ...prev, roundType: e.target.value }))
                    }
                    placeholder="e.g. Series D Direct SPV"
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Offering Badge
                  </label>
                  <input
                    value={editOfferingForm.badge}
                    onChange={(e) =>
                      setEditOfferingForm((prev) => ({ ...prev, badge: e.target.value }))
                    }
                    placeholder="e.g. Growth SPV Allocation"
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center justify-between">
                  <span>Third-Party Application / SPV Portal URL (Optional)</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Carta, Assure, AngelList, etc.</span>
                </label>
                <input
                  type="url"
                  value={editOfferingForm.thirdPartyUrl}
                  onChange={(e) =>
                    setEditOfferingForm((prev) => ({ ...prev, thirdPartyUrl: e.target.value }))
                  }
                  placeholder="https://app.carta.com/spvs/... or https://assure.co/..."
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Summary Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editOfferingForm.description}
                  onChange={(e) =>
                    setEditOfferingForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Provide a concise 1-2 sentence description of the company's core technology and market value proposition."
                  className="w-full p-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-xl text-xs uppercase tracking-wider"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingOffering}
                  className="rounded-xl text-xs font-semibold uppercase tracking-wider shadow-xs"
                >
                  {isSavingOffering ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN: BROADCAST DEAL MODAL */}
      {broadcastModalOpen && broadcastOffering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card text-card-foreground p-6 sm:p-7 shadow-2xl space-y-5 my-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-3.5 border-b border-border">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider mb-1">
                  <ShieldAlert className="size-3" />
                  <span>Admin Syndicate Desk · Deal Broadcast</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Broadcast Update: {broadcastOffering.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Send high-priority email notices &amp; attached documents to platform investors.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setBroadcastModalOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted cursor-pointer transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {broadcastError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{broadcastError}</span>
              </div>
            )}

            <form onSubmit={handleBroadcastSubmit} className="space-y-4">
              {/* Delivery Target Card (All Verified Users) */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-muted/30">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Delivery Audience
                  </span>
                  <p className="text-sm font-semibold text-foreground">
                    All Verified Platform Investors
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    {isLoadingAudiencePreview ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    <span>
                      {broadcastRecipientCount !== null
                        ? `${broadcastRecipientCount} Verified User${broadcastRecipientCount === 1 ? "" : "s"}`
                        : "Querying Audience..."}
                    </span>
                  </span>
                </div>
              </div>

              {/* Subject Line */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Email Subject Line *
                </label>
                <input
                  required
                  type="text"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  placeholder="e.g. Priority Allocation &amp; Wire Notice: Micro1 Inc. SPV Series"
                  className="w-full h-10 px-3.5 rounded-xl border border-input bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Custom Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Custom Message / Syndicate Note
                </label>
                <textarea
                  rows={3}
                  value={broadcastCustomMessage}
                  onChange={(e) => setBroadcastCustomMessage(e.target.value)}
                  placeholder="e.g. Attached is the updated SPV investment memorandum and subscription docs. Wire instructions are also included. Allocation closes this Friday at 5 PM EST."
                  className="w-full p-3 rounded-xl border border-input bg-background text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none"
                />
              </div>

              {/* Document Attachment Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center justify-between">
                  <span>Attach Document (Optional)</span>
                  <span className="text-[11px] text-muted-foreground font-normal">In-memory attachment (PDF, DOCX, XLSX, PPTX, max 20MB)</span>
                </label>

                {broadcastAttachment ? (
                  <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <FileText className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{broadcastAttachment.filename}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatFileSize(broadcastAttachment.size)} • <span className="text-emerald-600 dark:text-emerald-400 font-medium">Ready to send</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveBroadcastAttachment}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition cursor-pointer"
                      title="Remove attachment"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 rounded-2xl cursor-pointer transition text-center group">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx,image/*"
                      onChange={handleBroadcastFileUpload}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground group-hover:text-foreground">
                      <Upload className="size-4 text-primary" />
                      <span>Click to attach a document or pitch deck</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground mt-1">
                      Files are delivered directly as email attachments without persistent storage
                    </span>
                  </label>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBroadcastModalOpen(false)}
                  className="rounded-xl text-xs uppercase tracking-wider"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSendingBroadcast}
                  className="rounded-xl text-xs font-semibold uppercase tracking-wider shadow-xs gap-1.5"
                >
                  {isSendingBroadcast ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Dispatching Broadcast...</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5" />
                      <span>Send Email Broadcast</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
