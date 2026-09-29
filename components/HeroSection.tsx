"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Scale,
  Activity,
  Layers,
  ShieldCheck,
  Percent,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HeroSection() {
  const { isLoaded: isClerkLoaded, isSignedIn: clerkIsSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState<"allocation" | "carry_ledger" | "spv_mechanics">("allocation");
  const [simulatedGain, setSimulatedGain] = useState<number>(100000);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    if (!isClerkLoaded) return;

    if (!clerkIsSignedIn) {
      setIsSignedIn(false);
      setIsProfileSaved(false);
      setIsLoadingAuth(false);
      return;
    }

    let isMounted = true;
    async function loadUserState() {
      setIsLoadingAuth(true);
      try {
        const res = await fetch("/api/offerings/my-interactions", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setIsSignedIn(!!data.isSignedIn);
            setIsProfileSaved(!!data.isProfileSaved);
          }
        }
      } catch (e) {
        // Fallback gracefully
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    }
    loadUserState();
    return () => {
      isMounted = false;
    };
  }, [isClerkLoaded, clerkIsSignedIn]);

  // Fee calculations
  const peCarry = Math.round(simulatedGain * 0.20);
  const apexCarry = Math.round(simulatedGain * 0.10);
  const netSavings = peCarry - apexCarry;
  const lpApexTakehome = simulatedGain - apexCarry;
  const lpPeTakehome = simulatedGain - peCarry;

  return (
    <section className="relative pt-4 sm:pt-8 pb-4 space-y-10">
      {/* EDITORIAL HERO HEADER */}
      <div className="space-y-6 max-w-4xl">
        {/* Classical Tag */}
        <div className="inline-flex items-center gap-2 text-sm font-bold tracking-wide text-emerald-600 dark:text-emerald-400 uppercase">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>10% Performance Carry · Zero Management Fees</span>
        </div>

        {/* High-Contrast Conversion Headline */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-[-0.03em] text-foreground leading-[1.1]">
          Access Exclusive Deals. Keep More of Your Upside.
        </h1>

        {/* Concise Narrative Value Proposition */}
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl font-normal">
          Apex Krish Capital is a private investment syndicate giving accredited investors curated access to vetted private equity and early-stage opportunities.
        </p>

        {/* High-Intent CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <Button
            size="lg"
            onClick={() => {
              const el = document.getElementById("offerings");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="h-12 px-7 rounded-full font-bold text-sm tracking-wide bg-foreground text-background hover:bg-foreground/90 transition-all cursor-pointer group shadow-xs"
          >
            <span className="flex items-center justify-center gap-2">
              Explore Active Allocations
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>

          {isSignedIn && (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-7 rounded-full font-semibold text-sm tracking-wide border-border hover:bg-muted cursor-pointer"
            >
              <Link href="/profile" className="flex items-center justify-center gap-2">
                {isProfileSaved ? (
                  <>
                    <UserCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Update Investor Profile</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4 text-muted-foreground" />
                    <span>Complete Investor Profile</span>
                  </>
                )}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ARCHITECTURAL ALLOCATION & CARRY LEDGER */}
      <div className="rounded-2xl border border-border bg-card text-card-foreground overflow-hidden shadow-xs">
        {/* Ledger Header & Segment Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-7 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
              Syndicate Terminal
            </span>
            <span className="text-border">·</span>
            <span className="text-xs uppercase tracking-wider text-foreground font-bold">
              Allocation Ledger
            </span>
          </div>

          {/* Segment Tabs */}
          <div className="inline-flex rounded-lg border border-border bg-background p-1 self-start sm:self-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab("allocation")}
              className={cn(
                "px-3.5 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5",
                activeTab === "allocation"
                  ? "bg-muted text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Current SPV: Micro1</span>
            </button>
            <button
              onClick={() => setActiveTab("carry_ledger")}
              className={cn(
                "px-3.5 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5",
                activeTab === "carry_ledger"
                  ? "bg-muted text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Carry Advantage Ledger</span>
            </button>
            <button
              onClick={() => setActiveTab("spv_mechanics")}
              className={cn(
                "px-3.5 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5",
                activeTab === "spv_mechanics"
                  ? "bg-muted text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Legal Structure</span>
            </button>
          </div>
        </div>

        {/* TAB 1: CURRENT SPV TERM SHEET */}
        {activeTab === "allocation" && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Micro1 Inc.
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
                  AI-driven technical hiring and engineer vetting infrastructure. Direct equity access via Apex Krish Capital SPV.
                </p>
              </div>

              <Button asChild size="default" className="rounded-full text-xs font-bold uppercase tracking-wider shrink-0">
                <a href="#offerings">View Deal Room</a>
              </Button>
            </div>

            {/* Financial Terms Table */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
              <div className="bg-card p-5 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Pre-Money Valuation
                </span>
                <p className="text-2xl font-bold text-foreground tabular-nums">&lt;$4B</p>
                <span className="text-xs text-muted-foreground">Institutional Round</span>
              </div>

              <div className="bg-card p-5 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Performance Carry
                </span>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">10%</p>
                <span className="text-xs text-muted-foreground">50% below PE standard</span>
              </div>

              <div className="bg-card p-5 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Minimum Check
                </span>
                <p className="text-2xl font-bold text-foreground tabular-nums">$5,000</p>
                <span className="text-xs text-muted-foreground">USD per investor</span>
              </div>

              <div className="bg-card p-5 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Closing Deadline
                </span>
                <p className="text-2xl font-bold text-foreground">Oct 8, 2026</p>
                <span className="text-xs text-muted-foreground">$125K allocation cap</span>
              </div>
            </div>

            {/* Capacity Footnote */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span>Total allocation cap: $125,000 USD (Accredited verification required)</span>
              </div>
              <a href="#offerings" className="text-foreground hover:underline inline-flex items-center gap-1 font-bold">
                Go to commitment form <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: CARRY ADVANTAGE LEDGER (Real Numbers) */}
        {activeTab === "carry_ledger" && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  The 10% vs. 20% Carry Advantage
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Direct dollar impact on your realized net exit profits
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-bold">
                +${netSavings.toLocaleString()} USD Kept by LP
              </div>
            </div>

            {/* Capital Gain Selectors */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Select Example Exit Profit Gain:
              </span>
              <div className="flex flex-wrap gap-2.5">
                {[50000, 100000, 250000, 500000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setSimulatedGain(amount)}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-xs transition cursor-pointer font-bold",
                      simulatedGain === amount
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    ${amount.toLocaleString()} Net Gain
                  </button>
                ))}
              </div>
            </div>

            {/* Ledger Breakdown Table */}
            <div className="rounded-xl border border-border overflow-hidden text-sm">
              <div className="grid grid-cols-3 bg-muted/60 p-3.5 font-bold text-muted-foreground border-b border-border uppercase tracking-wider text-xs">
                <div>Metric</div>
                <div>Traditional PE (20% Carry)</div>
                <div className="text-emerald-600 dark:text-emerald-400">Apex Krish (10% Carry)</div>
              </div>

              <div className="grid grid-cols-3 p-3.5 border-b border-border/60 bg-card items-center">
                <div className="text-muted-foreground font-medium">Deal Profit Realized</div>
                <div className="font-bold text-foreground">${simulatedGain.toLocaleString()}</div>
                <div className="font-bold text-foreground">${simulatedGain.toLocaleString()}</div>
              </div>

              <div className="grid grid-cols-3 p-3.5 border-b border-border/60 bg-card items-center">
                <div className="text-muted-foreground font-medium">Performance Fee Deducted</div>
                <div className="text-destructive font-bold">-${peCarry.toLocaleString()} (20%)</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold">-${apexCarry.toLocaleString()} (10%)</div>
              </div>

              <div className="grid grid-cols-3 p-4 bg-muted/20 items-center font-bold">
                <div className="text-foreground">Net Profit in Your Pocket</div>
                <div className="text-muted-foreground text-base">${lpPeTakehome.toLocaleString()}</div>
                <div className="text-emerald-600 dark:text-emerald-400 text-base">
                  ${lpApexTakehome.toLocaleString()} (+${netSavings.toLocaleString()})
                </div>
              </div>
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              By reducing carry from 20% to 10%, you keep an additional $10,000 on every $100,000 of profit.
            </p>
          </div>
        )}

        {/* TAB 3: SPV LEGAL STRUCTURE */}
        {activeTab === "spv_mechanics" && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="pb-3 border-b border-border">
              <h3 className="text-2xl font-bold text-foreground">
                Fiduciary & SPV Mechanics
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Institutional legal architecture designed for clean liability segregation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
              <div className="p-5 rounded-xl border border-border bg-muted/20 space-y-2.5">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Structure
                </span>
                <h4 className="font-bold text-foreground text-base">Delaware Series LLC</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Each company offering is isolated inside a dedicated series. Assets and liabilities are legally ring-fenced with zero cross-fund contamination.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-muted/20 space-y-2.5">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Cap Table
                </span>
                <h4 className="font-bold text-foreground text-base">Direct Pass-Through</h4>
                <p className="text-muted-foreground leading-relaxed">
                  LPs receive pro-rata beneficial ownership matching institutional preferred stock with direct liquidation preference pass-throughs.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-muted/20 space-y-2.5">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Alignment
                </span>
                <h4 className="font-bold text-foreground text-base">Pure Carry Model</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Zero management fees on direct syndicated SPVs. We only generate revenue when our syndicated investors generate net profits.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
