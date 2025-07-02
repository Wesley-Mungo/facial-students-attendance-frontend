"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Camera,
  Users,
  FileText,
  Mail,
  BookOpen,
  UserPlus,
  BarChart3,
  Clock,
  Calendar,
  Award,
  Bell,
} from "lucide-react"
import Link from "next/link"
import { LecturerLayout } from "@/components/layouts/lecturer-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

// Define a Course interface for type safety
interface Course {
  id: number;
  name: string;
  code: string;
  semester: string;
  students: number;
  attendance: number;
  lastSession: string;
  color: string;
}

export default function LecturerDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/lecturer/login")
  }
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem('auth_token');
      try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/courses/my-courses-with-count", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Failed to fetch courses:', errorText)
          return
        }
        const data = await response.json()
        // Map backend data to Course[]
        const colorPalette = [
          "from-blue-500 to-blue-600",
          "from-purple-500 to-purple-600",
          "from-green-500 to-green-600",
          "from-orange-500 to-orange-600",
          "from-red-500 to-red-600",
          "from-indigo-500 to-indigo-600",
        ]
        const mappedCourses = (data || []).map((course: any, idx: number) => ({
          id: course.id,
          name: course.name || course.title || "Untitled Course",
          code: course.code || course.course_code || "",
          semester: course.semester || course.semester_name || "",
          students: course.student_count || course.students_count || 0,
          attendance: course.attendance_rate || 0, // fallback if not provided
          lastSession: course.last_session || "-",
          color: colorPalette[idx % colorPalette.length],
        }))
        setCourses(mappedCourses)
      } catch (err) {
        console.error('Error fetching courses:', err)
      }
    }
    fetchCourses()
  }, [])

  const todayStats = [
    {
      title: "Today's Sessions",
      value: "3",
      subtitle: "2 completed, 1 upcoming",
      icon: Calendar,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Students Present",
      value: "67",
      subtitle: "94% attendance rate",
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Recognition Rate",
      value: "98.5%",
      subtitle: "Excellent accuracy",
      icon: Award,
      color: "from-purple-500 to-purple-600",
    },
  ]

  const menuItems = [
    {
      title: "Start Facial Attendance",
      description: "Begin facial recognition attendance session",
      icon: Camera,
      href: "/lecturer/attendance/facial",
      gradient: "from-university-primary to-blue-600",
      iconBg: "bg-gradient-to-r from-university-primary to-blue-600",
      category: "Attendance",
      featured: true,
    },
    {
      title: "Manual Attendance",
      description: "Take attendance manually for backup",
      icon: Users,
      href: "/lecturer/attendance/manual",
      gradient: "from-green-500 to-green-600",
      iconBg: "bg-gradient-to-r from-green-500 to-green-600",
      category: "Attendance",
      featured: false,
    },
    {
      title: "View Course Students",
      description: "See all students enrolled in this course",
      icon: BookOpen,
      href: "/lecturer/students",
      gradient: "from-purple-500 to-purple-600",
      iconBg: "bg-gradient-to-r from-purple-500 to-purple-600",
      category: "Management",
      featured: false,
    },
    {
      title: "Add Student (Carryover)",
      description: "Add carryover students to course",
      icon: UserPlus,
      href: "/lecturer/students/add",
      gradient: "from-orange-500 to-orange-600",
      iconBg: "bg-gradient-to-r from-orange-500 to-orange-600",
      category: "Management",
      featured: false,
    },
    {
      title: "Attendance Records",
      description: "View detailed attendance history and analytics",
      icon: BarChart3,
      href: "/lecturer/attendance/records",
      gradient: "from-red-500 to-red-600",
      iconBg: "bg-gradient-to-r from-red-500 to-red-600",
      category: "Analytics",
      featured: false,
    },
    {
      title: "Generate Report",
      description: "Create comprehensive attendance reports",
      icon: FileText,
      href: "/lecturer/reports",
      gradient: "from-indigo-500 to-indigo-600",
      iconBg: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      category: "Reports",
      featured: false,
    },
    {
      title: "Email Settings",
      description: "Configure email notifications and templates",
      icon: Mail,
      href: "/lecturer/email/settings",
      gradient: "from-gray-500 to-gray-600",
      iconBg: "bg-gradient-to-r from-gray-500 to-gray-600",
      category: "Settings",
      featured: false,
    },
    {
      title: "Send Email",
      description: "Send attendace notifications to students",
      icon: Mail,
      href: "/lecturer/email/send",
      gradient: "from-yellow-500 to-yellow-600",
      iconBg: "bg-gradient-to-r from-yellow-500 to-yellow-600",
      category: "Email",
      featured: false,
    },
  ]

  const recentSessions = [
    {
      course: "Introduction to ML/AI",
      date: "Today, 10:00 AM",
      students: 42,
      attendance: "93%",
      status: "completed",
    },
    {
      course: "Internship Activity",
      date: "Yesterday, 2:00 PM",
      students: 28,
      attendance: "87%",
      status: "completed",
    },
    {
      course: "Introduction to ML/AI",
      date: "Dec 12, 8:00 AM",
      students: 45,
      attendance: "96%",
      status: "completed",
    },
  ]

  return (
    <ProtectedRoute allowedRoles={["lecturer"]}>
    <LecturerLayout>
      <div className="space-y-8 p-6">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-university-primary via-blue-600 to-purple-600 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                  <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.username || 'Lecturer'}!</h1>
                <p className="text-blue-100 text-lg">Ready to take attendance for your courses today?</p>
                </div>
                <Button onClick={handleLogout} variant="outline" className="hidden md:flex items-center space-x-4 bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <Bell className="h-8 w-8" />
                    <span className="ml-2">Log Out</span>
                </Button>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10"></div>
          <div className="absolute -left-20 -bottom-20 h-32 w-32 rounded-full bg-white/5"></div>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {todayStats.map((stat, index) => (
            <Card
              key={stat.title}
              className="relative overflow-hidden border-0 shadow-university hover:shadow-university-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Course Selection */}
        <Card className="border-0 shadow-university">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold flex items-center">
              <BookOpen className="h-6 w-6 mr-3 text-university-primary" />
              Your Courses
            </CardTitle>
            <CardDescription>Select a course to manage attendance and students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className={`cursor-pointer transition-all duration-300 border-2 ${
                    selectedCourse?.id === course.id
                      ? "border-university-primary bg-gradient-to-br from-university-primary/5 to-blue-50 shadow-university-lg scale-105"
                      : "border-gray-200 hover:border-university-primary/50 hover:shadow-university hover:-translate-y-1"
                  }`}
                  onClick={() => setSelectedCourse(course)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{course.name}</h3>
                        <Badge variant="secondary" className="mt-2">
                          {course.code}
                        </Badge>
                      </div>
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${course.color}`}>
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{course.semester}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-university-primary">{course.students}</p>
                        <p className="text-xs text-muted-foreground">Students</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{course.attendance}%</p>
                        <p className="text-xs text-muted-foreground">Attendance</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      Last session: {course.lastSession}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Course Actions */}
        {selectedCourse && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{selectedCourse.name}</h2>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="outline" className="text-university-primary border-university-primary">
                    {selectedCourse.code}
                  </Badge>
                  <Badge variant="secondary">{selectedCourse.semester}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item, index) => (
                <Link key={item.href} href={`${item.href}?course=${selectedCourse.id}`}>
                  <Card
                    className={`group relative overflow-hidden border-0 shadow-university hover:shadow-university-lg transition-all duration-300 hover:-translate-y-2 cursor-pointer ${item.featured ? "ring-2 ring-university-primary/20" : ""}`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                    ></div>
                    {item.featured && (
                      <div className="absolute top-4 right-4 z-20">
                        <Badge className="bg-gradient-to-r from-university-primary to-blue-600 text-white">
                          Featured
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${item.iconBg} shadow-lg`}>
                            <item.icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <Badge variant="secondary" className="mb-2 text-xs">
                              {item.category}
                            </Badge>
                            <CardTitle className="text-lg font-semibold group-hover:text-university-primary transition-colors">
                              {item.title}
                            </CardTitle>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-sm text-gray-600 leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button
                        className={`w-full ${item.featured ? "bg-gradient-to-r from-university-primary to-blue-600 hover:from-university-primary/90 hover:to-blue-600/90" : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                      >
                        {item.featured ? "Start Session" : "Access"}
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        <Card className="border-0 shadow-university">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-university-primary" />
              Recent Attendance Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-university-primary/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-university-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{session.course}</p>
                      <p className="text-sm text-muted-foreground">{session.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{session.students} students</p>
                    <Badge variant="secondary" className="text-green-600">
                      {session.attendance}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </LecturerLayout>
    </ProtectedRoute>
  )
}
