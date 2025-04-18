import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { neon } from "@neondatabase/serverless"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SignOutButton } from "@/components/sign-out-button"

// Initialize the database client
const sql = neon(process.env.DATABASE_URL!)

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return <div>Please sign in to view your profile</div>
  }

  // Get user stats from database
  const [userStats] = await sql`
    SELECT 
      (SELECT COUNT(*) FROM "Log" WHERE type = 'assignment_completed' AND "userId" = ${session.user.id}) as completed_count,
      (SELECT COUNT(*) FROM "Log" WHERE type = 'assignment_error' AND "userId" = ${session.user.id}) as error_count,
      (SELECT COUNT(*) FROM "Log" WHERE "userId" = ${session.user.id}) as total_logs
  `

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Profile</h1>
        <SignOutButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback>
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{session.user.name || "Canvas User"}</CardTitle>
                <CardDescription>{session.user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID:</span>
                <span className="font-mono">{session.user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Canvas Token:</span>
                <span className="font-mono">
                  {session.user.canvasToken ? "••••••••" : "Not set"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Activity Statistics</CardTitle>
            <CardDescription>Your assignment completion history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-2xl font-bold">{userStats?.completed_count || 0}</div>
                <div className="text-sm text-muted-foreground">Completed Assignments</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{userStats?.error_count || 0}</div>
                <div className="text-sm text-muted-foreground">Failed Assignments</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{userStats?.total_logs || 0}</div>
                <div className="text-sm text-muted-foreground">Total Activities</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 