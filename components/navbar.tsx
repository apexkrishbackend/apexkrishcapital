'use client'

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { DropdownMenuAvatar } from "./avatarbutton";
import DarkModeToggle from "./dark-mode-toggle";
import { Menu, X, ArrowUpRight, Users, Building2, Sparkles } from "lucide-react";
import RequestAccessModal from "./RequestAccessModal";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, isSignedIn, user } = useUser();
  const { sessionClaims } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activePersona, setActivePersona] = useState<"investors" | "founders">("investors");
  const isAdmin = sessionClaims?.metadata?.role === "admin";

  // Scroll listener for adaptive elevation & contraction (Navbar defaults to Investors always)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    const handleModalClose = () => {
      setActivePersona("investors");
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("close-expandable-screen", handleModalClose);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("close-expandable-screen", handleModalClose);
    };
  }, [pathname]);

  const handleSelectInvestors = () => {
    setActivePersona("investors");
    setMobileMenuOpen(false);
    if (pathname !== "/") {
      router.push("/");
      setTimeout(() => {
        const el = document.getElementById("offerings");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      const el = document.getElementById("offerings");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectFounders = () => {
    setActivePersona("founders");
    setMobileMenuOpen(false);
    // Open the modal in-place with zero page jumping or background scrolling
    if (pathname !== "/") {
      router.push("/");
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("open-expandable-screen", {
            detail: { layoutId: "founder-raise-portal" },
          })
        );
      }, 300);
    } else {
      window.dispatchEvent(
        new CustomEvent("open-expandable-screen", {
          detail: { layoutId: "founder-raise-portal" },
        })
      );
    }
  };

  const handleOpenRequestAccess = () => {
    setMobileMenuOpen(false);
    window.dispatchEvent(
      new CustomEvent("open-expandable-screen", {
        detail: { layoutId: "request-access-portal" },
      })
    );
  };

  return (
    <>
      {/* Desktop & Tablet Floating Navbar with Scroll-Adaptive Elevation */}
      <header
        className={cn(
          "fixed left-0 right-0 z-50 flex justify-center px-4 md:px-6 pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isScrolled ? "top-2.5 md:top-3.5" : "top-6 md:top-8"
        )}
      >
        <div
          className={cn(
            "relative w-full flex items-center justify-center gap-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isScrolled ? "max-w-[1180px]" : "max-w-[1300px]"
          )}
        >
          {/* Scroll-Adaptive Liquid Glass Shell */}
          <div
            className={cn(
              "pointer-events-auto relative overflow-hidden flex w-full items-center justify-between rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isScrolled
                ? "py-1.5 px-4 md:px-5 border border-black/[0.12] dark:border-white/[0.18] bg-white/90 dark:bg-[#0c0c0e]/90 shadow-[0_20px_50px_rgba(0,0,0,0.14),0_4px_12px_rgba(0,0,0,0.06),inset_0_1px_1.5px_0_rgba(255,255,255,0.9),inset_0_-1px_1px_0_rgba(255,255,255,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7),0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_1.5px_0_rgba(255,255,255,0.25),inset_0_-1px_1px_0_rgba(255,255,255,0.05)] backdrop-blur-3xl backdrop-saturate-200 backdrop-brightness-105"
                : "py-2.5 px-6 border border-black/[0.04] dark:border-white/[0.06] bg-white/20 dark:bg-white/[0.03] shadow-[0_8px_24px_rgba(0,0,0,0.03),inset_0_1px_1px_0_rgba(255,255,255,0.4)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.3),inset_0_1px_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl backdrop-saturate-150"
            )}
          >
            {/* Top Specular Rim Reflection */}
            <div
              className={cn(
                "pointer-events-none absolute inset-x-12 top-0 h-[1px] bg-gradient-to-r from-transparent to-transparent transition-all duration-300",
                isScrolled
                  ? "via-white/90 dark:via-white/40 opacity-100"
                  : "via-white/40 dark:via-white/15 opacity-70"
              )}
            />
            {/* Bottom Subtle Refraction Highlight */}
            <div
              className={cn(
                "pointer-events-none absolute inset-x-20 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 dark:via-white/[0.05] to-transparent transition-opacity duration-300",
                isScrolled ? "opacity-100" : "opacity-30"
              )}
            />

            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2.5 relative z-10">
              <Link
                href="/"
                className="flex items-center gap-2.5 transition-transform active:scale-[0.98]"
                aria-label="Apex Krish Capital Home"
              >
                <div
                  className={cn(
                    "relative overflow-hidden rounded-full transition-all duration-300",
                    isScrolled ? "size-8" : "size-9"
                  )}
                >
                  <Image
                    src="/apexkrishnalogo.png"
                    alt="Apex Krish Capital"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <span
                  className={cn(
                    "font-bold tracking-tight text-foreground transition-all duration-300",
                    isScrolled ? "text-[16px]" : "text-[17.5px]"
                  )}
                >
                  ApexKrish Capital
                </span>
              </Link>
            </div>

            {/* Center Navigation Links & DUAL-PERSONA MICRO-TOGGLE */}
            <div className="hidden md:flex items-center gap-2 lg:gap-2.5 relative z-10">
              <Link
                href="/investor-education"
                className={cn(
                  "px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 whitespace-nowrap",
                  pathname === "/investor-education"
                    ? "bg-foreground/10 text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                )}
              >
                Investor Education
              </Link>

              {/* DUAL-PERSONA MICRO-TOGGLE (INVESTORS vs FOUNDERS) */}
              <div className="relative flex items-center p-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.1] text-[13.5px] font-medium backdrop-blur-md">
                {/* Sliding Spring Capsule for Persona */}
                <div
                  className={cn(
                    "absolute top-1 bottom-1 rounded-full bg-white dark:bg-white/[0.16] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    activePersona === "investors" && !pathname?.startsWith("/admin") && pathname !== "/investor-education" && pathname !== "/aboutus"
                      ? "left-1 w-[105px] opacity-100"
                      : activePersona === "founders" && !pathname?.startsWith("/admin") && pathname !== "/investor-education" && pathname !== "/aboutus"
                      ? "left-[110px] w-[108px] opacity-100"
                      : "opacity-0 pointer-events-none"
                  )}
                />

                <button
                  type="button"
                  onClick={handleSelectInvestors}
                  className={cn(
                    "relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-colors duration-200 cursor-pointer whitespace-nowrap",
                    activePersona === "investors" && !pathname?.startsWith("/admin") && pathname !== "/investor-education" && pathname !== "/aboutus"
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Users className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Investors</span>
                </button>

                <button
                  type="button"
                  onClick={handleSelectFounders}
                  className={cn(
                    "relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-colors duration-200 cursor-pointer whitespace-nowrap",
                    activePersona === "founders" && !pathname?.startsWith("/admin") && pathname !== "/investor-education" && pathname !== "/aboutus"
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Building2 className="size-3.5 text-primary" />
                  <span>Founders</span>
                </button>
              </div>

              {/* About Us Link (Right side of center two buttons) */}
              <Link
                href="/aboutus"
                className={cn(
                  "px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 whitespace-nowrap",
                  pathname === "/aboutus"
                    ? "bg-foreground/10 text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                )}
              >
                About Us
              </Link>

              {/* Admin Link (No Icon) */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-[12px] font-semibold uppercase tracking-wider transition-all whitespace-nowrap",
                    pathname?.startsWith("/admin")
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                  )}
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Auth & Dark Mode Toggle */}
            <div className="flex items-center gap-2.5 md:gap-3 relative z-10">
              {isLoaded ? (
                isSignedIn ? (
                  <div className="flex items-center">
                    <DropdownMenuAvatar img_url={user?.imageUrl} />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/sign-in"
                      className="flex h-9 items-center justify-center rounded-full bg-foreground text-background px-4 text-[13px] font-medium transition-all shadow-[0_2px_12px_rgba(0,0,0,0.12)] hover:bg-foreground/90 active:scale-[0.98] whitespace-nowrap"
                    >
                      Log in
                    </Link>
                  </div>
                )
              ) : (
                <div className="w-9 h-9 rounded-full bg-muted/60 animate-pulse" />
              )}
              <DarkModeToggle />

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex md:hidden h-9 w-9 items-center justify-center rounded-full border border-black/[0.06] dark:border-white/10 bg-white/40 dark:bg-white/[0.06] text-foreground hover:bg-white/60 dark:hover:bg-white/10 transition active:scale-95 shadow-xs cursor-pointer"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Standalone "Request Access" Pill Button (Outside Right of the Navbar) */}
          <button
            type="button"
            onClick={handleOpenRequestAccess}
            className={cn(
              "pointer-events-auto hidden md:inline-flex items-center gap-1.5 rounded-full font-semibold transition-all duration-300 active:scale-95 cursor-pointer shrink-0 shadow-[0_4px_16px_rgba(5,150,105,0.3)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.45)] whitespace-nowrap bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/30",
              isScrolled
                ? "py-2 px-4 text-[12.5px]"
                : "py-2.5 px-5 text-[13px]"
            )}
          >
            <Sparkles className="size-3.5 text-emerald-200 animate-pulse" />
            <span>Request Access</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-4 top-20 z-50 md:hidden animate-in fade-in duration-150">
          <div className="relative overflow-hidden rounded-[24px] border border-black/[0.08] dark:border-white/[0.14] bg-white/95 dark:bg-[#0c0c0e]/95 text-foreground p-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-3xl backdrop-saturate-200 space-y-4">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/30 to-transparent" />
            
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Select Persona Portal
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                ApexKrish Capital
              </span>
            </div>

            {/* Mobile Dual Persona Switch */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-muted/50 border border-border">
              <button
                type="button"
                onClick={handleSelectInvestors}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer",
                  activePersona === "investors"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Users className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>For Investors</span>
              </button>

              <button
                type="button"
                onClick={handleSelectFounders}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer",
                  activePersona === "founders"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Building2 className="size-4" />
                <span>For Founders</span>
              </button>
            </div>

            {/* Request Access Mobile Button */}
            <button
              type="button"
              onClick={handleOpenRequestAccess}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Sparkles className="size-3.5 text-emerald-200" />
              <span>Request Allocation Access</span>
            </button>

            {/* Nav Links */}
            <div className="flex flex-col gap-1 pt-1">
              <Link
                href="/investor-education"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-[15px] font-medium text-foreground hover:text-primary transition-colors"
              >
                <span>Investor Education</span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                href="/aboutus"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-[15px] font-medium text-foreground hover:text-primary transition-colors"
              >
                <span>About Us</span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-[15px] font-medium text-primary hover:underline transition-colors"
                >
                  <span>Admin Deal Management</span>
                  <ArrowUpRight className="w-4 h-4 text-primary" />
                </Link>
              )}
            </div>

            <div className="my-1 h-[0.5px] w-full bg-border/40" />

            {/* Auth Actions */}
            {isLoaded && isSignedIn ? (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-[15px] font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>My Profile</span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 pt-1">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-foreground text-[14px] font-medium text-background shadow-xs hover:bg-foreground/90"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mount Request Access Expandable Screen Modal */}
      <RequestAccessModal />
    </>
  );
}

