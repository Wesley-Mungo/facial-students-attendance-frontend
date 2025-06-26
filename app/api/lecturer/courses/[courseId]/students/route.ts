import { type NextRequest, NextResponse } from "next/server"

// Mock data - replace with your actual database
const mockCourses = {
  "1": {
    id: "1",
    courseCode: "CEF401",
    courseName: "Introduction to ML/AI",
    session: "Second Semester 2024",
  },
  "2": {
    id: "2",
    courseCode: "CEF500",
    courseName: "Internship Activity",
    session: "First Semester 2024",
  },
  "3": {
    id: "3",
    courseCode: "CEF427",
    courseName: "Human Computing Interface",
    session: "Second Semester 2024",
  },
}

const mockStudents = [
  {
    id: "1",
    studentId: "FE21A160",
    name: "Wesley Mungo",
    department: "CEF",
    level: 500,
    type: "Regular",
  },
  {
    id: "2",
    studentId: "FE21A159",
    name: "Kanjo Daryl",
    department: "CEF",
    level: 500,
    type: "Regular",
  },
  {
    id: "3",
    studentId: "FE22A001",
    name: "John Smith",
    department: "CEF",
    level: 400,
    type: "Regular",
  },
  {
    id: "4",
    studentId: "FE22A011",
    name: "Daniel Green",
    department: "CEF",
    level: 400,
    type: "Regular",
  },
]

// Track enrollments with student IDs and their enrollment type
const mockEnrollments = {
  "1": [
    
    { studentId: "FE22A001", type: "Regular" },
    { studentId: "FE22A011", type: "Regular" },
  ],
  "2": [
    { studentId: "FE21A160", type: "Regular" },
    { studentId: "FE21A159", type: "Regular" },
    { studentId: "FE21A140", type: "Regular" },
  ],
  "3": [
    { studentId: "FE22A001", type: "Regular" },
    { studentId: "FE22A011", type: "Regular" },
  ], // Empty for Human Computing Interface
}

export async function POST(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const courseId = params.courseId
    const { studentId, type } = await request.json()

    // Validate required fields
    if (!studentId || !type) {
      return NextResponse.json({ error: "Student ID and type are required" }, { status: 400 })
    }

    // Check if course exists
    const course = mockCourses[courseId as keyof typeof mockCourses]
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if student is already enrolled
    const enrollments = mockEnrollments[courseId as keyof typeof mockEnrollments] || []
    const existingEnrollment = enrollments.find((e) => e.studentId === studentId)
    if (existingEnrollment) {
      return NextResponse.json({ error: "Student is already enrolled in this course" }, { status: 400 })
    }

    // Add student to course
    enrollments.push({ studentId, type })

    // In a real app, you would save this to your database
    mockEnrollments[courseId as keyof typeof mockEnrollments] = enrollments

    return NextResponse.json({
      success: true,
      message: `Student ${studentId} added to the course successfully!`,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add student to course" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const courseId = params.courseId

    // Check if course exists
    const course = mockCourses[courseId as keyof typeof mockCourses]
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Get enrolled students
    const enrollments = mockEnrollments[courseId as keyof typeof mockEnrollments] || []
    const students = enrollments
      .map((enrollment) => {
        const student = mockStudents.find((s) => s.studentId === enrollment.studentId)
        if (student) {
          return {
            ...student,
            type: enrollment.type,
          }
        }
        return null
      })
      .filter(Boolean)

    // Calculate stats
    const regularStudents = students.filter((student) => student?.type === "Regular").length
    const carryoverStudents = students.filter((student) => student?.type === "Carryover").length

    return NextResponse.json({
      course,
      stats: {
        totalStudents: students.length,
        regularStudents,
        carryoverStudents,
      },
      students,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch course details" }, { status: 500 })
  }
}
