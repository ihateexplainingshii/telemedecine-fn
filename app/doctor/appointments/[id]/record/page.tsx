"use client"

import { useParams } from "next/navigation"
import { Calendar, Bell, Users, Clock } from "lucide-react"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { RecordConsultation } from "@/features/doctors/RecordConsultation"
import { USER_ROLES } from "@/config/constants"

const navigation = [
  { name: "Dashboard", href: "/doctor-dashboard", icon: Calendar },
  { name: "My Profile", href: "/doctor/profile", icon: Users },
  { name: "Appointments Queue", href: "/doctor/appointments", icon: Clock, current: true },
  { name: "Notifications", href: "/doctor/notifications", icon: Bell },
]

function RecordConsultationContent() {
  const params = useParams()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Record Consultation</h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          Document the consultation details, diagnosis, and prescription
        </p>
      </div>

      <RecordConsultation appointmentId={params.id as string} />
    </div>
  )
}

export default function RecordConsultationPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}>
      <DashboardLayout navigation={navigation}>
        <RecordConsultationContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
