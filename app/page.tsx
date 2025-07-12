"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, Camera } from "lucide-react"
import { useState } from "react"
import Image from 'next/image'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-university-primary/10 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-between">
     <header className="w-full py-6 bg-university-primary text-white text-center font-serif text-xl tracking-wide shadow-md">
  Empowering Institutions with Smart, Secure, and Seamless Attendance Solutions
     </header>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="p-4 w-25 h-25 bg-university-primary rounded-full shadow-lg">
             
              <Image
              src="/icon.png"
              alt="Admin Logo"
              width={100}
              height={100}
              className="border-2 border-white shadow-md"
              />
              
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl  font-bold text-university-primary mb-4 tracking-tight drop-shadow-lg">
            Welcome to the{" "}
            <span className="text-blue-700">Facial Attendance System</span>
          </h1>
          <p className="text-2xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto font-light mb-4">
            Modern, secure, and intelligent attendance management for world-class institutions.
          </p>
          <p className="text-lg text-blue-900 font-medium font-serif mb-6">
            Empowering educators and students with seamless, AI-powered technology.
          </p>
          
        </div>

        {/* Portals */}
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto mt-12 animate-fade-in">
          <Card className="hover:shadow-2xl transition-shadow border-0 bg-white/90 dark:bg-gray-900/80 rounded-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-university-primary" />
              </div>
              <CardTitle className="text-2xl font-serif text-university-primary">
                Admin Portal
              </CardTitle>
              <CardDescription className="text-gray-700 dark:text-gray-300 font-sans">
                Manage students, lecturers, courses, and view comprehensive attendance reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-base text-gray-700 dark:text-gray-200 space-y-2 font-sans">
                <li>• Register new students</li>
                <li>• Manage lecturers and courses</li>
                <li>• View attendance summaries</li>
                <li>• Department-wise student management</li>
              </ul>
              <Link href="/admin/login" className="block">
                <Button className="w-full bg-university-primary hover:bg-blue-800 text-white text-lg rounded-full font-semibold shadow-md">
                  Admin Login
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-shadow border-0 bg-white/90 dark:bg-gray-900/80 rounded-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <GraduationCap className="h-12 w-12 text-green-700" />
              </div>
              <CardTitle className="text-2xl font-serif text-green-700">
                Lecturer Portal
              </CardTitle>
              <CardDescription className="text-gray-700 dark:text-gray-300 font-sans">
                Take attendance, manage courses, and generate detailed attendance reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-base text-gray-700 dark:text-gray-200 space-y-2 font-sans">
                <li>• Facial recognition attendance</li>
                <li>• Manual attendance backup</li>
                <li>• Course management</li>
                <li>• Attendance reports & emails</li>
              </ul>
              <Link href="/lecturer/login" className="block">
                <Button className="w-full border-2 border-green-700 text-green-700 bg-white hover:bg-green-50 text-lg rounded-full font-semibold shadow-md">
                  Lecturer Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 bg-university-primary text-white text-center font-serif text-lg tracking-wide shadow-inner">
        <span className="font-bold">Standard</span> &mdash; Powered by AttendanceCheck | &copy;{" "}
        {new Date().getFullYear()} Education Institutional System
      </footer>
    </div>
  )
}
