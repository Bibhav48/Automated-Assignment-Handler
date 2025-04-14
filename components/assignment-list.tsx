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
  };

  useGSAP(() => {
    if (assignments.length > 0) {
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" }
      });

      tl.from(".assignment-item", {
        y: 30,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1
      });
    }
  }, [assignments]);

  // fetch assignments from the database using api
  useEffect(() => {
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Assignments</CardTitle>
            <CardDescription>
              View and manage your Canvas assignments
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search assignments..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
                className="assignment-item flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{assignment.title}</h3>
                    <Badge
                      variant="secondary"
                      className={`bg-blue-200 cursor-pointer text-blue-500 hover:bg-blue-300 hover:text-blue-600`}
                    >
                      {assignment.courseName}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(
                        assignment.status
                      )} text-white cursor-pointer hover:${getStatusColor(
                        assignment.status
                      )}/80`}
                    >
                      {assignment.status.charAt(0).toUpperCase() +
                        assignment.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Due: {formatDate(assignment.dueDate)}
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
