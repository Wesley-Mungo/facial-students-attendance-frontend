"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { LecturerLayout } from "@/components/layouts/lecturer-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, RefreshCw, Download, Eye, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  timeRecorded: string
  status: "Present" | "Absent"
  date: string
}

export default function AttendanceRecords() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const searchParams = useSearchParams()
  const courseId = searchParams.get("course") || ""
  const { toast } = useToast()

  useEffect(() => {
    if (courseId) {
      fetchAttendanceRecords(courseId)
    } else {
      setIsLoading(false)
    }
  }, [courseId])

  const fetchAttendanceRecords = async (courseId: string) => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('auth_token');
      const url = `http://127.0.0.1:8000/api/v1/notifications/attendance-records/${courseId}`;
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json()
        // Map backend fields to frontend shape
        const mappedRecords = Array.isArray(data)
          ? data.map((record) => ({
              id: `${record.student_id}_${record.timestamp}`,
              studentId: record.student_id,
              studentName: record.name,
              timeRecorded: record.timestamp,
              status: record.status,
              date: record.date,
            }))
          : []
        setAttendanceRecords(mappedRecords)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch attendance records",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch attendance records",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = () => {
    if (attendanceRecords.length === 0) return

    const headers = ["ID", "Name", "Time", "Status"]
    const rows = attendanceRecords.map((record) => [
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
    link.setAttribute("download", `attendance_records_${courseId}.csv`)
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

  // Get unique dates from attendance records
  const uniqueDates = Array.from(new Set(attendanceRecords.map(r => r.date)))

  // Filter records for selected date and Present status
  const filteredRecords = selectedDate
    ? attendanceRecords.filter(r => r.date === selectedDate && r.status === "Present")
    : []

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

  return (
    <LecturerLayout>
      <div className="space-y-8 p-6">
                   {/* Header Section */}
                   <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-university-primary via-blue-600 to-purple-600 p-8 text-white">
                     <div className="absolute inset-0 bg-black/10"></div>
                     <div className="relative z-10">
                       <div className="flex items-center justify-between">
                         <div>
                             <h1 className="text-4xl font-bold mb-2">Attendance Records</h1>
                           <p className="text-blue-100 text-lg">Select a date to view students marked present</p>
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
        {/* Date selection */}
        <Card className="relative overflow-hidden border-0 shadow-university hover:shadow-university-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
            <CardTitle>Select Attendance Date</CardTitle>
            <CardDescription>Click a date to view students present on that day.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {uniqueDates.length > 0 ? (
                uniqueDates.map(date => (
                  <Button
                    key={date}
                    variant={selectedDate === date ? "default" : "outline"}
                    onClick={() => setSelectedDate(date)}
                  >
                    {formatDate(date)}
                  </Button>
                ))
              ) : (
                <span className="text-muted-foreground">No attendance dates found.</span>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Students present for selected date */}
        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle>Students Present on {formatDate(selectedDate)}</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRecords.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Time Recorded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell>{record.studentId}</TableCell>
                        <TableCell>{record.studentName}</TableCell>
                        <TableCell className="font-mono text-sm">{formatTime(record.timeRecorded)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <Eye className="h-4 w-4" />
                  <AlertDescription>No students marked present on this date.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </LecturerLayout>
  )
}
