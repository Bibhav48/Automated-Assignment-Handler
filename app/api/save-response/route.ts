import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { assignmentId, courseId, content } = await req.json();

    if (!assignmentId || !courseId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if response already exists for this assignment
    const existingResponse = await sql`
      SELECT id FROM "SavedResponse"
      WHERE "assignmentId" = ${assignmentId} AND "userId" = ${session.user.id}
    `;

    if (existingResponse.length > 0) {
      // Update existing response
      await sql`
        UPDATE "SavedResponse"
        SET content = ${content}, "updatedAt" = NOW()
        WHERE "assignmentId" = ${assignmentId} AND "userId" = ${session.user.id}
      `;
    } else {
      // Create new response
      await sql`
        INSERT INTO "SavedResponse" (
          id,
          "assignmentId",
          "courseId",
          content,
          "userId"
        ) VALUES (
          gen_random_uuid(),
          ${assignmentId},
          ${courseId},
          ${content},
          ${session.user.id}
        )
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving response:", error);
    return NextResponse.json(
      { error: "Failed to save response" },
      { status: 500 }
    );
  }
} 