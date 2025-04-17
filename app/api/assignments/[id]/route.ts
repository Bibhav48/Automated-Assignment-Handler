import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { CanvasApiClient } from "@/lib/canvas-api";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await and parse the ID parameter
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    const canvasApiClient = new CanvasApiClient(session.apiKey);
    
    // Get all assignments and find the specific one
    const allAssignments = await canvasApiClient.getAllAssignments();
    
    // Convert both to strings for comparison since Canvas might return numeric IDs
    const assignment = allAssignments.find(a => String(a.id) === String(id));

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
} 