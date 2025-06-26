"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, User, CheckCircle, XCircle } from "lucide-react"

interface StudentAttendance {
  studentId: string
  studentName: string
  attendanceRecords: { [date: string]: "Present" | "Absent" }
  presentCount: number
  attendancePercentage: number
}

interface DetailedAttendanceReportProps {
  studentAttendance: StudentAttendance[]
  attendanceDates: string[]
  isLoading: boolean
}

export function DetailedAttendanceReport({
  studentAttendance,
  attendanceDates,
  isLoading,
}: DetailedAttendanceReportProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [attendanceFilter, setAttendanceFilter] = useState("all")

  const filteredStudents = studentAttendance.filter((student) => {
    const matchesSearch =
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      attendanceFilter === "all" ||
      (attendanceFilter === "good" && student.attendancePercentage >= 75) ||
      (attendanceFilter === "average" && student.attendancePercentage >= 50 && student.attendancePercentage < 75) ||
      (attendanceFilter === "poor" && student.attendancePercentage < 50)

    return matchesSearch && matchesFilter
  })

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return "text-green-600 bg-green-100 dark:bg-green-900"
    if (percentage >= 50) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900"
    return "text-red-600 bg-red-100 dark:bg-red-900"
  }

  const getAttendanceIcon = (status: "Present" | "Absent") => {
    return status === "Present" ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={attendanceFilter} onValueChange={setAttendanceFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by attendance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            <SelectItem value="good">Good (≥75%)</SelectItem>
            <SelectItem value="average">Average (50-74%)</SelectItem>
            <SelectItem value="poor">Poor (&lt;50%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredStudents.length} of {studentAttendance.length} students
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  {attendanceDates.map((date) => (
                    <TableHead key={date} className="text-center min-w-24">
                      {date}
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Present Count</TableHead>
                  <TableHead className="text-center">Attendance %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    <TableCell>{student.studentName}</TableCell>
                    {attendanceDates.map((date) => (
                      <TableCell key={date} className="text-center">
                        <div className="flex justify-center">
                          {getAttendanceIcon(student.attendanceRecords[date] || "Absent")}
                        </div>
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-medium">{student.presentCount}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={getAttendanceColor(student.attendancePercentage)}>
                        {student.attendancePercentage.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredStudents.map((student) => (
          <Card key={student.studentId}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{student.studentName}</span>
                  </div>
                  <Badge className={getAttendanceColor(student.attendancePercentage)}>
                    {student.attendancePercentage.toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">ID: {student.studentId}</div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Attendance Records:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {attendanceDates.map((date) => (
                      <div key={date} className="flex items-center justify-between text-sm">
                        <span>{date}:</span>
                        <div className="flex items-center space-x-1">
                          {getAttendanceIcon(student.attendanceRecords[date] || "Absent")}
                          <span>{student.attendanceRecords[date] || "Absent"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-sm">
                  <strong>Present Count:</strong> {student.presentCount} / {attendanceDates.length}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
