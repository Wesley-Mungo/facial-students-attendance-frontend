import { type NextRequest, NextResponse } from "next/server"

// Mock attendance data - replace with your actual database
const mockAttendanceData = {
  "1": {
    // CEF450 - Cloud Computing
    summary: {
      totalSessions: 1,
      attendanceDates: ["Second Semester 2024"],
      totalStudents: 2,
      averageAttendance: 50.0,
      highestAttendance: 100.0,
      lowestAttendance: 0.0,
    },
    studentAttendance: [
      {
        studentId: "FE21A159",
        studentName: "Kanjo Daryl",
        attendanceRecords: {
          "Second Semester 2024": "Absent",
        },
        presentCount: 0,
        attendancePercentage: 0.0,
      },
      {
        studentId: "FE21A160",
        studentName: "Wesley Mungo",
        attendanceRecords: {
          "Second Semester 2024": "Present",
        },
        presentCount: 1,
        attendancePercentage: 100.0,
      },
    ],
  },
  "2": {
    // ENG301 - Introduction to ML/AI
    summary: {
      totalSessions: 3,
      attendanceDates: ["2024-01-15", "2024-01-22", "2024-01-29"],
      totalStudents: 4,
      averageAttendance: 75.0,
      highestAttendance: 100.0,
      lowestAttendance: 33.33,
    },
    studentAttendance: [
      {
        studentId: "FE21A160",
        studentName: "Wesley Mungo",
        attendanceRecords: {
          "2024-01-15": "Present",
          "2024-01-22": "Present",
          "2024-01-29": "Present",
        },
        presentCount: 3,
        attendancePercentage: 100.0,
      },
      {
        studentId: "FE21A159",
        studentName: "Kanjo Daryl",
        attendanceRecords: {
          "2024-01-15": "Present",
          "2024-01-22": "Absent",
          "2024-01-29": "Present",
        },
        presentCount: 2,
        attendancePercentage: 66.67,
      },
      {
        studentId: "FE21A158",
        studentName: "John Smith",
        attendanceRecords: {
          "2024-01-15": "Present",
          "2024-01-22": "Present",
          "2024-01-29": "Absent",
        },
        presentCount: 2,
        attendancePercentage: 66.67,
      },
      {
        studentId: "FE21A157",
        studentName: "Jane Doe",
        attendanceRecords: {
          "2024-01-15": "Absent",
          "2024-01-22": "Present",
          "2024-01-29": "Absent",
        },
        presentCount: 1,
        attendancePercentage: 33.33,
      },
    ],
  },
}

export async function GET(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const courseId = params.courseId

    // In a real app, fetch from your database
    const attendanceData = mockAttendanceData[courseId as keyof typeof mockAttendanceData]

    if (!attendanceData) {
      return NextResponse.json({ error: "No attendance data found for this course" }, { status: 404 })
    }

    return NextResponse.json(attendanceData)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance summary" }, { status: 500 })
  }
}
