import { z } from "zod";

/**
 * Clean & sanitize text strings (strip potential HTML/script tags)
 */
export const cleanText = (val: string) => (typeof val === "string" ? val.replace(/<[^>]*>?/gm, "").trim() : "");

/**
 * Helper to build a sanitized string schema with length constraints
 */
export function sanitizeString(options: { min?: number; max?: number; requiredError?: string; minError?: string }) {
  let schema = z.string();
  const minVal = options.min !== undefined ? options.min : (options.requiredError ? 1 : 0);
  if (minVal > 0) {
    schema = schema.min(minVal, options.minError || options.requiredError || `Must be at least ${minVal} characters`);
  }
  if (options.max !== undefined) {
    schema = schema.max(options.max, `Must be under ${options.max} characters`);
  }
  return schema.transform(cleanText);
}

/**
 * Founder / Company Application Validation Schema
 */
export const companyApplicationSchema = z.object({
  companyName: sanitizeString({ min: 1, max: 150, requiredError: "Company Name is required" }),
  founderName: sanitizeString({ min: 1, max: 150, requiredError: "Founder Name is required" }),
  workEmail: z.string().trim().email("Invalid email address").max(254).toLowerCase(),
  phoneNumber: z
    .string()
    .trim()
    .max(50)
    .optional()
    .nullable()
    .transform((v) => (v ? cleanText(v) : v)),
  websiteUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .refine((val) => !val || /^https?:\/\//i.test(val), {
      message: "Website URL must begin with http:// or https://",
    }),
  pitchDeckUrl: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .nullable()
    .refine((val) => !val || /^https?:\/\//i.test(val), {
      message: "Pitch deck link must begin with http:// or https://",
    }),
  stage: z.string().trim().max(50).default("Series A").transform(cleanText),
  targetRaiseAmount: sanitizeString({ min: 1, max: 100, requiredError: "Target Raise is required" }),
  currentArr: z
    .string()
    .trim()
    .max(100)
    .optional()
    .nullable()
    .transform((v) => (v ? cleanText(v) : v)),
  sector: z.string().trim().max(100).default("AI & Machine Learning").transform(cleanText),
  summary: sanitizeString({ min: 10, max: 3000, requiredError: "Summary is required", minError: "Summary must be at least 10 characters" }),
});

/**
 * Commitment & Interest Validation Schema
 */
export const commitmentSchema = z.object({
  offeringId: sanitizeString({ min: 1, max: 100, requiredError: "Offering ID is required" }),
  offeringTitle: sanitizeString({ min: 1, max: 200, requiredError: "Offering Title is required" }),
  type: z.enum(["interest", "commitment"] as const),
  amount: z
    .number()
    .positive("Commitment amount must be greater than zero")
    .max(100000000, "Commitment amount cannot exceed $100M")
    .optional()
    .nullable(),
  notes: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .nullable()
    .transform((v) => (v ? cleanText(v) : v)),
});

/**
 * Admin Broadcast Validation Schema
 */
export const broadcastSchema = z.object({
  offeringId: sanitizeString({ min: 1, max: 100, requiredError: "Offering ID is required" }),
  offeringTitle: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v ? cleanText(v) : v)),
  targetAudience: z.enum([
    "interests_only",
    "commitments_only",
    "all_interested",
    "all_deal_lps",
    "all_platform_investors",
    "all_verified",
  ] as const),
  verifiedOnly: z.boolean().default(false),
  thirdPartyUrl: z
    .string()
    .trim()
    .min(1, "Third-party closing portal URL is required")
    .max(1000)
    .refine((val) => /^https?:\/\//i.test(val), {
      message: "URL must begin with http:// or https://",
    }),
  subject: sanitizeString({ min: 1, max: 250, requiredError: "Subject is required" }),
  customMessage: z
    .string()
    .trim()
    .max(5000)
    .default("")
    .transform(cleanText),
  channel: z.enum(["email", "whatsapp", "both"] as const).optional(),
  sendEmail: z.boolean().optional().default(false),
  sendWhatsApp: z.boolean().optional().default(false),
});
