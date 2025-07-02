"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { LecturerLayout } from "@/components/layouts/lecturer-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Camera,
  Square,
  Users,
  Clock,
  AlertTriangle,
  BookOpen,
  Loader2,
  Play,
  RotateCcw,
  Zap,
  Shield,
  Target,
  Award,
  TrendingUp,
  Eye,
  Sparkles,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: string
  courseCode: string
  courseName: string
  session: string
  department: string
  level: number
}

interface Student {
  id: string
  studentId: string
  name: string
  department: string
  level: number
  type: "Regular" | "Carryover"
}

interface AttendanceRecord {
  studentId: string
  studentName: string
  timeRecorded: string
  confidence: number
}

interface FacialAttendanceData {
  course: Course
  enrolledStudents: Student[]
  stats: {
    totalStudents: number
    regularStudents: number
    carryoverStudents: number
  }
}

export default function FacialAttendance() {
  const [attendanceData, setAttendanceData] = useState<FacialAttendanceData | null>(null)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [sessionDuration, setSessionDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [cameraError, setCameraError] = useState("")
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastDetection, setLastDetection] = useState<string>("")
  const [recognitionStrength, setRecognitionStrength] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const searchParams = useSearchParams()
  const courseId = searchParams.get("course") || ""
  const { toast } = useToast()

  useEffect(() => {
    if (courseId) {
      loadAttendanceData(courseId)
    } else {
      setIsLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    return () => {
      stopCamera()
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current)
    }
  }, [])

  const loadAttendanceData = async (course_id: string) => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`http://127.0.0.1:8000/api/v1/courses/${course_id}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (response.ok) {
        const students = await response.json();
        // Build the expected attendanceData structure
        const attendanceDataObj = {
          course: {
            id: course_id,
            courseCode: "", // Fill with real data if available
            courseName: "", // Fill with real data if available
            session: "", // Fill with real data if available
            department: "", // Fill with real data if available
            level: 0, // Fill with real data if available
          },
          enrolledStudents: students,
          stats: {
            totalStudents: Array.isArray(students) ? students.length : 0,
            regularStudents: Array.isArray(students) ? students.filter(s => s.type === "Regular").length : 0,
            carryoverStudents: Array.isArray(students) ? students.filter(s => s.type === "Carryover").length : 0,
          },
        };
        setAttendanceData(attendanceDataObj);
      } else {
        toast({
          title: "System Error",
          description: "Unable to initialize facial recognition system",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Attendance data fetch error:", error, (error as any)?.message, (error as any)?.name, (error as any)?.target)
      toast({
        title: "Connection Error",
        description: "Failed to connect to attendance system",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startCamera = async () => {
    try {
      setCameraError("")
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play().catch((err) => {
          console.error("Camera video play error:", err, (err as any)?.message, (err as any)?.name, (err as any)?.target)
        })
      }
    } catch (err) {
      console.error("Camera access error:", err, (err as any)?.message, (err as any)?.name, (err as any)?.target)
      setCameraError("Camera access denied. Please grant camera permissions and refresh the page.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL("image/jpeg", 0.9)
  }

  const processFacialRecognition = async () => {
    if (!stream || !attendanceData) return

    setIsProcessing(true)
    const frameData = captureFrame()

    if (frameData) {
      try {
        const response = await fetch("/api/lecturer/attendance/recognize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: attendanceData.course.id,
            frameData: frameData,
            sessionId: sessionStartTime?.getTime().toString(),
          }),
        })

        if (response.ok) {
          const result = await response.json()

          if (result.recognized && result.student) {
            const confidence = result.confidence
            setRecognitionStrength(confidence * 100)

            const newRecord: AttendanceRecord = {
              studentId: result.student.studentId,
              studentName: result.student.name,
              timeRecorded: new Date().toISOString(),
              confidence: confidence,
            }

            const alreadyRecorded = attendanceRecords.some((record) => record.studentId === result.student.studentId)

            if (!alreadyRecorded) {
              setAttendanceRecords((prev) => [...prev, newRecord])
              setLastDetection(`${result.student.name}`)

              toast({
                title: "✨ Student Recognized",
                description: `${result.student.name} marked present with ${(confidence * 100).toFixed(1)}% confidence`,
              })
            } else {
              setLastDetection(`${result.student.name} (Already recorded)`)
            }
          } else {
            setLastDetection("Scanning for faces...")
            setRecognitionStrength(0)
          }
        }
      } catch (error) {
        console.error("Recognition processing error:", error, (error as any)?.message, (error as any)?.name, (error as any)?.target)
      }
    }

    setIsProcessing(false)
  }

  const startAttendanceSession = async () => {
    setIsSessionActive(true)
    setSessionStartTime(new Date())
    setAttendanceRecords([])
    setIsProcessing(true)
    setLastDetection("")

    // Start the camera so the live feed is visible
    await startCamera()

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/recognition/lecturer-capture-attendance?course_id=${attendanceData!.course.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        // Map backend results to AttendanceRecord[]
        const records = (data.results || [])
          .filter((r: any) => r.recognized && r.student_id)
          .map((r: any) => ({
            studentId: r.student_id,
            studentName: r.name,
            timeRecorded: r.timestamp,
            confidence: r.distance ? 1 - r.distance : 1,
          }))
        setAttendanceRecords(records)
        setLastDetection("Session complete. Attendance captured.")
        toast({
          title: "Attendance Captured",
          description: `Attendance marked for ${records.length} students.`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to capture attendance.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Attendance capture error:", error, (error as any)?.message, (error as any)?.name, (error as any)?.target)
      toast({
        title: "Error",
        description: "Failed to connect to attendance system.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setIsSessionActive(false)
      stopCamera()
    }
  }

  const stopAttendanceSession = async () => {
    setIsSessionActive(false)
    setIsProcessing(false)
    stopCamera()
  }

  const resetSession = () => {
    setAttendanceRecords([])
    setSessionDuration(0)
    setLastDetection("")
    setRecognitionStrength(0)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const attendanceRate = attendanceData ? (attendanceRecords.length / attendanceData.stats.totalStudents) * 100 : 0

  if (isLoading) {
    return (
      <LecturerLayout>
        <div className="min-h-screen bg-gradient-to-br from-university-secondary via-white to-primary-50 flex items-center justify-center">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="relative">
              <div className="w-20 h-20 bg-university-primary rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
              </div>
              <div className="absolute inset-0 w-20 h-20 bg-university-primary rounded-full animate-pulse-ring mx-auto"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-university-primary font-university">Initializing System</h3>
              <p className="text-gray-600 font-university">Preparing advanced facial recognition technology...</p>
            </div>
          </div>
        </div>
      </LecturerLayout>
    )
  }

  if (!courseId || !attendanceData) {
    return (
      <LecturerLayout>
        <div className="min-h-screen bg-gradient-to-br from-university-secondary via-white to-primary-50 flex items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-university">
              {!courseId
                ? "No course selected. Please select a course from the dashboard."
                : "Failed to load course data."}
            </AlertDescription>
          </Alert>
        </div>
      </LecturerLayout>
    )
  }

  return (
    <LecturerLayout>
      <div className="min-h-screen bg-gradient-to-br from-university-secondary via-white to-primary-50">
        <div className="space-y-8 p-6">
          {/* Header Section */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-university-primary rounded-xl flex items-center justify-center shadow-university">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-university-primary font-university">
                Facial Recognition Attendance
              </h1>
            </div>
            <p className="text-lg text-gray-600 font-university max-w-2xl mx-auto">
              Advanced biometric attendance system powered by artificial intelligence
            </p>
          </div>

          {/* Course Information Card */}
          <Card className="shadow-university-lg border-0 overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-university-primary to-primary-800 text-white p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-university">{attendanceData.course.courseName}</h2>
                    <p className="text-primary-100 text-lg font-university">
                      {attendanceData.course.courseCode} • {attendanceData.course.session}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge className="bg-white bg-opacity-20 text-white border-white border-opacity-30 font-university">
                    {attendanceData.course.department} Level {attendanceData.course.level}
                  </Badge>
                  <p className="text-primary-100 font-university">
                    {attendanceData.stats.totalStudents} enrolled students
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Status Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
            <Card className="shadow-university border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSessionActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full ${
                        isSessionActive ? "bg-green-500 animate-pulse" : "bg-gray-400"
                      }`}
                    ></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 font-university">Session Status</p>
                    <p className="text-xl font-bold font-university">{isSessionActive ? "Active" : "Inactive"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-university border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 font-university">Duration</p>
                    <p className="text-xl font-bold font-university">{formatDuration(sessionDuration)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-university border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 font-university">Present</p>
                    <p className="text-xl font-bold font-university">{attendanceRecords.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-university border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 font-university">Rate</p>
                    <p className="text-xl font-bold font-university">{attendanceRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Interface */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Camera Feed - Takes 2 columns */}
            <div className="xl:col-span-2">
              <Card className="shadow-university-lg border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-university-primary rounded-lg flex items-center justify-center">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-university">Live Camera Feed</CardTitle>
                        <CardDescription className="font-university">
                          AI-powered facial recognition system
                        </CardDescription>
                      </div>
                    </div>
                    {isSessionActive && (
                      <Badge className="bg-green-100 text-green-800 animate-pulse font-university">
                        <Zap className="h-3 w-3 mr-1" />
                        Scanning
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="aspect-video bg-black overflow-hidden relative">
                      {cameraError ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                          <div className="text-center p-8 space-y-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                              <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                            <div>
                              <h3 className="text-white text-lg font-semibold font-university mb-2">
                                Camera Access Required
                              </h3>
                              <p className="text-gray-300 text-sm font-university max-w-md">{cameraError}</p>
                            </div>
                          </div>
                        </div>
                      ) : stream ? (
                        <>
                          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

                          {/* Recognition Overlay */}
                          {isSessionActive && (
                            <div className="absolute inset-0">
                              {/* Scanning Line */}
                              {isProcessing && (
                                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-university-primary to-transparent animate-recognition-scan"></div>
                              )}

                              {/* Corner Brackets */}
                              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-university-primary"></div>
                              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-university-primary"></div>
                              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-university-primary"></div>
                              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-university-primary"></div>
                            </div>
                          )}

                          {/* Status Overlays */}
                          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                            {isProcessing && (
                              <div className="bg-university-primary bg-opacity-90 text-white px-4 py-2 rounded-full text-sm flex items-center space-x-2 backdrop-blur-sm">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                <span className="font-university">Processing...</span>
                              </div>
                            )}
                          </div>

                          {/* Recognition Strength */}
                          {recognitionStrength > 0 && (
                            <div className="absolute top-4 right-4">
                              <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm font-university">
                                <div className="flex items-center space-x-2">
                                  <Target className="h-3 w-3" />
                                  <span>{recognitionStrength.toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Last Detection */}
                          {lastDetection && (
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="bg-black bg-opacity-75 text-white px-4 py-3 rounded-lg backdrop-blur-sm">
                                <div className="flex items-center space-x-2">
                                  <Sparkles className="h-4 w-4 text-university-accent" />
                                  <span className="font-university">{lastDetection}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <div className="text-center p-8 space-y-4">
                            <div className="w-16 h-16 bg-university-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto">
                              <Camera className="h-8 w-8 text-university-primary" />
                            </div>
                            <div>
                              <h3 className="text-gray-700 text-lg font-semibold font-university mb-2">
                                Camera Preview
                              </h3>
                              <p className="text-gray-500 text-sm font-university">
                                Click start to begin facial recognition
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Camera Controls */}
                    <div className="p-6 bg-gray-50 border-t">
                      <div className="flex space-x-4">
                        {!isSessionActive ? (
                          <Button
                            onClick={startAttendanceSession}
                            className="flex-1 bg-university-primary hover:bg-primary-800 text-white py-3 text-lg font-university shadow-lg"
                            size="lg"
                          >
                            <Play className="mr-3 h-5 w-5" />
                            Start Recognition Session
                          </Button>
                        ) : (
                          <Button
                            onClick={stopAttendanceSession}
                            variant="destructive"
                            className="flex-1 py-3 text-lg font-university shadow-lg"
                            size="lg"
                          >
                            <Square className="mr-3 h-5 w-5" />
                            Stop Session
                          </Button>
                        )}
                        <Button
                          onClick={resetSession}
                          variant="outline"
                          disabled={isSessionActive}
                          className="px-6 font-university"
                          size="lg"
                        >
                          <RotateCcw className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Panel */}
            <div className="space-y-6">
              {/* Progress Card */}
              <Card className="shadow-university border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-university flex items-center space-x-2">
                    <Award className="h-5 w-5 text-university-primary" />
                    <span>Session Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-university">
                      <span className="text-gray-600">Attendance Rate</span>
                      <span className="font-semibold text-university-primary">
                        {attendanceRecords.length} / {attendanceData.stats.totalStudents}
                      </span>
                    </div>
                    <Progress value={attendanceRate} className="h-3 bg-gray-200" />
                    <p className="text-xs text-gray-500 font-university text-center">
                      {attendanceRate.toFixed(1)}% completion rate
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Live Attendance */}
              <Card className="shadow-university border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-university flex items-center space-x-2">
                    <Users className="h-5 w-5 text-university-primary" />
                    <span>Live Attendance</span>
                  </CardTitle>
                  <CardDescription className="font-university">Students marked present this session</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {attendanceRecords.length === 0 ? (
                      <div className="text-center py-8 space-y-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <Users className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-gray-500 font-university">No students recorded yet</p>
                          <p className="text-xs text-gray-400 font-university">
                            Start the session to begin recognition
                          </p>
                        </div>
                      </div>
                    ) : (
                      attendanceRecords.map((record, index) => (
                        <div
                          key={record.studentId}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 animate-slide-in"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold font-university">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 font-university">{record.studentName}</p>
                              <p className="text-xs text-gray-500 font-university">{record.studentId}</p>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <Badge className="bg-green-100 text-green-800 border-green-300 font-university">
                              {(record.confidence * 100).toFixed(1)}%
                            </Badge>
                            <p className="text-xs text-gray-500 font-university">
                              {new Date(record.timeRecorded).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                   ) }
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Instructions Panel */}
          {!isSessionActive && (
            <Card className="shadow-university border-0 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-xl font-university flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-university-primary" />
                  <span>System Instructions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-university-primary font-university">For Optimal Recognition:</h4>
                    <ul className="space-y-2 text-sm text-gray-600 font-university">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-university-primary rounded-full"></div>
                        <span>Ensure good lighting conditions</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-university-primary rounded-full"></div>
                        <span>Look directly at the camera</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-university-primary rounded-full"></div>
                        <span>Remove sunglasses or face coverings</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-university-primary rounded-full"></div>
                        <span>Stay within the camera frame</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-university-primary font-university">Session Management:</h4>
                    <ul className="space-y-2 text-sm text-gray-600 font-university">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-university-primary rounded-full"></div>
                        <span>Each student can only be marked once per session</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-university-primary rounded-full"></div>
                        <span>System processes recognition every 1.5 seconds</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-university-primary rounded-full"></div>
                        <span>Attendance is automatically saved when session ends</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-university-primary rounded-full"></div>
                        <span>High confidence threshold ensures accuracy</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hidden canvas for image capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </LecturerLayout>
  )
}
