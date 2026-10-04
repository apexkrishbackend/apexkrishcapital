"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import {
  ExpandableScreen,
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
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Send,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type HoveredStatusInfo = {
  value: string;
  description: string;
  top: number;
  left: number;
  placement: "right" | "left" | "bottom";
};

const investorStatusDescriptions: Record<string, string> = {
  "Accredited investor(1M+)":
    "Net worth exceeding $1 million, either individually or jointly with a spouse, excluding the value of their primary residence.",
  "Qualified client(2M+)":
    "Net worth possessing a net worth exceeding $2.7 million, excluding the value of their primary residence.",
  "Qualified purchaser(5M+)":
    "Individuals with an excess of $5 million in investments, or entities with at least $25 million in investments.",
};

export default function RequestAccessModal() {
  const { isLoaded, isSignedIn, user } = useUser();

  // Form State matching the reference HTML structure
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [citizenship, setCitizenship] = useState<"US" | "Other">("US");
  const [investorStatus, setInvestorStatus] = useState<string>("Accredited investor(1M+)");
  const [contactPrefs, setContactPrefs] = useState<{
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
  }>({
    email: true,
    whatsapp: false,
    sms: false,
  });

  const [hoveredStatus, setHoveredStatus] = useState<HoveredStatusInfo | null>(null);
  const [mounted, setMounted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dismiss hovering tooltip on scroll or resize
  useEffect(() => {
    if (!hoveredStatus) return;
    const handleDismiss = () => setHoveredStatus(null);
    window.addEventListener("scroll", handleDismiss, true);
    window.addEventListener("resize", handleDismiss);
    return () => {
      window.removeEventListener("scroll", handleDismiss, true);
      window.removeEventListener("resize", handleDismiss);
    };
  }, [hoveredStatus]);

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      if (!fullName) {
        const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "";
        if (name) setFullName(name);
      }
      if (!email) {
        const userMail =
          user.primaryEmailAddress?.emailAddress ||
          user.emailAddresses?.[0]?.emailAddress ||
          "";
        if (userMail) setEmail(userMail);
      }
      if (!phone && user.phoneNumbers?.[0]?.phoneNumber) {
        setPhone(user.phoneNumbers[0].phoneNumber);
      }
    }
  }, [isLoaded, isSignedIn, user]);

  function handleOptionHover(val: string, element: HTMLElement) {
    const desc = investorStatusDescriptions[val];
    if (!desc) {
      setHoveredStatus(null);
      return;
    }

    const rect = element.getBoundingClientRect();
    const margin = 12;
    const dialogWidth = 320;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (viewportWidth >= 640) {
      const hasRoomOnLeft = rect.left - margin - dialogWidth >= 0;
      const left = hasRoomOnLeft
        ? rect.left - margin - dialogWidth
        : rect.right + margin;
      const centerY = rect.top + rect.height / 2;
      const top = Math.max(70, Math.min(viewportHeight - 70, centerY));

      setHoveredStatus({
        value: val,
        description: desc,
        top,
        left,
        placement: hasRoomOnLeft ? "left" : "right",
      });
    } else {
      const left = Math.max(margin, Math.min(rect.left, viewportWidth - dialogWidth - margin));
      const top = rect.bottom + margin;
      setHoveredStatus({
        value: val,
        description: desc,
        top,
        left,
        placement: "bottom",
      });
    }
  }

  const handleContactPrefToggle = (key: "email" | "whatsapp" | "sms") => {
    setContactPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    const selectedMethods: string[] = [];
    if (contactPrefs.email) selectedMethods.push("Email");
    if (contactPrefs.whatsapp) selectedMethods.push("WhatsApp");
    if (contactPrefs.sms) selectedMethods.push("SMS");

    if (selectedMethods.length === 0) {
      selectedMethods.push("Email");
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/offerings/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: trimmedName,
          email: trimmedEmail,
          phone: phone.trim() || undefined,
          citizenship: citizenship === "US" ? "United States" : "Other",
          investorStatus,
          contactPreferences: selectedMethods,
          offeringName: "Apex Krish Capital Deal Room",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to submit your request at this time.");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setErrorMessage(null);
    if (!isSignedIn) {
      setFullName("");
      setEmail("");
      setPhone("");
    }
    setCitizenship("US");
    setInvestorStatus("Accredited investor(1M+)");
    setContactPrefs({ email: true, whatsapp: false, sms: false });
  };

  return (
    <ExpandableScreen layoutId="request-access-portal">
      <ExpandableScreenContent className="max-w-4xl">
        <div className="mx-auto w-full py-4 sm:py-6 space-y-6">
          {/* Header - Clean heading without extra subtitle or top verification badge */}
          <div className="flex items-center gap-3.5 border-b border-border pb-4">
            <div className="relative size-10 overflow-hidden rounded-full border border-border shrink-0">
              <Image
                src="/apexkrishnalogo.png"
                alt="Apex Krish Capital"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Request Access
            </h1>
          </div>

          {isSubmitted ? (
            /* SUCCESS CONFIRMATION VIEW */
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 sm:p-12 text-center space-y-5 max-w-xl mx-auto my-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="size-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-xs">
                <CheckCircle2 className="size-9" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground tracking-tight">
                  Request Submitted Successfully!
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Thank you, <strong className="text-foreground">{fullName}</strong>. Your request to access Apex Krish Capital syndicate opportunities has been sent to our administrator team.
                </p>
                <p className="text-xs text-muted-foreground pt-1">
                  We will verify your accredited investor status and send access credentials to <strong className="text-foreground">{email}</strong>.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  type="button"
                  onClick={handleReset}
                  variant="outline"
                  className="rounded-xl text-xs font-semibold h-10 px-5"
                >
                  Submit Another Request
                </Button>
              </div>
            </div>
          ) : (
            /* MAIN FORM VIEW */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Left Column: Short, clean headings with brief 1-line descriptions */}
              <div className="lg:col-span-4 space-y-4">
                <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    How It Works
                  </span>

                  <div className="space-y-3.5 text-xs sm:text-sm">
                    <div className="flex gap-3 items-start">
                      <div className="flex size-6 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0 border border-blue-500/20 mt-0.5">
                        1
                      </div>
                      <div>
                        <strong className="text-foreground block font-semibold text-xs sm:text-sm">Request Access</strong>
                        <p className="text-muted-foreground text-[11.5px] leading-snug">
                          Submit contact details &amp; self-certify status.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="flex size-6 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0 border border-blue-500/20 mt-0.5">
                        2
                      </div>
                      <div>
                        <strong className="text-foreground block font-semibold text-xs sm:text-sm">Verification</strong>
                        <p className="text-muted-foreground text-[11.5px] leading-snug">
                          Fast review under SEC Rule 506(c).
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="flex size-6 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0 border border-blue-500/20 mt-0.5">
                        3
                      </div>
                      <div>
                        <strong className="text-foreground block font-semibold text-xs sm:text-sm">Review &amp; Commit</strong>
                        <p className="text-muted-foreground text-[11.5px] leading-snug">
                          Direct Delaware Series SPV allocation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 space-y-1 text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="size-3.5 text-emerald-500" /> Confidentiality Guaranteed
                  </span>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    All requests are strictly confidential and sent directly to syndicate administrators.
                  </p>
                </div>
              </div>

              {/* Right Column: Request Access Form with Investor Status Dropdown & Hover Explanation */}
              <div className="lg:col-span-8">
                <form
                  onSubmit={handleSubmit}
                  className="rounded-3xl border border-border bg-card p-5 sm:p-7 space-y-5 shadow-xs"
                >
                  {errorMessage && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs sm:text-sm text-destructive font-medium flex items-center gap-2">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {isLoaded && isSignedIn && (
                    <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-2 text-xs">
                      <span className="text-muted-foreground">
                        Logged in as:{" "}
                        <strong className="text-foreground font-semibold">
                          {user?.fullName || user?.primaryEmailAddress?.emailAddress}
                        </strong>
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <UserCheck className="size-3.5" /> Verified Session
                      </span>
                    </div>
                  )}

                  {/* Contact Inputs */}
                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground block">
                        Full Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alexander Hamilton"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground block">
                          Email Address <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. alexander@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground block">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. +1 (555) 019-2834"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Citizenship Radio */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <label className="text-xs font-semibold text-foreground block">
                      Citizenship
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={cn(
                          "flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs sm:text-sm font-medium transition-all select-none",
                          citizenship === "US"
                            ? "border-primary bg-primary/5 text-foreground font-semibold"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <input
                          type="radio"
                          name="citizenship"
                          value="US"
                          checked={citizenship === "US"}
                          onChange={() => setCitizenship("US")}
                          className="size-4 accent-primary"
                        />
                        <span>United States</span>
                      </label>

                      <label
                        className={cn(
                          "flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs sm:text-sm font-medium transition-all select-none",
                          citizenship === "Other"
                            ? "border-primary bg-primary/5 text-foreground font-semibold"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <input
                          type="radio"
                          name="citizenship"
                          value="Other"
                          checked={citizenship === "Other"}
                          onChange={() => setCitizenship("Other")}
                          className="size-4 accent-primary"
                        />
                        <span>Other (International)</span>
                      </label>
                    </div>
                  </div>

                  {/* Investor Status Dropdown matching Investor Profile with Hover Explanations */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <label className="text-xs font-semibold text-foreground block">
                      Investor Status <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={investorStatus}
                      onValueChange={(val) => {
                        setInvestorStatus(val);
                        setHoveredStatus(null);
                      }}
                      onOpenChange={(open) => {
                        if (!open) setHoveredStatus(null);
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm h-11 focus:border-primary focus:outline-none">
                        <SelectValue placeholder="Select investor status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="Not Accredited"
                          onPointerEnter={() => setHoveredStatus(null)}
                          onFocus={() => setHoveredStatus(null)}
                        >
                          Not Accredited
                        </SelectItem>
                        {Object.entries(investorStatusDescriptions).map(([val]) => (
                          <SelectItem
                            key={val}
                            value={val}
                            onPointerEnter={(e) => handleOptionHover(val, e.currentTarget)}
                            onPointerLeave={() => setHoveredStatus(null)}
                            onFocus={(e) => handleOptionHover(val, e.currentTarget)}
                            onBlur={() => setHoveredStatus(null)}
                          >
                            {val}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preferred Contact Method */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <label className="text-xs font-semibold text-foreground block">
                      Preferred contact method for new opportunity alerts
                    </label>
                    <div className="flex flex-wrap gap-4 pt-1 text-xs sm:text-sm">
                      <label className="flex items-center gap-2 cursor-pointer text-foreground select-none">
                        <input
                          type="checkbox"
                          checked={contactPrefs.email}
                          onChange={() => handleContactPrefToggle("email")}
                          className="size-4 rounded accent-primary cursor-pointer"
                        />
                        <span>Email</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-foreground select-none">
                        <input
                          type="checkbox"
                          checked={contactPrefs.whatsapp}
                          onChange={() => handleContactPrefToggle("whatsapp")}
                          className="size-4 rounded accent-primary cursor-pointer"
                        />
                        <span>WhatsApp</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-foreground select-none">
                        <input
                          type="checkbox"
                          checked={contactPrefs.sms}
                          onChange={() => handleContactPrefToggle("sms")}
                          className="size-4 rounded accent-primary cursor-pointer"
                        />
                        <span>SMS</span>
                      </label>
                    </div>
                  </div>

                  {/* Mandatory Securities Disclaimer Box */}
                  <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 text-[11.5px] leading-relaxed text-muted-foreground">
                    By submitting, you confirm you meet the definition of &quot;accredited investor&quot; or &quot;qualified purchaser,&quot; as applicable, under applicable securities law. This site does not constitute an offer to sell securities; opportunities are made available only to verified investors under applicable exemptions.
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-2xl px-7 py-3 text-sm font-semibold h-12 bg-blue-600 hover:bg-blue-500 text-white gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>Submitting Request...</span>
                        </>
                      ) : (
                        <>
                          <Send className="size-4" />
                          <span>Submit Request</span>
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

      {/* Floating Description Portal on Hover */}
      {mounted &&
        hoveredStatus &&
        createPortal(
          <div
            role="tooltip"
            aria-live="polite"
            className="pointer-events-none fixed z-[99999] w-72 sm:w-80 rounded-2xl border border-border/80 bg-popover/95 p-3.5 sm:p-4 text-popover-foreground shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150 ring-1 ring-border/20"
            style={{
              top: `${hoveredStatus.top}px`,
              left: `${hoveredStatus.left}px`,
              transform: hoveredStatus.placement !== "bottom" ? "translateY(-50%)" : "none",
            }}
          >
            <div className="text-xs font-semibold text-foreground mb-1">
              {hoveredStatus.value}
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
              {hoveredStatus.description}
            </p>
          </div>,
          document.body
        )}
    </ExpandableScreen>
  );
}
