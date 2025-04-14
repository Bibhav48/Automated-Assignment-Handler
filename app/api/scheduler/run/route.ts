import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { scheduler } from "@/lib/scheduler"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create a scheduled run record
    const scheduledRun = await prisma.scheduledRun.create({
      data: {
        status: "running",
        startTime: new Date(),
      },
    })

    // Run the assignment completion process
    const result = await scheduler.runAssignmentCompletion()

    // Update the scheduled run record
    await prisma.scheduledRun.update({
      where: { id: scheduledRun.id },
      data: {
        status: result.success ? "completed" : "failed",
        endTime: new Date(),
        results: result,
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Scheduler run error:", error)
    return NextResponse.json({ error: "Failed to run scheduler" }, { status: 500 })
  }
}
