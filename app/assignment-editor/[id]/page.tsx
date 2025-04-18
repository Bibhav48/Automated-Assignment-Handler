"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Assignment } from "@/types/assignment";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Helper function to strip HTML tags
function stripHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export default function AssignmentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [description, setDescription] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [intendedPath, setIntendedPath] = useState<string | null>(null);

  // Add beforeunload event listener for browser/tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle navigation attempts
  const handleNavigate = (url: string) => {
    if (hasUnsavedChanges) {
      setIntendedPath(url);
      setShowLeaveWarning(true);
    } else {
      router.push(url);
    }
  };

  // Update hasUnsavedChanges when response changes
  useEffect(() => {
    if (response) {
      setHasUnsavedChanges(true);
    }
  }, [response]);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!params?.id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No assignment ID provided",
        });
        router.push('/dashboard');
        return;
      }

      try {
        setIsFetching(true);
        const [assignmentRes, savedResponseRes] = await Promise.all([
          fetch(`/api/assignments/${params.id}`),
          fetch(`/api/save-response?assignmentId=${params.id}`)
        ]);

        if (!assignmentRes.ok) {
          const data = await assignmentRes.json();
          throw new Error(data.error || 'Failed to fetch assignment');
        }

        const assignmentData = await assignmentRes.json();
        setAssignment(assignmentData);
        setDescription(assignmentData.description || '');

        // Load saved response if it exists
        if (savedResponseRes.ok) {
          const { content } = await savedResponseRes.json();
          if (content) {
            setResponse(content);
            setHasUnsavedChanges(false); // No unsaved changes since we just loaded the saved version
          }
        }
      } catch (error) {
        console.error("Failed to fetch assignment:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch assignment",
        });
        router.push('/dashboard');
      } finally {
        setIsFetching(false);
      }
    };

    fetchAssignment();
  }, [params?.id, router, toast]);

  const handleSubmit = async () => {
    if (!assignment) return;

    setIsLoading(true);
    try {
      // Create a modified assignment object with parsed description
      const modifiedAssignment = {
        ...assignment,
        description: stripHtml(description)
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignment: modifiedAssignment,
          userPrompt: stripHtml(userPrompt),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate response');
      }

      const data = await res.json();
      setResponse(data.response);
      toast({
        title: "Success",
        description: "Response generated successfully",
      });
    } catch (error) {
      console.error("Failed to generate response:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate response",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitToCanvas = async () => {
    if (!assignment || !response) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/process-assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignmentId: assignment.id,
          courseId: assignment.courseId,
          content: response,
          submit: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit assignment');
      }

      toast({
        title: "Success",
        description: "Assignment submitted successfully",
      });
    } catch (error) {
      console.error("Failed to submit assignment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit assignment",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveResponse = async () => {
    if (!assignment || !response) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/save-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignmentId: assignment.id,
          courseId: assignment.courseId,
          content: response,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save response');
      }

      setHasUnsavedChanges(false);
      toast({
        title: "Success",
        description: "Response saved successfully",
      });
    } catch (error) {
      console.error("Failed to save response:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save response",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  return (
    <>
      <div className="container mx-auto p-6 space-y-6 max-w-5xl">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">{assignment.title}</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Assignment Description</label>
              <RichTextEditor
                content={description}
                onChange={setDescription}
                editable={false}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Your Requirements</label>
              <RichTextEditor
                content={userPrompt}
                onChange={setUserPrompt}
                placeholder="Enter any specific requirements or questions..."
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Response"
                )}
              </Button>
              {response && (
                <>
                  <Button
                    onClick={handleSaveResponse}
                    disabled={isSaving}
                    className="flex-1"
                    variant="outline"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Response
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSubmitToCanvas}
                    disabled={isSubmitting}
                    className="flex-1"
                    variant="secondary"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit to Canvas"
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {response && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Generated Response</h2>
            <RichTextEditor
              content={response}
              onChange={setResponse}
            />
          </Card>
        )}
      </div>

      <AlertDialog open={showLeaveWarning} onOpenChange={setShowLeaveWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLeaveWarning(false)}>Stay</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setHasUnsavedChanges(false);
                setShowLeaveWarning(false);
                if (intendedPath) {
                  router.push(intendedPath);
                }
              }}
            >
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 