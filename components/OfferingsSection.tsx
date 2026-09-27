"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Calendar,
  DollarSign,
  CheckCircle2,
  Lock,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UserInteraction = {
  type: "interest" | "commitment";
  amount?: number | null;
};

type OfferingsSectionProps = {
  initialVerificationStatus?: string | null;
  isSignedIn?: boolean;
};

type ActiveOffering = {
  id: string;
  name: string;
  badge: string;
  description: string;
  closingDate: string;
  valuation: string;
  valuationSub: string;
  fundingGoal: string;
  goalSub: string;
  minCheck: string;
  minCheckSub: string;
  minCheckNum: number;
  eligibility: string;
  eligibilitySub: string;
  roundType: string;
};

const ACTIVE_OFFERINGS: ActiveOffering[] = [
  {
    id: "micro1-inc",
    name: "Micro1 Inc.",
    badge: "Active SPV Allocation",
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
    roundType: "Direct Equity SPV",
  },
  {
    id: "cursor-anysphere",
    name: "Cursor (Anysphere)",
    badge: "Series A/B SPV Allocation",
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
    roundType: "Growth SPV Series",
  },
];

export default function OfferingsSection({
  initialVerificationStatus,
  isSignedIn: initialIsSignedIn,
}: OfferingsSectionProps) {
  const { isLoaded: isClerkLoaded, isSignedIn: clerkIsSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState<"current" | "past">("current");
  const [isSignedIn, setIsSignedIn] = useState(initialIsSignedIn ?? false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(
    initialVerificationStatus ?? null
  );
  const [interactions, setInteractions] = useState<Record<string, UserInteraction>>({});
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(true);

  // Commit Dialog State
  const [commitModalOpen, setCommitModalOpen] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState<ActiveOffering>(ACTIVE_OFFERINGS[0]);
  const [commitAmount, setCommitAmount] = useState("5000");
  const [commitError, setCommitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Interest loading state
  const [expressingInterestId, setExpressingInterestId] = useState<string | null>(null);

  // Fetch current user state & interactions when clerk auth state changes
  useEffect(() => {
    if (!isClerkLoaded) return;

    if (!clerkIsSignedIn) {
      setIsSignedIn(false);
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

  const isVerified = isSignedIn && verificationStatus === "verified";
  const isPending = isSignedIn && verificationStatus !== "verified";

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
    setSelectedOffering(offering);
    const userInteraction = interactions[offering.id];
    if (userInteraction?.amount) {
      setCommitAmount(userInteraction.amount.toString());
    } else {
      setCommitAmount(offering.minCheckNum.toString());
    }
    setCommitError(null);
    setCommitModalOpen(true);
  }

  // Handle Commit Capital action
  async function handleCommitSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCommitError(null);

    const amountNum = Number(commitAmount);
    const minAmount = selectedOffering.minCheckNum;

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
          offeringId: selectedOffering.id,
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
        [selectedOffering.id]: { type: "commitment", amount: amountNum },
      }));

      setCommitModalOpen(false);
      setSuccessMessage(`Commitment of $${amountNum.toLocaleString()} USD for ${selectedOffering.name} submitted successfully.`);
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      setCommitError(err.message || "Unable to submit commitment.");
    } finally {
      setIsSubmitting(false);
    }
  }

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

        {/* Tab Switcher */}
        <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 self-start sm:self-auto text-xs">
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
            Current Deals ({ACTIVE_OFFERINGS.length})
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
            Past Deals (3)
          </button>
        </div>
      </div>

      {/* Global Success Banner */}
      {successMessage && (
        <div className="animate-in fade-in slide-in-from-top-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-xs">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

      {/* TAB CONTENT: CURRENT OFFERINGS */}
      {activeTab === "current" && (
        <div className="space-y-6">
          {ACTIVE_OFFERINGS.map((offering) => {
            const userInteraction = interactions[offering.id];
            const isExpressing = expressingInterestId === offering.id;

            return (
              <div
                key={offering.id}
                className="rounded-2xl border border-border bg-card text-card-foreground p-6 sm:p-8 shadow-xs relative"
              >
                {/* Top Badge Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border text-xs">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 uppercase tracking-wider text-[11px]">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Active Offering
                    </span>
                    <span className="text-muted-foreground hidden sm:inline">·</span>
                    <span className="text-muted-foreground font-medium hidden sm:inline">
                      {offering.roundType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span>
                      Closing:{" "}
                      <strong className="text-foreground font-semibold">
                        {offering.closingDate}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Main Info */}
                <div className="mt-7 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-7 space-y-5">
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
                        {offering.badge}
                      </p>
                      <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                        {offering.name}
                      </h3>
                    </div>

                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                      {offering.description}
                    </p>

                    {/* Key Offering Terms Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
                      <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                          Valuation
                        </span>
                        <p className="text-xl font-bold text-foreground tabular-nums">
                          {offering.valuation}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {offering.valuationSub}
                        </span>
                      </div>

                      <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                          Funding Goal
                        </span>
                        <p className="text-xl font-bold text-foreground tabular-nums">
                          {offering.fundingGoal}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {offering.goalSub}
                        </span>
                      </div>

                      <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                          Minimum Check
                        </span>
                        <p className="text-xl font-bold text-foreground tabular-nums">
                          {offering.minCheck}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {offering.minCheckSub}
                        </span>
                      </div>

                      <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                          Eligibility
                        </span>
                        <p className="text-xl font-bold text-foreground">
                          {offering.eligibility}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {offering.eligibilitySub}
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
                          To express interest or commit capital to {offering.name}, sign in with your accredited investor account.
                        </p>
                        <div>
                          <Button asChild className="w-full h-11 rounded-full font-bold text-sm tracking-wide shadow-xs">
                            <Link href="/sign-in">Log in to participate</Link>
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
                        {userInteraction?.type === "commitment" ? (
                          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-300 space-y-1.5">
                            <span className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">
                              Active Allocation Request
                            </span>
                            <p className="text-xl font-bold text-foreground">
                              ${userInteraction.amount?.toLocaleString()} USD Committed
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Our closing team will provide wire instructions and subscription documents prior to the deadline.
                            </p>
                          </div>
                        ) : userInteraction?.type === "interest" ? (
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
                          <Button
                            onClick={() => openCommitModal(offering)}
                            className="w-full h-11 px-4 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs inline-flex items-center justify-center gap-2"
                          >
                            <DollarSign className="size-4" />
                            <span>
                              {userInteraction?.type === "commitment" ? "Update Commitment" : "Commit Capital"}
                            </span>
                          </Button>

                          {userInteraction?.type !== "commitment" && (
                            <Button
                              variant={userInteraction?.type === "interest" ? "secondary" : "outline"}
                              onClick={() => handleExpressInterest(offering.id, offering.name)}
                              disabled={isExpressing}
                              className="w-full h-11 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2"
                            >
                              {isExpressing ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : userInteraction?.type === "interest" ? (
                                <CheckCircle2 className="size-4 text-primary" />
                              ) : null}
                              <span>
                                {userInteraction?.type === "interest" ? "Interested ✓" : "I'm Interested"}
                              </span>
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB CONTENT: PAST OFFERINGS */}
      {activeTab === "past" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Scale AI */}
          <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs font-bold">
              <span className="uppercase tracking-wider px-2.5 py-1 rounded-md bg-muted/60 text-foreground border border-border">
                Series F SPV
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                Funded & Closed
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Scale AI</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Foundational AI data infrastructure and model validation platform.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2 text-center text-xs font-semibold">
              <div className="rounded-xl bg-muted/30 border border-border/60 p-3 space-y-0.5">
                <span className="text-xs uppercase text-muted-foreground block font-bold">Valuation</span>
                <p className="text-base font-bold text-foreground">$14.0B</p>
              </div>
              <div className="rounded-xl bg-muted/30 border border-border/60 p-3 space-y-0.5">
                <span className="text-xs uppercase text-muted-foreground block font-bold">Status</span>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">Distributed</p>
              </div>
            </div>
          </div>

          {/* xAI */}
          <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs font-bold">
              <span className="uppercase tracking-wider px-2.5 py-1 rounded-md bg-muted/60 text-foreground border border-border">
                Series B SPV
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                Funded & Closed
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">xAI</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Frontier artificial intelligence research, Grok models, and supercomputing clusters.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2 text-center text-xs font-semibold">
              <div className="rounded-xl bg-muted/30 border border-border/60 p-3 space-y-0.5">
                <span className="text-xs uppercase text-muted-foreground block font-bold">Valuation</span>
                <p className="text-base font-bold text-foreground">$24.0B</p>
              </div>
              <div className="rounded-xl bg-muted/30 border border-border/60 p-3 space-y-0.5">
                <span className="text-xs uppercase text-muted-foreground block font-bold">Status</span>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">Distributed</p>
              </div>
            </div>
          </div>

          {/* Neuralink */}
          <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs font-bold">
              <span className="uppercase tracking-wider px-2.5 py-1 rounded-md bg-muted/60 text-foreground border border-border">
                Direct SPV
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                Funded & Closed
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Neuralink</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Brain-computer interface (BCI) technology restoring autonomy and neural function.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2 text-center text-xs font-semibold">
              <div className="rounded-xl bg-muted/30 border border-border/60 p-3 space-y-0.5">
                <span className="text-xs uppercase text-muted-foreground block font-bold">Valuation</span>
                <p className="text-base font-bold text-foreground">$7.0B</p>
              </div>
              <div className="rounded-xl bg-muted/30 border border-border/60 p-3 space-y-0.5">
                <span className="text-xs uppercase text-muted-foreground block font-bold">Status</span>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">Distributed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMMIT CAPITAL MODAL */}
      {commitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card text-card-foreground p-6 sm:p-7 shadow-xl space-y-5 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {interactions[selectedOffering.id]?.type === "commitment"
                    ? "Update Allocation Commitment"
                    : "Capital Commitment"}
                </span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">
                  {selectedOffering.name} SPV Series
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
                <strong className="text-foreground">${selectedOffering.minCheckNum.toLocaleString()} USD</strong>
              </div>
              <div className="flex justify-between">
                <span>Funding Deadline:</span>
                <strong className="text-foreground">{selectedOffering.closingDate}</strong>
              </div>
              <div className="flex justify-between">
                <span>Valuation:</span>
                <strong className="text-foreground">{selectedOffering.valuation} USD</strong>
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
                    min={selectedOffering.minCheckNum}
                    step="1000"
                    value={commitAmount}
                    onChange={(e) => {
                      setCommitAmount(e.target.value);
                      if (commitError) setCommitError(null);
                    }}
                    placeholder={selectedOffering.minCheckNum.toString()}
                    className="w-full h-12 pl-8 pr-4 rounded-xl border border-input bg-background text-base font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary tabular-nums"
                  />
                </div>
              </div>

              {/* Amount Quick Presets */}
              <div className="flex flex-wrap gap-2">
                {[selectedOffering.minCheckNum, 10000, 25000, 50000].map((preset) => (
                  <button
                    key={preset}
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
                  ) : interactions[selectedOffering.id]?.type === "commitment" ? (
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
    </section>
  );
}
