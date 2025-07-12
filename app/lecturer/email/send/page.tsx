"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { LecturerLayout } from "@/components/layouts/lecturer-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, Mail, Send, Users, CheckCircle, XCircle, Loader2, Settings, Clock, FileText, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Course {
  id: string
  courseCode: string
  courseName: string
  session: string
}

interface Student {
  id: string
  studentId: string
  name: string
  email: string
  department: string
  level: number
}

interface EmailStatus {
  studentId: string
  studentName: string
  email: string
  status: "pending" | "sent" | "failed"
  error?: string
}

interface SendEmailData {
  course: Course
  lecturer: {
    name: string
    email: string
  }
  students: Student[]
  hasEmailSettings: boolean
}

export default function SendAttendanceEmail() {
  const [emailData, setEmailData] = useState<SendEmailData | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [emailStatuses, setEmailStatuses] = useState<EmailStatus[]>([])
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sendingComplete, setSendingComplete] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const searchParams = useSearchParams()
  const courseId = searchParams.get("course") || ""
  const { toast } = useToast()

  useEffect(() => {
    if (courseId) {
      loadEmailData(courseId)
    } else {
      setIsLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    if (emailData?.course) {
      setEmailSubject(`Attendance Report - ${emailData.course.courseName} (${emailData.course.courseCode})`)
      setEmailMessage(
        `Dear Student,

I hope this email finds you well.

Please find your attendance report for ${emailData.course.courseName} (${emailData.course.courseCode}) - ${emailData.course.session}.

This report contains your attendance records for all sessions conducted so far. Please review your attendance status and contact me if you have any questions or concerns.

Important Notes:
• Regular attendance is crucial for your academic success
• If you have any valid reasons for absences, please discuss them with me
• Make sure to attend future sessions to improve your attendance percentage

If you need any clarification regarding your attendance records, feel free to reach out to me during office hours or via email.

Best regards,
${emailData.lecturer.name}
${emailData.lecturer.email}

---
This is an automated message from the Facial Attendance System.`,
      )
    }
  }, [emailData])

  const loadEmailData = async (courseId: string) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token") // or get from cookies/context as needed
      if (process.env.NODE_ENV === "development") {
        console.log("[DEBUG] Token from localStorage:", token)
        // If JWT, decode payload for inspection
        if (token && token.split(".").length === 3) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]))
            console.log("[DEBUG] Token payload:", payload)
          } catch (e) {
            console.log("[DEBUG] Failed to decode token payload.")
          }
        }
      }
      const response = await fetch(`http://127.0.0.1:8000/api/v1/notifications/email-data/${courseId}`, {
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          "Content-Type": "application/json"
        },
        credentials: "include" // try with include for cross-origin cookies if backend supports
      })
      if (response.ok) {
        const data = await response.json()
        setEmailData(data)
        setSelectedStudents(data.students.map((s: Student) => s.id))
      } else {
        toast({
          title: "Error",
          description: "Failed to load email data",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load email data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents((prev) => [...prev, studentId])
    } else {
      setSelectedStudents((prev) => prev.filter((id) => id !== studentId))
    }
  }

  const selectAllStudents = () => {
    if (emailData) {
      setSelectedStudents(emailData.students.map((s) => s.id))
    }
  }

  const deselectAllStudents = () => {
    setSelectedStudents([])
  }

  const sendEmails = async () => {
    if (!emailData || selectedStudents.length === 0) {
      toast({
        title: "No Recipients Selected",
        description: "Please select at least one student to send emails to",
        variant: "destructive",
      })
      return
    }

    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast({
        title: "Missing Content",
        description: "Please enter both subject and message",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSending(true)
      setSendingComplete(false)
      setCurrentStep(2)

      const selectedStudentData = emailData.students.filter((s) => selectedStudents.includes(s.id))
      const initialStatuses: EmailStatus[] = selectedStudentData.map((student) => ({
        studentId: student.id,
        studentName: student.name,
        email: student.email,
        status: "pending",
      }))
      setEmailStatuses(initialStatuses)

      const token = localStorage.getItem("auth_token")
      if (process.env.NODE_ENV === "development") {
        console.log("[DEBUG] Token from localStorage (sendEmails):", token)
      }

      const response = await fetch(`http://127.0.0.1:8000/api/v1/notifications/send-bulk-attendance-emails/${emailData.course.id}`, {
        method: "POST",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          courseId: emailData.course.id,
          selectedStudents,
          subject: emailSubject,
          message: emailMessage,
        }),
        credentials: "include"
      })

      if (response.ok) {
        const result = await response.json()
        // Build emailStatuses from backend response
        let statuses: EmailStatus[] = []
        if (result.student_details && (result.success_emails || result.failed_emails)) {
          statuses = result.student_details.map((student: any) => ({
            studentId: student.student_id,
            studentName: student.student_name,
            email: student.email,
            status: result.success_emails.includes(student.email) ? "sent" : result.failed_emails.includes(student.email) ? "failed" : "pending",
          }))
        } else if (result.emailStatuses) {
          statuses = result.emailStatuses
        }
        setEmailStatuses(statuses)
        setSendingComplete(true)
        setCurrentStep(3)

        const successCount = statuses.filter((s) => s.status === "sent").length
        const failCount = statuses.filter((s) => s.status === "failed").length

        toast({
          title: "Email Sending Complete",
          description: `Successfully sent: ${successCount} emails, Failed: ${failCount} emails`,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Sending Failed",
          description: errorData.error || "Failed to send emails",
          variant: "destructive",
        })
        setCurrentStep(1)
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to send emails. Please check your connection.",
        variant: "destructive",
      })
      setCurrentStep(1)
    } finally {
      setIsSending(false)
    }
  }

  const resetForm = () => {
    setCurrentStep(1)
    setSendingComplete(false)
    setEmailStatuses([])
    if (emailData) {
      setSelectedStudents(emailData.students.map((s) => s.id))
    }
  }

  if (isLoading) {
    return (
      <LecturerLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <div>
              <h3 className="text-lg font-medium">Loading Email System</h3>
              <p className="text-muted-foreground">Preparing to send attendance emails...</p>
            </div>
          </div>
        </div>
      </LecturerLayout>
    )
  }

  if (!courseId) {
    return (
      <LecturerLayout>
        <div className="max-w-2xl mx-auto mt-12">
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              No course selected. Please select a course from the dashboard to send attendance emails.
            </AlertDescription>
          </Alert>
        </div>
      </LecturerLayout>
    )
  }

  if (!emailData) {
    return (
      <LecturerLayout>
        <div className="max-w-2xl mx-auto mt-12">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>Failed to load email data. Please try again.</AlertDescription>
          </Alert>
        </div>
      </LecturerLayout>
    )
  }

  if (!emailData.hasEmailSettings) {
    return (
      <LecturerLayout>
        <div className="space-y-8 p-6">
                   {/* Header Section */}
                   <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-university-primary via-blue-600 to-purple-600 p-8 text-white">
                     <div className="absolute inset-0 bg-black/10"></div>
                     <div className="relative z-10">
                       <div className="flex items-center justify-between">
                         <div>
                             <h1 className="text-4xl font-bold mb-2">Send Attendance Email</h1>
                           <p className="text-blue-100 text-lg">Send attendance reports to students via email</p>
                           </div>
                           <Button  variant="outline" className="hidden md:flex items-center space-x-4 bg-white/20 backdrop-blur-sm rounded-lg p-4">
                               <Bell className="h-8 w-8" />
                               <span className="ml-2">Log Out</span>
                           </Button>
                       </div>
                     </div>
                     <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10"></div>
                     <div className="absolute -left-20 -bottom-20 h-32 w-32 rounded-full bg-white/5"></div>
                   </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
                <Settings className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle>Email Configuration Required</CardTitle>
              <CardDescription>
                You need to configure your email settings before sending emails to students
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  Configure your email credentials to enable sending attendance reports to students.
                </AlertDescription>
              </Alert>
              <Link href="/lecturer/email/settings">
                <Button size="lg" className="w-full">
                  <Settings className="mr-2 h-5 w-5" />
                  Configure Email Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </LecturerLayout>
    )
  }

  return (
    <LecturerLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        
                   {/* Header Section */}
                   <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-university-primary via-blue-600 to-purple-600 p-8 text-white">
                     <div className="absolute inset-0 bg-black/10"></div>
                     <div className="relative z-10">
                       <div className="flex items-center justify-between">
                         <div>
                             <h1 className="text-4xl font-bold mb-2">Send Attendance Email</h1>
                           <p className="text-blue-100 text-lg">Send attendance reports to students via email</p>
                           </div>
                           <Button  variant="outline" className="hidden md:flex items-center space-x-4 bg-white/20 backdrop-blur-sm rounded-lg p-4">
                               <Bell className="h-8 w-8" />
                               <span className="ml-2">Log Out</span>
                           </Button>
                       </div>
                     </div>
                     <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10"></div>
                     <div className="absolute -left-20 -bottom-20 h-32 w-32 rounded-full bg-white/5"></div>
                   </div>
                   

        {/* Progress Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-8">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                  <FileText className="h-4 w-4" />
                </div>
                <span className="font-medium">Compose</span>
              </div>
              <div className={`w-16 h-0.5 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                  <Send className="h-4 w-4" />
                </div>
                <span className="font-medium">Send</span>
              </div>
              <div className={`w-16 h-0.5 ${currentStep >= 3 ? "bg-blue-600" : "bg-gray-200"}`}></div>
              <div className={`flex items-center space-x-2 ${currentStep >= 3 ? "text-green-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-green-600 text-white" : "bg-gray-200"}`}
                >
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className="font-medium">Complete</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Information */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">{emailData.course.courseName}</CardTitle>
                  <CardDescription className="text-base">
                    {emailData.course.courseCode} • {emailData.course.session}
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="text-sm">
                  Lecturer: {emailData.lecturer.name}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">{emailData.lecturer.email}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {currentStep === 1 && (
          <>
            {/* Email Composition */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <span>Compose Email</span>
                  </CardTitle>
                  <CardDescription>Customize the email content for your students</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Enter email subject"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Email Message</Label>
                    <Textarea
                      id="message"
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      rows={12}
                      placeholder="Enter your message to students"
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Student Selection */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Select Recipients</span>
                      </CardTitle>
                      <CardDescription>Choose students to receive the email</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={selectAllStudents}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={deselectAllStudents}>
                        Clear All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {emailData.students.map((student, index) => (
                      <div
                        key={student.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={(checked) => handleStudentSelection(student.id, checked as boolean)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">#{index + 1}</span>
                            <span className="font-medium truncate">{student.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {student.studentId}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="my-4 h-px bg-border"></div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Selected: <strong>{selectedStudents.length}</strong> of{" "}
                      <strong>{emailData.students.length}</strong> students
                    </span>
                    <Badge variant={selectedStudents.length > 0 ? "default" : "secondary"}>
                      {selectedStudents.length} recipients
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Send Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Ready to send attendance emails?</p>
                    <p className="text-sm text-muted-foreground">
                      This will send the attendance report to {selectedStudents.length} selected students.
                    </p>
                  </div>
                  <Button
                    onClick={sendEmails}
                    disabled={
                      isSending || selectedStudents.length === 0 || !emailSubject.trim() || !emailMessage.trim()
                    }
                    size="lg"
                    className="min-w-[200px]"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Send Emails ({selectedStudents.length})
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Sending Progress */}
        {currentStep === 2 && isSending && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Sending Emails...</h3>
                  <p className="text-muted-foreground">Please wait while we send attendance emails to your students</p>
                </div>

                {emailStatuses.length > 0 && (
                  <div className="max-w-2xl mx-auto space-y-3">
                    {emailStatuses.map((status) => (
                      <div
                        key={status.studentId}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                          <span className="font-medium">{status.studentName}</span>
                          <span className="text-sm text-muted-foreground">{status.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {status.status === "pending" && <Clock className="h-4 w-4 text-blue-600" />}
                          {status.status === "sent" && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {status.status === "failed" && <XCircle className="h-4 w-4 text-red-600" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {currentStep === 3 && sendingComplete && (
          <>
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Email Sending Complete!</CardTitle>
                <CardDescription>Your attendance emails have been processed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{emailStatuses.length}</p>
                    <p className="text-sm text-muted-foreground">Total Attempted</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">
                      {emailStatuses.filter((s) => s.status === "sent").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Successfully Sent</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <p className="text-3xl font-bold text-red-600">
                      {emailStatuses.filter((s) => s.status === "failed").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Failed to Send</p>
                  </div>
                </div>

                <div className="my-6 h-px bg-border"></div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Detailed Results:</h4>
                  {emailStatuses.map((status) => (
                    <div
                      key={status.studentId}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        status.status === "sent"
                          ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                          : status.status === "failed"
                          ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                          : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div>
                          <span className="font-medium">{status.studentName}</span>
                          <p className="text-sm text-muted-foreground">{status.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {status.status === "sent" && (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-green-600">Sent Successfully</span>
                          </>
                        )}
                        {status.status === "failed" && (
                          <>
                            <XCircle className="h-5 w-5 text-red-600" />
                            <span className="text-sm font-medium text-red-600">Failed to Send</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <Button onClick={resetForm} variant="outline" size="lg">
                    <Mail className="mr-2 h-5 w-5" />
                    Send More Emails
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </LecturerLayout>
  )
}
