"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Calendar, Search, RefreshCw, Edit, Trash2, BookOpen, GraduationCap, Award, Star } from "lucide-react"

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

export function CourseList({ courses, isLoading, onRefresh }: { courses: Course[]; isLoading?: boolean; onRefresh?: () => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sessionFilter, setSessionFilter] = useState("all")
  const [assignmentFilter, setAssignmentFilter] = useState("all")

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      (course.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (course.course_code?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (course.lecturer_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())

    const matchesSession = sessionFilter === "all" || course.session === sessionFilter

    const matchesAssignment =
      assignmentFilter === "all" ||
      (assignmentFilter === "assigned" && course.lecturer_id) ||
      (assignmentFilter === "unassigned" && !course.lecturer_id)

    return matchesSearch && matchesSession && matchesAssignment
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
            <p className="text-lg font-semibold text-university">Loading Course Directory</p>
            <p className="text-muted-foreground">Fetching academic course information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Enhanced Search and Filter Section - Matching Lecturer Management */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by course name, code, or lecturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-white/80 backdrop-blur-sm border-gray-200/60 focus:border-university/50 focus:ring-university/20"
            />
          </div>
          <Select value={sessionFilter} onValueChange={setSessionFilter}>
            <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-gray-200/60">
              <SelectValue placeholder="Filter by session" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              {Array.from(new Set(courses.map((c) => c.session))).map((session) => (
                <SelectItem key={session} value={session}>
                  {session}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
            <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-gray-200/60">
              <SelectValue placeholder="Filter by assignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200/50">
            Showing <span className="font-semibold text-university">{filteredCourses.length}</span> of{" "}
            <span className="font-semibold">{courses.length}</span> courses
          </div>
          <Button
            variant="outline"
            onClick={onRefresh}
            className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:bg-university/5 hover:border-university/30"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Course Cards - Matching Lecturer Management Layout */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16">
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-700">No Courses Found</h3>
              <p className="text-muted-foreground">
                No courses match your search criteria. Try adjusting your filters.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course, index) => (
            <Card
              key={course.id}
              className="group hover:shadow-university transition-all duration-300 border-2 bg-white/80 backdrop-blur-sm overflow-hidden"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-university to-university-dark rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {course.course_code && course.course_code.length >= 2 ? course.course_code.substring(0, 2) : "--"}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg text-gray-800 group-hover:text-university transition-colors">
                          {course.name || "Unnamed Course"}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-university/10 text-university border-university/20">
                          {course.course_code || "N/A"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{course.session || "N/A"}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>
                          {course.lecturer_name ? (
                            <span className="text-green-600 font-medium">{course.lecturer_name}</span>
                          ) : (
                            <span className="text-orange-600 font-medium">Unassigned</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {/* Edit and Delete buttons removed for prop-based version */}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Course Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4 text-university" />
                        <span className="text-sm font-semibold text-gray-700">Course Details</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {typeof course.student_count === 'number' ? course.student_count : 0} Students
                      </Badge>
                    </div>

                    {!course.lecturer_id ? (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-orange-700">
                          <Award className="h-4 w-4" />
                          <span className="text-sm font-medium">No lecturer assigned</span>
                        </div>
                        <p className="text-xs text-orange-600 mt-1">This course is available for lecturer assignment</p>
                      </div>
                    ) : (
                      <div className="bg-university/5 border border-university/10 rounded-lg p-3 hover:bg-university/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-university" />
                              <span className="font-medium text-sm text-gray-800">{course.lecturer_name}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-600">
                              <span className="bg-white/60 px-2 py-1 rounded-md border border-gray-200/60">
                                Assigned Lecturer
                              </span>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{course.session}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-university">
                            <Star className="h-4 w-4 fill-current" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Course Stats - Matching Lecturer Management */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div className="text-center space-y-1">
                      <p className="text-2xl font-bold text-university">{typeof course.student_count === 'number' ? course.student_count : 0}</p>
                      <p className="text-xs text-gray-600">Enrolled Students</p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-2xl font-bold text-blue-600">{typeof course.average_attendance === 'number' ? `${course.average_attendance}%` : '0%'}</p>
                      <p className="text-xs text-gray-600">Average Attendance</p>
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
