"use client"

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Video, Phone, MessageSquare, User } from "lucide-react"
import { format } from "date-fns"

import { appointmentsApi } from "@/api/appointments"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SkeletonCard } from "@/components/shared/Skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { formatDate } from "@/lib/utils"

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
}

const typeIcons = {
  VIDEO: Video,
  AUDIO: Phone,
  CHAT: MessageSquare,
}

export function AppointmentsQueue() {
  const router = useRouter()

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["doctor-appointments"],
    queryFn: appointmentsApi.list,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (!appointments || appointments.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No appointments scheduled"
        description="Your appointment queue is empty. Appointments will appear here when patients book with you."
      />
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => {
        const TypeIcon = typeIcons[appointment.type]
        const appointmentDate = new Date(appointment.appointmentDate)
        const isToday = appointmentDate.toDateString() === today.toDateString()
        const canStartConsultation = appointment.status === "CONFIRMED" && isToday

        return (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{appointment.patient?.user?.fullName || "Patient"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {appointment.patient?.gender} • {appointment.patient?.bloodType || "Blood type not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(appointment.appointmentDate, "MMM dd, yyyy")}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {format(new Date(appointment.appointmentDate), "HH:mm")}
                    </div>
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-4 w-4" />
                      {appointment.type}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <Badge variant="outline" className={statusColors[appointment.status]}>
                    {appointment.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/doctor/appointments/${appointment.id}`)}
                    >
                      View Details
                    </Button>
                    {canStartConsultation && (
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary-hover"
                        onClick={() => router.push(`/doctor/appointments/${appointment.id}/record`)}
                      >
                        Start Consultation
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
