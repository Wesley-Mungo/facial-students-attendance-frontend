import { type NextRequest, NextResponse } from "next/server"

// Mock students data
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

export async function POST(request: NextRequest) {
  try {
    const { courseId, selectedStudents, subject, message } = await request.json()

    // Get students for the course
    const courseStudents = mockStudents[courseId as keyof typeof mockStudents] || []
    const selectedStudentData = courseStudents.filter((s) => selectedStudents.includes(s.id))

    // Simulate sending emails
    const emailStatuses = []

    for (const student of selectedStudentData) {
      // Simulate email sending delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Simulate success/failure (90% success rate)
      const success = Math.random() > 0.1

      emailStatuses.push({
        studentId: student.id,
        studentName: student.name,
        email: student.email,
        status: success ? "sent" : "failed",
        error: success ? undefined : "SMTP connection failed",
      })
    }

    return NextResponse.json({
      success: true,
      emailStatuses,
      summary: {
        attempted: emailStatuses.length,
        sent: emailStatuses.filter((s) => s.status === "sent").length,
        failed: emailStatuses.filter((s) => s.status === "failed").length,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500 })
  }
}
