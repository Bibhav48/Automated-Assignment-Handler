"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "lucide-react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"

interface Log {
  id: string
  type: string
  message: string
  assignmentId: string | null
  timestamp: string
}

export function RecentLogs() {
  const [logs, setLogs] = useState<Log[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useGSAP(() => {
    gsap.from(".log-item", {
      y: 10,
      opacity: 0,
      stagger: 0.03,
      duration: 0.3,
      ease: "power2.out",
      delay: 0.1,
    })
  }, [logs])

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/logs?limit=5")

      if (!response.ok) {
        throw new Error("Failed to fetch logs")
      }

      const data = await response.json()
      setLogs(data.logs)
    } catch (error) {
      console.error("Error fetching logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
  }

  const getLogTypeColor = (type: string) => {
    if (type.includes("error")) return "text-red-500"
    if (type.includes("complete")) return "text-green-500"
    if (type.includes("processing")) return "text-blue-500"
    if (type.includes("start")) return "text-purple-500"
    return "text-gray-500"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system logs</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={fetchLogs} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-muted-foreground">No logs found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="log-item space-y-1 border-b pb-3 last:border-0">
                <div className="flex justify-between">
                  <span className={`text-sm font-medium ${getLogTypeColor(log.type)}`}>
                    {log.type.replace(/_/g, " ").toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(log.timestamp)}</span>
                </div>
                <p className="text-sm">{log.message}</p>
                {log.assignmentId && <p className="text-xs text-muted-foreground">Assignment ID: {log.assignmentId}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
