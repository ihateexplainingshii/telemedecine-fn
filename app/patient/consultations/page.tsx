"use client"

import { Calendar, FileText, Bell, Clock } from "lucide-react"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ConsultationsList } from "@/features/patients/ConsultationsList"
import { USER_ROLES } from "@/config/constants"

const navigation = [
  { name: "Dashboard", href: "/patient-dashboard", icon: Calendar },
  { name: "My Profile", href: "/patient/profile", icon: FileText },
  { name: "My Appointments", href: "/patient/appointments", icon: Calendar },
  { name: "Book Appointment", href: "/patient/book-appointment", icon: Clock },
  { name: "My Consultations", href: "/patient/consultations", icon: FileText, current: true },
  { name: "Notifications", href: "/patient/notifications", icon: Bell },
]

function ConsultationsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">My Consultations</h1>
        <p className="text-muted-foreground mt-2 text-pretty">View your consultation history and medical records</p>
      </div>

      <ConsultationsList />
    </div>
  )
}

export default function PatientConsultationsPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}>
      <DashboardLayout navigation={navigation}>
        <ConsultationsContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
