import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import type { User } from "next-auth"
import { DashboardNav } from "@/components/dashboard-nav"
import { authOptions } from "../api/auth/[...nextauth]/route"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav user={session.user as User} />
      <div className="flex-1 p-8">{children}</div>
    </div>
  )
}
