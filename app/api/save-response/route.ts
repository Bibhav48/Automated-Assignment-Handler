import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Missing assignment ID" },
        { status: 400 }
      );
    }

    const savedResponse = await sql`
      SELECT content FROM "SavedResponse"
      WHERE "assignmentId" = ${assignmentId} AND "userId" = ${session.user.id}
      ORDER BY "updatedAt" DESC
      LIMIT 1
    `;

    return NextResponse.json({
      content: savedResponse[0]?.content || null,
    });
  } catch (error) {
    console.error("Error fetching saved response:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved response" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
          "userId",
          "createdAt",
          "updatedAt"
        ) VALUES (
          gen_random_uuid(),
          ${assignmentId},
          ${courseId},
          ${content},
          ${session.user.id},
          NOW(),
          NOW()
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
