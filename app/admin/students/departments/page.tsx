"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building, Users, Search, RefreshCw, GraduationCap, Award } from "lucide-react"
import { StudentsByDepartmentList } from "@/components/admin/students-by-department-list"
import { useToast } from "@/hooks/use-toast"

interface Student {
  id: string
  studentId: string
  name: string
  email: string
  department: string
  level: string
}

interface DepartmentData {
  department: string
  students: Student[]
  totalCount: number
}

export default function StudentsByDepartment() {
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchStudentsByDepartment()
  }, [])

  const [totalStudents, setTotalStudents] = useState<number>(0)

  const fetchStudentsByDepartment = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/students/departments")
      if (response.ok) {
        const data = await response.json()
        setDepartmentData(data.departments)
        // Prefer backend total if available, else sum department counts
        if (typeof data.total_students === "number") {
          setTotalStudents(data.total_students)
        } else if (Array.isArray(data.departments)) {
          setTotalStudents(data.departments.reduce((sum: number, dept: any) => sum + (dept.totalCount || 0), 0))
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch students by department",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students by department",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDepartments = departmentData.filter((dept) => {
    const matchesDepartment = selectedDepartment === "all" || dept.department === selectedDepartment
    const matchesSearch =
      searchTerm === "" ||
      dept.students.some(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    return matchesDepartment && matchesSearch
  })

  const departments = departmentData.map((dept) => dept.department)

  const getFilteredStudents = (students: Student[]) => {
    let filtered = students
    if (selectedLevel !== "all" && selectedLevel.trim() !== "") {
      filtered = filtered.filter((student) =>
        student.level && student.level.trim().toLowerCase() === selectedLevel.trim().toLowerCase()
      )
    }
    if (searchTerm === "") return filtered
    return filtered.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
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
                  <h1 className="text-4xl font-bold text-white">View All Students by Department</h1>
                  <p className="text-white/90 text-lg">Browse Students Organized by Department and Level</p>
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

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="relative overflow-hidden group hover:shadow-university transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="p-3 bg-gradient-to-br from-university/10 to-university/20 rounded-xl group-hover:scale-110 transition-transform">
                    <p className="text-2xl font-bold">{totalStudents}</p>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Building className="h-8 w-8 text-green-600" />
                  <div className="p-3 bg-gradient-to-br from-university/10 to-university/20 rounded-xl group-hover:scale-110 transition-transform" >
                    <p className="text-2xl font-bold">{departments.length}</p>
                    <p className="text-sm text-muted-foreground">Departments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-8 w-8 text-purple-600" />
                  <div className="p-3 bg-gradient-to-br from-university/10 to-university/20 rounded-xl group-hover:scale-110 transition-transform">
                    <p className="text-2xl font-bold">
                      {departmentData.length > 0 ? Math.round(totalStudents / departmentData.length) : 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg per Department</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Search & Filter</span>
              </CardTitle>
              <CardDescription>Filter students by department or search by name, ID, or email</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, student ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full sm:w-64">
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
                <div className="relative w-full sm:w-48">
                  <Input
                    placeholder="Enter or select level"
                    value={selectedLevel === "all" ? "" : selectedLevel}
                    onChange={e => setSelectedLevel(e.target.value || "all")}
                    list="level-suggestions"
                  />
                </div>
                <datalist id="level-suggestions">
                  {Array.from(new Set(
                    departmentData
                      .filter((dept) => selectedDepartment === "all" || dept.department === selectedDepartment)
                      .flatMap((dept) => dept.students.map((s) => s.level))
                      .filter((level) => !!level)
                  )).map((level) => (
                    <option key={level} value={level} />
                  ))}
                </datalist>
                <Button variant="outline" onClick={fetchStudentsByDepartment}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Department Lists */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading students...</span>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <Alert>
              <Building className="h-4 w-4" />
              <AlertDescription>No departments found matching your search criteria.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {filteredDepartments.map((deptData) => {
                const filteredStudents = getFilteredStudents(deptData.students)
                if (filteredStudents.length === 0 && searchTerm !== "") return null

                return (
                  <Card key={deptData.department} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <Building className="h-5 w-5 text-blue-600" />
                          <span>Department: {deptData.department}</span>
                        </CardTitle>
                        <Badge variant="secondary" className="text-sm">
                          Total: {searchTerm ? filteredStudents.length : deptData.totalCount} students
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <StudentsByDepartmentList
                        department={deptData.department}
                        searchTerm={searchTerm}
                      />
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Results Summary */}
          {!isLoading && (
            <div className="text-center text-sm text-muted-foreground">
              {searchTerm || selectedDepartment !== "all" ? (
                <span>
                  Showing filtered results •{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedDepartment("all")
                    }}
                  >
                    Clear filters
                  </Button>
                </span>
              ) : (
                <span>
                  Showing all {totalStudents} students across {departments.length} departments
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
