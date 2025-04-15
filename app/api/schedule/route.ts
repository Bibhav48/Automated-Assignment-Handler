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

    const canvasClient = new CanvasApiClient(session.apiKey)
    const incompleteAssignments = await canvasClient.getIncompleteAssignments()

    // Filter out assignments without due dates and map to schedule format
    const schedule = incompleteAssignments
      .filter(assignment => assignment.dueDate !== null)
      .map(assignment => ({
        id: assignment.id,
        name: assignment.title,
        course_name: assignment.courseName || 'Unknown Course',
        due_date: assignment.dueDate?.toISOString(),
        points_possible: assignment.points
      }))
      // log the schedule items
      for (const item of schedule) {
        console.log(item)
      }

    return NextResponse.json(schedule)
  } catch (error) {
    console.error("Error fetching schedule:", error)
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 })
  }
} 