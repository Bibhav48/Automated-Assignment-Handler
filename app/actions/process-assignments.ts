"use server";

import { neon } from "@neondatabase/serverless";
import { v4 as uuidv4 } from "uuid";
import { GeminiClient } from "@/lib/gemini-sdk";
import type { Assignment } from "@/types/assignment";

// Initialize the database client
const sql = neon(process.env.DATABASE_URL!);
const geminiClient = new GeminiClient();

export async function processAssignments(submit?: boolean) {
  try {
    // Log the start of the process
    await logEvent(
      "process_start",
      "Starting automated assignment completion process"
    );

    // Get incomplete assignments from Canvas
    const incompleteAssignments = await fetchIncompleteAssignments();

    await logEvent(
      "assignments_fetched",
      `Fetched ${incompleteAssignments.length} incomplete assignments`
    );

    // Create a scheduled run record
    const runId = uuidv4();
    await sql`
      INSERT INTO "ScheduledRun" (id, status, "startTime")
      VALUES (${runId}, 'running', ${new Date().toISOString()})
    `;

    // Process each assignment
    for (const assignment of incompleteAssignments) {
      await processAssignment(assignment, submit);
    }

    // Update the scheduled run record
    await sql`
      UPDATE "ScheduledRun"
      SET status = 'completed', "endTime" = ${new Date().toISOString()}, 
          results = ${JSON.stringify({
            processedCount: incompleteAssignments.length,
          })}
      WHERE id = ${runId}
    `;

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

async function fetchIncompleteAssignments(): Promise<Assignment[]> {
  try {
    // Canvas API URL and key from environment variables
    const apiUrl = process.env.CANVAS_API_URL;
    const apiKey = process.env.NOT_CANVAS_API_KEY;

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

async function processAssignment(assignment: Assignment, submit?: boolean) {
  try {
    await logEvent(
      "assignment_processing",
      `Processing assignment: ${assignment.title}`,
      assignment.id
    );

    // Use Gemini to complete the assignment
    if (assignment.description.length < 200) {
      console.log("Description is too short, skipping assignment.");
      console.log(assignment.description);
      return;
    }
    const completedContent = await geminiClient.completeAssignment(assignment);

    // Submit the completed assignment to Canvas
    if (submit) {
      await submitAssignmentToCanvas(
        assignment.courseId,
        assignment.id,
        completedContent
      );
      await logEvent(
        "assignment_completed",
        `Successfully completed assignment: ${assignment.title}`,
        assignment.id
      );
    } else {
      await logEvent(
        "assignment_generated",
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
  content: string
) {
  console.log(`Submitting ${assignmentId} to Canvas`);
  console.log(`Content: ${content}`);
  try {
    const apiUrl = process.env.CANVAS_API_URL;
    const apiKey = process.env.NOT_CANVAS_API_KEY;

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
    VALUES (${id}, ${type}, ${message}, ${
    assignmentId || null
  }, ${new Date().toISOString()})
  `;
}
