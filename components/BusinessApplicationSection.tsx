"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ExpandableScreen,
  ExpandableScreenTrigger,
  ExpandableScreenContent,
} from "@/components/ui/expandable-screen";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  FileCheck2,
  CheckCircle2,
  Loader2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  "Seed",
  "Series A",
  "Series B",
  "Series C+",
  "Pre-IPO",
  "Profitable Bootstrapped",
];

const SECTORS = [
  "AI & Machine Learning",
  "Autonomous Agents & Robotics",
  "Enterprise Infrastructure",
  "Defense & Aerospace",
  "Fintech & Crypto",
  "Frontier Tech & Bio",
];

export default function BusinessApplicationSection() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    companyName: "",
    founderName: "",
    workEmail: "",
    phoneNumber: "",
    websiteUrl: "",
    pitchDeckUrl: "",
    stage: "Series A",
    targetRaiseAmount: "$1,000,000 - $3,000,000",
    currentArr: "$1M - $5M ARR",
    sector: "AI & Machine Learning",
    summary: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.companyName.trim() || !formData.founderName.trim() || !formData.workEmail.trim() || !formData.summary.trim()) {
      setFormError("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/companies/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to submit application.");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setFormData({
      companyName: "",
      founderName: "",
      workEmail: "",
      phoneNumber: "",
      websiteUrl: "",
      pitchDeckUrl: "",
      stage: "Series A",
      targetRaiseAmount: "$1,000,000 - $3,000,000",
      currentArr: "$1M - $5M ARR",
      sector: "AI & Machine Learning",
      summary: "",
    });
  };

  return (
    <section id="raise-capital" className="scroll-mt-24 pt-4 pb-2">
      <ExpandableScreen layoutId="founder-raise-portal">
        {/* TRIGGER CARD ON MAIN PAGE */}
        <ExpandableScreenTrigger className="group">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-card via-card/95 to-card/60 p-7 sm:p-10 shadow-lg hover:border-primary/50 transition-all duration-300">
            {/* Ambient specular highlight */}
            <div className="pointer-events-none absolute inset-x-12 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-3.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider shadow-xs">
                  <Building2 className="size-3.5 text-blue-600 dark:text-blue-400" />
                  For Founders &amp; Companies
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                  Raising Growth Capital For Your Company?
                </h2>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  We syndicate <strong className="text-foreground font-semibold">$200K and above</strong> co-investment SPVs into top-tier tech startups alongside leading venture firms. Minimal founder costs and single cap table entry execution.
                </p>

                {/* Quick tags */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-xs font-medium text-foreground">
                    <Zap className="size-3 text-emerald-500" /> 30-Day SPV Close
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-xs font-medium text-foreground">
                    <FileCheck2 className="size-3 text-primary" /> Single Cap Table Entry
                  </span>
                </div>
              </div>

              {/* Call to action button inside card */}
              <div className="shrink-0">
                <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-foreground text-background font-semibold text-sm shadow-md group-hover:bg-foreground/90 transition-all group-hover:scale-[1.02]">
                  <span>Apply for Syndicate Funding</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </ExpandableScreenTrigger>

        {/* EXPANDED FULL-SCREEN APPLICATION PORTAL */}
        <ExpandableScreenContent>
          <div className="mx-auto w-full max-w-6xl py-6 md:py-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
              <div className="flex items-center gap-3.5">
                <Image
                  src="/apexkrishnalogo.png"
                  alt="Apex Krish Capital"
                  width={46}
                  height={46}
                  className="rounded-full object-contain"
                />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Syndicate Capital Application
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Direct SPV allocation pipeline for high-growth tech companies.
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold self-start sm:self-auto">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Applications Active for Q3 / Q4 SPVs
              </div>
            </div>

            {isSubmitted ? (
              /* Success Confirmation View */
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 sm:p-12 text-center space-y-5 max-w-2xl mx-auto my-12 animate-in fade-in zoom-in-95 duration-300">
                <div className="size-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">
                    Application Submitted Successfully!
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Thank you for submitting <strong className="text-foreground">{formData.companyName}</strong>. Our investment committee reviews submissions on a rolling basis. A general partner will reach out to <strong className="text-foreground">{formData.workEmail}</strong> within 3 business days.
                  </p>
                </div>

                <div className="pt-3">
                  <Button
                    type="button"
                    onClick={handleResetForm}
                    variant="outline"
                    className="rounded-xl text-sm font-semibold h-11 px-6"
                  >
                    Submit Another Application
                  </Button>
                </div>
              </div>
            ) : (
              /* 2-Column Application Layout */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Left Column: Syndicate Advantage */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Why Syndicate With Us
                    </span>
                    <h3 className="text-xl font-bold text-foreground">
                      The Apex Krish Syndicate Advantage
                    </h3>
                    <ul className="space-y-3.5 text-xs sm:text-sm text-muted-foreground">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong className="text-foreground">Minimal Founder Cost:</strong> Streamlined SPV structuring with minimal expenses and straightforward execution.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong className="text-foreground">Single cap table entry:</strong> All syndicate investors roll into a single Delaware SPV entity.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong className="text-foreground">High-Signal LPs:</strong> Our syndicate includes seasoned operators, AI researchers, and family offices.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong className="text-foreground">Speed &amp; Certainty:</strong> Rapid due diligence and standard Carta / AngelList closing rails.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-border/80 bg-muted/30 p-5 space-y-2">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="size-4 text-primary" /> Confidentiality Guarantee
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      All submitted materials, pitch decks, and financial metrics are strictly confidential and shared only with accredited syndicate members under NDA.
                    </p>
                  </div>
                </div>

                {/* Right Column: Application Form */}
                <div className="lg:col-span-8">
                  <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
                    {formError && (
                      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs sm:text-sm text-destructive font-medium">
                        {formError}
                      </div>
                    )}

                    <div className="space-y-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Company &amp; Founder Information
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Company Name <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Synthetix AI"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Website URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://synthetix.ai"
                            value={formData.websiteUrl}
                            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Founder / Contact Name <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sarah Jenkins"
                            value={formData.founderName}
                            onChange={(e) => setFormData({ ...formData, founderName: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Work Email <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="sarah@synthetix.ai"
                            value={formData.workEmail}
                            onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Phone / WhatsApp
                          </label>
                          <input
                            type="tel"
                            placeholder="+1 (555) 019-2834"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2 border-t border-border">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Round Details &amp; Metrics
                      </span>

                      {/* Stage Selector */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">
                          Current Round Stage
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {STAGES.map((stg) => (
                            <button
                              key={stg}
                              type="button"
                              onClick={() => setFormData({ ...formData, stage: stg })}
                              className={cn(
                                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border",
                                formData.stage === stg
                                  ? "bg-foreground text-background border-foreground shadow-xs"
                                  : "bg-muted/50 text-muted-foreground border-border hover:text-foreground"
                              )}
                            >
                              {stg}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Target Syndicate Allocation ($) <span className="text-destructive">*</span>
                          </label>
                          <Select
                            value={formData.targetRaiseAmount}
                            onValueChange={(val) => setFormData({ ...formData, targetRaiseAmount: val })}
                          >
                            <SelectTrigger className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm h-11 focus:border-primary focus:outline-none">
                              <SelectValue placeholder="Select target allocation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="$200,000 - $500,000">$200K – $500K</SelectItem>
                              <SelectItem value="$500,000 - $1,000,000">$500K – $1.0M</SelectItem>
                              <SelectItem value="$1,000,000 - $3,000,000">$1.0M – $3.0M</SelectItem>
                              <SelectItem value="$3,000,000 - $5,000,000">$3.0M – $5.0M</SelectItem>
                              <SelectItem value="$5,000,000+">$5.0M+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Current Revenue / ARR
                          </label>
                          <Select
                            value={formData.currentArr}
                            onValueChange={(val) => setFormData({ ...formData, currentArr: val })}
                          >
                            <SelectTrigger className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm h-11 focus:border-primary focus:outline-none">
                              <SelectValue placeholder="Select revenue / ARR" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pre-Revenue / In Beta">Pre-Revenue / In Beta</SelectItem>
                              <SelectItem value="< $500K ARR">&lt; $500K ARR</SelectItem>
                              <SelectItem value="$500K - $1M ARR">$500K – $1M ARR</SelectItem>
                              <SelectItem value="$1M - $5M ARR">$1M – $5M ARR</SelectItem>
                              <SelectItem value="$5M - $10M ARR">$5M – $10M ARR</SelectItem>
                              <SelectItem value="$10M+ ARR">$10M+ ARR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Primary Sector */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Primary Sector
                        </label>
                        <Select
                          value={formData.sector}
                          onValueChange={(val) => setFormData({ ...formData, sector: val })}
                        >
                          <SelectTrigger className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm h-11 focus:border-primary focus:outline-none">
                            <SelectValue placeholder="Select primary sector" />
                          </SelectTrigger>
                          <SelectContent>
                            {SECTORS.map((sec) => (
                              <SelectItem key={sec} value={sec}>
                                {sec}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Pitch Deck URL */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Pitch Deck / Data Room URL (DocSend, Drive, Dropbox)
                        </label>
                        <input
                          type="url"
                          placeholder="https://docsend.com/view/..."
                          value={formData.pitchDeckUrl}
                          onChange={(e) => setFormData({ ...formData, pitchDeckUrl: e.target.value })}
                          className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        />
                      </div>

                      {/* Executive Summary */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Executive Summary &amp; Competitive Moat <span className="text-destructive">*</span>
                        </label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Briefly describe what your company does, your key traction metrics, and why this round is compelling..."
                          value={formData.summary}
                          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                          className="w-full rounded-xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-2xl px-7 py-3 text-sm font-semibold h-12 bg-foreground text-background hover:bg-foreground/90 gap-2 cursor-pointer shadow-md"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="size-4 animate-spin" /> Submitting Application...
                          </>
                        ) : (
                          <>
                            <span>Submit Application for Review</span>
                            <ArrowRight className="size-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </ExpandableScreenContent>
      </ExpandableScreen>
    </section>
  );
}
