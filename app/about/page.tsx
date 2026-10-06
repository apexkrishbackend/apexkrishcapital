import Link from "next/link";
import { ArrowLeft, TrendingUp, Users, ShieldCheck, FileCheck2, DollarSign } from "lucide-react";

export const metadata = {
  title: "About Us | Apex Krish Capital",
  description: "Learn about Apex Krish Capital, our accessible $5,000 SPV syndicate model, and frontier tech investment thesis.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-[800px] px-4 sm:px-6 pt-28 pb-16 space-y-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* Hero */}
        <div className="space-y-4 text-center sm:text-left">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            ABOUT APEX KRISH CAPITAL
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Disciplined Research & Curated Access
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            Apex Krish Capital is a private investment syndicate providing accredited investors with curated access to vetted private equity and early-stage opportunities in frontier technology—with accessible $5,000 minimum checks rather than conventional $50,000+ institutional barriers.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 space-y-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-card-foreground">
              Accessible $5,000 Minimum Entry
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We provide better access to smaller accredited investors by offering low $5,000 entry minimums—opening high-conviction deals typically walled off by $50,000+ private equity minimums.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 space-y-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-card-foreground">
              Direct SPV Model
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our Special Purpose Vehicle model ring-fences each deal in its own Delaware Series LLC, providing investors with direct beneficial ownership, liability segregation, and cap table simplicity.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 space-y-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-card-foreground">
              Curated Frontier Tech Sourcing
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We leverage disciplined diligence and market networks to source allocations in category-defining leaders across AI infrastructure, autonomous intelligence, and computing.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 space-y-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-card-foreground">
              Fiduciary Alignment & Transparency
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A 2% minimum management fee and standard contractual carry terms ensure complete alignment, clear communication, and fiduciary integrity throughout the entire lifecycle.
            </p>
          </div>
        </div>

        {/* Minimal CTA */}
        <div className="rounded-2xl border border-border bg-muted/40 p-6 text-center space-y-3">
          <p className="text-sm font-medium text-foreground">
            Ready to explore active SPV syndications?
          </p>
          <Link
            href="/#offerings"
            className="inline-flex h-9 px-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider items-center justify-center hover:bg-primary/90 transition shadow-xs"
          >
            Explore Active Offerings
          </Link>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-border bg-background py-6 px-4 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Apex Krish Capital. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
