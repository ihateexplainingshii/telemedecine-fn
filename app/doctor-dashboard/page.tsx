"use client"

import { useQuery } from "@tanstack/react-query"
import { Calendar, Bell, Users, Clock } from "lucide-react"

import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { appointmentsApi } from "@/api/appointments"
import { SkeletonCard } from "@/components/shared/Skeleton"
import { USER_ROLES } from "@/config/constants"

const navigation = [
  { name: "Dashboard", href: "/doctor-dashboard", icon: Calendar, current: true },
  { name: "My Profile", href: "/doctor/profile", icon: Users },
  { name: "Appointments Queue", href: "/doctor/appointments", icon: Clock },
  { name: "Notifications", href: "/doctor/notifications", icon: Bell },
]

function DashboardContent() {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["doctor-appointments"],
    queryFn: appointmentsApi.list,
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayAppointments = appointments?.filter((apt) => {
    const aptDate = new Date(apt.appointmentDate)
    aptDate.setHours(0, 0, 0, 0)
    return aptDate.getTime() === today.getTime()
  })

  const nextAppointment = appointments
    ?.filter((apt) => new Date(apt.appointmentDate) > new Date() && apt.status === "CONFIRMED")
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())[0]

  const patientsThisWeek = new Set(
    appointments
      ?.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return aptDate >= weekAgo && apt.status === "COMPLETED"
      })
      .map((apt) => apt.patientId),
  ).size

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-balance">Welcome, Doctor!</h1>
        <p className="text-muted-foreground mt-2 text-pretty">Here's your practice overview for today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{todayAppointments?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Scheduled for today</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Next Appointment</CardTitle>
                <Clock className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-primary">
                  {nextAppointment
                    ? new Date(nextAppointment.appointmentDate).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "None"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {nextAppointment ? nextAppointment.patient?.user?.fullName : "No upcoming appointments"}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Patients This Week</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{patientsThisWeek}</div>
                <p className="text-xs text-muted-foreground mt-1">Unique patients seen</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Today's Schedule */}
      {todayAppointments && todayAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAppointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{apt.patient?.user?.fullName}</p>
                    <p className="text-sm text-muted-foreground">{apt.type} Consultation</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">
                      {new Date(apt.appointmentDate).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">{apt.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function DoctorDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}>
      <DashboardLayout navigation={navigation}>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
