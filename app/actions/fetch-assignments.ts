"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Assignment } from "@/types/assignment";

export async function fetchIncompleteAssignments(): Promise<Assignment[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session.apiKey) {
      throw new Error("No Canvas token found in session");
    }

    const apiKey = session.apiKey;
    const apiUrl = process.env.CANVAS_API_URL;

    // Fetch courses
    const coursesResponse = await fetch(
      `${apiUrl}/users/self/favourites`,
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
        courseName: course.name,
        title: item.name,
        description: item.description || "",
        dueDate: item.due_at ? new Date(item.due_at) : null,
        status: item.has_submitted_submissions ? "completed" : "incomplete",
        points: item.points_possible || 0,
        url: item.html_url,
        submissionTypes: item.submission_types || [],
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