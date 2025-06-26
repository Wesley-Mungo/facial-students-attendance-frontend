import { type NextRequest, NextResponse } from "next/server"

// Mock data - replace with your actual database
const mockCourses = {
  "2": {
    id: "2",
    courseCode: "CEF500",
    courseName: "Internship Activity",
    session: "First Semester 2024",
    department: "CEF",
    level: 500,
  },
  "1": {
    id: "1",
    courseCode: "ENG301",
    courseName: "Introduction to ML/AI",
    session: "Second Semester 2024",
    department: "Computer Engineering",
    level: 400,
  },
}

// Mock students database
const mockStudentsDB = [
  {
    studentId: "FE21A160",
    name: "Wesley Mungo",
    department: "CEF",
    level: 500,
  },
  {
    studentId: "FE21A159",
    name: "Kanjo Daryl",
    department: "CEF",
    level: 500,
  },
  {
    studentId: "FE21A140",
    name: "Brendan",
    department: "CEF",
    level: 500,
  },
  {
    studentId: "FE23A109",
    name: "NDIWANE TIMOTHY",
    department: "CEF",
    level: 300,
  },
]

// Mock attendance data
const mockAttendanceData = {
  "2": {
    sessionDates: ["2025-06-03", "2025-06-04", "2025-06-11"],
    records: [
      {
        studentId: "FE21A140",
        name: "Brendan",
        attendanceByDate: {
          "2025-06-03": "Absent",
          "2025-06-04": "Absent",
          "2025-06-11": "Present",
        },
        presentCount: 1,
        attendancePercentage: 33.333333,
      },
      {
        studentId: "FE21A159",
        name: "Kanjo Daryl",
        attendanceByDate: {
          "2025-06-03": "Absent",
          "2025-06-04": "Absent",
          "2025-06-11": "Absent",
        },
        presentCount: 0,
        attendancePercentage: 0.0,
      },
      {
        studentId: "FE21A160",
        name: "Wesley Mungo",
        attendanceByDate: {
          "2025-06-03": "Present",
          "2025-06-04": "Present",
          "2025-06-11": "Present",
        },
        presentCount: 3,
        attendancePercentage: 100.0,
      },
    ],
  },
}

export async function GET(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const courseId = params.courseId

    // Get course details
    const course = mockCourses[courseId as keyof typeof mockCourses]
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Get attendance data
    const attendanceData = mockAttendanceData[courseId as keyof typeof mockAttendanceData]
    if (!attendanceData) {
      return NextResponse.json({ error: "No attendance data found" }, { status: 404 })
    }

    // Student matching logic
    const studentMatches = mockStudentsDB.map((student) => {
      const matched = student.department === course.department && student.level === course.level
      return {
        studentId: student.studentId,
        name: student.name,
        department: student.department,
        level: student.level,
        matched,
        type: matched ? "Regular" : ("Carryover" as const),
      }
    })

    // Calculate stats
    const stats = {
      totalStudentsInDB: mockStudentsDB.length,
      matchedRegularStudents: studentMatches.filter((s) => s.matched).length,
      carryoverStudents: 0, // No carryover students in this example
      notMatchedStudents: studentMatches.filter((s) => !s.matched).length,
    }

    const reportData = {
      course,
      totalSessions: attendanceData.sessionDates.length,
      sessionDates: attendanceData.sessionDates,
      studentMatches,
      attendanceRecords: attendanceData.records,
      stats,
    }

    return NextResponse.json(reportData)
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
