"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { User, Mail, Edit, Trash2, Eye } from "lucide-react"

interface Student {
  id: string
  studentId: string
  name: string
  email: string
  department: string
  level: string
}

interface StudentsByDepartmentListProps {
  department: string
  searchTerm: string
}

export function StudentsByDepartmentList({ department, searchTerm }: StudentsByDepartmentListProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedView, setExpandedView] = useState(false)

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/students/")
        if (!response.ok) throw new Error("Failed to fetch students")
        const data = await response.json()
        console.log("Fetched students:", data)
        // Map backend fields to frontend fields
        const studentsArray = Array.isArray(data) ? data : data.students || []
        const normalized = studentsArray.map((s: any) => ({
          id: s.id,
          studentId: s.studentId || s.student_id || s.id_number || "",
          name: s.name,
          email: s.email,
          department: s.department,
          level: s.level || s.class_level || "",
        }))
        setStudents(normalized)
      } catch (err: any) {
        setError(err.message || "Unknown error")
      } finally {
        setIsLoading(false)
      }
    }
    fetchStudents()
  }, [])

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text

    const regex = new RegExp(`(${searchTerm})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  // Filter students by department and search term
  const filteredStudents = students.filter(
    (student) =>
      student.department === department &&
      (
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
  )

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading students...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>
  }

  if (filteredStudents.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No students found in {department} department</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredStudents.map((student, index) => (
            <div key={student.id || index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {highlightText(student.name, searchTerm)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold">Student ID:</span>
                      <span className="text-xs text-gray-900 dark:text-gray-100">{highlightText(student.studentId, searchTerm)}</span>
                      <Badge variant="secondary" className="text-xs ml-2">
                        Level: {student.level}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {highlightText(student.email, searchTerm)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 p-4">
        {filteredStudents.map((student, index) => (
          <Card key={student.id || index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                      <p className="font-medium">{highlightText(student.name, searchTerm)}</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold">Student ID:</span>
                      <span className="text-xs text-gray-900 dark:text-gray-100">{highlightText(student.studentId, searchTerm)}</span>
                      <Badge variant="secondary" className="text-xs ml-2">
                        Level: {student.level}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{highlightText(student.email, searchTerm)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Show More/Less Button for Large Lists */}
      {filteredStudents.length > 10 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Button variant="ghost" onClick={() => setExpandedView(!expandedView)} className="w-full">
            {expandedView ? "Show Less" : `Show All ${filteredStudents.length} Students`}
          </Button>
        </div>
      )}
    </div>
  )
}
