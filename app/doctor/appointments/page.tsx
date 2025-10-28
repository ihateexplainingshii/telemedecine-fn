"use client"

import { Calendar, Bell, Users, Clock } from "lucide-react"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { AppointmentsQueue } from "@/features/doctors/AppointmentsQueue"
import { USER_ROLES } from "@/config/constants"

const navigation = [
  { name: "Dashboard", href: "/doctor-dashboard", icon: Calendar },
  { name: "My Profile", href: "/doctor/profile", icon: Users },
  { name: "Appointments Queue", href: "/doctor/appointments", icon: Clock, current: true },
  { name: "Notifications", href: "/doctor/notifications", icon: Bell },
]

function AppointmentsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Appointments Queue</h1>
        <p className="text-muted-foreground mt-2 text-pretty">Manage your scheduled patient appointments</p>
      </div>

      <AppointmentsQueue />
    </div>
  )
}

export default function DoctorAppointmentsPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}>
      <DashboardLayout navigation={navigation}>
        <AppointmentsContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
