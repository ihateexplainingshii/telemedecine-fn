"use client"

import { useQuery } from "@tanstack/react-query"
import { Calendar, FileText, Bell, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { appointmentsApi } from "@/api/appointments"
import { consultationsApi } from "@/api/consultations"
import { notificationsApi } from "@/api/notifications"
import { SkeletonCard } from "@/components/shared/Skeleton"
import { USER_ROLES } from "@/config/constants"

const navigation = [
  { name: "Dashboard", href: "/patient-dashboard", icon: Calendar, current: true },
  { name: "My Profile", href: "/patient/profile", icon: FileText },
  { name: "My Appointments", href: "/patient/appointments", icon: Calendar },
  { name: "Book Appointment", href: "/patient/book-appointment", icon: Clock },
  { name: "My Consultations", href: "/patient/consultations", icon: FileText },
  { name: "Notifications", href: "/patient/notifications", icon: Bell },
]

function DashboardContent() {
  const router = useRouter()

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: appointmentsApi.list,
  })

  const { data: consultations, isLoading: consultationsLoading } = useQuery({
    queryKey: ["consultations"],
    queryFn: consultationsApi.list,
  })

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.list,
  })

  const upcomingAppointments = appointments?.filter(
    (apt) => apt.status === "CONFIRMED" && new Date(apt.appointmentDate) > new Date(),
  )

  const unreadNotifications = notifications?.filter((n) => !n.isRead)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-balance">Welcome Back!</h1>
        <p className="text-muted-foreground mt-2 text-pretty">Here's an overview of your healthcare journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {appointmentsLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{upcomingAppointments?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Confirmed appointments</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Recent Consultations</CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{consultations?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Total consultations</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Unread Notifications</CardTitle>
                <Bell className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{unreadNotifications?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">New notifications</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            onClick={() => router.push("/patient/book-appointment")}
            className="bg-primary hover:bg-primary-hover h-auto py-4"
          >
            <div className="flex flex-col items-center gap-2">
              <Clock className="h-6 w-6" />
              <span>Book Appointment</span>
            </div>
          </Button>
          <Button onClick={() => router.push("/patient/appointments")} variant="outline" className="h-auto py-4">
            <div className="flex flex-col items-center gap-2">
              <Calendar className="h-6 w-6" />
              <span>View Appointments</span>
            </div>
          </Button>
          <Button onClick={() => router.push("/patient/consultations")} variant="outline" className="h-auto py-4">
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-6 w-6" />
              <span>My Consultations</span>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PatientDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}>
      <DashboardLayout navigation={navigation}>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
