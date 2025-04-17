import type { Assignment } from "@/types/assignment";

export class CanvasApiClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiUrl = process.env.CANVAS_API_URL || "";
    this.apiKey = apiKey || "";
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        throw new Error(
          `Canvas API error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Canvas API request failed:", error);
      throw error;
    }
  }

  async getUserProfile() {
    return this.fetchWithAuth("/users/self");
  }

  async getCourses() {
    return this.fetchWithAuth("/users/self/favorites/courses");
  }

  async getAssignments(
    courseId: string,
    courseName: string
  ): Promise<Assignment[]> {
    const data = await this.fetchWithAuth(`/courses/${courseId}/assignments`);

    return data.map((item: any) => ({
      id: item.id,
      courseName: courseName,
      courseId: courseId,
      title: item.name,
      description: item.description || "",
      dueDate: item.due_at ? new Date(item.due_at) : null,
      status: item.has_submitted_submissions ? "completed" : "incomplete",
      points: item.points_possible,
      url: item.html_url,
      submissionTypes: item.submission_types,
    }));
  }

  async getAllAssignments(): Promise<Assignment[]> {
    const courses = await this.getCourses();
    const assignmentPromises = courses.map((course: any) =>
      this.getAssignments(course.id, course.course_code)
    );

    const assignmentsArrays = await Promise.all(assignmentPromises);
    
    return assignmentsArrays.flat().sort((a, b) => {
      const now = new Date();
      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

      // Helper functions to determine assignment category
      const getCategory = (assignment: Assignment) => {
        if (!assignment.dueDate) {
          return assignment.status === "incomplete" ? 4 : 3; // no due + incomplete before past due 10+, completed in middle
        }
        
        const dueDate = new Date(assignment.dueDate);
        if (assignment.status === "completed") {
          return 3; // completed in middle
        }
        
        if (dueDate < tenDaysAgo) {
          return 5; // incomplete + past due 10+ days at the end
        }
        
        if (dueDate < now) {
          return 2; // incomplete + past due less than 10 days
        }
        
        return 1; // incomplete with due left
      };

      const categoryA = getCategory(a);
      const categoryB = getCategory(b);

      // First sort by category
      if (categoryA !== categoryB) {
        return categoryA - categoryB;
      }

      // Within the same category, sort by due date (ascending)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      // If one has a due date and the other doesn't, the one with due date comes first
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;

      // If both have no due date, maintain original order
      return 0;
    });
  }

  async getIncompleteAssignments(): Promise<Assignment[]> {
    const allAssignments = await this.getAllAssignments();
    return allAssignments.filter(
      (assignment) =>
        assignment.status === "incomplete" &&
        assignment.dueDate &&
        new Date(assignment.dueDate) > new Date()
    );
  }

  // async submitAssignment(
  //   courseId: string,
  //   assignmentId: string,
  //   content: string
  // ) {
  //   return this.fetchWithAuth(
  //     `/courses/${courseId}/assignments/${assignmentId}/submissions`,
  //     {
  //       method: "POST",
  //       body: JSON.stringify({
  //         submission: {
  //           submission_type: "online_text_entry",
  //           body: content,
  //         },
  //       }),
  //     }
  //   );
  // }
}
