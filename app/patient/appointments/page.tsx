"use client"

import { Calendar, FileText, Bell, Clock, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { AppointmentsList } from "@/features/patients/AppointmentsList"
import { Button } from "@/components/ui/button"
import { USER_ROLES } from "@/config/constants"

const navigation = [
  { name: "Dashboard", href: "/patient-dashboard", icon: Calendar },
  { name: "My Profile", href: "/patient/profile", icon: FileText },
  { name: "My Appointments", href: "/patient/appointments", icon: Calendar, current: true },
  { name: "Book Appointment", href: "/patient/book-appointment", icon: Clock },
  { name: "My Consultations", href: "/patient/consultations", icon: FileText },
  { name: "Notifications", href: "/patient/notifications", icon: Bell },
]

function AppointmentsContent() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">My Appointments</h1>
          <p className="text-muted-foreground mt-2 text-pretty">View and manage your healthcare appointments</p>
        </div>
        <Button onClick={() => router.push("/patient/book-appointment")} className="bg-primary hover:bg-primary-hover">
          <Plus className="mr-2 h-4 w-4" />
          Book New
        </Button>
      </div>

      <AppointmentsList />
    </div>
  )
}

export default function PatientAppointmentsPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}>
      <DashboardLayout navigation={navigation}>
        <AppointmentsContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
