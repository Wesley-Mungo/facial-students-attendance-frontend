"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { LecturerLayout } from "@/components/layouts/lecturer-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Calendar, Clock, Users, RefreshCw, Download, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: string
  courseCode: string
  courseName: string
  session: string
}

interface AttendanceSession {
  id: string
  date: string
  sessionNumber: number
  totalPresent: number
}

interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  timeRecorded: string
  status: "Present" | "Absent"
}

interface AttendanceData {
  course: Course
  sessions: AttendanceSession[]
  selectedSessionRecords?: AttendanceRecord[]
}

export default function AttendanceRecords() {
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingRecords, setIsLoadingRecords] = useState(false)
  const searchParams = useSearchParams()
  const courseId = searchParams.get("course") || ""
  const { toast } = useToast()

  useEffect(() => {
    if (courseId) {
      fetchAttendanceData(courseId)
    } else {
      setIsLoading(false)
    }
  }, [courseId])

  const fetchAttendanceData = async (courseId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/lecturer/attendance/records/${courseId}`)
      if (response.ok) {
        const data = await response.json()
        setAttendanceData(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch attendance data",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch attendance data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSessionRecords = async (sessionId: string) => {
    if (!courseId || !sessionId) return

    try {
      setIsLoadingRecords(true)
      const response = await fetch(`/api/lecturer/attendance/records/${courseId}/sessions/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setAttendanceData((prev) => (prev ? { ...prev, selectedSessionRecords: data.records } : null))
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch session records",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch session records",
        variant: "destructive",
      })
    } finally {
      setIsLoadingRecords(false)
    }
  }

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId)
    fetchSessionRecords(sessionId)
  }

  const exportSessionData = () => {
    if (!attendanceData?.selectedSessionRecords || !attendanceData.course) return

    const selectedSession = attendanceData.sessions.find((s) => s.id === selectedSessionId)
    if (!selectedSession) return

    const headers = ["ID", "Name", "Time", "Status"]
    const rows = attendanceData.selectedSessionRecords.map((record) => [
      record.studentId,
      record.studentName,
      record.timeRecorded,
      record.status,
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `${attendanceData.course.courseCode}_attendance_${selectedSession.date.replace(/[^0-9]/g, "")}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Successful",
      description: "Attendance records exported to CSV",
    })
  }

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    } catch {
      return timeString
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <LecturerLayout>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading attendance records...</span>
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

  if (!attendanceData) {
    return (
      <LecturerLayout>
        <Alert variant="destructive">
          <AlertDescription>Failed to load attendance data.</AlertDescription>
        </Alert>
      </LecturerLayout>
    )
  }

  return (
    <LecturerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Attendance Records</h1>
          <p className="text-muted-foreground">View detailed attendance records for your course sessions</p>
        </div>

        {/* Course Information */}
        <Card>
          <CardHeader className="bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span>
                    {attendanceData.course.courseName} ({attendanceData.course.courseCode})
                  </span>
                </CardTitle>
                <CardDescription className="mt-1">{attendanceData.course.session}</CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {attendanceData.sessions.length} Sessions
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Sessions Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Attendance Sessions</span>
            </CardTitle>
            <CardDescription>Select a session to view detailed attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attendanceData.sessions.map((session, index) => (
                <Card
                  key={session.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedSessionId === session.id ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950" : ""
                  }`}
                  onClick={() => handleSessionSelect(session.id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Session {index + 1}</span>
                        <Badge variant="outline">{formatDate(session.date)}</Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{session.totalPresent} students present</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {attendanceData.sessions.length === 0 && (
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>No attendance sessions found for this course.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Session Records */}
        {selectedSessionId && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Attendance Records</span>
                  </CardTitle>
                  <CardDescription>
                    {(() => {
                      const session = attendanceData.sessions.find((s) => s.id === selectedSessionId)
                      return session ? `Session on ${formatDate(session.date)}` : "Session details"
                    })()}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={exportSessionData}
                  disabled={
                    !attendanceData.selectedSessionRecords || attendanceData.selectedSessionRecords.length === 0
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingRecords ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading session records...</span>
                </div>
              ) : attendanceData.selectedSessionRecords && attendanceData.selectedSessionRecords.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-32">Student ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="w-40">Time Recorded</TableHead>
                          <TableHead className="w-24">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceData.selectedSessionRecords.map((record, index) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.studentId}</TableCell>
                            <TableCell>{record.studentName}</TableCell>
                            <TableCell className="font-mono text-sm">{formatTime(record.timeRecorded)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={record.status === "Present" ? "default" : "destructive"}
                                className={
                                  record.status === "Present"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : ""
                                }
                              >
                                {record.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {attendanceData.selectedSessionRecords.map((record, index) => (
                      <Card key={record.id}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{record.studentName}</span>
                              <Badge
                                variant={record.status === "Present" ? "default" : "destructive"}
                                className={
                                  record.status === "Present"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : ""
                                }
                              >
                                {record.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex justify-between">
                                <span>ID:</span>
                                <span className="font-medium text-foreground">{record.studentId}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Time:</span>
                                <span className="font-mono">{formatTime(record.timeRecorded)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span>Total Records: {attendanceData.selectedSessionRecords.length}</span>
                      <span>
                        Present: {attendanceData.selectedSessionRecords.filter((r) => r.status === "Present").length} |
        
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <Alert>
                  <Eye className="h-4 w-4" />
                  <AlertDescription>No attendance records found for this session.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!selectedSessionId && attendanceData.sessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>• Click on any session card above to view detailed attendance records</p>
                <p>• Use the Export CSV button to download attendance data</p>
                <p>• Records show the exact time each student was marked present</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </LecturerLayout>
  )
}
