import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { scheduler } from "@/lib/scheduler"

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Run the assignment completion process
    const result = await scheduler.runAssignmentCompletion()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Scheduler run error:", error)
    return NextResponse.json({ error: "Failed to run scheduler" }, { status: 500 })
  }
}
