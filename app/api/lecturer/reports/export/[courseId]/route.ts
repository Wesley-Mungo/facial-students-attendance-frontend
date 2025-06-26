import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { courseCode, courseName, reportData } = await request.json()
    const courseId = params.courseId

    // In a real app, you would use a library like 'xlsx' to create the Excel file
    // For now, we'll create a CSV-like content that can be opened in Excel

    const headers = ["SessionDate", "ID", "Name", ...reportData.sessionDates, "PresentCount", "AttendancePercentage"]

    const rows = reportData.attendanceRecords.map((record: any) => [
      "", // SessionDate column (empty for data rows)
      record.studentId,
      record.name,
      ...reportData.sessionDates.map((date: string) => record.attendanceByDate[date]),
      record.presentCount,
      record.attendancePercentage.toFixed(6),
    ])

    // Create Excel-compatible content
    const excelContent = `ATTENDANCE REPORT: ${courseName} (${courseCode})
================================================================================
Total Sessions: ${reportData.totalSessions}

${headers.join("\t")}
${rows.map((row: any[]) => row.join("\t")).join("\n")}

Report generated: ${new Date().toLocaleString()}`

    // Convert to blob
    const blob = new Blob([excelContent], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="attendance_report_${courseCode}_${new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/[:-]/g, "")
          .replace("T", "_")}.xlsx"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to export report" }, { status: 500 })
  }
}
