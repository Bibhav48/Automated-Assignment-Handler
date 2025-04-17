'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { useState, useEffect } from "react"

interface Course {
  id: string
  name: string
  code: string
  term: string
  isEnabled: boolean
  lastSync: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [hasAnimated, setHasAnimated] = useState(false)

  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/courses")
      if (!response.ok) {
        throw new Error("Failed to fetch courses")
      }
      const data = await response.json()
      setCourses(data)
      setHasAnimated(false)
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useGSAP(() => {
    if (courses.length > 0 && !hasAnimated) {
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" }
      })

      tl.from(".course-item", {
        y: 30,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        onComplete: () => setHasAnimated(true)
      })
    }
  }, [courses, hasAnimated])

  useEffect(() => {
    fetchCourses()
  }, [])

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleCourse = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/toggle`, {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Failed to toggle course")
      }
      fetchCourses()
    } catch (error) {
      console.error("Error toggling course:", error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">
            Manage your Canvas courses and their settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={fetchCourses} disabled={isLoading}>
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No courses found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="course-item flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{course.name}</h3>
                      <Badge variant="secondary">{course.code}</Badge>
                      <Badge
                        variant={course.isEnabled ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleCourse(course.id)}
                      >
                        {course.isEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Term: {course.term} • Last sync: {new Date(course.lastSync).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Settings
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 