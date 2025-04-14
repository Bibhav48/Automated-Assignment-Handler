export type AssignmentStatus =
  | "completed"
  | "incomplete"
  | "in_progress"
  | "error";

export interface Assignment {
  id: string;
  courseName: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: Date | null;
  status: AssignmentStatus;
  points: number;
  url: string;
  submissionTypes: string[];
}

export interface AssignmentLog {
  id: string;
  assignmentId: string;
  timestamp: Date;
  action: "fetch" | "complete" | "error";
  details: string;
}
