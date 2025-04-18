import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecentActivityWrapper } from "@/components/recent-logs"
import { ManualRun } from "@/components/manual-run"
import { Schedule } from "@/components/schedule"
import { neon } from "@neondatabase/serverless"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { BackgroundGradient } from "@/components/ui/background-gradient"

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
        <BackgroundGradient 
          className="h-full" 
          containerClassName="h-full"
          customColors="bg-[radial-gradient(circle_farthest-side_at_0_100%,#4ade80,transparent),radial-gradient(circle_farthest-side_at_100%_0,#22c55e,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#16a34a,transparent),radial-gradient(circle_farthest-side_at_0_0,#4ade80,#14532d)]"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-green-800 dark:text-green-100">Completed Assignments</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-800 dark:text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-green-800 dark:text-green-100">{assignmentStats?.completed_count || 0}</div>
            <p className="text-sm text-green-700 dark:text-green-200 mt-1">Successfully processed</p>
          </CardContent>
        </BackgroundGradient>

        <BackgroundGradient 
          className="h-full" 
          containerClassName="h-full"
          customColors="bg-[radial-gradient(circle_farthest-side_at_0_100%,#f87171,transparent),radial-gradient(circle_farthest-side_at_100%_0,#ef4444,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#dc2626,transparent),radial-gradient(circle_farthest-side_at_0_0,#f87171,#7f1d1d)]"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-red-800 dark:text-red-100">Failed Assignments</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-800 dark:text-red-100" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-red-800 dark:text-red-100">{assignmentStats?.error_count || 0}</div>
            <p className="text-sm text-red-700 dark:text-red-200 mt-1">Errors during processing</p>
          </CardContent>
        </BackgroundGradient>

        <BackgroundGradient 
          customColors="bg-[radial-gradient(circle_farthest-side_at_0_100%,#c084fc,transparent),radial-gradient(circle_farthest-side_at_100%_0,#a855f7,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#9333ea,transparent),radial-gradient(circle_farthest-side_at_0_0,#c084fc,#581c87)]"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-purple-800 dark:text-purple-100">Next Scheduled Run</CardTitle>
            <Clock className="h-4 w-4 text-purple-800 dark:text-purple-100" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xl font-bold text-purple-800 dark:text-purple-100">Today at 8:00 PM</div>
              <p className="text-sm text-purple-700 dark:text-purple-200 mt-1">Automated completion schedule</p>
            </div>
            <ManualRun />
          </CardContent>
        </BackgroundGradient>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BackgroundGradient 
          className="h-full"
          containerClassName="h-full"
          customColors="bg-[radial-gradient(circle_farthest-side_at_0_100%,#c084fc,transparent),radial-gradient(circle_farthest-side_at_100%_0,#a855f7,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#9333ea,transparent),radial-gradient(circle_farthest-side_at_0_0,#c084fc,#581c87)]"
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-purple-800 dark:text-purple-100">Schedule</CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-200/90">Automated assignment processing schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <Schedule />
          </CardContent>
        </BackgroundGradient>

        <BackgroundGradient
          customColors="bg-[radial-gradient(circle_farthest-side_at_0_100%,#fdba74,transparent),radial-gradient(circle_farthest-side_at_100%_0,#fb923c,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#f97316,transparent),radial-gradient(circle_farthest-side_at_0_0,#fdba74,#7c2d12)]"
        >
          <RecentActivityWrapper />
        </BackgroundGradient>
      </div>
    </div>
  )
}
