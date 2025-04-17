import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecentLogs } from "@/components/recent-logs"
import { ManualRun } from "@/components/manual-run"
import { Schedule } from "@/components/schedule"
import { neon } from "@neondatabase/serverless"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"

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
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <div className="text-sm text-muted-foreground">
          Welcome back, {session.user.name || 'User'}!
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-slate-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-green-700 dark:text-green-300">Completed Assignments</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-700 dark:text-green-300" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-green-700 dark:text-green-300">{assignmentStats?.completed_count || 0}</div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">Successfully processed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white dark:from-red-950 dark:to-slate-900 border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-red-700 dark:text-red-300">Failed Assignments</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-700 dark:text-red-300" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-red-700 dark:text-red-300">{assignmentStats?.error_count || 0}</div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">Errors during processing</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-slate-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-purple-700 dark:text-purple-300">Next Scheduled Run</CardTitle>
            <Clock className="h-4 w-4 text-purple-700 dark:text-purple-300" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xl font-bold text-purple-700 dark:text-purple-300">Today at 8:00 PM</div>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">Automated completion schedule</p>
            </div>
            <ManualRun />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-purple-700 dark:text-purple-300">Schedule</CardTitle>
            <CardDescription>Automated assignment processing schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <Schedule />
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-orange-700 dark:text-orange-300">Recent Activity</CardTitle>
            <CardDescription>Latest assignment processing logs</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentLogs />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
