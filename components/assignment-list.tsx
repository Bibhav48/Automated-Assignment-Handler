"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Assignment } from "@/types/assignment";
import { RefreshCw, Search } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export function AssignmentList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [refreshTimeout, setRefreshTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/assignments");
      if (!response.ok) {
        setIsError(true);
        return;
      }
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = () => {
    setIsLoading(true);
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
    setRefreshTimeout(
      setTimeout(() => {
        setIsLoading(false);
      }, 1000)
    );
    fetchAssignments();
  };

  useGSAP(() => {
    if (assignments.length > 0) {
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
      });

      tl.from(".assignment-item", {
        y: 30,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
      });
    }
  }, [assignments]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date | null) => {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string, hover: boolean = false) => {
    if (hover) {
      return "bg-opacity-80";
    }
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "incomplete":
        return "bg-yellow-500";
      case "in_progress":
        return "bg-blue-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignments</CardTitle>
        <CardDescription>Your current assignments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="icon" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No assignments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="assignment-item p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {assignment.courseName}
                    </p>
                  </div>
                  <Badge
                    className={`${getStatusColor(
                      assignment.status
                    )} text-white`}
                  >
                    {assignment.status}
                  </Badge>
                </div>
                <div className="mt-2 text-sm">
                  <p>Due: {formatDate(assignment.dueDate)}</p>
                  <p className="text-muted-foreground line-clamp-2">
                    {assignment.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={assignment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View in Canvas
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
