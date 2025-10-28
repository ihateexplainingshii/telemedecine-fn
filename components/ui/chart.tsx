"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { hospitalsApi, type CreateHospitalRequest } from "@/api/hospitals"
import { getUsers } from "@/api/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog"
import { SkeletonTable } from "@/components/shared/Skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { Search, Building2, Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const hospitalSchema = z.object({
  name: z.string().min(1, "Hospital name is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  address: z.string().min(1, "Address is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(1, "Contact phone is required"),
  adminId: z.string().optional(),
})

type HospitalFormData = z.infer<typeof hospitalSchema>

export function HospitalManagement() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null)

  const { data: hospitals, isLoading } = useQuery({
    queryKey: ["hospitals"],
    queryFn: hospitalsApi.list,
  })

  const { data: hospitalAdmins } = useQuery({
    queryKey: ["users", "HOSPITAL_ADMIN"],
    queryFn: () => getUsers({ role: "HOSPITAL_ADMIN" }),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<HospitalFormData>({
    resolver: zodResolver(hospitalSchema),
  })

  const createMutation = useMutation({
    mutationFn: hospitalsApi.create,
    onSuccess: () => {
      toast.success("Hospital registered successfully!")
      setCreateOpen(false)
      reset()
      queryClient.invalidateQueries({ queryKey: ["hospitals"] })
    },
    onError: () => {
      toast.error("Failed to register hospital")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateHospitalRequest> }) => hospitalsApi.update(id, data),
    onSuccess: () => {
      toast.success("Hospital updated successfully!")
      setEditOpen(false)
      reset()
      queryClient.invalidateQueries({ queryKey: ["hospitals"] })
    },
    onError: () => {
      toast.error("Failed to update hospital")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: hospitalsApi.delete,
    onSuccess: () => {
      toast.success("Hospital deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["hospitals"] })
    },
    onError: () => {
      toast.error("Failed to delete hospital")
    },
  })

  const onCreateSubmit = (data: HospitalFormData) => {
    createMutation.mutate(data)
  }

  const onEditSubmit = (data: HospitalFormData) => {
    if (selectedHospitalId) {
      updateMutation.mutate({ id: selectedHospitalId, data })
    }
  }

  const handleEdit = (hospital: any) => {
    setSelectedHospitalId(hospital.id)
    setValue("name", hospital.name)
    setValue("licenseNumber", hospital.licenseNumber)
    setValue("address", hospital.address)
    setValue("contactEmail", hospital.contactEmail)
    setValue("contactPhone", hospital.contactPhone)
    setValue("adminId", hospital.adminId || "")
    setEditOpen(true)
  }

  const filteredHospitals = hospitals?.filter(
    (hospital) =>
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hospital Management</h1>
          <p className="text-muted-foreground mt-1">Register and manage hospitals</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Register Hospital
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Register New Hospital</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Hospital Name</Label>
                  <Input id="name" {...register("name")} placeholder="Central Hospital" />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input id="licenseNumber" {...register("licenseNumber")} placeholder="LIC-12345" />
                  {errors.licenseNumber && <p className="text-sm text-destructive">{errors.licenseNumber.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register("address")} placeholder="123 Main St, Kigali" />
                {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input id="contactEmail" type="email" {...register("contactEmail")} placeholder="info@hospital.rw" />
                  {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input id="contactPhone" {...register("contactPhone")} placeholder="+250 XXX XXX XXX" />
                  {errors.contactPhone && <p className="text-sm text-destructive">{errors.contactPhone.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminId">Assign Hospital Admin (Optional)</Label>
                <Select onValueChange={(value) => setValue("adminId", value)}>
                  <SelectTrigger id="adminId">
                    <SelectValue placeholder="Select an admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitalAdmins?.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.fullName} ({admin.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {createMutation.isPending ? "Registering..." : "Register Hospital"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search hospitals by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <SkeletonTable />
      ) : !filteredHospitals?.length ? (
        <EmptyState
          icon={Building2}
          title="No hospitals found"
          description={searchTerm ? "No hospitals match your search" : "Register your first hospital to get started"}
          actionLabel="Register Hospital"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>License Number</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead>Contact Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHospitals.map((hospital) => (
                <TableRow key={hospital.id}>
                  <TableCell className="font-medium">{hospital.name}</TableCell>
                  <TableCell>{hospital.licenseNumber}</TableCell>
                  <TableCell>{hospital.address}</TableCell>
                  <TableCell>{hospital.contactEmail}</TableCell>
                  <TableCell>{hospital.contactPhone}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(hospital)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <ConfirmationDialog
                        title="Delete Hospital"
                        description="Are you sure you want to delete this hospital? This action cannot be undone."
                        onConfirm={() => deleteMutation.mutate(hospital.id)}
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Hospital</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Hospital Name</Label>
                <Input id="edit-name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-licenseNumber">License Number</Label>
                <Input id="edit-licenseNumber" {...register("licenseNumber")} />
                {errors.licenseNumber && <p className="text-sm text-destructive">{errors.licenseNumber.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input id="edit-address" {...register("address")} />
              {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-contactEmail">Contact Email</Label>
                <Input id="edit-contactEmail" type="email" {...register("contactEmail")} />
                {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contactPhone">Contact Phone</Label>
                <Input id="edit-contactPhone" {...register("contactPhone")} />
                {errors.contactPhone && <p className="text-sm text-destructive">{errors.contactPhone.message}</p>}
              </div>
            </div>
            <Button type="submit" disabled={updateMutation.isPending} className="w-full bg-primary hover:bg-primary/90">
              {updateMutation.isPending ? "Updating..." : "Update Hospital"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}