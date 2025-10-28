"use client"

import { Calendar, Users, DollarSign, Clock } from "lucide-react"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { PaymentHistory } from "@/features/receptionists/PaymentHistory"
import { USER_ROLES } from "@/config/constants"

const navigation = [
  { name: "Dashboard", href: "/receptionist-dashboard", icon: Calendar },
  { name: "Appointments", href: "/receptionist/appointments", icon: Clock },
  { name: "Patients", href: "/receptionist/patients", icon: Users },
  { name: "Record Payment", href: "/receptionist/payments/record", icon: DollarSign },
  { name: "Payment History", href: "/receptionist/payments/history", icon: DollarSign, current: true },
]

function PaymentHistoryContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Payment History</h1>
        <p className="text-muted-foreground mt-2 text-pretty">View all recorded payment transactions</p>
      </div>

      <PaymentHistory />
    </div>
  )
}

export default function PaymentHistoryPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.RECEPTIONIST]}>
      <DashboardLayout navigation={navigation}>
        <PaymentHistoryContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
