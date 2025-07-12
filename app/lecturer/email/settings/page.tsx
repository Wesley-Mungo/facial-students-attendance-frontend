"use client"

import { useState, useEffect } from "react"
import { LecturerLayout } from "@/components/layouts/lecturer-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Settings, Eye, EyeOff, Loader2, CheckCircle, Shield, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmailSettings {
  email: string
  password: string
  smtpServer?: string
  smtpPort?: number
}

export default function EmailSettings() {
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    email: "",
    password: "",
    smtpServer: "smtp.gmail.com",
    smtpPort: 587,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasExistingSettings, setHasExistingSettings] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadEmailSettings()
  }, [])

  const loadEmailSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/lecturer/email/settings")
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setEmailSettings({
            email: data.settings.email || "",
            password: "", // Don't load password for security
            smtpServer: data.settings.smtpServer || "smtp.gmail.com",
            smtpPort: data.settings.smtpPort || 587,
          })
          setHasExistingSettings(true)
        }
      }
    } catch (error) {
      console.error("Failed to load email settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!emailSettings.email || !emailSettings.password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email address and password",
        variant: "destructive",
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailSettings.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch("/api/lecturer/email/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailSettings),
      })

      if (response.ok) {
        setHasExistingSettings(true)
        toast({
          title: "Settings Saved",
          description: "Email settings saved securely!",
        })
        // Clear password field after saving for security
        setEmailSettings((prev) => ({ ...prev, password: "" }))
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to save email settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save email settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const testEmailConnection = async () => {
    if (!emailSettings.email || !emailSettings.password) {
      toast({
        title: "Missing Information",
        description: "Please enter email and password before testing",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/lecturer/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailSettings),
      })

      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "Email configuration is working correctly",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Connection Failed",
          description: errorData.error || "Failed to connect with email settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to test email connection",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <LecturerLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading email settings...</span>
        </div>
      </LecturerLayout>
    )
  }

  return (
    <LecturerLayout>
      <div className="space-y-8 p-6">
                         {/* Header Section */}
                         <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-university-primary via-blue-600 to-purple-600 p-8 text-white">
                           <div className="absolute inset-0 bg-black/10"></div>
                           <div className="relative z-10">
                             <div className="flex items-center justify-between">
                               <div>
                                   <h1 className="text-4xl font-bold mb-2">Email Configuration</h1>
                                 <p className="text-blue-100 text-lg">Configure your email settings to send attendance reports</p>
                                 </div>
                                 <Button  variant="outline" className="hidden md:flex items-center space-x-4 bg-white/20 backdrop-blur-sm rounded-lg p-4">
                                     <Bell className="h-8 w-8" />
                                     <span className="ml-2">Log Out</span>
                                 </Button>
                             </div>
                           </div>
                           <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10"></div>
                           <div className="absolute -left-20 -bottom-20 h-32 w-32 rounded-full bg-white/5"></div>
                         </div>

        {/* Email Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Email Settings</span>
            </CardTitle>
            <CardDescription>
              Configure your email credentials to send attendance reports to students and administrators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Your Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={emailSettings.email}
                  onChange={(e) => setEmailSettings((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="e.g., chowesleymungo@gmail.com"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Email Password (for sending emails)</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={emailSettings.password}
                    onChange={(e) => setEmailSettings((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder={hasExistingSettings ? "Enter new password to update" : "Enter your email password"}
                    className="w-full pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpServer">SMTP Server</Label>
                  <Input
                    id="smtpServer"
                    value={emailSettings.smtpServer}
                    onChange={(e) => setEmailSettings((prev) => ({ ...prev, smtpServer: e.target.value }))}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={(e) =>
                      setEmailSettings((prev) => ({ ...prev, smtpPort: Number.parseInt(e.target.value) }))
                    }
                    placeholder="587"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button onClick={handleSaveSettings} disabled={isSaving} className="flex-1">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={testEmailConnection}>
                <Mail className="mr-2 h-4 w-4" />
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Notice:</strong> Your email credentials are encrypted and stored securely. We
                  recommend using an app-specific password for Gmail accounts.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <p>
                  <strong>For Gmail users:</strong> You may need to enable "Less secure app access" or use an
                  app-specific password.
                </p>
                <p>
                  <strong>App Password Setup:</strong> Go to Google Account Settings → Security → 2-Step Verification →
                  App passwords
                </p>
                <p>
                  <strong>Supported Email Providers:</strong> Gmail, Outlook, Yahoo Mail, and other SMTP-compatible
                  services
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Status */}
        {hasExistingSettings && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Email Configuration Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Configured Email:</strong> {emailSettings.email}
                </p>
                <p className="text-sm">
                  <strong>SMTP Server:</strong> {emailSettings.smtpServer}:{emailSettings.smtpPort}
                </p>
                <p className="text-sm text-green-600">✓ Email settings are configured and ready to use</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </LecturerLayout>
  )
}
