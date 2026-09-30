import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import OfferingsSection from "@/components/OfferingsSection";
import HeroSection from "@/components/HeroSection";
import BusinessApplicationSection from "@/components/BusinessApplicationSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      {/* Top System Notice Bar */}
      <div className="pt-24 sm:pt-28 pb-2 text-center">
        <p className="text-[11.5px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          APEX KRISH CAPITAL
        </p>
      </div>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-[1150px] px-4 sm:px-6 py-4 space-y-24">
        {/* CONVERSION-OPTIMIZED HERO SECTION */}
        <HeroSection />

        {/* OFFERINGS SECTION (CURRENT: Micro1 Inc. & PAST OFFERINGS) */}
        <OfferingsSection />

        {/* FOR FOUNDERS & COMPANIES - EXPANDABLE SCREEN PORTAL */}
        <BusinessApplicationSection />

        {/* CORE INVESTMENT THESIS & SECTOR INDEX */}
        <section id="focus" className="space-y-8 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Research Thesis
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Sectors of Conviction
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            {/* Sector 01 */}
            <div className="rounded-2xl border border-border/80 bg-gradient-to-b from-card to-card/60 p-6 sm:p-8 hover:border-primary/40 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-bold text-foreground bg-muted/60 px-2.5 py-1 rounded-md text-xs">01</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-wide text-xs uppercase">
                    Intelligence & Autonomous Agents
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-foreground tracking-tight">
                  Foundation Architectures & Applied AI Infrastructure
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed font-normal">
                  Backing category-leading teams building synthetic data pipelines, verified coding agents, and enterprise AI engines.
                </p>
              </div>

              <div className="sm:text-right shrink-0 pt-1 sm:pt-0">
                <span className="font-bold text-xs text-foreground bg-muted/50 px-3.5 py-2 rounded-lg inline-block border border-border/60">
                  Micro1 · Scale AI · xAI
                </span>
              </div>
            </div>

            {/* Sector 02 */}
            <div className="rounded-2xl border border-border/80 bg-gradient-to-b from-card to-card/60 p-6 sm:p-8 hover:border-primary/40 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-bold text-foreground bg-muted/60 px-2.5 py-1 rounded-md text-xs">02</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-wide text-xs uppercase">
                    Hardware & Scale
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-foreground tracking-tight">
                  Accelerated Computing & Silicon Systems
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed font-normal">
                  Next-generation datacenter interconnects, specialized ASIC accelerators, and optical compute scaling cluster density.
                </p>
              </div>

              <div className="sm:text-right shrink-0 pt-1 sm:pt-0">
                <span className="font-bold text-xs text-foreground bg-muted/50 px-3.5 py-2 rounded-lg inline-block border border-border/60">
                  Series B through Pre-IPO
                </span>
              </div>
            </div>

            {/* Sector 03 */}
            <div className="rounded-2xl border border-border/80 bg-gradient-to-b from-card to-card/60 p-6 sm:p-8 hover:border-primary/40 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-bold text-foreground bg-muted/60 px-2.5 py-1 rounded-md text-xs">03</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-wide text-xs uppercase">
                    Frontier Science
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-foreground tracking-tight">
                  Neural Interfaces & Computational Therapeutics
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed font-normal">
                  Pioneering brain-computer interfaces (BCI), algorithmic drug discovery, and neuro-restorative technologies.
                </p>
              </div>

              <div className="sm:text-right shrink-0 pt-1 sm:pt-0">
                <span className="font-bold text-xs text-foreground bg-muted/50 px-3.5 py-2 rounded-lg inline-block border border-border/60">
                  Neuralink SPV
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* FIDUCIARY ARCHITECTURE & STANDARDS */}
        <section className="space-y-8 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Fiduciary & Execution Standards
              </h2>
              <p className="text-base text-muted-foreground mt-1">
                How we protect syndicate members and ensure clean, institutional-grade equity ownership.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 space-y-3">
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                Rigorous Secondary Diligence
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed font-normal">
                Direct verification of board approvals, company ROFR waivers, cap table standings, and transfer mechanics prior to capital calls.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 space-y-3">
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                Delaware Ring-Fenced SPVs
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed font-normal">
                Every deal is isolated in its own Delaware Series LLC. Each vehicle is bankruptcy-remote, completely insulating your capital.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 space-y-3">
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                Standard Vehicle Terms
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed font-normal">
                Direct SPVs are governed by standardized series operating agreements featuring a 2% minimum management fee and a 10% performance carry on net realized gains.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 space-y-3">
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                SEC 506(c) Compliance
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed font-normal">
                All allocations are strictly structured under SEC Rule 506(c) exemptions for verified accredited individuals and institutional buyers.
              </p>
            </div>
          </div>
        </section>

        {/* OFFICE & DIRECT COMMUNICATIONS */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-5 font-medium">
          <div className="flex items-center gap-2.5">
            <Mail className="size-4 text-muted-foreground shrink-0" />
            <a href="mailto:syndicate@apexkrishcapital.com" className="text-foreground hover:underline">
              syndicate@apexkrishcapital.com
            </a>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="size-4 text-muted-foreground shrink-0" />
            <a href="tel:7208456839" className="text-foreground hover:underline">
              720-845-6839
            </a>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="size-4 text-muted-foreground shrink-0" />
            <span className="text-foreground">Denver, CO, USA</span>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-border bg-background py-12 px-4 sm:px-6 text-center text-sm text-muted-foreground space-y-5 font-normal">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
          <Link href="/aboutus" className="text-foreground hover:underline transition-colors">
            About Us
          </Link>
          <span className="text-border">·</span>
          <a href="#offerings" className="text-muted-foreground hover:text-foreground transition-colors">
            Active SPV Offerings
          </a>
          <span className="text-border">·</span>
          <a href="#focus" className="text-muted-foreground hover:text-foreground transition-colors">
            Investment Thesis
          </a>
          <span className="text-border">·</span>
          <a href="#raise-capital" className="text-muted-foreground hover:text-foreground transition-colors">
            For Founders
          </a>
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-foreground">© {new Date().getFullYear()} Apex Krish Capital. All Rights Reserved.</p>
          <p className="text-xs max-w-2xl mx-auto leading-relaxed text-muted-foreground">
            Apex Krish Capital provides private market investment opportunities exclusively to accredited investors under SEC Rule 506(c). Syndicated vehicles operate under standard terms (10% performance carry, 2% minimum management fees). Past performance is not indicative of future results. Private market securities involve substantial risk of loss.
          </p>
        </div>
      </footer>
    </div>
  );
}
