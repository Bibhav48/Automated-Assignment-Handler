import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { CanvasApiClient } from "@/lib/canvas-api";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canvasApiClient = new CanvasApiClient(session.apiKey);
    
    // Get courses from Canvas
    const courses = await canvasApiClient.getCourses();
    
    // Transform the response to match the frontend interface
    const transformedCourses = courses.map((course: any) => ({
      id: course.id,
      name: course.name,
      code: course.course_code,
      term: course.term?.name || "No term",
      isEnabled: true, // All courses are enabled by default
      lastSync: new Date().toISOString(),
    }));

    return NextResponse.json(transformedCourses);
  } catch (error) {
    console.error("Get courses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
} 