"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users, Calendar, TrendingUp, TrendingDown, BarChart3 } from "lucide-react"

interface AttendanceSummary {
  totalSessions: number
  attendanceDates: string[]
  totalStudents: number
  averageAttendance: number
  highestAttendance: number
  lowestAttendance: number
}

interface AttendanceSummaryStatsProps {
  summary: AttendanceSummary
  isLoading: boolean
}

export function AttendanceSummaryStats({ summary, isLoading }: AttendanceSummaryStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: "Total Sessions",
      value: summary.totalSessions,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Total Students",
      value: summary.totalStudents,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Average Attendance",
      value: `${summary.averageAttendance.toFixed(2)}%`,
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
    {
      title: "Attendance Range",
      value: `${summary.lowestAttendance.toFixed(0)}% - ${summary.highestAttendance.toFixed(0)}%`,
      icon: summary.highestAttendance > summary.lowestAttendance ? TrendingUp : TrendingDown,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attendance Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attendance Dates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {summary.attendanceDates.map((date, index) => (
              <div key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium">
                {date}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Average Attendance</span>
              <span className="font-medium">{summary.averageAttendance.toFixed(2)}%</span>
            </div>
            <Progress value={summary.averageAttendance} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Highest:</span>
              <span className="font-medium text-green-600">{summary.highestAttendance.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lowest:</span>
              <span className="font-medium text-red-600">{summary.lowestAttendance.toFixed(2)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
