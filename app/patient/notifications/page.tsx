"use client"

import { Calendar, FileText, Bell, Clock } from "lucide-react"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { NotificationsList } from "@/features/patients/NotificationsList"
import { USER_ROLES } from "@/config/constants"

const navigation = [
  { name: "Dashboard", href: "/patient-dashboard", icon: Calendar },
  { name: "My Profile", href: "/patient/profile", icon: FileText },
  { name: "My Appointments", href: "/patient/appointments", icon: Calendar },
  { name: "Book Appointment", href: "/patient/book-appointment", icon: Clock },
  { name: "My Consultations", href: "/patient/consultations", icon: FileText },
  { name: "Notifications", href: "/patient/notifications", icon: Bell, current: true },
]

function NotificationsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Notifications</h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          Stay updated with your appointments and healthcare activities
        </p>
      </div>

      <NotificationsList />
    </div>
  )
}

export default function PatientNotificationsPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}>
      <DashboardLayout navigation={navigation}>
        <NotificationsContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
