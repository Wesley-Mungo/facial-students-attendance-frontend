"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Users, BookOpen, TrendingUp, Award, Mail, Building2, GraduationCap } from "lucide-react"
import { AddLecturerForm } from "@/components/admin/add-lecturer-form"
import { LecturerList } from "@/components/admin/lecturer-list"
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

export default function LecturerManagement() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("view")
  const { toast } = useToast()

  useEffect(() => {
    fetchLecturers()
  }, [])

  const fetchLecturers = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('auth_token');
      const response = await fetch("http://localhost:8000/api/v1/auth/admin/lecturers", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleLecturerAdded = (newLecturer: Lecturer) => {
    setLecturers((prev) => [...prev, newLecturer])
    setActiveTab("view")
    toast({
      title: "Success",
      description: `Successfully added lecturer ${newLecturer.fullName}`,
    })
  }

  // Ensure only valid lecturers are used for stats
  const validLecturers = Array.isArray(lecturers)
    ? lecturers.filter(l => l && Array.isArray(l.assignedCourses))
    : [];

  const stats = {
    total: validLecturers.length,
    withCourses: validLecturers.filter((l) => l.assignedCourses.length > 0).length,
    withoutCourses: validLecturers.filter((l) => l.assignedCourses.length === 0).length,
    departments: Array.from(new Set(validLecturers.map((l) => l.department))).length,
    averageCourses:
      validLecturers.length > 0
        ? (
            validLecturers.reduce((sum, l) => sum + l.assignedCourses.length, 0) /
            validLecturers.length
          ).toFixed(1)
        : 0,
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="space-y-8 p-6">
          {/* Header Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-university-primary via-blue-600 via-university-dark to-blue-800 p-8 shadow-university-lg">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Lecturer Management</h1>
                  <p className="text-white/90 text-lg">Manage faculty members and their course assignments</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2 text-white/80">
                  <GraduationCap className="h-5 w-5" />
                  <span className="text-sm">Academic Excellence</span>
                </div>
                <div className="flex items-center space-x-2 text-white/80">
                  <Award className="h-5 w-5" />
                  <span className="text-sm">Faculty Development</span>
                </div>
              </div>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="relative overflow-hidden group hover:shadow-university transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-university">{stats.total}</p>
                    <p className="text-sm text-muted-foreground font-medium">Total Lecturers</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-university/10 to-university/20 rounded-xl group-hover:scale-110 transition-transform">
                    <Users className="h-8 w-8 text-university" />
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
                    <p className="text-3xl font-bold text-green-600">{stats.withCourses}</p>
                    <p className="text-sm text-muted-foreground font-medium">Active Faculty</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl group-hover:scale-110 transition-transform">
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                    style={{ width: `${stats.total > 0 ? (stats.withCourses / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-university transition-all duration-300 border-0 bg-gradient-to-br from-white to-orange-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-orange-600">{stats.withoutCourses}</p>
                    <p className="text-sm text-muted-foreground font-medium">Unassigned</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl group-hover:scale-110 transition-transform">
                    <UserPlus className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
                    style={{ width: `${stats.total > 0 ? (stats.withoutCourses / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-university transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-purple-600">{stats.departments}</p>
                    <p className="text-sm text-muted-foreground font-medium">Departments</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl group-hover:scale-110 transition-transform">
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 w-full rounded-full"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-university transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-indigo-600">{stats.averageCourses}</p>
                    <p className="text-sm text-muted-foreground font-medium">Avg Courses</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-8 w-8 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 w-3/4 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-center">
              <TabsList className="inline-flex bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-lg overflow-hidden">
                <TabsTrigger
                  value="view"
                  className="flex items-center space-x-2 px-6 py-3 font-medium text-sm data-[state=active]:bg-university-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  <Users className="h-5 w-5" />
                  <span>View All Lecturer Faculty</span>
                </TabsTrigger>
                <TabsTrigger
                  value="add"
                  className="flex items-center space-x-2 px-6 py-3 font-medium text-sm data-[state=active]:bg-university-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Add New Lecturer Faculty</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="view" className="space-y-6">
              <Card className="border-0 shadow-university bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-university/5 to-university/10 border-b border-university/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-university/10 rounded-xl">
                        <Users className="h-6 w-6 text-university" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-university">Faculty Lecturer Directory</CardTitle>
                        <CardDescription className="text-lg">
                          Comprehensive list of all registered faculty Lecturer members
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>Contact Management</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <LecturerList />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="add" className="space-y-6">
              <Card className="border-0 shadow-university bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-xl">
                        <UserPlus className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-green-800">Add New Faculty Member</CardTitle>
                        <CardDescription className="text-lg">
                          Register a new faculty member in the academic system
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <Award className="h-4 w-4" />
                      <span>Faculty Registration</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <AddLecturerForm onLecturerAdded={handleLecturerAdded} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  )
}
