"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Edit } from "lucide-react"
import toast from "react-hot-toast"

import { doctorsApi } from "@/api/doctors"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/shared/Skeleton"

const profileSchema = z.object({
  specialization: z.string().optional(),
  availability: z.string().optional(),
  consultationFee: z.coerce.number().min(0).optional(),
  status: z.enum(["AVAILABLE", "BUSY", "OFFLINE"]).optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function DoctorProfile() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { data: doctor, isLoading } = useQuery({
    queryKey: ["doctor", user?.profileId],
    queryFn: () => doctorsApi.getById(user?.profileId!),
    enabled: !!user?.profileId,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      specialization: doctor?.specialization,
      availability: doctor?.availability,
      consultationFee: doctor?.consultationFee,
      status: doctor?.status,
    },
  })

  const status = watch("status")

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormData) => doctorsApi.update(user?.profileId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor", user?.profileId] })
      toast.success("Profile updated successfully")
      setIsEditDialogOpen(false)
    },
  })

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusColors = {
    AVAILABLE: "bg-green-100 text-green-800",
    BUSY: "bg-yellow-100 text-yellow-800",
    OFFLINE: "bg-red-100 text-red-800",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-balance">My Profile</h1>
        <Button onClick={() => setIsEditDialogOpen(true)} className="bg-primary hover:bg-primary-hover">
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Full Name</Label>
              <p className="font-medium">{user?.fullName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Phone</Label>
              <p className="font-medium">{user?.phone || "Not provided"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">License Number</Label>
              <p className="font-medium">{doctor?.licenseNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Specialization</Label>
              <p className="font-medium">{doctor?.specialization}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Hospital</Label>
              <p className="font-medium">{doctor?.hospital?.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Consultation Fee</Label>
              <p className="font-medium text-primary">RWF {doctor?.consultationFee?.toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusColors[doctor?.status || "OFFLINE"]}`}
              >
                {doctor?.status}
              </span>
            </div>
            <div className="md:col-span-2">
              <Label className="text-muted-foreground">Availability</Label>
              <p className="font-medium">{doctor?.availability || "Not specified"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your professional information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input id="specialization" placeholder="e.g., Cardiology, Pediatrics" {...register("specialization")} />
              {errors.specialization && <p className="text-sm text-destructive">{errors.specialization.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Textarea id="availability" placeholder="e.g., Mon-Fri, 9am-5pm" {...register("availability")} rows={3} />
              {errors.availability && <p className="text-sm text-destructive">{errors.availability.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultationFee">Consultation Fee (RWF)</Label>
              <Input id="consultationFee" type="number" placeholder="20000" {...register("consultationFee")} />
              {errors.consultationFee && <p className="text-sm text-destructive">{errors.consultationFee.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setValue("status", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="BUSY">Busy</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary-hover" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
