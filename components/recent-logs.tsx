"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ArrowRight, AlertCircle } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Log {
  id: string;
  type: string;
  message: string;
  assignmentId: string | null;
  timestamp: string;
}

export function RecentLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/logs?limit=5");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch logs");
      }

      const data = await response.json();
      setLogs(data.logs);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch logs");
    } finally {
      setIsLoading(false);
    }
  };

  useGSAP(() => {
    if (logs.length > 0) {
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" }
      });

      tl.from(".log-item", {
        y: 30,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1
      });
    }
  }, [logs]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case "assignment_completed":
        return "text-green-700 dark:text-green-300";
      case "assignment_error":
        return "text-red-700 dark:text-red-300";
      case "process_start":
        return "text-purple-700 dark:text-purple-300";
      case "process_complete":
        return "text-green-700 dark:text-green-300";
      case "assignment_processing":
        return "text-blue-700 dark:text-blue-300";
      default:
        return "text-gray-700 dark:text-gray-300";
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <div className="flex items-center gap-4">
            <CardTitle>Recent Activity</CardTitle>
            <Link href="/dashboard/logs">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <CardDescription>Latest system logs</CardDescription>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchLogs}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh</span>
        </Button>
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
          <div className="text-center text-muted-foreground py-4">
            No recent activity
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="log-item space-y-1 border-b pb-3 last:border-0"
              >
                <div className="flex justify-between">
                  <span
                    className={`text-sm font-medium ${getLogTypeColor(
                      log.type
                    )}`}
                  >
                    {log.type.replace(/_/g, " ").toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(log.timestamp)}
                  </span>
                </div>
                <p className="text-sm">{log.message}</p>
                {log.assignmentId && (
                  <p className="text-xs text-muted-foreground">
                    Assignment ID: {log.assignmentId}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
