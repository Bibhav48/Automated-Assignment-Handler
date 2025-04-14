import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Initialize the database client
const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: NextRequest) {
  try {
    // Get pagination params
    const { searchParams } = new URL(req.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Get logs with pagination
    const logs = await sql`
      SELECT * FROM "Log"
      ORDER BY "timestamp" DESC
      LIMIT ${limit} OFFSET ${skip}
    `

    // Get total count for pagination
    const [{ count }] = await sql`SELECT COUNT(*) as count FROM "Log"`
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
