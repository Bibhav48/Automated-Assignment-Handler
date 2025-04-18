"use client"

import { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Assignment {
  id: string
  name: string
  course_name: string
  due_date: string | null
  points_possible: number
}

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedDayAssignments, setSelectedDayAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch("/api/schedule")
        const data = await response.json()
        setAssignments(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching assignments:", error)
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [])

  useEffect(() => {
    if (date && assignments.length > 0) {
      const selectedDate = format(date, "yyyy-MM-dd")
      const filteredAssignments = assignments.filter((assignment) => {
        if (!assignment.due_date) return false
        return format(new Date(assignment.due_date), "yyyy-MM-dd") === selectedDate
      })
      setSelectedDayAssignments(filteredAssignments)
    }
  }, [date, assignments])

  const getDayAssignmentCount = (day: Date): number => {
    const dayString = format(day, "yyyy-MM-dd")
    return assignments.filter((assignment) => {
      if (!assignment.due_date) return false
      return format(new Date(assignment.due_date), "yyyy-MM-dd") === dayString
    }).length
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Schedule</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="lg:col-span-4 col-span-6">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>View your upcoming assignments</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center overflow-x-hidden">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="mx-10"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4 w-full",
                table: "w-full border-collapse",
                head_row: "flex w-full",
                head_cell: "w-11 md:w-11 lg:w-12 font-normal text-muted-foreground",
                row: "flex w-full mt-2",
                cell: "w-11 h-12 md:h-11  lg:h-12 lg:w-12 text-center text-sm relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "w-11 h-12 md:h-11  lg:w-12 lg:h-12 p-0 font-normal aria-selected:opacity-100",
                day_today: "bg-accent text-accent-foreground",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
              }}
              components={{
                DayContent: ({ date }) => {
                  const count = getDayAssignmentCount(date)
                  return (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <span>{date.getDate()}</span>
                      {count > 0 && (
                        <Badge
                          variant="secondary"
                          className="absolute top-0 right-0 -mt-2 -mr-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {count}
                        </Badge>
                      )}
                    </div>
                  )
                },
              }}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-8 col-span-6">
          <CardHeader>
            <CardTitle>
              Assignments Due{" "}
              {date ? format(date, "MMMM d, yyyy") : "Select a date"}
            </CardTitle>
            <CardDescription>
              {selectedDayAssignments.length} assignments due on this day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {loading ? (
                <div className="text-center text-muted-foreground">Loading...</div>
              ) : selectedDayAssignments.length > 0 ? (
                <div className="space-y-4">
                  {selectedDayAssignments.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold">{assignment.name}</h3>
                          <div className="text-sm text-muted-foreground">
                            <p>{assignment.course_name}</p>
                            <p>Points: {assignment.points_possible}</p>
                            {assignment.due_date && (
                              <p>Due: {format(new Date(assignment.due_date), "h:mm a")}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  No assignments due on this day
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 