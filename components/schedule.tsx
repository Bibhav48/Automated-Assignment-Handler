"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
        console.log(data)
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
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Assignments</CardTitle>
          <CardDescription>Loading schedule...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Assignments</CardTitle>
        <CardDescription>Your upcoming assignment deadlines</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedule.length === 0 ? (
            <p className="text-muted-foreground">No upcoming assignments</p>
          ) : (
            schedule.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.course_name} • Due {new Date(item.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
} 