import { canvasApi } from "./canvas-api"
import { geminiClient } from "./gemini-sdk"
import { neon } from "@neondatabase/serverless"
import type { Assignment } from "@/types/assignment"
import { v4 as uuidv4 } from "uuid"

// Initialize the database client
const sql = neon(process.env.DATABASE_URL!)

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
      const response = await geminiClient.completeAssignment(assignment)

      // Log completion
      await this.logEvent("assignment_completed", `Successfully completed assignment: ${assignment.title}`, assignment.id)

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      await this.logEvent("assignment_error", `Error processing assignment ${assignment.title}: ${errorMessage}`, assignment.id)
      throw error
    }
  }

  private async logEvent(type: string, message: string, assignmentId?: string) {
    const id = uuidv4()
    await sql`
      INSERT INTO "Log" (id, type, message, "assignmentId", timestamp)
      VALUES (${id}, ${type}, ${message}, ${assignmentId || null}, ${new Date().toISOString()})
    `
  }
}

export const scheduler = new SchedulerService()
