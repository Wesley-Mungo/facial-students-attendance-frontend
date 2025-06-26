import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Replace with your actual database query
    // This is just a mock implementation
    const mockLecturers = [
      {
        id: 1,
        email: "chowesleymungo@gmail.com",
        password: "password123", // In real app, this would be hashed
        name: "Dr Sop",
        courses: [
          { id: 1, name: "Introduction to ML/AI", code: "ENG301" },
          { id: 2, name: "Internship Activity", code: "CEF500" },
        ],
      },
    ]

    const lecturer = mockLecturers.find((l) => l.email === email && l.password === password)

    if (lecturer) {
      // In a real app, you'd create a JWT token or session
      const { password: _, ...lecturerData } = lecturer
      return NextResponse.json({
        success: true,
        lecturer: lecturerData,
        message: "Login successful",
      })
    } else {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
