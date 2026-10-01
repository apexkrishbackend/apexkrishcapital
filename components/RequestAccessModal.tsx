"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import {
  ExpandableScreen,
  ExpandableScreenContent,
} from "@/components/ui/expandable-screen";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Send,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OfferingSimple {
  offeringId: string;
  name: string;
  status: string;
}

const FALLBACK_ACTIVE_OFFERINGS: OfferingSimple[] = [
  { offeringId: "micro1-inc", name: "Micro1 Inc.", status: "active" },
  { offeringId: "cursor-anysphere", name: "Cursor (Anysphere)", status: "active" },
];

export default function RequestAccessModal() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [offerings, setOfferings] = useState<OfferingSimple[]>(FALLBACK_ACTIVE_OFFERINGS);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(false);

  // Unauthenticated user input fields
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  // Request status tracking per offering
  const [requestingOfferingId, setRequestingOfferingId] = useState<string | null>(null);
  const [requestedOfferings, setRequestedOfferings] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchOfferings() {
      try {
        setIsLoadingOfferings(true);
        const res = await fetch("/api/offerings");
        if (res.ok) {
          const data = await res.json();
          if (data.activeOfferings && Array.isArray(data.activeOfferings) && isMounted) {
            const activeOnly = data.activeOfferings
              .filter((o: any) => o.status === "active")
              .map((o: any) => ({
                offeringId: o.offeringId,
                name: o.name,
                status: o.status,
              }));
            if (activeOnly.length > 0) {
              setOfferings(activeOnly);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load offerings in RequestAccessModal:", err);
      } finally {
        if (isMounted) setIsLoadingOfferings(false);
      }
    }

    fetchOfferings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRequestAccess = async (offering: OfferingSimple) => {
    setInputError(null);
    setSuccessMessage(null);

    // If not signed in, ensure guest email is provided
    let emailToSend = guestEmail.trim();
    let nameToSend = guestName.trim();

    if (isSignedIn && user) {
      emailToSend =
        user.primaryEmailAddress?.emailAddress ||
        user.emailAddresses?.[0]?.emailAddress ||
        "";
      nameToSend = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "";
    }

    if (!emailToSend || !emailToSend.includes("@")) {
      setInputError("Please enter a valid email address to request access.");
      return;
    }

    try {
      setRequestingOfferingId(offering.offeringId);

      const res = await fetch("/api/offerings/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offeringId: offering.offeringId,
          offeringName: offering.name,
          userEmail: emailToSend,
          userName: nameToSend,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit access request.");
      }

      setRequestedOfferings((prev) => new Set(prev).add(offering.offeringId));
      setSuccessMessage(`Access request for ${offering.name} sent to administrators!`);
    } catch (err: any) {
      setInputError(err.message || "An error occurred while submitting your request.");
    } finally {
      setRequestingOfferingId(null);
    }
  };

  return (
    <ExpandableScreen layoutId="request-access-portal">
      <ExpandableScreenContent className="max-w-3xl">
        <div className="mx-auto w-full py-4 sm:py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div className="flex items-center gap-3.5">
              <div className="relative size-11 overflow-hidden rounded-full border border-border">
                <Image
                  src="/apexkrishnalogo.png"
                  alt="Apex Krish Capital"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Request Allocation Access
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Select an active offering below to request allocation materials and access.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold self-start sm:self-auto">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Allocations
            </div>
          </div>

          {/* User Identity / Guest Input */}
          {isLoaded && !isSignedIn && (
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Lock className="size-3.5 text-primary" />
                <span>Your Contact Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <input
                  type="email"
                  required
                  placeholder="Your Email Address *"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2 px-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {isLoaded && isSignedIn && (
            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
              <span>
                Requesting as:{" "}
                <strong className="text-foreground">
                  {user?.fullName || user?.primaryEmailAddress?.emailAddress}
                </strong>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="size-3.5" /> Authenticated
              </span>
            </div>
          )}

          {/* Error & Success Messages */}
          {inputError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs sm:text-sm text-destructive font-medium">
              {inputError}
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Active Allocations List (Strict: ONLY the Name of each offering) */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Current &amp; Active Offerings
            </span>

            {isLoadingOfferings ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>Loading active offerings...</span>
              </div>
            ) : offerings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No active offerings available at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {offerings.map((offering) => {
                  const isRequested = requestedOfferings.has(offering.offeringId);
                  const isProcessing = requestingOfferingId === offering.offeringId;

                  return (
                    <div
                      key={offering.offeringId}
                      onClick={() => !isProcessing && !isRequested && handleRequestAccess(offering)}
                      className={cn(
                        "group flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-200 select-none",
                        isRequested
                          ? "border-emerald-500/40 bg-emerald-500/5 cursor-default"
                          : "border-border bg-card hover:border-primary/50 hover:bg-muted/30 cursor-pointer shadow-xs"
                      )}
                    >
                      {/* STRICT REQUIREMENT: Only the Name of the offering */}
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                          <Building className="size-4.5" />
                        </div>
                        <span className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {offering.name}
                        </span>
                      </div>

                      {/* Request Action Button / Status */}
                      <div>
                        {isRequested ? (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                            <CheckCircle2 className="size-3.5" />
                            <span>Requested</span>
                          </span>
                        ) : isProcessing ? (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-foreground/10 text-foreground text-xs font-semibold">
                            <Loader2 className="size-3.5 animate-spin" />
                            <span>Sending...</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-foreground text-background text-xs sm:text-sm font-semibold shadow-xs group-hover:bg-primary group-hover:text-primary-foreground transition-all active:scale-95 cursor-pointer"
                          >
                            <span>Request Access</span>
                            <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              Direct notification to ApexKrish Capital Partners
            </span>
            <span>Accredited Investors Only</span>
          </div>
        </div>
      </ExpandableScreenContent>
    </ExpandableScreen>
  );
}
