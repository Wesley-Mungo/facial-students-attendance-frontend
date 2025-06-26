import { type NextRequest, NextResponse } from "next/server"

// Mock attendance data - replace with your actual database
const mockAttendanceData = {
  "2": {
    // CEF500 - Internship Activity
    course: {
      id: "2",
      courseCode: "CEF500",
      courseName: "Internship Activity",
      session: "First Semester 2024",
    },
    sessions: [
      {
        id: "session_1",
        date: "2025-06-03",
        sessionNumber: 1,
        totalPresent: 2,
      },
      {
        id: "session_2",
        date: "2025-06-04",
        sessionNumber: 2,
        totalPresent: 3,
      },
      {
        id: "session_3",
        date: "2025-06-04",
        sessionNumber: 3,
        totalPresent: 2,
      },
      {
        id: "session_4",
        date: "2025-06-04",
        sessionNumber: 4,
        totalPresent: 1,
      },
      {
        id: "session_5",
        date: "2025-06-04",
        sessionNumber: 5,
        totalPresent: 2,
      },
      {
        id: "session_6",
        date: "2025-06-11",
        sessionNumber: 6,
        totalPresent: 2,
      },
      {
        id: "session_7",
        date: "2025-06-11",
        sessionNumber: 7,
        totalPresent: 3,
      },
    ],
  },
  "1": {
    // ENG301 - Introduction to ML/AI
    course: {
      id: "1",
      courseCode: "CEF401",
      courseName: "Introduction to ML/AI",
      session: "Second Semester 2024",
    },
    sessions: [
      {
        id: "session_ml_1",
        date: "2025-01-15",
        sessionNumber: 1,
        totalPresent: 4,
      },
      {
        id: "session_ml_2",
        date: "2025-01-22",
        sessionNumber: 2,
        totalPresent: 3,
      },
    ],
  },
}

export async function GET(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const courseId = params.courseId

    // Get attendance data for the course
    const attendanceData = mockAttendanceData[courseId as keyof typeof mockAttendanceData]

    if (!attendanceData) {
      return NextResponse.json({ error: "No attendance data found for this course" }, { status: 404 })
    }

    return NextResponse.json(attendanceData)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 })
  }
}
