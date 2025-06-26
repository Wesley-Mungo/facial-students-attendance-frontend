import { type NextRequest, NextResponse } from "next/server"

// Mock session records data - replace with your actual database
const mockSessionRecords = {
  session_6: [
    // June 11, 2025 session
    {
      id: "record_1",
      studentId: "FE21A160",
      studentName: "Wesley Mungo",
      timeRecorded: "2025-06-11T16:05:57",
      status: "Present" as const,
    },
    {
      id: "record_2",
      studentId: "FE21A140",
      studentName: "Brendan",
      timeRecorded: "2025-06-11T16:06:04",
      status: "Present" as const,
    },
  ],
  session_7: [
    // June 11, 2025 session (later)
    {
      id: "record_3",
      studentId: "FE21A160",
      studentName: "Wesley Mungo",
      timeRecorded: "2025-06-11T17:15:23",
      status: "Present" as const,
    },
    {
      id: "record_4",
      studentId: "FE21A140",
      studentName: "Brendan",
      timeRecorded: "2025-06-11T17:15:45",
      status: "Present" as const,
    },
    {
      id: "record_5",
      studentId: "FE21A159",
      studentName: "Kanjo Daryl",
      timeRecorded: "2025-06-11T17:16:12",
      status: "Present" as const,
    },
  ],
  session_1: [
    {
      id: "record_6",
      studentId: "FE21A160",
      studentName: "Wesley Mungo",
      timeRecorded: "2025-06-03T14:30:15",
      status: "Present" as const,
    },
    {
      id: "record_7",
      studentId: "FE21A159",
      studentName: "Kanjo Daryl",
      timeRecorded: "2025-06-03T14:31:22",
      status: "Present" as const,
    },
  ],
  session_2: [
    {
      id: "record_8",
      studentId: "FE21A160",
      studentName: "Wesley Mungo",
      timeRecorded: "2025-06-04T09:15:30",
      status: "Present" as const,
    },
    {
      id: "record_9",
      studentId: "FE21A140",
      studentName: "Brendan",
      timeRecorded: "2025-06-04T09:16:45",
      status: "Present" as const,
    },
    {
      id: "record_10",
      studentId: "FE21A159",
      studentName: "Kanjo Daryl",
      timeRecorded: "2025-06-04T09:17:12",
      status: "Present" as const,
    },
  ],
}

export async function GET(request: NextRequest, { params }: { params: { courseId: string; sessionId: string } }) {
  try {
    const { courseId, sessionId } = params

    // Get session records
    const records = mockSessionRecords[sessionId as keyof typeof mockSessionRecords] || []

    return NextResponse.json({ records })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch session records" }, { status: 500 })
  }
}
