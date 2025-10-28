"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle2 } from "lucide-react"

import { consultationsApi } from "@/api/consultations"
import { appointmentsApi } from "@/api/appointments"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/shared/Skeleton"
import { useState } from "react"
import { cn } from "@/lib/utils"

const consultationSchema = z.object({
  doctorNotes: z.string().min(10, "Please provide detailed notes (at least 10 characters)"),
  prescription: z.string().optional(),
  consultationType: z.enum(["VIDEO", "AUDIO", "CHAT"], {
    required_error: "Please select a consultation type",
  }),
})

type ConsultationFormData = z.infer<typeof consultationSchema>

const consultationTypes = [
  { value: "VIDEO", label: "Video Call", description: "Face-to-face video consultation" },
  { value: "AUDIO", label: "Audio Call", description: "Voice-only consultation" },
  { value: "CHAT", label: "Chat", description: "Text-based consultation" },
]

interface RecordConsultationProps {
  appointmentId: string
}

export function RecordConsultation({ appointmentId }: RecordConsultationProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const { data: appointment, isLoading } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => appointmentsApi.getById(appointmentId),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      consultationType: appointment?.type,
    },
  })

  const consultationType = watch("consultationType")

  const recordMutation = useMutation({
    mutationFn: consultationsApi.create,
    onSuccess: async () => {
      // Update appointment status to COMPLETED
      await appointmentsApi.updateStatus(appointmentId, { status: "COMPLETED" })
      queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] })
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] })
      setShowSuccessDialog(true)
    },
  })

  const onSubmit = (data: ConsultationFormData) => {
    recordMutation.mutate({
      appointmentId,
      doctorNotes: data.doctorNotes,
      prescription: data.prescription,
      consultationType: data.consultationType,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Review patient details before recording consultation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Patient Name</Label>
                <p className="font-medium">{appointment?.patient?.user?.fullName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Gender</Label>
                <p className="font-medium">{appointment?.patient?.gender || "Not specified"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Blood Type</Label>
                <p className="font-medium">{appointment?.patient?.bloodType || "Not specified"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Insurance</Label>
                <p className="font-medium">{appointment?.patient?.insuranceProvider || "None"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consultation Type</CardTitle>
            <CardDescription>Select the type of consultation conducted</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={consultationType} onValueChange={(value) => setValue("consultationType", value as any)}>
              <div className="grid gap-3">
                {consultationTypes.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={option.value}
                    className={cn(
                      "flex items-center space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer transition-all hover:bg-accent",
                      consultationType === option.value && "border-primary bg-primary/5",
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
            {errors.consultationType && (
              <p className="text-sm text-destructive mt-2">{errors.consultationType.message}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doctor's Notes</CardTitle>
            <CardDescription>Record your observations, diagnosis, and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea
                placeholder="Enter detailed consultation notes, diagnosis, and observations..."
                {...register("doctorNotes")}
                rows={8}
                className="focus:ring-2 focus:ring-primary"
              />
              {errors.doctorNotes && <p className="text-sm text-destructive">{errors.doctorNotes.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prescription</CardTitle>
            <CardDescription>Add medication and treatment instructions (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea
                placeholder="Enter prescription details, medication names, dosages, and instructions..."
                {...register("prescription")}
                rows={6}
                className="focus:ring-2 focus:ring-primary"
              />
              {errors.prescription && <p className="text-sm text-destructive">{errors.prescription.message}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.push("/doctor/appointments")}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary-hover" disabled={recordMutation.isPending}>
            {recordMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Consultation...
              </>
            ) : (
              "Save Consultation"
            )}
          </Button>
        </div>
      </form>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center">Consultation Recorded!</DialogTitle>
            <DialogDescription className="text-center text-pretty">
              The consultation has been successfully recorded and the appointment has been marked as completed.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => router.push("/doctor/appointments")}
            className="w-full bg-primary hover:bg-primary-hover"
          >
            Back to Appointments
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
