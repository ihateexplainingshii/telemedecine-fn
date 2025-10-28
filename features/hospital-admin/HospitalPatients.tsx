"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { patientsApi } from "@/api/patients"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog"
import { SkeletonTable } from "@/components/shared/Skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { Search, Eye, Trash2, Users } from "lucide-react"
import { toast } from "react-hot-toast"
import { useAuthStore } from "@/store/authStore"
import Link from "next/link"
import { format } from "date-fns"

export function HospitalPatients() {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")

  const { data: patients, isLoading } = useQuery({
    queryKey: ["patients", user?.hospitalId],
    queryFn: () => patientsApi.list({ hospitalId: user?.hospitalId }),
    enabled: !!user?.hospitalId,
  })

  const deletePatientMutation = useMutation({
    mutationFn: (patientId: string) => patientsApi.delete(patientId),
    onSuccess: () => {
      toast.success("Patient removed successfully")
      queryClient.invalidateQueries({ queryKey: ["patients"] })
    },
    onError: () => {
      toast.error("Failed to remove patient")
    },
  })

  const filteredPatients = patients?.filter(
    (patient) =>
      patient.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user?.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Patient Management</h1>
        <p className="text-muted-foreground mt-1">View and manage hospital patients</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search patients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <SkeletonTable />
      ) : !filteredPatients?.length ? (
        <EmptyState
          icon={Users}
          title="No patients found"
          description={searchTerm ? "No patients match your search" : "No patients registered yet"}
        />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.user?.fullName}</TableCell>
                  <TableCell>{patient.user?.email}</TableCell>
                  <TableCell>{patient.user?.phone || "N/A"}</TableCell>
                  <TableCell>{patient.gender || "N/A"}</TableCell>
                  <TableCell>
                    {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), "MMM dd, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={patient.user?.status === "ACTIVE" ? "default" : "secondary"}>
                      {patient.user?.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/hospital-admin/patients/${patient.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <ConfirmationDialog
                        title="Remove Patient"
                        description="Are you sure you want to remove this patient? This action cannot be undone."
                        onConfirm={() => deletePatientMutation.mutate(patient.id)}
                        trigger={
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}