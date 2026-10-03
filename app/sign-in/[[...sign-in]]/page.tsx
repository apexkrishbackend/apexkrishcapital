import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { neobrutalism } from "@clerk/ui/themes";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const customLocalization = {
  signIn: {
    start: {
      title: "Continue to ApexKrish Capital",
      titleCombined: "Continue to ApexKrish Capital",
      subtitle: "to continue to ApexKrish Capital",
      subtitleCombined: "to continue to ApexKrish Capital",
      actionText: "Don’t have an account?",
      actionLink: "Sign up",
    },
    password: {
      title: "Continue to ApexKrish Capital",
      subtitle: "to continue to ApexKrish Capital",
    },
    emailLink: {
      subtitle: "to continue to ApexKrish Capital",
    },
    emailCode: {
      subtitle: "to continue to ApexKrish Capital",
    },
    phoneCode: {
      subtitle: "to continue to ApexKrish Capital",
    },
  },
  signUp: {
    start: {
      title: "Create your account",
      titleCombined: "Create your account",
      subtitle: "to continue to ApexKrish Capital",
      subtitleCombined: "to continue to ApexKrish Capital",
    },
  },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-[110px] md:pt-[150px] pb-16 px-4 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Apex Krish Capital</span>
        </Link>

        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 shadow-xs backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-mono font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Accredited Investor Portal
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground leading-[1.1]">
              Access Your Investment Portal
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed max-w-md">
              Sign in to access your direct SPV subscriptions, quarterly portfolio
              marks, capital calls, and confidential frontier tech diligence memoranda.
            </p>

            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                <span>256-bit Encrypted Private Market Access</span>
              </div>
            </div>
          </section>

          <div className="flex justify-center lg:justify-end">
            <div className="rounded-[28px] border border-border bg-card text-card-foreground p-3 shadow-sm backdrop-blur-xl">
          <SignIn
            localization={customLocalization}
            appearance={{
              theme: neobrutalism,

              elements: {
                socialButtonsBlockButton: {
                  backgroundColor: "#6B6685",
                  color: "#FFFFFF",

                  "&:hover": {
                    backgroundColor: "#5F5A78",
                    color: "#FFFFFF",
                  },

                  "&:focus": {
                    backgroundColor: "#6B6685",
                    color: "#FFFFFF",
                  },

                  "&:active": {
                    backgroundColor: "#55516C",
                    color: "#FFFFFF",
                  },
                },

                socialButtonsBlockButtonText: {
                  color: "#FFFFFF",

                  "&:hover": {
                    color: "#FFFFFF",
                  },
                },
              },
            }}
          />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
