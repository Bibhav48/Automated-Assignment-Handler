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
    <Card>
      <CardHeader>
        <CardTitle>Next Scheduled Run</CardTitle>
        <CardDescription>Automated completion schedule</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span>Today at 8:00 PM</span>
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            onClick={runScheduler}
            disabled={isRunning}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Now
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
