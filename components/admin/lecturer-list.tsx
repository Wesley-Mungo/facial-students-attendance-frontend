"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Mail,
  BookOpen,
  Building,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Calendar,
  Star,
  Award,
  Users,
  GraduationCap,
} from "lucide-react"

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
  username?: string
}

export function LecturerList() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [courseFilter, setCourseFilter] = useState("all")

  // Fetch lecturers from API
  const fetchLecturers = async () => {
    setIsLoading(true)
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/admin/lecturers", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        // Map API fields to frontend fields
        const mapped = (Array.isArray(data) ? data : data.lecturers || []).map((l: any) => ({
          id: String(l.id),
          lecturerId: String(l.id),
          fullName: l.name || l.fullName || l.username || "",
          department: l.department || "Unknown",
          email: l.email || "",
          assignedCourses: Array.isArray(l.courses)
            ? l.courses.map((c: any) => ({
                id: c.course_code || c.code || c.name,
                name: c.name || "",
                code: c.course_code || c.code || "",
                semester: c.session || c.semester || "",
              }))
            : [],
        }))
        setLecturers(mapped)
      } else {
        setLecturers([])
      }
    } catch (err) {
      setLecturers([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLecturers()
  }, [])

  // Ensure all required fields exist and filter out malformed objects
  const safeLecturers = Array.isArray(lecturers)
    ? lecturers
        .filter(l => l && (l.fullName || l.username) && l.email && l.lecturerId)
        .map(l => ({
          ...l,
          fullName: l.fullName || l.username || "",
          email: l.email || "",
          lecturerId: l.lecturerId || "",
          assignedCourses: Array.isArray(l.assignedCourses) ? l.assignedCourses : [],
        }))
    : [];

  const departments = Array.from(new Set(safeLecturers.map((l) => l.department)))

  const filteredLecturers = safeLecturers.filter((lecturer) => {
    const matchesSearch =
      lecturer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.lecturerId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = departmentFilter === "all" || lecturer.department === departmentFilter

    const matchesCourse =
      courseFilter === "all" ||
      (courseFilter === "with-courses" && lecturer.assignedCourses.length > 0) ||
      (courseFilter === "no-courses" && lecturer.assignedCourses.length === 0)

    return matchesSearch && matchesDepartment && matchesCourse
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="relative">
            <RefreshCw className="h-12 w-12 animate-spin text-university mx-auto" />
            <div className="absolute inset-0 bg-university/20 rounded-full blur-xl"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-university">Loading Faculty Directory</p>
            <p className="text-muted-foreground">Fetching faculty member information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Enhanced Search and Filter Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or faculty ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-white/80 backdrop-blur-sm border-gray-200/60 focus:border-university/50 focus:ring-university/20"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-gray-200/60">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-gray-200/60">
              <SelectValue placeholder="Filter by assignments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Faculty</SelectItem>
              <SelectItem value="with-courses">With Assignments</SelectItem>
              <SelectItem value="no-courses">No Assignments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200/50">
            Showing <span className="font-semibold text-university">{filteredLecturers.length}</span> of{" "}
            <span className="font-semibold">{safeLecturers.length}</span> faculty members
          </div>
          <Button
            variant="outline"
            onClick={fetchLecturers}
            className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:bg-university/5 hover:border-university/30"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Faculty Cards */}
      {filteredLecturers.length === 0 ? (
        <div className="text-center py-16">
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-700">No Faculty Members Found</h3>
              <p className="text-muted-foreground">
                No faculty members match your search criteria. Try adjusting your filters.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLecturers.map((lecturer) => (
            <Card key={lecturer.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-university/10 to-university/20">
                    <div className="absolute inset-0 rounded-full blur-xl" />
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          lecturer.fullName
                        )}&background=2563eb&color=fff&bold=true`}
                        alt={lecturer.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {/* Lecturer Name and Email */}
                  <div className="mt-2">
                    <div className="font-semibold text-lg text-gray-800">{lecturer.fullName}</div>
                    <div className="text-sm text-gray-500">{lecturer.email}</div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-university/10 hover:text-university"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Course Assignments */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-university" />
                        <span className="text-sm font-semibold text-gray-700">Course Assignments</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {lecturer.assignedCourses.length} {lecturer.assignedCourses.length === 1 ? "Course" : "Courses"}
                      </Badge>
                    </div>

                    {lecturer.assignedCourses.length === 0 ? (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-orange-700">
                          <Award className="h-4 w-4" />
                          <span className="text-sm font-medium">No course assignments</span>
                        </div>
                        <p className="text-xs text-orange-600 mt-1">
                          This faculty member is available for new course assignments
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {lecturer.assignedCourses.map((course) => (
                          <div
                            key={course.id}
                            className="bg-university/5 border border-university/10 rounded-lg p-3 hover:bg-university/10 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <GraduationCap className="h-4 w-4 text-university" />
                                  <span className="font-medium text-sm text-gray-800">{course.name}</span>
                                </div>
                                <div className="flex items-center space-x-4 text-xs text-gray-600">
                                  <span className="bg-white/60 px-2 py-1 rounded-md border border-gray-200/60">
                                    {course.code}
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{course.semester}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 text-university">
                                <Star className="h-4 w-4 fill-current" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Faculty Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div className="text-center space-y-1">
                      <p className="text-2xl font-bold text-university">{lecturer.assignedCourses.length}</p>
                      <p className="text-xs text-gray-600">Active Courses</p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-2xl font-bold text-green-600">
                        {lecturer.assignedCourses.length > 0 ? "100%" : "0%"}
                      </p>
                      <p className="text-xs text-gray-600">Engagement</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
