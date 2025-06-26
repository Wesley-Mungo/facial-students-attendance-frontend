"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, Loader2, User, Mail, Building2, Key, CheckCircle, AlertCircle, Hash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: string
  name: string
  code: string
  semester: string
}

interface Lecturer {
  id: string
  lecturerId: string
  fullName: string
  department: string
  email: string
  assignedCourses: Course[]
}

interface AddLecturerFormProps {
  onLecturerAdded: (lecturer: Lecturer) => void
}

const departments = [
  "Computer Engineering",
  "CEF",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
]

export function AddLecturerForm({ onLecturerAdded }: AddLecturerFormProps) {
  const [formData, setFormData] = useState({
    lecturerId: "",
    fullName: "",
    department: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.lecturerId.trim()) {
      errors.lecturerId = "Lecturer ID is required"
    }
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required"
    }
    if (!formData.department) {
      errors.department = "Department is required"
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }
    if (!formData.password.trim()) {
      errors.password = "Password is required"
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Send registration to FastAPI backend
      const response = await fetch("http://localhost:8000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: "lecturer"
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Optionally, you can add department/lecturerId via another endpoint if needed
        onLecturerAdded({
          id: data.id,
          lecturerId: formData.lecturerId,
          fullName: data.username,
          department: formData.department,
          email: data.email,
          assignedCourses: [],
        })
        setFormData({
          lecturerId: "",
          fullName: "",
          department: "",
          email: "",
          password: "",
        })
        setValidationErrors({})
        toast({
          title: "Success",
          description: `Successfully added lecturer ${formData.fullName}`,
        })
      } else {
        setError(data.detail || data.error || "Failed to add lecturer")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const clearForm = () => {
    setFormData({
      lecturerId: "",
      fullName: "",
      department: "",
      email: "",
      password: "",
    })
    setValidationErrors({})
    setError("")
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Form Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <User className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Faculty Lecturer Registration Form</h2>
        <p className="text-gray-600">Enter the details to register a new faculty lecturer member</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information Section */}
        <Card className="border-0 shadow-university bg-gradient-to-br from-white to-blue-50/30">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lecturerId" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <Hash className="h-4 w-4" />
                    <span>Faculty ID</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="lecturerId"
                      value={formData.lecturerId}
                      onChange={(e) => handleInputChange("lecturerId", e.target.value)}
                      placeholder="e.g., L105"
                      className={`h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-university/50 focus:ring-university/20 ${
                        validationErrors.lecturerId ? "border-red-300 focus:border-red-500" : ""
                      }`}
                    />
                    {validationErrors.lecturerId && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  {validationErrors.lecturerId && (
                    <p className="text-xs text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{validationErrors.lecturerId}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Full Name</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="e.g., DR Tsague"
                      className={`h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-university/50 focus:ring-university/20 ${
                        validationErrors.fullName ? "border-red-300 focus:border-red-500" : ""
                      }`}
                    />
                    {validationErrors.fullName && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  {validationErrors.fullName && (
                    <p className="text-xs text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{validationErrors.fullName}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department & Contact Section */}
        <Card className="border-0 shadow-university bg-gradient-to-br from-white to-purple-50/30">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Department & Contact</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    <span>Department</span>
                  </Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                    <SelectTrigger
                      className={`h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-university/50 focus:ring-university/20 ${
                        validationErrors.department ? "border-red-300" : ""
                      }`}
                    >
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
                  {validationErrors.department && (
                    <p className="text-xs text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{validationErrors.department}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Address</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="e.g., tsague@university.edu"
                      className={`h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-university/50 focus:ring-university/20 ${
                        validationErrors.email ? "border-red-300 focus:border-red-500" : ""
                      }`}
                    />
                    {validationErrors.email && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  {validationErrors.email && (
                    <p className="text-xs text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{validationErrors.email}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="border-0 shadow-university bg-gradient-to-br from-white to-green-50/30">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Key className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Security Settings</h3>
              </div>

              <div className="max-w-md space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Set Password</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter a secure password"
                    className={`h-12 pr-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-university/50 focus:ring-university/20 ${
                      validationErrors.password ? "border-red-300 focus:border-red-500" : ""
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  {validationErrors.password && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                </div>
                {validationErrors.password && (
                  <p className="text-xs text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{validationErrors.password}</span>
                  </p>
                )}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Password requirements:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>At least 6 characters long</li>
                    <li>Contains letters and numbers (recommended)</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form Actions */}
        <div className="flex space-x-4 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 h-14 bg-gradient-to-r from-university-primary to-university-dark hover:from-university-dark hover:to-university shadow-lg hover:shadow-university transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Registering Faculty Member...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Register Faculty Member
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearForm}
            className="px-8 h-14 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          >
            Clear Form
          </Button>
        </div>
      </form>
    </div>
  )
}
