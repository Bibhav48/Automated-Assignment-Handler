import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"; // updated import
import { authOptions } from "../auth/[...nextauth]/route"; // import authOptions from your auth config
import { CanvasApiClient } from "@/lib/canvas-api";

export async function GET(req: NextRequest) {
  console.log("GET assignments");
  try {
    // Check authentication with proper options
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Instantiate API client using the API key from session
    const canvasApiClient = new CanvasApiClient(session.apiKey);

    // Get status filter from query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let assignments;
    if (status === "incomplete") {
      assignments = await canvasApiClient.getIncompleteAssignments();
    } else {
      assignments = await canvasApiClient.getAllAssignments();
    }

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Get assignments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
