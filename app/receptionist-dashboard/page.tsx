"use client"

import { useQuery } from "@tanstack/react-query"
import { Calendar, Users, DollarSign, Clock } from "lucide-react"

import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { appointmentsApi } from "@/api/appointments"
import { paymentsApi } from "@/api/payments"
import { SkeletonCard } from "@/components/shared/Skeleton"
import { USER_ROLES } from "@/config/constants"

const navigation = [
  { name: "Dashboard", href: "/receptionist-dashboard", icon: Calendar, current: true },
  { name: "Appointments", href: "/receptionist/appointments", icon: Clock },
  { name: "Patients", href: "/receptionist/patients", icon: Users },
  { name: "Record Payment", href: "/receptionist/payments/record", icon: DollarSign },
  { name: "Payment History", href: "/receptionist/payments/history", icon: DollarSign },
]

function DashboardContent() {
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["receptionist-appointments"],
    queryFn: appointmentsApi.list,
  })

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: paymentsApi.list,
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayBookings = appointments?.filter((apt) => {
    const aptDate = new Date(apt.appointmentDate)
    aptDate.setHours(0, 0, 0, 0)
    return aptDate.getTime() === today.getTime()
  })

  const pendingApprovals = appointments?.filter((apt) => apt.status === "PENDING")

  const todayPayments = payments?.filter((payment) => {
    const paymentDate = new Date(payment.createdAt)
    paymentDate.setHours(0, 0, 0, 0)
    return paymentDate.getTime() === today.getTime()
  })

  const totalPaymentsToday = todayPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-balance">Receptionist Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-pretty">Manage appointments, patients, and payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {appointmentsLoading || paymentsLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today's Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{todayBookings?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Appointments scheduled</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{pendingApprovals?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {new Set(appointments?.map((apt) => apt.patientId)).size}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Registered patients</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today's Payments</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">RWF {totalPaymentsToday.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{todayPayments?.length || 0} transactions</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default function ReceptionistDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.RECEPTIONIST]}>
      <DashboardLayout navigation={navigation}>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
