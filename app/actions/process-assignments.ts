"use server";

import { neon } from "@neondatabase/serverless";
import { v4 as uuidv4 } from "uuid";
import { GeminiClient } from "@/lib/gemini-sdk";
import type { Assignment } from "@/types/assignment";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Initialize the database client
const sql = neon(process.env.DATABASE_URL!);
const geminiClient = new GeminiClient();

export async function processAssignments(submit?: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.apiKey) {
      throw new Error("No Canvas token found in session");
    }

    // Log the start of the process
    await logEvent(
      "process_start",
      "Starting automated assignment completion process"
    );

    // Get incomplete assignments from Canvas
    const incompleteAssignments = await fetchIncompleteAssignments(session.apiKey);

    await logEvent(
      "assignments_fetched",
      `Fetched ${incompleteAssignments.length} incomplete assignments`
    );

    // Process each assignment
    for (const assignment of incompleteAssignments) {
      await processAssignment(assignment, submit, session.apiKey);
    }

    // Log completion
    await logEvent(
      "process_complete",
      `Completed processing ${incompleteAssignments.length} assignments`
    );

    return {
      success: true,
      processedCount: incompleteAssignments.length,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    await logEvent(
      "process_error",
      `Error in assignment completion process: ${errorMessage}`
    );

    return {
      success: false,
      error: errorMessage,
    };
  }
}

async function fetchIncompleteAssignments(apiKey: string): Promise<Assignment[]> {
  try {
    // Canvas API URL from environment variables
    const apiUrl = process.env.CANVAS_API_URL;

    // Fetch courses
    const coursesResponse = await fetch(
      `${apiUrl}/courses?enrollment_state=active`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!coursesResponse.ok) {
      throw new Error(`Canvas API error: ${coursesResponse.status}`);
    }

    const courses = await coursesResponse.json();

    // Fetch assignments for each course
    const assignmentPromises = courses.map(async (course: any) => {
      const assignmentsResponse = await fetch(
        `${apiUrl}/courses/${course.id}/assignments`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!assignmentsResponse.ok) {
        throw new Error(`Canvas API error: ${assignmentsResponse.status}`);
      }

      const assignments = await assignmentsResponse.json();

      return assignments.map((item: any) => ({
        id: item.id,
        courseId: course.id,
        title: item.name,
        description: item.description || "",
        dueDate: item.due_at ? new Date(item.due_at) : null,
        status: item.has_submitted_submissions ? "completed" : "incomplete",
      }));
    });

    const assignmentsArrays = await Promise.all(assignmentPromises);
    const allAssignments = assignmentsArrays.flat();

    // Filter for incomplete assignments
    return allAssignments.filter(
      (assignment) =>
        assignment.status === "incomplete" &&
        (assignment.dueDate ? new Date(assignment.dueDate) > new Date() : true)
    );
  } catch (error) {
    console.error("Error fetching assignments:", error);
    throw error;
  }
}

async function processAssignment(assignment: Assignment, submit?: boolean, apiKey?: string) {
  try {
    await logEvent(
      "assignment_processing",
      `Processing assignment: ${assignment.title}`,
      assignment.id
    );

    // Use Gemini to complete the assignment
    if (assignment.description.length < 200) {
      console.log("Description is too short, skipping assignment.");
      
      return;
    }
    const completedContent = await geminiClient.completeAssignment(assignment);

    // Submit the completed assignment to Canvas
    if (submit && apiKey) {
      await submitAssignmentToCanvas(
        assignment.courseId,
        assignment.id,
        completedContent,
        apiKey
      );
      await logEvent(
        "assignment_submitted",
        `Successfully completed assignment: ${assignment.title}`,
        assignment.id
      );
    } else {
      console.log("Not submitting assignment but generating solution");
      await logEvent(
        "assignment_completed",
        `Successfully generated solution: ${assignment.title}`,
        assignment.id
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    await logEvent(
      "assignment_error",
      `Error processing assignment ${assignment.title}: ${errorMessage}`,
      assignment.id
    );
  }
}

async function submitAssignmentToCanvas(
  courseId: string,
  assignmentId: string,
  content: string,
  apiKey: string
) {
  console.log(`Submitting ${assignmentId} to Canvas`);
  console.log(`Content: ${content}`);
  try {
    const apiUrl = process.env.CANVAS_API_URL;

    const response = await fetch(
      `${apiUrl}/courses/${courseId}/assignments/${assignmentId}/submissions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submission: {
            submission_type: "online_text_entry",
            body: content,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Canvas API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting assignment:", error);
    throw error;
  }
}

async function logEvent(type: string, message: string, assignmentId?: string) {
  const id = uuidv4();
  await sql`
    INSERT INTO "Log" (id, type, message, "assignmentId", timestamp)
    VALUES (${id}, ${type}, ${message}, ${assignmentId || null}, ${new Date().toISOString()})
  `;
}
