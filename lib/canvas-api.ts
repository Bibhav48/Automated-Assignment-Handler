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
    console.log(this.apiKey);
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
    for (const course of courses) {
      console.log(course.course_code);
    }
    const assignmentPromises = courses.map((course: any) =>
      this.getAssignments(course.id, course.course_code)
    );

    const assignmentsArrays = await Promise.all(assignmentPromises);
    return assignmentsArrays.flat();
  }

  async getIncompleteAssignments(): Promise<Assignment[]> {
    const allAssignments = await this.getAllAssignments();
    return allAssignments.filter(
      (assignment) =>
        assignment.status === "incomplete" &&
        (assignment.dueDate ? new Date(assignment.dueDate) > new Date() : true)
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
