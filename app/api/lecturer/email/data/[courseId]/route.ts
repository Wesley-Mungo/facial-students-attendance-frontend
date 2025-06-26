import { type NextRequest, NextResponse } from "next/server"

// Mock data
const mockCourses = {
  "3": {
    id: "3",
    courseCode: "CEF420",
    courseName: "Mobile Programming ",
    session: "First Semester 2023",
  },
  "2": {
    id: "2",
    courseCode: "CEF500",
    courseName: "Internship Activity",
    session: "First Semester 2024",
  },
}

const mockLecturer = {
  name: "Dr Valery",
  email: "valery@gmail.com",
}

const mockStudents = {
  "3": [
    {
      id: "1",
      studentId: "FE21A160",
      name: "Wesley Mungo",
      email: "wesleymungo808@gmail.com",
      department: "CEF",
      level: 500,
    },
  ],
  "2": [
    {
      id: "1",
      studentId: "FE21A160",
      name: "Wesley Mungo",
      email: "wesleymungo808@gmail.com",
      department: "CEF",
      level: 500,
    },
    {
      id: "2",
      studentId: "FE21A159",
      name: "Kanjo Daryl",
      email: "chrismaxbrown0123456789@gmail.com",
      department: "CEF",
      level: 500,
    },
    {
      id: "3",
      studentId: "FE21A140",
      name: "Brendan",
      email: "brendan@gmail.com",
      department: "CEF",
      level: 500,
    },
  ],
}

// Check if email settings exist (from previous API)
const hasEmailSettings = true // Simulated - in real app, check database

export async function GET(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const courseId = params.courseId

    const course = mockCourses[courseId as keyof typeof mockCourses]
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const students = mockStudents[courseId as keyof typeof mockStudents] || []

    return NextResponse.json({
      course,
      lecturer: mockLecturer,
      students,
      hasEmailSettings,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load email data" }, { status: 500 })
  }
}
