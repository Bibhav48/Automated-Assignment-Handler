import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { CanvasApiClient } from "@/lib/canvas-api"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.apiKey) {
      return NextResponse.json({ error: "Canvas API token not found" }, { status: 404 })
    }

    // Use the existing CanvasApiClient to fetch incomplete assignments
    const canvasClient = new CanvasApiClient(session.apiKey)
    const incompleteAssignments = await canvasClient.getIncompleteAssignments()

    // Format the assignments for the schedule component
    const schedule = incompleteAssignments.map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      dueDate: assignment.dueDate ? assignment.dueDate.toISOString() : null,
      courseName: assignment.courseName
    }))

    return NextResponse.json(schedule)
  } catch (error) {
    console.error("Error fetching schedule:", error)
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 })
  }
} 