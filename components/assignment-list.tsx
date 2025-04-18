"use client";

import { useState, useEffect, useMemo } from "react";
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
import { RefreshCw, Search, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

// Helper function to clean and render HTML content
const cleanHtml = (html: string) => {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Process all links
  const links = tempDiv.getElementsByTagName('a');
  for (let i = links.length - 1; i >= 0; i--) {
    const link = links[i];
    // Add external link icon and styling
    link.innerHTML += ' <i class="inline-block w-3 h-3 ml-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></i>';
    link.className = 'text-primary hover:underline inline-flex items-center';
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  }

  // Clean up common Canvas LMS artifacts
  let cleanedHtml = tempDiv.innerHTML
    .replace(/&nbsp;/g, ' ')
    .replace(/<p style="display: none;">[^<]*<\/p>/g, '')
    .replace(/<p><\/p>/g, '')
    .replace(/\s+/g, ' ')
    .replace(/<p>/g, '<p class="mb-2">')
    .replace(/<ul>/g, '<ul class="list-disc pl-4 mb-2">')
    .replace(/<ol>/g, '<ol class="list-decimal pl-4 mb-2">')
    .replace(/<li>/g, '<li class="mb-1">')
    .trim();

  return cleanedHtml;
};

// Helper function to create markup
const createMarkup = (html: string) => {
  return { __html: cleanHtml(html) };
};

export function AssignmentList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const ITEMS_PER_PAGE = 10;

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/assignments`);
      if (!response.ok) {
        setIsError(true);
        return;
      }
      const data = await response.json();
      setAllAssignments(data);
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Filter and paginate assignments
  const { 
    filteredAssignments, 
    totalPages,
    currentAssignments 
  } = useMemo(() => {
    // First, filter based on search
    const filtered = searchTerm
      ? allAssignments.filter(
          (assignment) =>
            assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allAssignments;

    // Calculate total pages
    const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);

    // Get current page's assignments
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const current = filtered.slice(start, end);

    return {
      filteredAssignments: filtered,
      totalPages: total,
      currentAssignments: current
    };
  }, [allAssignments, searchTerm, currentPage]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useGSAP(() => {
    // Clear any existing animations first
    gsap.killTweensOf(".assignment-item");
    
    if (currentAssignments.length > 0) {
      gsap.set(".assignment-item", { opacity: 0, y: 30 });
      
      gsap.to(".assignment-item", {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
        clearProps: "all" // Clean up after animation
      });
    }
  }, [currentAssignments]);

  const formatDate = (date: Date | null) => {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
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
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchAssignments}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : currentAssignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? "No assignments found matching your search" : "No assignments found"}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="assignment-item p-4 rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {assignment.courseName}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(assignment.status)} text-white`}>
                      {assignment.status}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm">
                    <p>Due: {formatDate(assignment.dueDate)}</p>
                    <div 
                      className="text-muted-foreground prose-sm max-w-none line-clamp-2 [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline [&_ul]:my-1 [&_ol]:my-1"
                      dangerouslySetInnerHTML={createMarkup(assignment.description)}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="outline" size="sm" asChild className="transition-all hover:scale-[1.01]">
                      <a
                        href={assignment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center"
                      >
                        View in Canvas
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="transition-all hover:scale-[1.01]">
                      <a
                        href={`/assignment-editor/${assignment.id}`}
                        className="inline-flex items-center"
                      >
                        Open in Editor
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="transition-all hover:scale-[1.01]"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="transition-all hover:scale-[1.01]"
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
  );
}
