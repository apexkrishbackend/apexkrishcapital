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
  const [activeTab, setActiveTab] = useState<"allocation" | "spv_mechanics">("allocation");
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

  return (
    <section className="relative pt-4 sm:pt-8 pb-4 space-y-10">
      {/* EDITORIAL HERO HEADER */}
      <div className="space-y-6 max-w-4xl">
        {/* Classical Tag */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Accredited Investor Syndicate · SEC 506(c)</span>
        </div>

        {/* High-Contrast Conversion Headline */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-[-0.03em] text-foreground leading-[1.1]">
          Access Exclusive Deals. Invest with High Conviction.
        </h1>

        {/* Concise Narrative Value Proposition */}
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl font-normal">
          Apex Krish Capital gives accredited investors curated access to vetted private equity and high-conviction tech rounds with an accessible <strong className="text-foreground font-semibold">$5,000 minimum entry</strong>—bypassing the $50,000+ hurdles of traditional private equity.
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

        {/* Micro Comparison Value Highlights */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            <span>
              <strong className="text-foreground font-semibold">$5K Min. Check</strong> vs. $50K+ in traditional PE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            <span>Direct SPV Equity Pass-Through</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            <span>SEC Rule 506(c) Verified</span>
          </div>
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
              Allocation Overview
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
              onClick={() => setActiveTab("spv_mechanics")}
              className={cn(
                "px-3.5 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5",
                activeTab === "spv_mechanics"
                  ? "bg-muted text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Structure & Governance</span>
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
                  Structure
                </span>
                <p className="text-2xl font-bold text-foreground">Direct SPV</p>
                <span className="text-xs text-muted-foreground">Delaware Series LLC</span>
              </div>

              <div className="bg-card p-5 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Minimum Check
                </span>
                <p className="text-2xl font-bold text-foreground tabular-nums">$5,000</p>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">vs. $50K+ typical PE</span>
              </div>

              <div className="bg-card p-5 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Closing Deadline
                </span>
                <p className="text-2xl font-bold text-foreground">Oct 8, 2026</p>
                <span className="text-xs text-muted-foreground">$123K allocation cap</span>
              </div>
            </div>

            {/* Capacity Footnote */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span>Total allocation cap: $123,000 USD (Accredited verification required)</span>
              </div>
              <a href="#offerings" className="text-foreground hover:underline inline-flex items-center gap-1 font-bold">
                Go to commitment form <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: SPV LEGAL STRUCTURE */}
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
                <h4 className="font-bold text-foreground text-base">Standard Syndicate Terms</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Direct syndicated vehicles standardly feature a 2% minimum management fee and a 10% performance carry on net realized profits.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
