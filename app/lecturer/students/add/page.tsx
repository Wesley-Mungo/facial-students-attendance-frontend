"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { LecturerLayout } from "@/components/layouts/lecturer-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { BookOpen, UserPlus, Search, Loader2, CheckCircle2, XCircle, AlertCircle, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: string
  course_code: string
  name: string
  session: string
}

interface Student {
  id: string
  student_id: string
  name: string
  department: string
  level: number
}

export default function AddStudentToCourse() {
  const [course, setCourse] = useState<Course | null>(null)
  const [student_id, setstudent_id] = useState("")
  const [searchedStudent, setSearchedStudent] = useState<Student | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [addError, setAddError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const course_id = searchParams.get("course") || ""
  const { toast } = useToast()

  useEffect(() => {
    if (course_id) {
      fetchCourseDetails(course_id)
    } else {
      setIsLoading(false)
      setFetchError("No course selected. Please select a course from the dashboard.")
    }
  }, [course_id])

  const fetchCourseDetails = async (course_id: string) => {
    try {
      setIsLoading(true)
      setFetchError("")

      const token = localStorage.getItem('auth_token');
      const url = `http://127.0.0.1:8000/api/v1/courses/${course_id}`;
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();

      if (response.ok) {
        setCourse(data.course || data)
      } else {
        setFetchError(data.error || "Failed to fetch course details")
        toast({
          title: "Error",
          description: data.error || "Failed to fetch course details",
          variant: "destructive",
        })
      }
    } catch (error) {
      setFetchError("Failed to fetch course details. Please try again.")
      toast({
        title: "Error",
        description: "Failed to fetch course details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchStudent = async () => {
    if (!student_id.trim()) {
      setSearchError("Please enter a student ID")
      return
    }

    setIsSearching(true)
    setSearchError("")
    setSearchedStudent(null)
    setSuccess(false)
    setAddError("")

    try {
      const token = localStorage.getItem('auth_token');
      const url = `http://127.0.0.1:8000/api/v1/students/${student_id}`;
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();

      if (response.ok && data) {
        setSearchedStudent(data)
      } else {
        setSearchError(data.error || "Student not found")
      }
    } catch (error) {
      setSearchError("Failed to search for student")
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddStudent = async () => {
    if (!course || !searchedStudent) return

    setIsAdding(true)
    setAddError("")
    setSuccess(false)

    try {
      const token = localStorage.getItem('auth_token');
      const url = `http://127.0.0.1:8000/api/v1/students/${student_id}/add-to-course/${course_id}`;
      const response = await fetch(url, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        toast({
          title: "Success",
          description: `Student ${searchedStudent.name} added to the course successfully!`,
        })
        setstudent_id("")
        setSearchedStudent(null)
      } else {
        if (
          (data?.error && data.error.toLowerCase().includes("already")) ||
          (data?.detail && data.detail.toLowerCase().includes("already"))
        ) {
          setAddError("Student already exists in this course.")
        } else {
          setAddError(data.error || data.detail || "Failed to add student to course")
        }
      }
    } catch (error) {
      setAddError("Failed to add student to course")
    } finally {
      setIsAdding(false)
    }
  }

  const goToDashboard = () => {
    router.push("/lecturer/dashboard")
  }

  return (
    <LecturerLayout>
      <div className="space-y-8 p-6">
                   {/* Header Section */}
                   <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-university-primary via-blue-600 to-purple-600 p-8 text-white">
                     <div className="absolute inset-0 bg-black/10"></div>
                     <div className="relative z-10">
                       <div className="flex items-center justify-between">
                         <div>
                             <h1 className="text-4xl font-bold mb-2">Add Student to Course (Carryover)</h1>
                           <p className="text-blue-100 text-lg">Add existing students to your course as carryover students</p>
                           </div>
                           <Button  variant="outline" className="hidden md:flex items-center space-x-4 bg-white/20 backdrop-blur-sm rounded-lg p-4">
                               <Bell className="h-8 w-8" />
                               <span className="ml-2">Log Out</span>
                           </Button>
                       </div>
                     </div>
                     <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10"></div>
                     <div className="absolute -left-20 -bottom-20 h-32 w-32 rounded-full bg-white/5"></div>
                   </div>
     
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading course details...</span>
          </div>
        ) : fetchError ? (
          <Card className="relative overflow-hidden border-0 shadow-university hover:shadow-university-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-6 pb-6">
              <Alert variant="destructive" className="mb-4">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{fetchError}</AlertDescription>
              </Alert>
              <Button onClick={goToDashboard}>Return to Dashboard</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Course Information */}
            {course && (
              <Card>
                <CardHeader className="bg-blue-50 dark:bg-blue-950">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <span>
                          {course.name} ({course.course_code})
                        </span>
                      </CardTitle>
                      <CardDescription className="mt-1">{course.session}</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Current Course
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            )}

            {/* Student Search Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Search Student</span>
                </CardTitle>
                <CardDescription>Enter the student ID to search for an existing student</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student_id">Student ID</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="student_id"
                        value={student_id}
                        onChange={(e) => setstudent_id(e.target.value)}
                        placeholder="e.g., FE21A140"
                        className="flex-1"
                      />
                      <Button onClick={handleSearchStudent} disabled={isSearching}>
                        {isSearching ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" />
                            Search
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {searchError && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{searchError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Student Details */}
            {searchedStudent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserPlus className="h-5 w-5" />
                    <span>Student Found</span>
                  </CardTitle>
                  <CardDescription>Review student details before adding to the course</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Student ID</Label>
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">{searchedStudent.student_id}</div>
                      </div>
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">{searchedStudent.name}</div>
                      </div>
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">{searchedStudent.department}</div>
                      </div>
                      <div className="space-y-2">
                        <Label>Level</Label>
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">{searchedStudent.level}</div>
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This student will be added as a <strong>carryover student</strong> to {course?.name || "the current course"}.
                      </AlertDescription>
                    </Alert>

                    {addError && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>{addError}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          Student {searchedStudent.name} added to the course successfully!
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setSearchedStudent(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddStudent} disabled={isAdding || success}>
                    {isAdding ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add as Carryover
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Instructions */}
            {!searchedStudent && !isSearching && (
              <Card>
                <CardHeader>
                  <CardTitle>Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      Use this form to add existing students to your course as carryover students. Follow these steps:
                    </p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Enter the student ID in the search field above</li>
                      <li>Click "Search" to find the student in the system</li>
                      <li>Review the student details to ensure it's the correct student</li>
                      <li>Click "Add as Carryover" to add the student to your course</li>
                    </ol>
                    <Alert>
                      <AlertDescription>
                        Only students who are already registered in the system can be added as carryover students.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </LecturerLayout>
  )
}
