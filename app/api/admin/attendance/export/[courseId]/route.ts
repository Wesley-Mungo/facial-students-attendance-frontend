import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { courseCode, courseName, session } = await request.json()
    const courseId = params.courseId

    // In a real app, you would:
    // 1. Fetch the actual attendance data from your database
    // 2. Use a library like 'xlsx' to create the Excel file
    // 3. Return the file as a blob

    // For now, we'll create a mock Excel file content
    const mockExcelContent = `Course: ${courseName} (${courseCode})
Session: ${session}
Generated: ${new Date().toLocaleString()}

Student ID,Student Name,Attendance Percentage,Present Count
FE21A159,Kanjo Daryl,0.0%,0
FE21A160,Wesley Mungo,100.0%,1`

    // Convert to blob (in a real app, you'd use xlsx library)
    const blob = new Blob([mockExcelContent], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="attendance_summary_${courseCode}_${session}_${new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/:/g, "")}.xlsx"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to export attendance report" }, { status: 500 })
  }
}
