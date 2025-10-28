"use client"

import { Calendar, Bell, Users, Clock } from "lucide-react"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { DoctorProfile } from "@/features/doctors/DoctorProfile"
import { USER_ROLES } from "@/config/constants"

const navigation = [
  { name: "Dashboard", href: "/doctor-dashboard", icon: Calendar },
  { name: "My Profile", href: "/doctor/profile", icon: Users, current: true },
  { name: "Appointments Queue", href: "/doctor/appointments", icon: Clock },
  { name: "Notifications", href: "/doctor/notifications", icon: Bell },
]

export default function DoctorProfilePage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}>
      <DashboardLayout navigation={navigation}>
        <DoctorProfile />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
