import { NextResponse } from "next/server";
import { getLiveOfferings } from "@/lib/offerings-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { activeOfferings, pastOfferings, allOfferings } = await getLiveOfferings();

    return NextResponse.json({
      success: true,
      activeOfferings,
      pastOfferings,
      allOfferings,
    });
  } catch (error: any) {
    console.error("Failed to fetch offerings:", error);
    return NextResponse.json(
      { error: "Failed to fetch offerings", message: error.message },
      { status: 500 }
    );
  }
}
