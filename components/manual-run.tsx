"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Clock, Play, RefreshCw } from "lucide-react";
import { processAssignments } from "@/app/actions/process-assignments";

export function ManualRun() {
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runScheduler = async () => {
    setIsRunning(true);
    try {
      const result = await processAssignments();

      if (result.success) {
        toast({
          title: "Success",
          description: `Processed ${result.processedCount} assignments.`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to run scheduler.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error running scheduler:", error);
      toast({
        title: "Error",
        description: "Failed to run scheduler. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex gap-2 mt-2">
      <Button
        onClick={runScheduler}
        disabled={isRunning}
        className="shadow-xl transition-all hover:scale-[1.03] flex-1 bg-purple-100/50 hover:bg-purple-200/50 dark:bg-purple-300/10 dark:hover:bg-purple-300/20 text-purple-800 dark:text-purple-100 border border-purple-200 dark:border-purple-400/20"
      >
        {isRunning ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin text-purple-800 dark:text-purple-100" />
            Running...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4 text-purple-800 dark:text-purple-100" />
            Run Now
          </>
        )}
      </Button>
    </div>
  );
}
