"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from 'next/image'
import {
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Shield,
  LayoutDashboard,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/admin/students", icon: GraduationCap },
  { name: "Lecturers", href: "/admin/lecturers", icon: Users },
  { name: "Courses", href: "/admin/courses", icon: BookOpen },
  { name: "Attendance", href: "/admin/attendance", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    router.push("/")
  }

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-gradient-to-b from-[#182EC3] to-[#1428A0]">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-center py-8 px-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="text-white">
                  <h2 className="text-lg font-bold">Admin Portal</h2>
                  <p className="text-xs text-white/80">Smart Attendance</p>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-white transition-all duration-200 ${
                    isActive(item.href) ? "bg-white/20 backdrop-blur-sm shadow-lg" : "hover:bg-white/10"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile Logout */}
            <div className="p-4 border-t border-white/10">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full text-white hover:bg-white/10 justify-start"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-[#182EC3] to-[#1428A0] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-center py-8 px-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-18 h-18 bg-white/10  flex items-center justify-center ">
                 <Image
              src="/icon.png"
              alt="Admin Logo"
              width={100}
              height={100}
              className="border-2 border-white shadow-md"
            />
              </div>
              <div className="text-white">
                <h2 className="text-xl font-bold">Admin Portal</h2>
                <p className="text-sm text-white/80">Smart Attendance</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-white transition-all duration-200 group ${
                  isActive(item.href)
                    ? "bg-white/20 backdrop-blur-sm shadow-lg transform scale-105"
                    : "hover:bg-white/10 hover:transform hover:scale-105"
                }`}
              >
                <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full text-white hover:bg-white/10 justify-start group transition-all duration-200"
            >
              <LogOut className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-72">
        <main className="min-h-screen bg-gray-50">{children}</main>
      </div>
    </div>
  )
}
