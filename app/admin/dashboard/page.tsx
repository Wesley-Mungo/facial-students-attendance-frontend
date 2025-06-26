"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  UserPlus,
  Settings,
  TrendingUp,
  Clock,
  Award,
  Bell,
} from "lucide-react"
import Link from "next/link"
import { AdminLayout } from "@/components/layouts/admin-layout"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Students",
      value: "2,847",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Active Lecturers",
      value: "156",
      change: "+3%",
      trend: "up",
      icon: GraduationCap,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Total Courses",
      value: "89",
      change: "+8%",
      trend: "up",
      icon: BookOpen,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Attendance Rate",
      value: "94.2%",
      change: "+2.1%",
      trend: "up",
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
    },
  ]

  const menuItems = [
    {
      title: "Register New Student",
      description: "Add new students to the system with facial recognition setup",
      icon: UserPlus,
      href: "/admin/students/register",
      gradient: "from-university-primary to-blue-600",
      iconBg: "bg-gradient-to-r from-university-primary to-blue-600",
      category: "Student Management",
    },
    {
      title: "Manage Lecturers",
      description: "Add, edit, or remove lecturers and assign courses",
      icon: Users,
      href: "/admin/lecturers",
      gradient: "from-emerald-500 to-emerald-600",
      iconBg: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      category: "Staff Management",
    },
    {
      title: "Manage Courses",
      description: "Create and manage course offerings and schedules",
      icon: BookOpen,
      href: "/admin/courses",
      gradient: "from-purple-500 to-purple-600",
      iconBg: "bg-gradient-to-r from-purple-500 to-purple-600",
      category: "Academic Management",
    },
    {
      title: "View Students by Department",
      description: "Browse students organized by department and level",
      icon: GraduationCap,
      href: "/admin/students/departments",
      gradient: "from-orange-500 to-orange-600",
      iconBg: "bg-gradient-to-r from-orange-500 to-orange-600",
      category: "Student Management",
    },
    {
      title: "Attendance Summary",
      description: "View comprehensive attendance reports and analytics",
      icon: BarChart3,
      href: "/admin/attendance/summary",
      gradient: "from-red-500 to-red-600",
      iconBg: "bg-gradient-to-r from-red-500 to-red-600",
      category: "Analytics",
    },
    {
      title: "System Settings",
      description: "Configure system preferences and security settings",
      icon: Settings,
      href: "/admin/settings",
      gradient: "from-gray-500 to-gray-600",
      iconBg: "bg-gradient-to-r from-gray-500 to-gray-600",
      category: "System",
    },
  ]

  const recentActivities = [
    {
      action: "New student registered",
      details: "John Doe (CS/2024/001) added to Computer Science",
      time: "2 minutes ago",
      icon: UserPlus,
      color: "text-green-600",
    },
    {
      action: "Course assignment updated",
      details: "Dr. Smith assigned to Advanced Algorithms",
      time: "15 minutes ago",
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      action: "Attendance session completed",
      details: "Mobile Programming - 45 students marked present",
      time: "1 hour ago",
      icon: Clock,
      color: "text-purple-600",
    },
    {
      action: "System backup completed",
      details: "Daily backup completed successfully",
      time: "2 hours ago",
      icon: Award,
      color: "text-orange-600",
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-8 p-6">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-university-primary via-blue-600 to-purple-600 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Welcome back, Administrator</h1>
                <p className="text-blue-100 text-lg">Manage your university's attendance system with ease</p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <Bell className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10"></div>
          <div className="absolute -left-20 -bottom-20 h-32 w-32 rounded-full bg-white/5"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
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
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm font-medium text-green-600">{stat.change}</span>
                      <span className="text-sm text-muted-foreground ml-1">from last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuItems.map((item, index) => (
                  <Link key={item.href} href={item.href} className="block">
                    <Card className="group relative overflow-hidden border-0 shadow-university hover:shadow-university-lg transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                      ></div>
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
                        <Button className="w-full bg-gradient-to-r from-university-primary to-blue-600 hover:from-university-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                          Access Module
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="space-y-6">
            <Card className="border-0 shadow-university">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-university-primary" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg bg-gray-100 ${activity.color}`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-university bg-gradient-to-br from-university-primary to-blue-600 text-white">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Today's Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Active Sessions</span>
                  <span className="text-2xl font-bold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Students Present</span>
                  <span className="text-2xl font-bold">1,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Completion Rate</span>
                  <span className="text-2xl font-bold">96%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
