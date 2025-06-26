"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart3, Users, Download, Eye, FileSpreadsheet, Award, GraduationCap, BookOpen } from "lucide-react"
import { AttendanceSummaryStats } from "@/components/admin/attendance-summary-stats"
import { DetailedAttendanceReport } from "@/components/admin/detailed-attendance-report"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: string
  courseCode: string
  courseName: string
  session: string
  lecturerName?: string
}

interface AttendanceSummary {
  totalSessions: number
  attendanceDates: string[]
  totalStudents: number
  averageAttendance: number
  highestAttendance: number
  lowestAttendance: number
}

interface StudentAttendance {
  studentId: string
  studentName: string
  attendanceRecords: { [date: string]: "Present" | "Absent" }
  presentCount: number
  attendancePercentage: number
}

export default function CourseAttendanceSummary() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null)
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>([])
  const [showDetailedReport, setShowDetailedReport] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("http://127.0.0.1:8000/api/v1/courses/all-courses-with-count", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        console.log("Fetched courses data:", data)
        // Map backend fields to Course interface if needed
        const mappedCourses = (Array.isArray(data) ? data : Array.isArray(data.courses) ? data.courses : []).map((c: any) => ({
          id: String(c.id || c.course_id),
          courseCode: c.course_code,
          courseName: c.name,
          session: c.session,
          lecturerName: c.lecturer_ename,
        }))
        console.log("Mapped courses:", mappedCourses)
        setCourses(mappedCourses)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      })
    }
  }

  const fetchAttendanceSummary = async (courseId: string) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://127.0.0.1:8000/api/v1/recognition/admin-attendance-summary/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json()
        console.log("Attendance summary API response:", data)
        setAttendanceSummary({
          totalSessions: data.total_sessions,
          attendanceDates: [], // No dates in your response
          totalStudents: data.students.length,
          averageAttendance: data.students.length > 0 ? data.students.reduce((sum: number, s: any) => sum + parseFloat(s.attendance_percent), 0) / data.students.length : 0,
          highestAttendance: data.students.length > 0 ? Math.max(...data.students.map((s: any) => parseFloat(s.attendance_percent))) : 0,
          lowestAttendance: data.students.length > 0 ? Math.min(...data.students.map((s: any) => parseFloat(s.attendance_percent))) : 0,
        })
        setStudentAttendance(
          data.students.map((s: any) => ({
            studentId: s.student_id,
            studentName: s.name,
            attendanceRecords: {}, // No per-date records in your response
            presentCount: s.attended,
            attendancePercentage: parseFloat(s.attendance_percent),
          }))
        )
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch attendance summary",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch attendance summary",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCourseSelect = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId)
    if (course) {
      setSelectedCourse(course)
      setShowDetailedReport(false)
      fetchAttendanceSummary(courseId)
    }
  }

  const handleExportToExcel = async () => {
    if (!selectedCourse || !attendanceSummary) return

    setIsExporting(true)
    try {
      const response = await fetch(`/api/admin/attendance/export/${selectedCourse.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode: selectedCourse.courseCode,
          courseName: selectedCourse.courseName,
          session: selectedCourse.session,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `attendance_summary_${selectedCourse.courseCode}_${selectedCourse.session}_${new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/:/g, "")}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Success",
          description: "Attendance report exported successfully",
        })
      } else {
        throw new Error("Export failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export attendance report",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="space-y-8 p-6">
          {/* Header Section - Matching Lecturer Management */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-university-primary via-university-dark to-blue-800 p-8 shadow-university-lg">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Course Attendance Summary</h1>
                  <p className="text-white/90 text-lg">
                    View detaied attendance records and statistics for each course
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2 text-white/80">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-sm">Academic Excellence</span>
                </div>
                <div className="flex items-center space-x-2 text-white/80">
                  <Award className="h-5 w-5" />
                  <span className="text-sm">Course Development</span>
                </div>
              </div>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          </div>

          {/* Course Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Select Course</span>
              </CardTitle>
              <CardDescription>Choose a course to view its attendance summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select onValueChange={handleCourseSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course, index) => (
                      <SelectItem key={course.id} value={course.id}>
                        {index + 1}. {course.courseName} ({course.courseCode}) - {course.session}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedCourse && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Selected Course:</h3>
                    <p className="text-blue-800 dark:text-blue-200">
                      {selectedCourse.courseName} ({selectedCourse.courseCode})
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{selectedCourse.session}</p>
                    {selectedCourse.lecturerName && (
                      <p className="text-sm text-blue-700 dark:text-blue-300">Lecturer: {selectedCourse.lecturerName}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          {selectedCourse && attendanceSummary && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        Attendance Summary: {selectedCourse.courseName} ({selectedCourse.courseCode})
                      </CardTitle>
                      <CardDescription>{selectedCourse.session}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowDetailedReport(!showDetailedReport)}
                        className="flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>{showDetailedReport ? "Hide" : "Show"} Detailed Report</span>
                      </Button>
                      <Button
                        onClick={handleExportToExcel}
                        disabled={isExporting}
                        className="flex items-center space-x-2"
                      >
                        {isExporting ? (
                          <>
                            <FileSpreadsheet className="h-4 w-4 animate-pulse" />
                            <span>Exporting...</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            <span>Export to Excel</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <AttendanceSummaryStats summary={attendanceSummary} isLoading={isLoading} />
                </CardContent>
              </Card>

              {/* Detailed Report */}
              {showDetailedReport && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Detailed Attendance Report</span>
                    </CardTitle>
                    <CardDescription>Individual student attendance records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DetailedAttendanceReport
                      studentAttendance={studentAttendance}
                      attendanceDates={attendanceSummary.attendanceDates}
                      isLoading={isLoading}
                    />
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* No Course Selected */}
          {!selectedCourse && (
            <Alert>
              <BarChart3 className="h-4 w-4" />
              <AlertDescription>Please select a course to view its attendance summary.</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
