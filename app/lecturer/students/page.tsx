"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { LecturerLayout } from "@/components/layouts/lecturer-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Users, Search, RefreshCw, Download, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Student {
  id: string
  studentId: string
  name: string
  department: string
  level: number
  type: "Regular" | "Carryover"
}

interface CourseStudentsData {
  course: {
    id: string
    courseCode: string
    courseName: string
    session: string
  }
  stats?: {
    totalStudents: number
    regularStudents: number
    carryoverStudents: number
  }
  students?: Student[]
}

export default function ViewCourseStudents() {
  const [courseData, setCourseData] = useState<CourseStudentsData | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const course_id = searchParams.get("course") || ""
  const { toast } = useToast()

  useEffect(() => {
    if (course_id) {
      fetchCourseStudents(course_id)
    } else {
      setIsLoading(false)
    }
  }, [course_id])

  // Fetch course details from backend
  const fetchCourseDetails = async (course_id: string) => {
    const token = localStorage.getItem('auth_token');
    const url = `http://127.0.0.1:8000/api/v1/courses/${course_id}`;
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (response.ok) {
      return await response.json();
    }
    return null;
  };

  const fetchCourseStudents = async (course_id: string) => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('auth_token');
      console.log('course_id:', course_id)
      const url = `http://127.0.0.1:8000/api/v1/courses/${course_id}/students`
      console.log('Fetching students from:', url)
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (response.ok) {
        const data = await response.json()
        // Fetch real course info
        const courseDetails = await fetchCourseDetails(course_id)
        setCourseData({
          course: {
            id: course_id,
            courseCode: courseDetails?.course_code || '',
            courseName: courseDetails?.name || '',
            session: courseDetails?.session || '',
          },
          stats: {
            totalStudents: data.length,
            regularStudents: data.length, // No type info, so treat all as regular
            carryoverStudents: 0,
          },
          students: data.map((student: any, idx: number) => ({
            id: student.student_id || idx.toString(),
            studentId: student.student_id || '',
            name: student.name || '',
            department: student.department || '',
            level: student.level || '',
            type: 'Regular', // No type info in backend response
          })),
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch course students",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch course students",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStudents =
    courseData?.students?.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = typeFilter === "all" || student.type.toLowerCase() === typeFilter.toLowerCase()

      return matchesSearch && matchesType
    }) || []

  const totalStudents = courseData?.stats?.totalStudents || 0
  const regularStudents = courseData?.stats?.regularStudents || 0
  const carryoverStudents = courseData?.stats?.carryoverStudents || 0

  const exportToCSV = () => {
    if (!courseData || !courseData.students) return

    const headers = ["ID", "Name", "Department", "Level", "Type"]
    const rows = courseData.students.map((student) => [
      student.studentId,
      student.name,
      student.department,
      student.level.toString(),
      student.type,
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `${courseData.course.courseCode}_students_${new Date().toISOString().slice(0, 10)}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Successful",
      description: "Student list has been exported to CSV",
    })
  }

  return (
    <LecturerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">View Course Students</h1>
          <p className="text-muted-foreground">View all students enrolled in your course</p>
        </div>

        {/* Course Information */}
        {courseData && (
          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-950">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span>
                      {courseData.course.courseName} ({courseData.course.courseCode})
                    </span>
                  </CardTitle>
                  <CardDescription className="mt-1">{courseData.course.session}</CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {totalStudents} Students
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Total Students</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{totalStudents}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">Regular Students</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{regularStudents}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium">Carryover Students</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{carryoverStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Search & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="carryover">Carryover</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => course_id && fetchCourseStudents(course_id)}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={exportToCSV} disabled={!courseData || !courseData.students}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Student List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading students...</span>
          </div>
        ) : !course_id ? (
          <Alert>
            <AlertDescription>No course selected. Please select a course from the dashboard.</AlertDescription>
          </Alert>
        ) : !courseData ? (
          <Alert>
            <AlertDescription>Course data not available.</AlertDescription>
          </Alert>
        ) : !filteredStudents || filteredStudents.length === 0 ? (
          <Alert>
            <AlertDescription>No students found matching your search criteria.</AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Enrolled Students</span>
              </CardTitle>
              <CardDescription>
                Showing {filteredStudents.length} of {totalStudents} students
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.studentId}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell>{student.level}</TableCell>
                        <TableCell>
                          <Badge
                            variant={student.type === "Regular" ? "outline" : "secondary"}
                            className={
                              student.type === "Regular"
                                ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                                : "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                            }
                          >
                            {student.type}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile List View */}
              <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{student.name}</span>
                      <Badge
                        variant={student.type === "Regular" ? "outline" : "secondary"}
                        className={
                          student.type === "Regular"
                            ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                            : "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                        }
                      >
                        {student.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>ID:</span>
                        <span className="font-medium text-foreground">{student.studentId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Department:</span>
                        <span>{student.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Level:</span>
                        <span>{student.level}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Footer */}
        {courseData && courseData.stats && (
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Total students: {totalStudents} • Regular: {regularStudents} • Carryover: {carryoverStudents}
            </p>
          </div>
        )}
      </div>
    </LecturerLayout>
  )
}
