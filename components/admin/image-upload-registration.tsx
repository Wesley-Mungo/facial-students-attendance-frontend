"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Eye, EyeOff, Upload, Loader2, ImageIcon, X, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadRegistrationProps {
  onRegistrationSuccess: (studentName: string) => void
}

const departments = [
  "CEF",
  "Computer Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
]

export function ImageUploadRegistration({ onRegistrationSuccess }: ImageUploadRegistrationProps) {
  const [formData, setFormData] = useState({
    userId: "",
    fullName: "",
    department: "",
    email: "",
    level: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check if files are images
    const imageFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith("image/")) {
        imageFiles.push(file)
      }
    }

    if (imageFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please upload image files only",
        variant: "destructive",
      })
      return
    }

    // Simulate upload process
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 10
        if (newProgress >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadedImages(imageFiles)
        }
        return newProgress
      })
    }, 200)
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
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
    if (uploadedImages.length === 0) {
      setError("Please upload at least one facial image")
      return
    }
    setIsSubmitting(true)
    try {
      const payload = new FormData()
      payload.append("student_id", formData.userId)
      payload.append("name", formData.fullName)
      payload.append("email", formData.email)
      payload.append("department", formData.department)
      payload.append("level", formData.level)
      uploadedImages.forEach((file, idx) => {
        payload.append("image", file)
      })
      const token = localStorage.getItem('auth_token');
      const response = await fetch("http://127.0.0.1:8000/api/v1/students/create-with-embedding", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: payload,
      })
      if (!response.ok) {
        const errorText = await response.text()
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
      setUploadedImages([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      setError("Registration failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Upload Area */}
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center min-h-[240px] ${
              uploadedImages.length > 0
                ? "border-green-300 bg-green-50 dark:bg-green-950/20"
                : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
            }`}
          >
            {isUploading ? (
              <div className="w-full space-y-4">
                <div className="flex justify-center">
                  <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                </div>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-center text-sm text-muted-foreground">Uploading images...</p>
              </div>
            ) : uploadedImages.length > 0 ? (
              <div className="w-full space-y-4">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <p className="text-center font-medium">
                  {uploadedImages.length} {uploadedImages.length === 1 ? "image" : "images"} uploaded
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {uploadedImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={URL.createObjectURL(file) || "/placeholder.svg"}
                          alt={`Uploaded ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <p className="text-sm font-medium mb-1">Drag and drop facial images</p>
                <p className="text-xs text-muted-foreground mb-4">or click to browse</p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Images
                </Button>
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>• Upload clear facial images for better recognition</p>
            <p>• Multiple angles improve recognition accuracy</p>
            <p>• Ensure good lighting in the images</p>
          </div>
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

          <Button
            type="submit"
            disabled={isSubmitting || isUploading || uploadedImages.length === 0}
            className="w-full"
          >
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
