"use client"

import { Calendar, Users, DollarSign, Clock } from "lucide-react"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { HospitalAppointments } from "@/features/receptionists/HospitalAppointments"
import { USER_ROLES } from "@/config/constants"

const navigation = [
  { name: "Dashboard", href: "/receptionist-dashboard", icon: Calendar },
  { name: "Appointments", href: "/receptionist/appointments", icon: Clock, current: true },
  { name: "Patients", href: "/receptionist/patients", icon: Users },
  { name: "Record Payment", href: "/receptionist/payments/record", icon: DollarSign },
  { name: "Payment History", href: "/receptionist/payments/history", icon: DollarSign },
]

function AppointmentsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Hospital Appointments</h1>
        <p className="text-muted-foreground mt-2 text-pretty">View and manage all hospital appointments</p>
      </div>

      <HospitalAppointments />
    </div>
  )
}

export default function ReceptionistAppointmentsPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.RECEPTIONIST]}>
      <DashboardLayout navigation={navigation}>
        <AppointmentsContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
