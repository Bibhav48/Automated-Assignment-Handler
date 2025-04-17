import { NextResponse } from "next/server";
import { processAssignments } from "@/app/actions/process-assignments";

// This route is meant to be called by a cron job service like Vercel Cron
export async function GET() {
  try {
    // Check if it's around 8 PM (with some flexibility)
    const now = new Date();
    const hour = now.getHours();

    // Only run if it's between 7:55 PM and 8:05 PM
    if (hour !== 20) {
      return NextResponse.json({
        message: "Not scheduled time. This job runs at 8 PM.",
      });
    }

    // Run the assignment completion process
    const result = await processAssignments();

    return NextResponse.json({
      success: true,
      message: "Scheduled job completed successfully",
      result,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to run scheduled job" },
      { status: 500 }
    );
  }
}
