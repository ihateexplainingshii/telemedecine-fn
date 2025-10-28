"use client"

import { Calendar, Users, DollarSign, Clock } from "lucide-react"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { RecordPayment } from "@/features/receptionists/RecordPayment"
import { USER_ROLES } from "@/config/constants"

const navigation = [
  { name: "Dashboard", href: "/receptionist-dashboard", icon: Calendar },
  { name: "Appointments", href: "/receptionist/appointments", icon: Clock },
  { name: "Patients", href: "/receptionist/patients", icon: Users },
  { name: "Record Payment", href: "/receptionist/payments/record", icon: DollarSign, current: true },
  { name: "Payment History", href: "/receptionist/payments/history", icon: DollarSign },
]

function RecordPaymentContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Record Payment</h1>
        <p className="text-muted-foreground mt-2 text-pretty">Record cash, mobile money, or insurance payments</p>
      </div>

      <RecordPayment />
    </div>
  )
}

export default function RecordPaymentPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.RECEPTIONIST]}>
      <DashboardLayout navigation={navigation}>
        <RecordPaymentContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
