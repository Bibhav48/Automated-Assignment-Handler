"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ArrowRight, AlertCircle } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface Log {
  id: string;
  type: string;
  message: string;
  assignmentId: string | null;
  timestamp: string;
}

export function ViewAllButton() {
  return (
    <Link href="/dashboard/logs">
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-orange-800 hover:text-orange-900 dark:text-orange-200/90 dark:hover:text-orange-100"
      >
        View All
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </Link>
  );
}

export function RefreshButton({ onClick, isLoading }: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={isLoading}
      className="text-orange-800 hover:text-orange-900 dark:text-orange-200/90 dark:hover:text-orange-100"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      <span className="sr-only">Refresh</span>
    </Button>
  );
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
    <div className="rounded-lg p-4">
      <div>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[200px] bg-orange-200/50 dark:bg-white/5" />
                <Skeleton className="h-4 w-full bg-orange-200/50 dark:bg-white/5" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center text-orange-800 dark:text-orange-200/90 py-4">
            No recent activity
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="log-item space-y-1 bg-orange-100 dark:bg-[#54403a] rounded-lg p-3 mb-3 last:mb-0 shadow-xl"
              >
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-orange-900 dark:text-white">
                    {log.type.replace(/_/g, " ").toUpperCase()}
                  </span>
                  <span className="text-xs text-orange-700 dark:text-orange-200/70">
                    {formatDate(log.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-orange-800 dark:text-orange-200/90">{log.message}</p>
                {log.assignmentId && (
                  <p className="text-xs text-orange-700 dark:text-orange-200/70">
                    Assignment ID: {log.assignmentId}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function RecentActivityWrapper() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Add a small delay to show loading state
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-orange-800 dark:text-orange-100">Recent Activity</CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-200/90">Latest assignment processing logs</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/logs">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-orange-800 hover:text-orange-900 dark:text-orange-200/90 dark:hover:text-orange-100"
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-orange-800 hover:text-orange-900 dark:text-orange-200/90 dark:hover:text-orange-100"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <RecentLogs />
      </CardContent>
    </>
  );
}
