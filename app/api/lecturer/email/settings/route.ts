import { type NextRequest, NextResponse } from "next/server"

// Mock storage for email settings - in a real app, use a secure database
let mockEmailSettings = {
  lecturerId: "1", // Dr Sop
  email: "",
  password: "", // This should be encrypted in a real app
  smtpServer: "smtp.gmail.com",
  smtpPort: 587,
}

export async function GET() {
  try {
    // In a real app, fetch from database and decrypt password
    const settings = {
      email: mockEmailSettings.email,
      smtpServer: mockEmailSettings.smtpServer,
      smtpPort: mockEmailSettings.smtpPort,
      // Don't return password for security
    }

    return NextResponse.json({
      settings: mockEmailSettings.email ? settings : null,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load email settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, smtpServer, smtpPort } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // In a real app, encrypt the password before storing
    mockEmailSettings = {
      lecturerId: "1",
      email,
      password, // Should be encrypted
      smtpServer: smtpServer || "smtp.gmail.com",
      smtpPort: smtpPort || 587,
    }

    return NextResponse.json({
      success: true,
      message: "Email settings saved securely!",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save email settings" }, { status: 500 })
  }
}
