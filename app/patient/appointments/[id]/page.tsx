"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Calendar, FileText, Bell, Clock, MapPin, User, Video, Phone, MessageSquare, Loader2 } from "lucide-react"
import { format } from "date-fns"
import toast from "react-hot-toast"

import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { appointmentsApi } from "@/api/appointments"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/shared/Skeleton"
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog"
import { USER_ROLES } from "@/config/constants"
import { formatDate, formatCurrency } from "@/lib/utils"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/patient-dashboard", icon: Calendar },
  { name: "My Profile", href: "/patient/profile", icon: FileText },
  { name: "My Appointments", href: "/patient/appointments", icon: Calendar, current: true },
  { name: "Book Appointment", href: "/patient/book-appointment", icon: Clock },
  { name: "My Consultations", href: "/patient/consultations", icon: FileText },
  { name: "Notifications", href: "/patient/notifications", icon: Bell },
]

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

function AppointmentDetailsContent() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const { data: appointment, isLoading } = useQuery({
    queryKey: ["appointment", params.id],
    queryFn: () => appointmentsApi.getById(params.id as string),
  })

  const cancelMutation = useMutation({
    mutationFn: () => appointmentsApi.updateStatus(params.id as string, { status: "CANCELLED" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment", params.id] })
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      toast.success("Appointment cancelled successfully")
      setShowCancelDialog(false)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Appointment not found</p>
        <Button onClick={() => router.push("/patient/appointments")} className="mt-4">
          Back to Appointments
        </Button>
      </div>
    )
  }

  const TypeIcon = typeIcons[appointment.type]
  const canCancel = appointment.status === "PENDING" || appointment.status === "CONFIRMED"

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Appointment Details</h1>
            <p className="text-muted-foreground mt-2">View your appointment information</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/patient/appointments")}>
            Back to List
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Appointment Information</CardTitle>
              <Badge variant="outline" className={statusColors[appointment.status]}>
                {appointment.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Doctor</h3>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{appointment.doctor?.user?.fullName}</p>
                      <p className="text-sm text-muted-foreground">{appointment.doctor?.specialization}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Hospital</h3>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{appointment.hospital?.name}</p>
                      <p className="text-sm text-muted-foreground">{appointment.hospital?.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Date & Time</h3>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{formatDate(appointment.appointmentDate, "MMM dd, yyyy")}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(appointment.appointmentDate), "HH:mm")}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Consultation Type</h3>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <TypeIcon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-semibold">{appointment.type}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Consultation Fee</h3>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(appointment.doctor?.consultationFee || 0)}
                  </p>
                </div>
              </div>
            </div>

            {canCancel && (
              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Appointment"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmationDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmLabel="Yes, Cancel"
        onConfirm={() => cancelMutation.mutate()}
        variant="destructive"
      />
    </>
  )
}

export default function AppointmentDetailsPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}>
      <DashboardLayout navigation={navigation}>
        <AppointmentDetailsContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
