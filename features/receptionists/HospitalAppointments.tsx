"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Calendar, Search, Filter } from "lucide-react"
import { format } from "date-fns"

import { appointmentsApi } from "@/api/appointments"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SkeletonTable } from "@/components/shared/Skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog"
import { formatDate } from "@/lib/utils"
import { useDebounce } from "@/hooks/useDebounce"
import toast from "react-hot-toast"

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
}

export function HospitalAppointments() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null)
  const [actionType, setActionType] = useState<"confirm" | "cancel" | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["receptionist-appointments"],
    queryFn: appointmentsApi.list,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "CONFIRMED" | "CANCELLED" }) =>
      appointmentsApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receptionist-appointments"] })
      toast.success("Appointment status updated successfully")
      setSelectedAppointment(null)
      setActionType(null)
    },
  })

  const filteredAppointments = appointments?.filter((apt) => {
    const matchesSearch =
      apt.patient?.user?.fullName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      apt.doctor?.user?.fullName?.toLowerCase().includes(debouncedSearch.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || apt.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return <SkeletonTable />
  }

  if (!appointments || appointments.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No appointments yet"
        description="Appointments will appear here when patients book consultations."
      />
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient or doctor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Appointments List */}
        <div className="space-y-3">
          {filteredAppointments?.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={statusColors[appointment.status]}>
                        {appointment.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(appointment.appointmentDate, "MMM dd, yyyy")} at{" "}
                        {format(new Date(appointment.appointmentDate), "HH:mm")}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Patient:</span>{" "}
                        <span className="font-medium">{appointment.patient?.user?.fullName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Doctor:</span>{" "}
                        <span className="font-medium">{appointment.doctor?.user?.fullName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>{" "}
                        <span className="font-medium">{appointment.type}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Specialization:</span>{" "}
                        <span className="font-medium">{appointment.doctor?.specialization}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/receptionist/appointments/${appointment.id}`)}
                    >
                      View Details
                    </Button>
                    {appointment.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary-hover"
                          onClick={() => {
                            setSelectedAppointment(appointment.id)
                            setActionType("confirm")
                          }}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedAppointment(appointment.id)
                            setActionType("cancel")
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAppointments?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No appointments match your search criteria</p>
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={!!selectedAppointment && actionType === "confirm"}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAppointment(null)
            setActionType(null)
          }
        }}
        title="Confirm Appointment"
        description="Are you sure you want to confirm this appointment?"
        confirmLabel="Confirm"
        onConfirm={() => {
          if (selectedAppointment) {
            updateStatusMutation.mutate({ id: selectedAppointment, status: "CONFIRMED" })
          }
        }}
      />

      <ConfirmationDialog
        open={!!selectedAppointment && actionType === "cancel"}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAppointment(null)
            setActionType(null)
          }
        }}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmLabel="Cancel Appointment"
        onConfirm={() => {
          if (selectedAppointment) {
            updateStatusMutation.mutate({ id: selectedAppointment, status: "CANCELLED" })
          }
        }}
        variant="destructive"
      />
    </>
  )
}
