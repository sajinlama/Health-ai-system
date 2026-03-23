"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Bell, Heart, Pill, Lock, LogOut, Edit, Save, X, Eye, EyeOff, Calendar, Activity, Moon, Zap, AlertCircle } from "lucide-react"

interface UserProfile {
  fullName: string
  email: string
  dateOfBirth: string
  gender: string
  height: string
  weight: number
  activityLevel: string
  password: string
  phone: string
}

interface HealthSettings {
  primaryCondition: string
  diagnosedDate: string
  targetWeight: number
  targetBP: string
  sleepTarget: number
  exerciseTarget: number
  sodiumTarget: number
  waterTarget: number
}

export default function SettingsPage() {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true)
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true)
  const [pushNotifications, setPushNotifications] = useState<boolean>(true)

  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: "Ghost",
    email: "ghost@example.com",
    dateOfBirth: "1990-05-15",
    gender: "Male",
    height: "5'10\"",
    weight: 72,
    activityLevel: "MODERATELY_ACTIVE",
    password: "••••••••",
    phone: "+1 (555) 123-4567"
  })

  const [healthSettings, setHealthSettings] = useState<HealthSettings>({
    primaryCondition: "HYPERTENSION",
    diagnosedDate: "2023-01-15",
    targetWeight: 70,
    targetBP: "120/80",
    sleepTarget: 7.5,
    exerciseTarget: 30,
    sodiumTarget: 2300,
    waterTarget: 8,
  })

  const [tempProfile, setTempProfile] = useState<UserProfile>(userProfile)

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempProfile({ ...tempProfile, [e.target.name]: e.target.value })
  }

  const saveProfile = () => {
    setUserProfile(tempProfile)
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setTempProfile(userProfile)
    setIsEditing(false)
  }

  return (
    <section className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground">
            Settings ⚙️
          </h1>
          <p className="text-muted-foreground">
            Manage your profile, health preferences, and app settings
          </p>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">

          {/* LEFT: USER PROFILE */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-6">
              <User className="text-primary" />
              <h2 className="text-lg font-semibold">👤 Profile Settings</h2>
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Full Name</p>
                  <p className="text-foreground font-semibold">{userProfile.fullName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Email</p>
                  <p className="text-foreground">{userProfile.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Phone</p>
                  <p className="text-foreground">{userProfile.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Date of Birth</p>
                  <p className="text-foreground">{userProfile.dateOfBirth}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Gender</p>
                  <p className="text-foreground">{userProfile.gender}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Height</p>
                    <p className="text-foreground font-semibold">{userProfile.height}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Weight</p>
                    <p className="text-foreground font-semibold">{userProfile.weight} kg</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Activity Level</p>
                  <p className="text-foreground">{userProfile.activityLevel.replace(/_/g, ' ')}</p>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-primary to-accent mt-4" 
                  onClick={() => {
                    setIsEditing(true)
                    setTempProfile(userProfile)
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase block mb-1">Full Name</label>
                  <input 
                    name="fullName" 
                    value={tempProfile.fullName}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase block mb-1">Email</label>
                  <input 
                    name="email" 
                    type="email"
                    value={tempProfile.email}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase block mb-1">Phone</label>
                  <input 
                    name="phone" 
                    value={tempProfile.phone}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase block mb-1">Date of Birth</label>
                  <input 
                    name="dateOfBirth" 
                    type="date"
                    value={tempProfile.dateOfBirth}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase block mb-1">Height</label>
                    <input 
                      name="height" 
                      value={tempProfile.height}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase block mb-1">Weight (kg)</label>
                    <input 
                      name="weight" 
                      type="number"
                      value={tempProfile.weight}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 bg-gradient-to-r from-primary to-accent" onClick={saveProfile}>
                    <Save className="w-4 h-4 mr-2" /> Save
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={cancelEdit}>
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* MIDDLE: HEALTH SETTINGS */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="text-primary" />
              <h2 className="text-lg font-semibold">❤️ Health Goals</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-background/60 border border-red-500/30">
                <div className="flex items-start gap-3">
                  <Pill className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Primary Condition</p>
                    <p className="text-xs text-muted-foreground mt-1">{healthSettings.primaryCondition}</p>
                    <p className="text-xs text-red-600 mt-1">🫀 Diagnosed: {healthSettings.diagnosedDate}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-background/60 border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Target Weight</p>
                  <p className="text-lg font-bold text-foreground">{healthSettings.targetWeight} kg</p>
                </div>
                <div className="p-3 rounded-lg bg-background/60 border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Target BP</p>
                  <p className="text-lg font-bold text-foreground">{healthSettings.targetBP}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-background/60 border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Sleep Target</p>
                  <p className="text-lg font-bold text-foreground">{healthSettings.sleepTarget}h</p>
                </div>
                <div className="p-3 rounded-lg bg-background/60 border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Exercise</p>
                  <p className="text-lg font-bold text-foreground">{healthSettings.exerciseTarget} min</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-background/60 border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Sodium Target</p>
                  <p className="text-lg font-bold text-foreground">{healthSettings.sodiumTarget} mg</p>
                </div>
                <div className="p-3 rounded-lg bg-background/60 border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Water Target</p>
                  <p className="text-lg font-bold text-foreground">{healthSettings.waterTarget} glasses</p>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                <Edit className="w-4 h-4 mr-2" /> Edit Health Goals
              </Button>
            </div>
          </Card>

          {/* RIGHT: SECURITY SETTINGS */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="text-primary" />
              <h2 className="text-lg font-semibold">🔒 Security</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Current Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    defaultValue="••••••••"
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Change Password
              </Button>

              <div className="space-y-2 pt-2 border-t border-border/50">
                <p className="text-sm font-semibold text-foreground">Two-Factor Authentication</p>
                <div className="flex items-center justify-between p-2 rounded-lg bg-background/40">
                  <span className="text-sm text-muted-foreground">2FA Status</span>
                  <span className="text-xs font-semibold text-yellow-600">⚠️ Disabled</span>
                </div>
                <Button variant="outline" className="w-full">
                  Enable 2FA
                </Button>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/50">
                <p className="text-sm font-semibold text-foreground">Active Sessions</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>📱 Chrome on Mac - Active now</p>
                  <p>⌨️ Safari on iPhone - 2h ago</p>
                </div>
                <Button variant="outline" className="w-full text-sm">
                  Logout All Other Sessions
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* NOTIFICATION SETTINGS */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">

          {/* LEFT: NOTIFICATIONS */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-6">
              <Bell className="text-primary" />
              <h2 className="text-lg font-semibold">🔔 Notifications</h2>
            </div>

            <div className="space-y-4">

              {/* All Notifications Toggle */}
              <div className="p-4 rounded-lg bg-background/60 border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">All Notifications</p>
                    <p className="text-sm text-muted-foreground">Manage all notification settings</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notificationsEnabled}
                      onChange={(e) => setNotificationsEnabled(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-12 h-6 bg-gray-400 peer-checked:bg-green-500 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>

              {/* Medication Reminders */}
              <div className="p-4 rounded-lg bg-background/60 border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">💊 Medication Reminders</p>
                    <p className="text-sm text-muted-foreground">Get notified when it's time to take medicine</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-12 h-6 bg-gray-400 peer-checked:bg-green-500 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>

              {/* BP Checkup Reminder */}
              <div className="p-4 rounded-lg bg-background/60 border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">📏 BP Checkup Reminder</p>
                    <p className="text-sm text-muted-foreground">Weekly blood pressure monitoring alerts</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-12 h-6 bg-gray-400 peer-checked:bg-green-500 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>

              {/* Exercise Reminders */}
              <div className="p-4 rounded-lg bg-background/60 border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">🏃 Exercise Reminders</p>
                    <p className="text-sm text-muted-foreground">Daily activity and exercise notifications</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-12 h-6 bg-gray-400 peer-checked:bg-green-500 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>

              {/* Meal Reminders */}
              <div className="p-4 rounded-lg bg-background/60 border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">🍎 Meal Reminders</p>
                    <p className="text-sm text-muted-foreground">Low sodium meal timing alerts</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-12 h-6 bg-gray-400 peer-checked:bg-green-500 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>

            </div>
          </Card>

          {/* RIGHT: NOTIFICATION CHANNELS */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="text-primary" />
              <h2 className="text-lg font-semibold">⚡ Notification Channels</h2>
            </div>

            <div className="space-y-4">

              {/* Push Notifications */}
              <div className="p-4 rounded-lg bg-background/60 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-foreground">📱 Push Notifications</p>
                  <label className="relative inline-flex cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={pushNotifications}
                      onChange={(e) => setPushNotifications(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-12 h-6 bg-gray-400 peer-checked:bg-green-500 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
              </div>

              {/* Email Notifications */}
              <div className="p-4 rounded-lg bg-background/60 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-foreground">📧 Email Notifications</p>
                  <label className="relative inline-flex cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-12 h-6 bg-gray-400 peer-checked:bg-green-500 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">Receive emails for important updates</p>
              </div>

              {/* Email Verification */}
              <div className="p-4 rounded-lg bg-background/60 border border-border/50">
                <p className="text-sm font-semibold text-foreground mb-2">Email Address</p>
                <p className="text-sm text-muted-foreground mb-3">{userProfile.email}</p>
                <Button variant="outline" className="w-full text-sm">
                  Verify Email
                </Button>
              </div>

              {/* Notification Frequency */}
              <div className="p-4 rounded-lg bg-background/60 border border-border/50">
                <p className="text-sm font-semibold text-foreground mb-2">Notification Frequency</p>
                <select className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="realtime">Real-time</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Digest</option>
                </select>
              </div>

            </div>
          </Card>
        </div>

        {/* DANGER ZONE */}
        <Card className="p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-4">⚠️ Danger Zone</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-background/60 border border-red-500/30">
                  <p className="text-sm font-semibold text-foreground mb-2">Clear All Data</p>
                  <p className="text-xs text-muted-foreground mb-3">Remove all your health data and start fresh</p>
                  <Button variant="outline" className="w-full text-red-500 border-red-500/30 hover:bg-red-500/10">
                    Clear Data
                  </Button>
                </div>

                <div className="p-4 rounded-lg bg-background/60 border border-red-500/30">
                  <p className="text-sm font-semibold text-foreground mb-2">Delete Account</p>
                  <p className="text-xs text-muted-foreground mb-3">Permanently delete your account and all associated data</p>
                  <Button variant="outline" className="w-full text-red-500 border-red-500/30 hover:bg-red-500/10">
                    <LogOut className="w-4 h-4 mr-2" /> Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </section>
  )
}