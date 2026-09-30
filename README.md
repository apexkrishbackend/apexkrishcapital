# ApexKrish Capital — Private Market SPV Syndication Platform

**ApexKrish Capital** is a high-performance private market syndication platform connecting verified, accredited investors with direct Special Purpose Vehicle (SPV) allocations into high-conviction tier-one frontier technology companies (e.g., Micro1 Inc., Cursor/Anysphere, Scale AI, xAI, Neuralink).

---

## Key Features

- **Institutional SPV Engine**: Direct allocations with a 10% performance carry structure (half standard 20%+ carry) and discrete 2% minimum management fees.
- **Founder Fast-Track**: Single cap table entry, 30-day SPV close, and raises of $200K and above.
- **Dynamic Offerings & Deal Lifecycle**: Real-time MongoDB-backed offerings with full admin lifecycle support (Create, Close with month/year timestamping, and permanent cascade Delete).
- **Split Commitments Command Center**: Distinct management tables for **Active Deals Commitments** vs. **Closed Deals Archive**, with real-time status management and 1-click CSV exports.
- **Investor Portal & 506(c) Verification**: Accreditation capture, SEC definitions, phone number collection, and multi-tier anti-spam rate limiting.
- **Closing Portal Broadcast Engine**: Multi-channel distribution of tokenized subscription links via automated email and click-to-chat WhatsApp (`wa.me`) links.
- **Founder Applications Pipeline**: Inbound venture applications review portal with multi-dimensional filtering by Sector, Stage, Review Status, and Pitch Deck presence.

---

## Tech Stack

- **Framework**: Next.js 16+ (App Router, Turbopack)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS + Radix UI (Shadcn UI)
- **Auth & RBAC**: Clerk Auth (`role: "admin"`)
- **Database**: MongoDB Atlas + Mongoose ODM
- **Email Service**: Nodemailer (SMTP)

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file with:
```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# MongoDB
MONGODB_URI=mongodb+srv://...

# Nodemailer / SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM="ApexKrish Capital <noreply@apexkrish.com>"
PROFILE_NOTIFICATION_TO=admin@apexkrishcapital.com
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## Comprehensive Documentation

For complete architectural specifications, schema definitions, API routes, and security models, see [`DOCUMENTATION.md`](./DOCUMENTATION.md).
