"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, Camera } from "lucide-react"
import { useState } from "react"

export default function HomePage() {
  const [message, setMessage] = useState("")

  const handleTestApi = async () => {
    try {
      const response = await fetch("http://localhost:8000/")
      const data = await response.json()
      setMessage(data.message)
    } catch (error) {
      setMessage("Failed to fetch from API")
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-600 rounded-full">
              <Camera className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Facial Attendance System</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Modern attendance management with facial recognition technology for educational institutions
          </p>
          <div className="mt-4">
            <Button onClick={handleTestApi}>Test API</Button>
            {message && <p className="mt-4 text-green-500">{message}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Admin Portal</CardTitle>
              <CardDescription>
                Manage students, lecturers, courses, and view comprehensive attendance reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• Register new students</li>
                <li>• Manage lecturers and courses</li>
                <li>• View attendance summaries</li>
                <li>• Department-wise student management</li>
              </ul>
              <Link href="/admin/login" className="block">
                <Button className="w-full" size="lg">
                  Admin Login
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <GraduationCap className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Lecturer Portal</CardTitle>
              <CardDescription>
                Take attendance, manage courses, and generate detailed attendance reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• Facial recognition attendance</li>
                <li>• Manual attendance backup</li>
                <li>• Course management</li>
                <li>• Attendance reports & emails</li>
              </ul>
              <Link href="/lecturer/login" className="block">
                <Button className="w-full" variant="outline" size="lg">
                  Lecturer Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
