import { canvasApi } from "./canvas-api"
import { geminiClient } from "./gemini-sdk"
import { prisma } from "./prisma"
import type { Assignment } from "@/types/assignment"

export class SchedulerService {
  async runAssignmentCompletion() {
    try {
      // Log the start of the process
      await this.logEvent("process_start", "Starting automated assignment completion process")

      // Get incomplete assignments
      const incompleteAssignments = await canvasApi.getIncompleteAssignments()
      await this.logEvent("assignments_fetched", `Fetched ${incompleteAssignments.length} incomplete assignments`)

      // Process each assignment
      for (const assignment of incompleteAssignments) {
        await this.processAssignment(assignment)
      }

      // Log completion
      await this.logEvent("process_complete", `Completed processing ${incompleteAssignments.length} assignments`)

      return {
        success: true,
        processedCount: incompleteAssignments.length,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      await this.logEvent("process_error", `Error in assignment completion process: ${errorMessage}`)

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  private async processAssignment(assignment: Assignment) {
    try {
      await this.logEvent("assignment_processing", `Processing assignment: ${assignment.title}`, assignment.id)

      // Use Gemini to complete the assignment
      const completedContent = await geminiClient.completeAssignment(assignment)

      // Submit the completed assignment to Canvas
      await canvasApi.submitAssignment(assignment.courseId, assignment.id, completedContent)

      await this.logEvent(
        "assignment_completed",
        `Successfully completed assignment: ${assignment.title}`,
        assignment.id,
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      await this.logEvent(
        "assignment_error",
        `Error processing assignment ${assignment.title}: ${errorMessage}`,
        assignment.id,
      )
    }
  }

  private async logEvent(type: string, message: string, assignmentId?: string) {
    await prisma.log.create({
      data: {
        type,
        message,
        assignmentId,
        timestamp: new Date(),
      },
    })
  }
}

export const scheduler = new SchedulerService()
