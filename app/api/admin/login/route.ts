import { type NextRequest, NextResponse } from "next/server"

// In a real application, you would store these in a secure database with hashed passwords
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || "admin@university.edu",
  password: process.env.ADMIN_PASSWORD || "admin123",
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Check credentials
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      // In a real app, you'd create a JWT token or session
      const adminData = {
        email: email,
        role: "admin",
        loginTime: new Date().toISOString(),
        permissions: ["manage_students", "manage_lecturers", "manage_courses", "view_reports"],
      }

      return NextResponse.json({
        success: true,
        message: "Login successful",
        admin: adminData,
      })
    } else {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
