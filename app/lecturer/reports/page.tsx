"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { LecturerLayout } from "@/components/layouts/lecturer-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, FileText, Download, Users, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: string
  courseCode: string
  courseName: string
  session: string
  department: string
  level: number
}

interface StudentMatch {
  studentId: string
  name: string
  department: string
  level: number
  matched: boolean
  type: "Regular" | "Carryover"
}

interface AttendanceRecord {
  studentId: string
  name: string
  attendanceByDate: { [date: string]: "Present" | "Absent" }
  presentCount: number
  attendancePercentage: number
}

interface ReportData {
  course: Course
  totalSessions: number
  sessionDates: string[]
  studentMatches: StudentMatch[]
  attendanceRecords: AttendanceRecord[]
  stats: {
    totalStudentsInDB: number
    matchedRegularStudents: number
    carryoverStudents: number
    notMatchedStudents: number
  }
}

export default function AttendanceReport() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const searchParams = useSearchParams()
  const courseId = searchParams.get("course") || ""
  const { toast } = useToast()

  useEffect(() => {
    if (courseId) {
      generateReport(courseId)
    } else {
      setIsLoading(false)
    }
  }, [courseId])

  const generateReport = async (courseId: string) => {
    try {
      setIsLoading(true)
      setIsGenerating(true)

      const response = await fetch(`/api/lecturer/reports/generate/${courseId}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
        toast({
          title: "Report Generated",
          description: "Attendance report has been successfully generated",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to generate report",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate attendance report",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsGenerating(false)
    }
  }

  const exportToExcel = async () => {
    if (!reportData) return

    try {
      setIsExporting(true)

      const response = await fetch(`/api/lecturer/reports/export/${courseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode: reportData.course.courseCode,
          courseName: reportData.course.courseName,
          reportData: reportData,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `attendance_report_${reportData.course.courseCode}_${new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/[:-]/g, "")
          .replace("T", "_")}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Export Successful",
          description: "Attendance report exported to Excel successfully",
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

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return "text-green-600 bg-green-100 dark:bg-green-900"
    if (percentage >= 50) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900"
    return "text-red-600 bg-red-100 dark:bg-red-900"
  }

  if (isLoading) {
    return (
      <LecturerLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Generate Attendance Report</h1>
            <p className="text-muted-foreground">Creating comprehensive attendance report...</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Generating Report...</p>
                    <p className="text-sm text-muted-foreground">
                      {isGenerating ? "Processing attendance data and matching students..." : "Loading..."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </LecturerLayout>
    )
  }

  if (!courseId) {
    return (
      <LecturerLayout>
        <Alert>
          <AlertDescription>No course selected. Please select a course from the dashboard.</AlertDescription>
        </Alert>
      </LecturerLayout>
    )
  }

  if (!reportData) {
    return (
      <LecturerLayout>
        <Alert variant="destructive">
          <AlertDescription>Failed to generate attendance report.</AlertDescription>
        </Alert>
      </LecturerLayout>
    )
  }

  return (
    <LecturerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Attendance Report</h1>
          <p className="text-muted-foreground">Comprehensive attendance analysis and student matching</p>
        </div>

        {/* Course Information */}
        <Card>
          <CardHeader className="bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span>
                    {reportData.course.courseName} ({reportData.course.courseCode})
                  </span>
                </CardTitle>
                <CardDescription className="mt-1">
                  {reportData.course.session} • Seeking Dept: {reportData.course.department} • Level:{" "}
                  {reportData.course.level}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {reportData.totalSessions} Sessions
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Student Matching Summary */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Student Matching Summary</span>
              </CardTitle>
              <CardDescription>Student enrollment validation results</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Regular Students</span>
                </div>
                <p className="text-2xl font-bold mt-2">{reportData.stats.matchedRegularStudents}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">Carryover Students</span>
                </div>
                <p className="text-2xl font-bold mt-2">{reportData.stats.carryoverStudents}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Total Offering Course</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {reportData.stats.matchedRegularStudents + reportData.stats.carryoverStudents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Report Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Attendance Report</span>
                </CardTitle>
                <CardDescription>Detailed attendance records for {reportData.totalSessions} sessions</CardDescription>
              </div>
              <Button onClick={exportToExcel} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">ID</TableHead>
                    <TableHead>Name</TableHead>
                    {reportData.sessionDates.map((date) => (
                      <TableHead key={date} className="text-center min-w-24">
                        {date}
                      </TableHead>
                    ))}
                    <TableHead className="text-center">Present Count</TableHead>
                    <TableHead className="text-center">Attendance %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.attendanceRecords.map((record, index) => (
                    <TableRow key={record.studentId}>
                      <TableCell className="font-medium">{record.studentId}</TableCell>
                      <TableCell>{record.name}</TableCell>
                      {reportData.sessionDates.map((date) => (
                        <TableCell key={date} className="text-center">
                          <Badge
                            variant={record.attendanceByDate[date] === "Present" ? "default" : "destructive"}
                            className={
                              record.attendanceByDate[date] === "Present"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }
                          >
                            {record.attendanceByDate[date]}
                          </Badge>
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-medium">{record.presentCount}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={getAttendanceColor(record.attendancePercentage)}>
                          {record.attendancePercentage.toFixed(2)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {reportData.attendanceRecords.map((record) => (
                <div key={record.studentId} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{record.name}</span>
                        <p className="text-sm text-muted-foreground">{record.studentId}</p>
                      </div>
                      <Badge className={getAttendanceColor(record.attendancePercentage)}>
                        {record.attendancePercentage.toFixed(1)}%
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Attendance by Session:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {reportData.sessionDates.map((date) => (
                          <div key={date} className="flex items-center justify-between text-sm">
                            <span>{date}:</span>
                            <Badge
                              variant={record.attendanceByDate[date] === "Present" ? "default" : "destructive"}
                              className={
                                record.attendanceByDate[date] === "Present"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }
                            >
                              {record.attendanceByDate[date]}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm">
                      <strong>Present Count:</strong> {record.presentCount} / {reportData.totalSessions}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {reportData.attendanceRecords.filter((r) => r.attendancePercentage >= 75).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Good Attendance (≥75%)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {
                      reportData.attendanceRecords.filter(
                        (r) => r.attendancePercentage >= 50 && r.attendancePercentage < 75,
                      ).length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Average Attendance (50-74%)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {reportData.attendanceRecords.filter((r) => r.attendancePercentage < 50).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Poor Attendance (&lt;50%)</p>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Report generated on {new Date().toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </LecturerLayout>
  )
}
