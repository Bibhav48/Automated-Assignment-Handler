import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Initialize the database client
const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get pagination params
    const { searchParams } = new URL(req.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Get logs with pagination for the current user
    const logs = await sql`
      SELECT * FROM "Log"
      WHERE "userId" = ${session.user.id}
      ORDER BY "timestamp" DESC
      LIMIT ${limit} OFFSET ${skip}
    `

    // Get total count for pagination
    const [{ count }] = await sql`
      SELECT COUNT(*) as count 
      FROM "Log"
      WHERE "userId" = ${session.user.id}
    `
    const totalCount = Number.parseInt(count as string)

    return NextResponse.json({
      logs,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        current: page,
        limit,
      },
    })
  } catch (error) {
    console.error("Get logs error:", error)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}
