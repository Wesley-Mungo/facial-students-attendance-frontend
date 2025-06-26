"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Eye, EyeOff, Camera, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LiveCameraRegistrationProps {
  onRegistrationSuccess: (studentName: string) => void
}

const departments = [
  "CEF",
  "Computer Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
]

export function LiveCameraRegistration({ onRegistrationSuccess }: LiveCameraRegistrationProps) {
  const [formData, setFormData] = useState({
    userId: "",
    fullName: "",
    department: "",
    email: "",
    level: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureProgress, setCaptureProgress] = useState(0)
  const [capturedSamples, setCapturedSamples] = useState(0)
  const [totalSamples] = useState(10)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [error, setError] = useState("")
  const [cameraError, setCameraError] = useState("")
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImages, setCapturedImages] = useState<string[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    return () => {
      // Clean up camera stream when component unmounts
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const startCamera = async () => {
    try {
      setCameraError("")
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      })
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setCameraError("Failed to access camera. Please ensure camera permissions are granted.")
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

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL("image/jpeg")
  }

  const startCapturing = () => {
    if (!stream) {
      toast({
        title: "Camera not ready",
        description: "Please start the camera before capturing images",
        variant: "destructive",
      })
      return
    }
    setIsCapturing(true)
    setCapturedSamples(0)
    setCaptureProgress(0)
    setCapturedImages([])
    const images: string[] = []
    const captureInterval = setInterval(() => {
      setCapturedSamples((prev) => {
        const newCount = prev + 1
        setCaptureProgress((newCount / totalSamples) * 100)
        if (newCount >= totalSamples) {
          clearInterval(captureInterval)
          setIsCapturing(false)
        }
        return newCount
      })
      // Capture the actual image
      const imageData = captureImage()
      if (imageData) {
        images.push(imageData)
        setCapturedImages((prev) => [...prev, imageData])
      }
    }, 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    // Validate form
    if (!formData.userId || !formData.fullName || !formData.department || !formData.email || !formData.level) {
      setError("All fields are required")
      return
    }
    if (isNaN(Number(formData.level))) {
      setError("Level must be an integer")
      return
    }
    if (capturedImages.length < totalSamples) {
      setError(`Please capture all ${totalSamples} facial samples before submitting`)
      return
    }
    setIsSubmitting(true)
    try {
      const payload = new FormData()
      payload.append("student_id", formData.userId)
      payload.append("name", formData.fullName)
      payload.append("department", formData.department)
      payload.append("email", formData.email)
      payload.append("level", formData.level)
      // Convert base64 images to Blob and append
      capturedImages.forEach((img, idx) => {
        const arr = img.split(",")
        const mimeMatch = arr[0].match(/:(.*?);/)
        const mime = mimeMatch ? mimeMatch[1] : "image/jpeg"
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        const file = new File([u8arr], `sample_${idx + 1}.jpg`, { type: mime })
        payload.append("image", file) // changed from "images" to "image"
      })
      // Get token from localStorage (or other storage as per your auth logic)
      const token = localStorage.getItem('auth_token')
      console.log('Registration token:', token)
      const response = await fetch("http://127.0.0.1:8000/api/v1/students/admin-create-with-embedding", {
        method: "POST",
        body: payload,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Registration error:', errorText)
        setError(errorText || "Registration failed. Please try again.")
        return
      }
      // Success
      onRegistrationSuccess(formData.fullName)
      setFormData({
        userId: "",
        fullName: "",
        department: "",
        email: "",
        level: "",
      })
      setCapturedSamples(0)
      setCaptureProgress(0)
      setCapturedImages([])
      stopCamera()
    } catch (err) {
      setError("Registration failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Camera Preview */}
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            {cameraError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-4">
                  <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                  <p className="text-white text-sm">{cameraError}</p>
                </div>
              </div>
            ) : stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    videoRef.current.play()
                    setIsCameraReady(true)
                  }
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-4">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Camera preview will appear here</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            {!stream ? (
              <Button onClick={startCamera} type="button" className="flex-1">
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
            ) : (
              <Button onClick={stopCamera} type="button" variant="outline" className="flex-1">
                <XCircle className="mr-2 h-4 w-4" />
                Stop Camera
              </Button>
            )}

            <Button
              onClick={startCapturing}
              type="button"
              disabled={!stream || isCapturing}
              className="flex-1"
              variant={capturedSamples === totalSamples ? "outline" : "default"}
            >
              {isCapturing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Capturing...
                </>
              ) : capturedSamples === totalSamples ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  Samples Complete
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Samples
                </>
              )}
            </Button>
          </div>

          {/* Hidden canvas for capturing images */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Capture Progress */}
          {(isCapturing || capturedSamples > 0) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Capturing facial samples</span>
                <span>
                  {capturedSamples}/{totalSamples}
                </span>
              </div>
              <Progress value={captureProgress} className="h-2" />
            </div>
          )}
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">Student ID</Label>
            <Input
              id="userId"
              value={formData.userId}
              onChange={(e) => handleInputChange("userId", e.target.value)}
              placeholder="e.g., FE22A130"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder="e.g., John William"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="e.g., johnwesley@gmail.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Input
              id="level"
              type="number"
              min="100"
              step="100"
              value={formData.level}
              onChange={(e) => handleInputChange("level", e.target.value)}
              placeholder="e.g., 100, 200, 300, 400, 500"
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isSubmitting || capturedSamples < totalSamples} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register Student"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
