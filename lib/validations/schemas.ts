import { z } from "zod";

/**
 * Clean & sanitize text strings (strip potential HTML/script injection)
 */
export const sanitizedString = (maxLen = 500) =>
  z
    .string()
    .trim()
    .max(maxLen, `Must be under ${maxLen} characters`)
    .transform((val) => val.replace(/<[^>]*>?/gm, "")); // strip HTML tags

/**
 * Founder / Company Application Validation Schema
 */
export const companyApplicationSchema = z.object({
  companyName: sanitizedString(150).min(1, "Company Name is required"),
  founderName: sanitizedString(150).min(1, "Founder Name is required"),
  workEmail: z.string().trim().email("Invalid email address").max(254).toLowerCase(),
  phoneNumber: sanitizedString(50).optional().nullable(),
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
  stage: sanitizedString(50).default("Series A"),
  targetRaiseAmount: sanitizedString(100).min(1, "Target Raise is required"),
  currentArr: sanitizedString(100).optional().nullable(),
  sector: sanitizedString(100).default("AI & Machine Learning"),
  summary: sanitizedString(3000).min(10, "Summary must be at least 10 characters"),
});

/**
 * Commitment & Interest Validation Schema
 */
export const commitmentSchema = z.object({
  offeringId: sanitizedString(100).min(1, "Offering ID is required"),
  offeringTitle: sanitizedString(200).min(1, "Offering Title is required"),
  type: z.enum(["interest", "commitment"]),
  amount: z
    .number()
    .positive("Commitment amount must be greater than zero")
    .max(100000000, "Commitment amount cannot exceed $100M")
    .optional()
    .nullable(),
  notes: sanitizedString(1000).optional().nullable(),
});

/**
 * Admin Broadcast Validation Schema
 */
export const broadcastSchema = z.object({
  offeringId: sanitizedString(100).min(1, "Offering ID is required"),
  offeringTitle: sanitizedString(200).optional(),
  targetAudience: z.enum([
    "interests_only",
    "commitments_only",
    "all_interested",
    "all_deal_lps",
    "all_platform_investors",
    "all_verified",
  ]),
  verifiedOnly: z.boolean().default(false),
  thirdPartyUrl: z
    .string()
    .trim()
    .min(1, "Third-party closing portal URL is required")
    .max(1000)
    .refine((val) => /^https?:\/\//i.test(val), {
      message: "URL must begin with http:// or https://",
    }),
  subject: sanitizedString(250).min(1, "Subject is required"),
  customMessage: sanitizedString(5000).optional().default(""),
  channel: z.enum(["email", "whatsapp", "both"]).optional(),
  sendEmail: z.boolean().optional().default(false),
  sendWhatsApp: z.boolean().optional().default(false),
});
