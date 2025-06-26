"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, BookOpen, User, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: string
  course_code: string
  name: string
  session: string
  lecturer_id?: string
  lecturer_name?: string
  student_count?: number
  average_attendance?: number
}

interface Lecturer {
  id: string
  lecturerId: string
  fullName: string
  department: string
  email: string
  assignedCourses?: any[]
  username: string // Make username required
}

interface AssignCourseFormProps {
  courses: Course[]
  lecturers: Lecturer[]
  onCourseAssigned: (course: Course) => void
}

export function AssignCourseForm({ courses, lecturers, onCourseAssigned }: AssignCourseFormProps) {
  // Map incoming courses to expected snake_case shape
  const normalizedCourses: Course[] = (courses as any[]).map((c) => ({
    id: c.id,
    course_code: c.course_code || c.courseCode,
    name: c.name || c.courseName,
    session: c.session,
    lecturer_id: c.lecturer_id || c.lecturerId,
    lecturer_name: c.lecturer_name || c.lecturerName,
    student_count: c.student_count || c.studentCount,
    average_attendance: c.average_attendance || c.averageAttendance,
  }))

  // Only show courses that are not yet assigned (robust check)
  const unassignedCourses = normalizedCourses.filter(
    (c) => !c.lecturer_id || c.lecturer_id === "null" || c.lecturer_id === "" || c.lecturer_id === null
  )

  // Normalize lecturers to always include username
  const normalizedLecturers = (lecturers as any[]).map((l) => ({
    ...l,
    username: l.username || l.fullName || l.email || "unknown"
  }))

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleAssignCourse = async () => {
    if (!selectedCourse || !selectedLecturer) {
      setError("Please select both a course and a lecturer")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/v1/courses/${selectedCourse.id}/assign-lecturer`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ lecturer_id: selectedLecturer.id }),
      })

      const data = await response.json()

      if (response.ok) {
        onCourseAssigned(data)
        setSelectedCourse(null)
        setSelectedLecturer(null)
        toast({
          title: "Success",
          description: `Successfully assigned ${selectedCourse.name} to ${selectedLecturer.fullName}`,
        })
      } else {
        setError(data.detail || data.error || "Failed to assign course")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Available Courses */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <BookOpen className="h-5 w-5" />
          <span>Available Courses</span>
        </h3>
        <div className="grid gap-3">
          {unassignedCourses.map((course, index) => (
            <Card
              key={course.id}
              className={`cursor-pointer transition-all ${
                selectedCourse?.id === course.id
                  ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                  : "hover:shadow-md"
              }`}
              onClick={() => setSelectedCourse(course)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {index + 1}. {course.name}
                      </span>
                      <Badge variant="secondary">({course.course_code})</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Session: {course.session}</p>
                    <p className="text-sm">
                      Lecturer:{" "}
                      {course.lecturer_name ? (
                        <span className="text-green-600 font-medium">{course.lecturer_name}</span>
                      ) : (
                        <span className="text-orange-600 font-medium">Unassigned</span>
                      )}
                    </p>
                  </div>
                  {selectedCourse?.id === course.id && <CheckCircle className="h-5 w-5 text-blue-600" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Lecturer Selection */}
      {selectedCourse && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Select Lecturer for "{selectedCourse.name}"</span>
          </h3>
          <div className="grid gap-3">
            {normalizedLecturers.map((lecturer, index) => (
              <Card
                key={lecturer.id}
                className={`cursor-pointer transition-all ${
                  selectedLecturer?.id === lecturer.id
                    ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-950"
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelectedLecturer(lecturer)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {index + 1}. {lecturer.fullName}{" "}
                          <span className="text-xs text-gray-500">({lecturer.username})</span>
                        </span>
                        <Badge variant="outline">({lecturer.lecturerId})</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Department: {lecturer.department}</p>
                      <p className="text-sm text-muted-foreground">{lecturer.email}</p>
                    </div>
                    {selectedLecturer?.id === lecturer.id && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Assignment Summary */}
      {selectedCourse && selectedLecturer && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200">Assignment Summary</CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Ready to assign the following course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Course:</strong> {selectedCourse.name} ({selectedCourse.course_code})
              </p>
              <p>
                <strong>Session:</strong> {selectedCourse.session}
              </p>
              <p>
                <strong>Lecturer:</strong> {selectedLecturer.fullName} ({selectedLecturer.lecturerId})
              </p>
              <p>
                <strong>Department:</strong> {selectedLecturer.department}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          onClick={handleAssignCourse}
          disabled={!selectedCourse || !selectedLecturer || isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Assigning Course...
            </>
          ) : (
            "Assign Course"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSelectedCourse(null)
            setSelectedLecturer(null)
            setError("")
          }}
        >
          Clear Selection
        </Button>
      </div>
    </div>
  )
}
