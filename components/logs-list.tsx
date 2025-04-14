"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"

interface Log {
  id: string
  type: string
  message: string
  assignmentId: string | null
  timestamp: string
}

interface PaginationData {
  total: number
  pages: number
  current: number
  limit: number
}

export function LogsList() {
  const [logs, setLogs] = useState<Log[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 0,
    current: 1,
    limit: 10,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

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
  }, [pagination.current])

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/logs?page=${pagination.current}&limit=${pagination.limit}`)

      if (!response.ok) {
        throw new Error("Failed to fetch logs")
      }

      const data = await response.json()
      setLogs(data.logs)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching logs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch logs. Please try again.",
        variant: "destructive",
      })
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
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>System activity and assignment processing logs</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={fetchLogs} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No logs found</p>
          </div>
        ) : (
          <>
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
                  {log.assignmentId && (
                    <p className="text-xs text-muted-foreground">Assignment ID: {log.assignmentId}</p>
                  )}
                </div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
                  disabled={pagination.current === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.current} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
                  disabled={pagination.current === pagination.pages || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
