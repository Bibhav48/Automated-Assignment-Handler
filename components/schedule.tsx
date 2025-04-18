"use client"

import { useEffect, useState } from "react"
import { Calendar } from "lucide-react"

interface ScheduleItem {
  id: string
  name: string
  course_name: string
  due_date: string
  points_possible: number
}

export function Schedule() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const response = await fetch("/api/schedule")
        const data = await response.json()
        setSchedule(data)
      } catch (error) {
        console.error("Error fetching schedule:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedule()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-purple-200 dark:bg-purple-300/10 rounded w-3/4"></div>
            <div className="h-3 bg-purple-200 dark:bg-purple-300/10 rounded w-1/2 mt-2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {schedule.length === 0 ? (
        <p className="text-purple-800 dark:text-purple-200">No upcoming assignments</p>
      ) : (
        schedule.map((item) => (
          <div key={item.id} className="flex items-center space-x-4 bg-purple-100 dark:bg-purple-300/10 rounded-lg p-3 shadow-xl">
            <Calendar className="h-5 w-5 text-purple-800 dark:text-purple-200" />
            <div>
              <p className="font-medium text-purple-900 dark:text-purple-100">{item.name}</p>
              <p className="text-sm text-purple-800 dark:text-purple-300">
                {item.course_name} • Due {new Date(item.due_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  )
} 