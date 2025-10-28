"use client"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Video, Phone, MessageSquare, MapPin } from "lucide-react"
import { format } from "date-fns"

import { appointmentsApi } from "@/api/appointments"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

export function AppointmentsList() {
  const router = useRouter()

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments"],
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
        title="No appointments yet"
        description="Book your first appointment to get started with quality healthcare."
        actionLabel="Book Appointment"
        onAction={() => router.push("/patient/book-appointment")}
      />
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => {
        const TypeIcon = typeIcons[appointment.type]
        return (
          <Card
            key={appointment.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/patient/appointments/${appointment.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <TypeIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{appointment.doctor?.user?.fullName || "Doctor"}</h3>
                      <p className="text-sm text-muted-foreground">{appointment.doctor?.specialization}</p>
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
                      <MapPin className="h-4 w-4" />
                      {appointment.hospital?.name}
                    </div>
                  </div>
                </div>

                <Badge variant="outline" className={statusColors[appointment.status]}>
                  {appointment.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
