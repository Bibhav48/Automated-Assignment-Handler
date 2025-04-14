import { neon } from "@neondatabase/serverless"
import { v4 as uuidv4 } from "uuid"

// Initialize the database client
const sql = neon(process.env.DATABASE_URL!)

async function seedDatabase() {
  try {
    console.log("Seeding database with sample data...")

    // Create sample logs
    const logTypes = [
      "process_start",
      "assignments_fetched",
      "assignment_processing",
      "assignment_completed",
      "assignment_error",
      "process_complete",
      "process_error",
    ]

    const logMessages = [
      "Starting automated assignment completion process",
      "Fetched 5 incomplete assignments",
      "Processing assignment: Introduction to Computer Science",
      "Successfully completed assignment: Data Structures and Algorithms",
      "Error processing assignment Web Development: API key invalid",
      "Completed processing 4 assignments",
      "Error in assignment completion process: Network error",
    ]

    // Create 20 sample logs
    for (let i = 0; i < 20; i++) {
      const typeIndex = Math.floor(Math.random() * logTypes.length)
      const messageIndex = Math.floor(Math.random() * logMessages.length)

      const timestamp = new Date()
      timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 72)) // Random time in the last 3 days

      await sql`
        INSERT INTO "Log" (id, type, message, assignmentId, timestamp)
        VALUES (${uuidv4()}, ${logTypes[typeIndex]}, ${logMessages[messageIndex]}, ${null}, ${timestamp.toISOString()})
      `
    }

    console.log("Created sample logs")

    // Create sample scheduled runs
    const statuses = ["completed", "failed", "running"]

    // Create 5 sample scheduled runs
    for (let i = 0; i < 5; i++) {
      const statusIndex = Math.floor(Math.random() * statuses.length)
      const startTime = new Date()
      startTime.setHours(startTime.getHours() - Math.floor(Math.random() * 72)) // Random time in the last 3 days

      let endTime = null
      if (statuses[statusIndex] !== "running") {
        endTime = new Date(startTime)
        endTime.setMinutes(endTime.getMinutes() + Math.floor(Math.random() * 10) + 1) // 1-10 minutes after start
      }

      const results =
        statuses[statusIndex] === "completed"
          ? { processedCount: Math.floor(Math.random() * 5) + 1 }
          : statuses[statusIndex] === "failed"
            ? { error: "Failed to connect to Canvas API" }
            : null

      await sql`
        INSERT INTO "ScheduledRun" (id, status, startTime, endTime, results)
        VALUES (
          ${uuidv4()}, 
          ${statuses[statusIndex]}, 
          ${startTime.toISOString()}, 
          ${endTime ? endTime.toISOString() : null}, 
          ${results ? JSON.stringify(results) : null}
        )
      `
    }

    console.log("Created sample scheduled runs")
    console.log("Database seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

// Run the seed function
seedDatabase()
