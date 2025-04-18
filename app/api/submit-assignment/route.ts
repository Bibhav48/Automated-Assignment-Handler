import { NextResponse } from 'next/server'
import { CanvasApiClient } from '@/lib/canvas-api'

const canvasClient = new CanvasApiClient()

export async function POST(request: Request) {
  try {
    const { assignmentId, courseId, content } = await request.json()

    if (!assignmentId || !courseId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Simulate submission
    const submission = await canvasClient.submitAssignment(
      courseId,
      assignmentId,
      content
    )

    return NextResponse.json({
      success: true,
      submission,
      message: "Assignment submitted successfully (simulated)"
    })
  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json(
      { error: "Failed to submit assignment" },
      { status: 500 }
    )
  }
} 