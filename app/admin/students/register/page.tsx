"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Camera, Upload, Users, Award, GraduationCap } from "lucide-react"
import { LiveCameraRegistration } from "@/components/admin/live-camera-registration"
import { ImageUploadRegistration } from "@/components/admin/image-upload-registration"
import { useToast } from "@/hooks/use-toast"

export default function RegisterStudent() {
  const [registrationMethod, setRegistrationMethod] = useState<"camera" | "upload">("camera")
  const { toast } = useToast()

  const handleRegistrationSuccess = (studentName: string) => {
    toast({
      title: "Registration Successful",
      description: `Successfully registered ${studentName} with facial samples`,
    })
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
                  <h1 className="text-4xl font-bold text-white">Register New Student</h1>
                  <p className="text-white/90 text-lg">Add a new student with facial Recognition data</p>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Student Registration</span>
              </CardTitle>
              <CardDescription>Choose a registration method and enter student details</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="camera"
                value={registrationMethod}
                onValueChange={(value) => setRegistrationMethod(value as "camera" | "upload")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="camera" className="flex items-center space-x-2">
                    <Camera className="h-4 w-4" />
                    <span>Live Camera Registration</span>
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Image Upload Registration</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="camera" className="mt-6">
                  <LiveCameraRegistration onRegistrationSuccess={handleRegistrationSuccess} />
                </TabsContent>

                <TabsContent value="upload" className="mt-6">
                  <ImageUploadRegistration onRegistrationSuccess={handleRegistrationSuccess} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
