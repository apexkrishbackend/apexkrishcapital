import Link from "next/link";
import { 
  ArrowLeft, 
  BookOpen, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  Scale, 
  FileText, 
  ArrowUpRight,
  Info,
  Coins,
  Landmark,
  Building2,
  Briefcase,
  Repeat,
} from "lucide-react";

export const metadata = {
  title: "Investor Education | Apex Krish Capital",
  description: "Learn what it means to be an accredited investor or qualified purchaser, and understand private equity and SPV investing basics.",
};

const tocItems = [
  { id: "accredited", title: "What is an Accredited Investor?" },
  { id: "qualified", title: "What is a Qualified Purchaser?" },
  { id: "pe", title: "What is Private Equity?" },
  { id: "why-pe", title: "Why Private Equity Investment?" },
  { id: "valuation-myth", title: "Myth: Share Price Tells You the Valuation" },
  { id: "spv", title: "What is an SPV?" },
  { id: "syndicate", title: "What is an Investment Syndicate?" },
  { id: "liquidity-events", title: "What is a Liquidation Event?" },
  { id: "risks", title: "Key Risks of Private Investing" },
  { id: "diligence", title: "Our Due Diligence Approach" },
];

export default function InvestorEducationPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      <main className="mx-auto w-full max-w-[880px] px-4 sm:px-6 pt-28 pb-20 space-y-12">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors font-medium group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>

        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-semibold tracking-wider uppercase text-primary">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Knowledge Base</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Investor Education
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Background on the terms and structures you&apos;ll encounter as a prospective investor with Apex Krish Capital.
          </p>
        </div>

        {/* Table of Contents Box */}
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-md p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold tracking-tight text-foreground">
            <Layers className="w-4 h-4 text-primary" />
            <span>On this page</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {tocItems.map((item, idx) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="group flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors py-0.5"
              >
                <span className="text-[11px] font-mono text-muted-foreground/60 group-hover:text-primary transition-colors w-4">
                  {idx + 1}.
                </span>
                <span className="group-hover:underline underline-offset-4">{item.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-14 pt-4 text-foreground/90">
          {/* 1. What is an Accredited Investor? */}
          <section id="accredited" className="scroll-mt-28 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                What is an Accredited Investor?
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              An accredited investor is a person or entity permitted under U.S. securities law (Regulation D of the Securities Act) to invest in certain unregistered securities, including private equity and venture deals, without the disclosure protections required for public offerings.
            </p>
            <p className="text-sm sm:text-base leading-relaxed font-medium text-foreground">
              An individual generally qualifies by meeting any one of these tests:
            </p>
            <ul className="space-y-2.5 pl-2 sm:pl-4 text-sm sm:text-base text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                <span>Annual income of at least $200,000 ($300,000 with a spouse or partner) in each of the past two years, with a reasonable expectation of the same this year.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                <span>Net worth over $1 million, excluding the value of a primary residence.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                <span>Holding certain professional licenses in good standing (e.g., Series 7, 65, or 82).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                <span>Being a &ldquo;knowledgeable employee&rdquo; of the fund in question, where applicable.</span>
              </li>
            </ul>
            <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs sm:text-sm text-foreground leading-relaxed mt-4">
              <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span>
                Entities such as trusts, LLCs, and family offices can also qualify as accredited investors, generally by holding total assets above $5 million or having all equity owners individually accredited.
              </span>
            </div>
          </section>

          {/* 2. What is a Qualified Purchaser? */}
          <section id="qualified" className="scroll-mt-28 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                What is a Qualified Purchaser?
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              A qualified purchaser is a higher bar than accredited investor status, defined under the Investment Company Act of 1940. It&apos;s relevant because funds relying on the &ldquo;3(c)(7)&rdquo; exemption can accept an unlimited number of qualified purchasers, versus a 100-investor cap for accredited-investor-only (&ldquo;3(c)(1)&rdquo;) funds.
            </p>
            <ul className="space-y-2.5 pl-2 sm:pl-4 text-sm sm:text-base text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <div className="size-1.5 rounded-full bg-indigo-500 mt-2.5 shrink-0" />
                <span><strong>Individuals:</strong> generally at least $5 million in investments (not counting a primary residence or business).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="size-1.5 rounded-full bg-indigo-500 mt-2.5 shrink-0" />
                <span><strong>Entities:</strong> generally at least $25 million in investments, or entities wholly owned by qualified purchasers.</span>
              </li>
            </ul>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground font-medium pt-1">
              Every qualified purchaser is, by definition, also an accredited investor — the reverse is not true.
            </p>
          </section>

          {/* 3. What is Private Equity? */}
          <section id="pe" className="scroll-mt-28 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                What is Private Equity?
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              Private equity refers to capital invested directly into companies that are not listed on a public stock exchange. Unlike buying public stock, private equity investors typically commit capital for a multi-year horizon in exchange for equity ownership, with returns realized when the company is sold, recapitalized, or taken public.
            </p>
            <p className="text-sm sm:text-base leading-relaxed font-medium text-foreground">
              Common private equity strategies include:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-primary">Growth equity</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Capital for an already-profitable company to expand.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-500">Venture / early-stage</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Capital for young companies with high growth potential and higher risk.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-500">Buyouts</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Acquiring a controlling stake in an established business, often alongside existing management.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Why Private Equity Investment? */}
          <section id="why-pe" className="scroll-mt-28 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <Layers className="w-5 h-5 text-cyan-500" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Why Private Equity Investment?
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              A large share of a company&apos;s value appreciation tends to happen while it is still private — in the early and pre-IPO stages of its growth — rather than after it lists on a public exchange. By the time a company goes public, much of that early growth curve has often already played out, and public investors are frequently buying in after a large part of the value creation has occurred.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              Private equity is also a way to reach companies that public markets simply don&apos;t offer: many category-leading businesses choose to stay private for years, or indefinitely, so an investor limited to public markets never gets access to them at all. For these reasons, private equity is often considered a valuable vehicle for long-term wealth building and a component worth having as part of a well-rounded portfolio.
            </p>
          </section>

          {/* 5. Myth: Share Price Tells You the Valuation */}
          <section id="valuation-myth" className="scroll-mt-28 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <Scale className="w-5 h-5 text-rose-500" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Myth: Share Price Tells You the Valuation
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              A common misconception is that a low share price means a company is &ldquo;cheap,&rdquo; or that a high share price means it is &ldquo;expensive.&rdquo; The price of a single share, on its own, does not tell you a company&apos;s valuation.
            </p>
            <div className="rounded-xl border border-border bg-card/80 p-5 space-y-2 leading-relaxed text-sm sm:text-base text-foreground">
              <p>
                A company&apos;s actual valuation is its share price multiplied by its total number of outstanding shares. Two companies can trade at very different per-share prices and have the exact same valuation, depending on how many shares each has issued.
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm pt-1">
                When evaluating a private opportunity, focus on the overall valuation and what it implies about the business, not the per-share price in isolation.
              </p>
            </div>
          </section>

          {/* 6. What is an SPV? */}
          <section id="spv" className="scroll-mt-28 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <FileText className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                What is an SPV?
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              A Special Purpose Vehicle (SPV) is a standalone legal entity — typically an LLC — created to pool capital from multiple investors for a single investment. Rather than each investor holding shares in the underlying company directly, investors hold an interest in the SPV, and the SPV holds the underlying investment.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              SPVs simplify cap tables for the company being invested in (one line item instead of dozens of individual investors) and let a syndicate organize a group of investors around a specific deal, each contributing their chosen amount subject to the deal&apos;s minimum.
            </p>
          </section>

          {/* 7. What is an Investment Syndicate? */}
          <section id="syndicate" className="scroll-mt-28 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <TrendingUp className="w-5 h-5 text-violet-500" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                What is an Investment Syndicate?
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              A syndicate is a group of investors who pool their capital, typically organized by a lead sponsor, to invest together in opportunities that might otherwise be inaccessible to any single investor — whether due to deal size, relationship access, or minimum investment thresholds. Apex Krish Capital operates as a syndicate: we source, evaluate, and present opportunities, and interested accredited investors and qualified purchasers can choose to participate deal-by-deal through the associated SPV.
            </p>
          </section>

          {/* 8. What is a Liquidation Event? */}
          <section id="liquidity-events" className="scroll-mt-28 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <Coins className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                What is a Liquidation Event?
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              A liquidation event (also called an exit or liquidity event) is the point at which private shareholders are able to convert their ownership stake into cash — or into freely tradable public shares. Until a liquidity event occurs, an investment is generally held on paper only, since there is no public market to sell into. Common types include:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Initial Public Offering (IPO)</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  The company lists its shares on a public stock exchange. Existing private shareholders typically become holders of publicly tradable stock, though sales are often restricted for a period after listing (a &ldquo;lock-up&rdquo;).
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Business acquisition (M&amp;A)</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Another company buys the business outright, in cash, stock, or a combination. Shareholders are paid out (or receive shares in the acquirer) based on their ownership stake and the negotiated deal terms.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Private equity sale / recapitalization</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  A private equity firm or other financial buyer purchases some or all of the company&apos;s equity, often replacing early investors while the business continues operating privately under new ownership.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-500 flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Secondary sale</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  An investor sells their existing shares directly to another private buyer before any company-wide exit event, subject to the company&apos;s transfer restrictions and any right of first refusal.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs sm:text-sm text-muted-foreground leading-relaxed mt-2">
              <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <span>
                Timing and structure of a liquidity event vary by company and are never guaranteed — this is a core part of the illiquidity risk described below.
              </span>
            </div>
          </section>

          {/* 9. Key Risks of Private Investing */}
          <section id="risks" className="scroll-mt-28 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Key Risks of Private Investing
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-foreground">Illiquidity</div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Private investments typically cannot be sold on a public market and may be held for many years before any exit.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-500">Loss of capital</div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Early-stage and private companies carry meaningfully higher failure rates than public equities.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-foreground">Limited information</div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Private companies are not subject to the same disclosure and reporting requirements as public companies.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-500">Dilution</div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Future funding rounds may reduce an investor&apos;s proportional ownership.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 space-y-1.5 sm:col-span-2">
                <div className="text-xs font-bold uppercase tracking-wider text-foreground">Valuation uncertainty</div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  There is no public market price, so valuations rely on periodic estimates.
                </p>
              </div>
            </div>
          </section>

          {/* 10. Our Due Diligence Approach */}
          <section id="diligence" className="scroll-mt-28 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Our Due Diligence Approach
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              Before an opportunity is presented to our investor network, our team reviews the company&apos;s financials, capitalization table, market position, and management team, and negotiates terms on behalf of the syndicate. Full diligence materials for a given opportunity — financial statements, cap table, term sheet, and related documents — are made available to verified investors within the deal room.
            </p>
          </section>
        </div>

        {/* CTA Banner */}
        <div className="rounded-2xl border border-border bg-muted/40 p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Explore Active SPV Opportunities
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Join accredited peers and review diligence materials for live allocations.
            </p>
          </div>
          <Link
            href="/#offerings"
            className="inline-flex h-11 px-6 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition shadow-xs whitespace-nowrap"
          >
            <span>Request Access</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Legal Disclaimer */}
        <div className="rounded-xl border border-border bg-card/40 p-5 text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground block mb-1">Disclaimer</strong>
          This page is provided for general educational purposes only and does not constitute legal, tax, or investment advice. Definitions of &ldquo;accredited investor&rdquo; and &ldquo;qualified purchaser&rdquo; are subject to change under applicable law; investors should confirm their status and consult their own legal and financial advisors. Nothing on this page is an offer to sell, or a solicitation of an offer to buy, any security.
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-background py-6 px-4 text-center text-xs text-muted-foreground">
        <p>&copy; 2026 Apex Krish Capital, a division of HS Corporation.</p>
      </footer>
    </div>
  );
}
