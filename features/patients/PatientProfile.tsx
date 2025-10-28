"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Edit, CalendarIcon } from "lucide-react"
import toast from "react-hot-toast"
import { format } from "date-fns"

import { patientsApi } from "@/api/patients"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/shared/Skeleton"
import { cn } from "@/lib/utils"

const profileSchema = z.object({
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  bloodType: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function PatientProfile() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [dateOfBirth, setDateOfBirth] = useState<Date>()

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", user?.profileId],
    queryFn: () => patientsApi.getById(user?.profileId!),
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
      dateOfBirth: patient?.dateOfBirth,
      gender: patient?.gender,
      bloodType: patient?.bloodType,
      insuranceProvider: patient?.insuranceProvider,
      insuranceNumber: patient?.insuranceNumber,
    },
  })

  const gender = watch("gender")

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormData) => patientsApi.update(user?.profileId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", user?.profileId] })
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
              <Label className="text-muted-foreground">Date of Birth</Label>
              <p className="font-medium">
                {patient?.dateOfBirth ? format(new Date(patient.dateOfBirth), "PPP") : "Not provided"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Gender</Label>
              <p className="font-medium">{patient?.gender || "Not provided"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Blood Type</Label>
              <p className="font-medium">{patient?.bloodType || "Not provided"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Insurance Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Insurance Provider</Label>
              <p className="font-medium">{patient?.insuranceProvider || "Not provided"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Insurance Number</Label>
              <p className="font-medium">{patient?.insuranceNumber || "Not provided"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your personal and insurance information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateOfBirth && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth ? format(dateOfBirth, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateOfBirth}
                    onSelect={(date) => {
                      setDateOfBirth(date)
                      if (date) {
                        setValue("dateOfBirth", format(date, "yyyy-MM-dd"))
                      }
                    }}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={(value) => setValue("gender", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type</Label>
              <Input id="bloodType" placeholder="e.g., O+, A-, B+" {...register("bloodType")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insuranceProvider">Insurance Provider</Label>
              <Input id="insuranceProvider" placeholder="e.g., Radiant" {...register("insuranceProvider")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insuranceNumber">Insurance Number</Label>
              <Input id="insuranceNumber" placeholder="e.g., RAD-98765" {...register("insuranceNumber")} />
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
