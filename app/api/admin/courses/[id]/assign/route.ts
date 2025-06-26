import { type NextRequest, NextResponse } from "next/server"

// Mock data - this should match your courses data
const mockCourses = [
  {
    id: "1",
    courseCode: "CEF450",
    courseName: "Cloud Computing",
    session: "Second Semester 2024",
    lecturerId: "3",
    lecturerName: "Dr Ines",
    studentCount: 28,
  },
  {
    id: "2",
    courseCode: "ENG301",
    courseName: "Introduction to ML/AI",
    session: "Second Semester 2024",
    lecturerId: "1",
    lecturerName: "Dr Sop",
    studentCount: 45,
  },
  {
    id: "3",
    courseCode: "CEF420",
    courseName: "Mobile Programming",
    session: "First Semester 2023",
    lecturerId: "2",
    lecturerName: "Dr Valery",
    studentCount: 32,
  },
  {
    id: "4",
    courseCode: "CEF500",
    courseName: "Internship Activity",
    session: "First Semester 2024",
    lecturerId: "1",
    lecturerName: "Dr Sop",
    studentCount: 38,
  },
  {
    id: "5",
    courseCode: "CEF 390",
    courseName: "Digital Image",
    session: "Second Semester 2025",
    lecturerId: "4",
    lecturerName: "Dr Ashle",
    studentCount: 25,
  },
  {
    id: "6",
    courseCode: "CEF427",
    courseName: "Human Computing Interface",
    session: "Second Semester 2024",
    lecturerId: "5",
    lecturerName: "Dr Nguti",
    studentCount: 0,
  },
]

const mockLecturers = [
  {
    id: "1",
    lecturerId: "L100",
    fullName: "Dr Sop",
    department: "Computer Engineering",
    email: "chowesleymungo@gmail.com",
  },
  {
    id: "2",
    lecturerId: "L101",
    fullName: "Dr Valery",
    department: "Computer Engineering",
    email: "valery@gmail.com",
  },
  {
    id: "3",
    lecturerId: "L102",
    fullName: "Dr Ines",
    department: "Computer Engineering",
    email: "ines@gmail.com",
  },
  {
    id: "4",
    lecturerId: "L104",
    fullName: "Dr Ashle",
    department: "Computer Engineering",
    email: "ashle@gmail.com",
  },
  {
    id: "5",
    lecturerId: "L10",
    fullName: "Dr Nguti",
    department: "Computer Engineering",
    email: "nguti@gmail.com",
  },
]

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { lecturerId } = await request.json()
    const courseId = params.id

    // Find the course
    const courseIndex = mockCourses.findIndex((c) => c.id === courseId)
    if (courseIndex === -1) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Find the lecturer
    const lecturer = mockLecturers.find((l) => l.id === lecturerId)
    if (!lecturer) {
      return NextResponse.json({ error: "Lecturer not found" }, { status: 404 })
    }

    // Update the course with lecturer assignment
    mockCourses[courseIndex] = {
      ...mockCourses[courseIndex],
      lecturerId: lecturer.id,
      lecturerName: lecturer.fullName,
    }

    return NextResponse.json({
      course: mockCourses[courseIndex],
      message: `Successfully assigned ${mockCourses[courseIndex].courseName} to ${lecturer.fullName}`,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to assign course" }, { status: 500 })
  }
}
