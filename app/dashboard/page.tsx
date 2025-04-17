import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecentLogs } from "@/components/recent-logs"
import { ManualRun } from "@/components/manual-run"
import { Schedule } from "@/components/schedule"
import { neon } from "@neondatabase/serverless"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Initialize the database client
const sql = neon(process.env.DATABASE_URL!)

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return <div>Please sign in to view your dashboard</div>
  }

  // Get counts from database
  const [assignmentStats] = await sql`
    SELECT 
      (SELECT COUNT(*) FROM "Log" WHERE type = 'assignment_completed' AND "userId" = ${session.user.id}) as completed_count,
      (SELECT COUNT(*) FROM "Log" WHERE type = 'assignment_error' AND "userId" = ${session.user.id}) as error_count
  `

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Completed Assignments</CardTitle>
            <CardDescription>Successfully processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{assignmentStats?.completed_count || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failed Assignments</CardTitle>
            <CardDescription>Errors during processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{assignmentStats?.error_count || 0}</div>
          </CardContent>
        </Card>

        <ManualRun />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Schedule />
        <RecentLogs />
      </div>
    </div>
  )
}
