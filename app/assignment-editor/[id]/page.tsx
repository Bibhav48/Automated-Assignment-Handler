"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Assignment } from "@/types/assignment";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

// Helper function to strip HTML tags
function stripHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export default function AssignmentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [description, setDescription] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

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
        const res = await fetch(`/api/assignments/${params.id}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch assignment');
        }

        const data = await res.json();
        setAssignment(data);
        setDescription(data.description || '');
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

          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="w-full"
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
  );
} 