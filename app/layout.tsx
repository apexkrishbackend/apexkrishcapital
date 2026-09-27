import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import AgentationProvider from "@/components/AgentationProvider";
import ThemeProvider from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { dark, neobrutalism, shadcn } from "@clerk/ui/themes";
import ScrollRestorationManager from "@/components/ScrollRestorationManager";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://apexkrishcapital.com"),
  title: {
    default: "Apex Krish Capital | Private Equity & Frontier Tech Syndicate",
    template: "%s | Apex Krish Capital",
  },
  description:
    "Apex Krish Capital is a private investment syndicate giving accredited investors curated access to vetted private equity and early-stage opportunities.",
  keywords: [
    "Apex Krish Capital",
    "Apex Krish",
    "Private Equity Syndicate",
    "Accredited Investor SPV",
    "AI Startup Investments",
    "Frontier Tech Venture Capital",
    "Pre-IPO Allocations",
    "Direct SPV Investments",
    "Qualified Purchaser Fund",
  ],
  authors: [{ name: "Apex Krish Capital", url: "https://apexkrishcapital.com" }],
  creator: "Apex Krish Capital",
  publisher: "Apex Krish Capital",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://apexkrishcapital.com",
    siteName: "Apex Krish Capital",
    title: "Apex Krish Capital | Private Equity & Frontier Tech Syndicate",
    description:
      "Curated access to vetted private equity and early-stage opportunities for accredited investors. 10% performance carry, zero management fees.",
    images: [
      {
        url: "/apexkrishnalogo.png",
        width: 1200,
        height: 630,
        alt: "Apex Krish Capital",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex Krish Capital | Private Equity Syndicate",
    description:
      "Curated access to vetted private equity and early-stage opportunities for accredited investors.",
    images: ["/apexkrishnalogo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        "font-sans"
      )}
    >
      <head>
        {/* Synchronous theme initialization script to prevent Flash of Incorrect Theme (FOIT) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = localStorage.getItem('theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = storedTheme === 'dark' || (storedTheme !== 'light' && supportDarkMode);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* JSON-LD Structured Data Schema for Google Knowledge Graph & Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["Organization", "FinancialService"],
              "name": "Apex Krish Capital",
              "url": "https://apexkrishcapital.com",
              "logo": "https://apexkrishcapital.com/apexkrishnalogo.png",
              "description": "Private investment syndicate giving accredited investors curated access to vetted private equity and early-stage opportunities.",
              "email": "syndicate@apexkrishcapital.com",
              "telephone": "+1-720-845-6839",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Denver",
                "addressRegion": "CO",
                "addressCountry": "US"
              },
              "sameAs": [
                "https://apexkrishcapital.com"
              ]
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <ScrollRestorationManager />
        <ThemeProvider>
          <ClerkProvider
            appearance={{
              theme: neobrutalism,
            }}>
            <Navbar />
            {children}
            <AgentationProvider />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
