import { NextRequest, NextResponse } from "next/server";
import { processEmailQueue } from "@/lib/email-notifications";

// This endpoint should be called by a cron job to process queued emails
// For MVP, can be called manually or set up with Vercel Cron, etc.
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication for cron job
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await processEmailQueue();

    return NextResponse.json({ 
      message: "Email queue processed successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error processing email queue:", error);
    return NextResponse.json(
      { error: "Failed to process email queue" },
      { status: 500 }
    );
  }
}

// GET endpoint for manual testing
export async function GET(request: NextRequest) {
  try {
    await processEmailQueue();

    return NextResponse.json({ 
      message: "Email queue processed successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error processing email queue:", error);
    return NextResponse.json(
      { error: "Failed to process email queue" },
      { status: 500 }
    );
  }
}
