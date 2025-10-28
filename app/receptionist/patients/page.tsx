"use client"

import { useQuery } from "@tanstack/react-query"
import { Calendar, Users, DollarSign, Clock, Search } from "lucide-react"
import { useState } from "react"

import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { InvitePatient } from "@/features/receptionists/InvitePatient"
import { appointmentsApi } from "@/api/appointments"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SkeletonCard } from "@/components/shared/Skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { useDebounce } from "@/hooks/useDebounce"
import { USER_ROLES } from "@/config/constants"

const navigation = [
  { name: "Dashboard", href: "/receptionist-dashboard", icon: Calendar },
  { name: "Appointments", href: "/receptionist/appointments", icon: Clock },
  { name: "Patients", href: "/receptionist/patients", icon: Users, current: true },
  { name: "Record Payment", href: "/receptionist/payments/record", icon: DollarSign },
  { name: "Payment History", href: "/receptionist/payments/history", icon: DollarSign },
]

function PatientsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["receptionist-appointments"],
    queryFn: appointmentsApi.list,
  })

  // Get unique patients from appointments
  const patients = Array.from(new Map(appointments?.map((apt) => [apt.patientId, apt.patient])).values()).filter(
    Boolean,
  )

  const filteredPatients = patients.filter((patient: any) =>
    patient?.user?.fullName?.toLowerCase().includes(debouncedSearch.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Patient Management</h1>
          <p className="text-muted-foreground mt-2 text-pretty">View and invite patients to the platform</p>
        </div>
        <InvitePatient />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredPatients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patients found"
          description="Invite patients to register on the platform."
          actionLabel="Invite Patient"
          onAction={() => {}}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient: any) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{patient.user?.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{patient.user?.email}</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{patient.user?.phone || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gender:</span>
                      <span className="font-medium">{patient.gender || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Blood Type:</span>
                      <span className="font-medium">{patient.bloodType || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ReceptionistPatientsPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.RECEPTIONIST]}>
      <DashboardLayout navigation={navigation}>
        <PatientsContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
