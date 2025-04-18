"use client"

import { LogsList } from "@/components/logs-list"

export default function LogsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Activity Logs</h1>
        <p className="text-muted-foreground">View all system activity and assignment processing logs</p>
      </div>
      <LogsList />
    </div>
  )
} 