"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, BookOpen, Calendar, GraduationCap, CheckCircle, AlertCircle, Hash } from "lucide-react"
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

interface CreateCourseFormProps {
  onCourseCreated: (course: Course) => void
}

const sessions = [
  "First Semester 2024",
  "Second Semester 2024",
  "First Semester 2025",
  "Second Semester 2025",
  "Summer 2024",
  "Summer 2025",
]

export function CreateCourseForm({ onCourseCreated }: CreateCourseFormProps) {
  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    session: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.courseCode.trim()) {
      errors.courseCode = "Course code is required"
    }
    if (!formData.courseName.trim()) {
      errors.courseName = "Course name is required"
    }
    if (!formData.session) {
      errors.session = "Session is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("http://localhost:8000/api/v1/courses/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          course_code: formData.courseCode,
          name: formData.courseName,
          session: formData.session
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onCourseCreated(data)
        setFormData({
          courseCode: "",
          courseName: "",
          session: "",
        })
        setValidationErrors({})
        toast({
          title: "Success",
          description: `Successfully created course: ${formData.courseName} (${formData.courseCode})`,
        })
      } else {
        let errorMsg = "Failed to create course";
        if (Array.isArray(data.detail)) {
          errorMsg = data.detail.map((e: any) => e.msg).join("; ");
        } else if (typeof data.detail === "string") {
          errorMsg = data.detail;
        } else if (data.error) {
          errorMsg = data.error;
        }
        setError(errorMsg);
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const clearForm = () => {
    setFormData({
      courseCode: "",
      courseName: "",
      session: "",
    })
    setValidationErrors({})
    setError("")
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Form Header - Matching Lecturer Management */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <BookOpen className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Course Registration Form</h2>
        <p className="text-gray-600">Enter the details to create a new academic course</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Course Information Section */}
        <Card className="border-0 shadow-university bg-gradient-to-br from-white to-blue-50/30">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Course Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="courseCode" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <Hash className="h-4 w-4" />
                    <span>Course Code</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="courseCode"
                      value={formData.courseCode}
                      onChange={(e) => handleInputChange("courseCode", e.target.value)}
                      placeholder="e.g., CEF427"
                      className={`h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-university/50 focus:ring-university/20 ${
                        validationErrors.courseCode ? "border-red-300 focus:border-red-500" : ""
                      }`}
                    />
                    {validationErrors.courseCode && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  {validationErrors.courseCode && (
                    <p className="text-xs text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{validationErrors.courseCode}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Academic Session</span>
                  </Label>
                  <Select value={formData.session} onValueChange={(value) => handleInputChange("session", value)}>
                    <SelectTrigger
                      className={`h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-university/50 focus:ring-university/20 ${
                        validationErrors.session ? "border-red-300" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select academic session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map((session) => (
                        <SelectItem key={session} value={session}>
                          {session}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.session && (
                    <p className="text-xs text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{validationErrors.session}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Details Section */}
        <Card className="border-0 shadow-university bg-gradient-to-br from-white to-purple-50/30">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Course Details</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseName" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Course Name</span>
                </Label>
                <div className="relative">
                  <Input
                    id="courseName"
                    value={formData.courseName}
                    onChange={(e) => handleInputChange("courseName", e.target.value)}
                    placeholder="e.g., Human Computing Interface"
                    className={`h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-university/50 focus:ring-university/20 ${
                      validationErrors.courseName ? "border-red-300 focus:border-red-500" : ""
                    }`}
                  />
                  {validationErrors.courseName && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                </div>
                {validationErrors.courseName && (
                  <p className="text-xs text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{validationErrors.courseName}</span>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form Actions - Matching Lecturer Management */}
        <div className="flex space-x-4 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 h-14 bg-gradient-to-r from-university-primary to-university-dark hover:from-university-dark hover:to-university shadow-lg hover:shadow-university transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Course...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Create Course
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearForm}
            className="px-8 h-14 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          >
            Clear Form
          </Button>
        </div>
      </form>
    </div>
  )
}
