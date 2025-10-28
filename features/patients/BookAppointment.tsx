"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle2 } from "lucide-react"
import toast from "react-hot-toast"
import { format } from "date-fns"

import { appointmentsApi } from "@/api/appointments"
import { hospitalsApi } from "@/api/hospitals"
import { doctorsApi } from "@/api/doctors"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/shared/Skeleton"
import { cn, formatCurrency } from "@/lib/utils"

const bookingSchema = z.object({
  hospitalId: z.string().min(1, "Please select a hospital"),
  specialization: z.string().min(1, "Please select a specialization"),
  doctorId: z.string().min(1, "Please select a doctor"),
  appointmentDate: z.string().min(1, "Please select a date and time"),
  type: z.enum(["VIDEO", "AUDIO", "CHAT"], {
    required_error: "Please select a consultation type",
  }),
})

type BookingFormData = z.infer<typeof bookingSchema>

const consultationTypes = [
  { value: "VIDEO", label: "Video Call", description: "Face-to-face video consultation" },
  { value: "AUDIO", label: "Audio Call", description: "Voice-only consultation" },
  { value: "CHAT", label: "Chat", description: "Text-based consultation" },
]

export function BookAppointment() {
  const router = useRouter()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  })

  const hospitalId = watch("hospitalId")
  const specialization = watch("specialization")
  const doctorId = watch("doctorId")
  const type = watch("type")

  const { data: hospitals, isLoading: hospitalsLoading } = useQuery({
    queryKey: ["hospitals"],
    queryFn: hospitalsApi.list,
  })

  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ["doctors", hospitalId, specialization],
    queryFn: () => doctorsApi.list({ hospitalId, specialization }),
    enabled: !!hospitalId,
  })

  const selectedDoctor = doctors?.find((d) => d.id === doctorId)

  const specializations = Array.from(new Set(doctors?.map((d) => d.specialization) || []))

  const bookMutation = useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      setShowSuccessDialog(true)
    },
  })

  const onSubmit = (data: BookingFormData) => {
    if (!user?.profileId) {
      toast.error("Profile not found")
      return
    }

    bookMutation.mutate({
      patientId: user.profileId,
      doctorId: data.doctorId,
      hospitalId: data.hospitalId,
      appointmentDate: data.appointmentDate,
      type: data.type,
    })
  }

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ]

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    if (selectedDate) {
      const dateTime = new Date(selectedDate)
      const [hours, minutes] = time.split(":")
      dateTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)
      setValue("appointmentDate", dateTime.toISOString())
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Select Hospital */}
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Select Hospital</CardTitle>
            <CardDescription>Choose the hospital where you want to be treated</CardDescription>
          </CardHeader>
          <CardContent>
            {hospitalsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital</Label>
                <Select value={hospitalId} onValueChange={(value) => setValue("hospitalId", value)}>
                  <SelectTrigger id="hospital" className="focus:ring-2 focus:ring-primary">
                    <SelectValue placeholder="Select a hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals?.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.hospitalId && <p className="text-sm text-destructive">{errors.hospitalId.message}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Select Specialization & Doctor */}
        {hospitalId && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Select Doctor</CardTitle>
              <CardDescription>Choose a specialization and doctor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {doctorsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Select value={specialization} onValueChange={(value) => setValue("specialization", value)}>
                      <SelectTrigger id="specialization" className="focus:ring-2 focus:ring-primary">
                        <SelectValue placeholder="Select a specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {specializations.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.specialization && (
                      <p className="text-sm text-destructive">{errors.specialization.message}</p>
                    )}
                  </div>

                  {specialization && (
                    <div className="space-y-2">
                      <Label>Available Doctors</Label>
                      <div className="grid gap-3">
                        {doctors
                          ?.filter((d) => d.specialization === specialization)
                          .map((doctor) => (
                            <Card
                              key={doctor.id}
                              className={cn(
                                "cursor-pointer transition-all hover:shadow-md",
                                doctorId === doctor.id && "ring-2 ring-primary",
                              )}
                              onClick={() => setValue("doctorId", doctor.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <h4 className="font-semibold">{doctor.user?.fullName}</h4>
                                    <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                                    <p className="text-sm text-muted-foreground">License: {doctor.licenseNumber}</p>
                                    {doctor.availability && (
                                      <p className="text-xs text-muted-foreground">Available: {doctor.availability}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-primary">
                                      {formatCurrency(doctor.consultationFee)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Consultation fee</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                      {errors.doctorId && <p className="text-sm text-destructive">{errors.doctorId.message}</p>}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Select Date & Time */}
        {doctorId && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Select Date & Time</CardTitle>
              <CardDescription>Choose your preferred appointment date and time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border"
                />
              </div>

              {selectedDate && (
                <div className="space-y-2">
                  <Label>Select Time</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        type="button"
                        variant={selectedTime === time ? "default" : "outline"}
                        className={cn(selectedTime === time && "bg-primary hover:bg-primary-hover")}
                        onClick={() => handleTimeSelect(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {errors.appointmentDate && <p className="text-sm text-destructive">{errors.appointmentDate.message}</p>}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Select Consultation Type */}
        {selectedDate && selectedTime && (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Consultation Type</CardTitle>
              <CardDescription>Choose how you want to consult with the doctor</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={type} onValueChange={(value) => setValue("type", value as any)}>
                <div className="grid gap-3">
                  {consultationTypes.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={option.value}
                      className={cn(
                        "flex items-center space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer transition-all hover:bg-accent",
                        type === option.value && "border-primary bg-primary/5",
                      )}
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <div className="flex-1">
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
              {errors.type && <p className="text-sm text-destructive mt-2">{errors.type.message}</p>}
            </CardContent>
          </Card>
        )}

        {/* Summary & Submit */}
        {type && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor:</span>
                <span className="font-medium">{selectedDoctor?.user?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Specialization:</span>
                <span className="font-medium">{selectedDoctor?.specialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time:</span>
                <span className="font-medium">
                  {selectedDate && format(selectedDate, "PPP")} at {selectedTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{consultationTypes.find((t) => t.value === type)?.label}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-3 border-t">
                <span>Consultation Fee:</span>
                <span className="text-primary">{formatCurrency(selectedDoctor?.consultationFee || 0)}</span>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover mt-4"
                disabled={bookMutation.isPending}
              >
                {bookMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </form>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center">Appointment Booked!</DialogTitle>
            <DialogDescription className="text-center text-pretty">
              Your appointment has been successfully booked. You will receive a confirmation notification shortly.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => router.push("/patient/appointments")}
            className="w-full bg-primary hover:bg-primary-hover"
          >
            View My Appointments
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
