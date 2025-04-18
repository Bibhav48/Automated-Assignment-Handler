import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { CanvasApiClient } from '@/lib/canvas-api'

export async function POST() {
  try {
    // Create a new session with the demo API key
    const canvasClient = new CanvasApiClient(process.env.DEMO_CANVAS_API_KEY!)
    const user = await canvasClient.getUserProfile()

    // Return the user data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        canvasToken: process.env.DEMO_CANVAS_API_KEY,
      }
    })
  } catch (error) {
    console.error('Guest login error:', error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
} 