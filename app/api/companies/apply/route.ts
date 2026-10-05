import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import CompanyApplication from "@/models/company-application.model";
import { companyApplicationSchema } from "@/lib/validations/schemas";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendCompanyApplicationNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting (5 requests per hour)
    const clientIp = getClientIp(req);
    const limiter = rateLimit(`company_apply_${clientIp}`, {
      limit: 5,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!limiter.success) {
      return NextResponse.json(
        {
          error: `Too many submissions from this IP address. Please try again in ${limiter.reset} seconds.`,
        },
        { status: 429 }
      );
    }

    // 2. Body parsing and Zod validation
    const rawBody = await req.json();
    const validation = companyApplicationSchema.safeParse(rawBody);

    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || "Invalid application payload.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const {
      companyName,
      founderName,
      workEmail,
      phoneNumber,
      websiteUrl,
      pitchDeckUrl,
      stage,
      targetRaiseAmount,
      currentArr,
      sector,
      summary,
    } = validation.data;

    await dbConnect();

    const application = await CompanyApplication.create({
      companyName,
      founderName,
      workEmail,
      phoneNumber: phoneNumber || undefined,
      websiteUrl: websiteUrl || undefined,
      pitchDeckUrl: pitchDeckUrl || undefined,
      stage,
      targetRaiseAmount,
      currentArr: currentArr || undefined,
      sector,
      summary,
      status: "pending_review",
    });

    // Send email notification to admins
    try {
      await sendCompanyApplicationNotification(application);
    } catch (emailErr) {
      console.error("Failed to send company application email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully. Our investment committee will review your materials.",
      applicationId: application._id,
    });
  } catch (error) {
    console.error("Error submitting company application:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit company application." },
      { status: 500 }
    );
  }
}
