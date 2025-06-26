"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  UserCheck,
  List,
  Plus,
  GraduationCap,
  Calendar,
  Users,
  TrendingUp,
  Award,
  Target,
} from "lucide-react"
import { CreateCourseForm } from "@/components/admin/create-course-form"
import { AssignCourseForm } from "@/components/admin/assign-course-form"
import { CourseList } from "@/components/admin/course-list"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: string
  course_code: string
  name: string
  session: string
  lecturer_id?: string
  lecturer_name?: string
  student_count?: number
  average_attendance?: number
}

interface Lecturer {
  id: string
  lecturerId: string
  fullName: string
  department: string
  email: string
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("view")
  const { toast } = useToast()

  useEffect(() => {
    fetchCourses()
    fetchLecturers()
  }, [])

  // --- FIX: Use correct backend endpoints for courses and lecturers ---
  const fetchCourses = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('auth_token');
      const response = await fetch("http://127.0.0.1:8000/api/v1/courses/all-courses-with-count", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      let courses: Course[] = []
      if (response.ok) {
        const data = await response.json()
        courses = Array.isArray(data) ? data : data.courses || []
      }
      setCourses(courses)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLecturers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/admin/lecturers", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setLecturers(Array.isArray(data) ? data : data.lecturers || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch lecturers",
        variant: "destructive",
      })
    }
  }

  const handleCourseCreated = (newCourse: Course) => {
    setCourses((prev) => [...prev, newCourse])
    setActiveTab("view")
    toast({
      title: "Success",
      description: `Successfully created course: ${newCourse.name} (${newCourse.course_code})`,
    })
  }

  const handleCourseAssigned = (updatedCourse: Course) => {
    setCourses((prev) => prev.map((course) => (course.id === updatedCourse.id ? updatedCourse : course)))
    setActiveTab("view")
    toast({
      title: "Success",
      description: `Successfully assigned ${updatedCourse.name} to ${updatedCourse.lecturer_name}`,
    })
  }

  const stats = {
    total: courses.length,
    assigned: courses.filter((c) => c.lecturer_id).length,
    unassigned: courses.filter((c) => !c.lecturer_id).length,
    sessions: Array.from(new Set(courses.map((c) => c.session))).length,
    totalStudents: courses.reduce((sum, c) => sum + (c.student_count || 0), 0),
    avgStudentsPerCourse:
      courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + (c.student_count || 0), 0) / courses.length) : 0,
  }

  // Always normalize lecturers to include username before passing to AssignCourseForm
  const normalizedLecturers = lecturers.map(l => ({
    ...l,
    username: (l as any).username || l.fullName || l.email || "unknown"
  }))

  // Normalize courses to ensure lecturer_id and lecturer_name are always correct and robustly detect assignment
  const normalizedCourses = courses.map((c) => {
    const rawId = c.lecturer_id;
    // Treat as assigned if rawId is a non-empty string (not 'null'), or a positive number
    const assigned = (typeof rawId === 'string' && rawId.trim() !== '' && rawId !== 'null') || (typeof rawId === 'number' && rawId > 0);
    return {
      ...c,
      lecturer_id: assigned ? String(rawId) : undefined,
      lecturer_name: assigned ? (c.lecturer_name ? String(c.lecturer_name) : undefined) : undefined,
    };
  })

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="space-y-8 p-6">
          {/* Header Section - Matching Lecturer Management */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-university-primary via-university-dark to-blue-800 p-8 shadow-university-lg">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Course Management</h1>
                  <p className="text-white/90 text-lg">
                    Create courses, assign lecturers, and manage academic offerings
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2 text-white/80">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-sm">Academic Excellence</span>
                </div>
                <div className="flex items-center space-x-2 text-white/80">
                  <Award className="h-5 w-5" />
                  <span className="text-sm">Course Development</span>
                </div>
              </div>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          </div>

          {/* Enhanced Stats Grid - Matching Lecturer Management Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="relative overflow-hidden group hover:shadow-university transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-university">{stats.total}</p>
                    <p className="text-sm text-muted-foreground font-medium">Total Courses</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-university/10 to-university/20 rounded-xl group-hover:scale-110 transition-transform">
                    <BookOpen className="h-8 w-8 text-university" />
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-university to-university-dark w-full rounded-full"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-university transition-all duration-300 border-0 bg-gradient-to-br from-white to-green-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-green-600">{stats.assigned}</p>
                    <p className="text-sm text-muted-foreground font-medium">Assigned</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl group-hover:scale-110 transition-transform">
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                    style={{ width: `${stats.total > 0 ? (stats.assigned / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-university transition-all duration-300 border-0 bg-gradient-to-br from-white to-orange-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-orange-600">{stats.unassigned}</p>
                    <p className="text-sm text-muted-foreground font-medium">Unassigned</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl group-hover:scale-110 transition-transform">
                    <Plus className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
                    style={{ width: `${stats.total > 0 ? (stats.unassigned / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

          

            <Card className="relative overflow-hidden group hover:shadow-university transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-indigo-600">{stats.totalStudents}</p>
                    <p className="text-sm text-muted-foreground font-medium">Enrollments</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl group-hover:scale-110 transition-transform">
                    <Users className="h-8 w-8 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 w-3/4 rounded-full"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-university transition-all duration-300 border-0 bg-gradient-to-br from-white to-teal-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-teal-600">{stats.avgStudentsPerCourse}</p>
                    <p className="text-sm text-muted-foreground font-medium">Avg Students</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-8 w-8 text-teal-600" />
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-teal-600 w-2/3 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Tabs - Matching Lecturer Management */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-center">
              <TabsList className="inline-flex bg-white/70 backdrop-blur-sm border border-gray-200/50 p-1 rounded-xl shadow-lg overflow-hidden">
                <TabsTrigger
                  value="view"
                  className="flex items-center space-x-2 px-6 py-3 rounded-lg data-[state=active]:bg-university-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  <List className="h-5 w-5" />
                  <span className="font-medium">View All Courses</span>
                </TabsTrigger>
                <TabsTrigger
                  value="create"
                  className="flex items-center space-x-2 px-6 py-3 rounded-lg data-[state=active]:bg-university-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Create New Course</span>
                </TabsTrigger>
                <TabsTrigger
                  value="assign"
                  className="flex items-center space-x-2 px-6 py-3 rounded-lg data-[state=active]:bg-university-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  <UserCheck className="h-5 w-5" />
                  <span className="font-medium">Assign Course</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="view" className="space-y-6">
              <Card className="border-2 shadow-university bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-university/5 to-university/10 border-b border-university/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-university/10 rounded-xl">
                        <List className="h-6 w-6 text-university" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-university">Course Directory</CardTitle>
                        <CardDescription className="text-lg">
                          Comprehensive list of all academic courses
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span>Academic Management</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <CourseList courses={normalizedCourses} isLoading={isLoading} onRefresh={fetchCourses} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              <Card className="border-0 shadow-university bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-xl">
                        <Plus className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-green-800">Create New Course</CardTitle>
                        <CardDescription className="text-lg">
                          Add a new academic course to the university system
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <Award className="h-4 w-4" />
                      <span>Course Registration</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <CreateCourseForm onCourseCreated={handleCourseCreated} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assign" className="space-y-6">
              <Card className="border-0 shadow-university bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <UserCheck className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-blue-800">Assign Course to Lecturer</CardTitle>
                        <CardDescription className="text-lg">
                          Match qualified lecturers with appropriate courses
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <Target className="h-4 w-4" />
                      <span>Faculty Assignment</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <AssignCourseForm courses={courses} lecturers={normalizedLecturers} onCourseAssigned={handleCourseAssigned} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  )
}
