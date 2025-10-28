"use client"

import { Calendar, FileText, Bell, Clock } from "lucide-react"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { BookAppointment } from "@/features/patients/BookAppointment"
import { USER_ROLES } from "@/config/constants"

const navigation = [
  { name: "Dashboard", href: "/patient-dashboard", icon: Calendar },
  { name: "My Profile", href: "/patient/profile", icon: FileText },
  { name: "My Appointments", href: "/patient/appointments", icon: Calendar },
  { name: "Book Appointment", href: "/patient/book-appointment", icon: Clock, current: true },
  { name: "My Consultations", href: "/patient/consultations", icon: FileText },
  { name: "Notifications", href: "/patient/notifications", icon: Bell },
]

function BookAppointmentContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Book an Appointment</h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          Schedule a consultation with a qualified healthcare professional
        </p>
      </div>

      <BookAppointment />
    </div>
  )
}

export default function BookAppointmentPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}>
      <DashboardLayout navigation={navigation}>
        <BookAppointmentContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
