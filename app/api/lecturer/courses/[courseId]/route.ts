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

export async function GET(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const courseId = params.courseId

    // Check if course exists
    const course = mockCourses[courseId as keyof typeof mockCourses]
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ course })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch course details" }, { status: 500 })
  }
}
