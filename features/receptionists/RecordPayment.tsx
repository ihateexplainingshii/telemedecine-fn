"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, CheckCircle2, DollarSign } from "lucide-react"

import { paymentsApi } from "@/api/payments"
import { appointmentsApi } from "@/api/appointments"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

const paymentSchema = z.object({
  appointmentId: z.string().min(1, "Please select an appointment"),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  method: z.enum(["CASH", "MOBILE_MONEY", "INSURANCE"], {
    required_error: "Please select a payment method",
  }),
})

type PaymentFormData = z.infer<typeof paymentSchema>

const paymentMethods = [
  { value: "CASH", label: "Cash", description: "Physical cash payment" },
  { value: "MOBILE_MONEY", label: "Mobile Money", description: "MTN, Airtel, etc." },
  { value: "INSURANCE", label: "Insurance", description: "Insurance coverage" },
]

export function RecordPayment() {
  const queryClient = useQueryClient()
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const { data: appointments } = useQuery({
    queryKey: ["receptionist-appointments"],
    queryFn: appointmentsApi.list,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  })

  const appointmentId = watch("appointmentId")
  const method = watch("method")

  const selectedAppointment = appointments?.find((apt) => apt.id === appointmentId)

  const recordMutation = useMutation({
    mutationFn: paymentsApi.record,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      setShowSuccessDialog(true)
      reset()
    },
  })

  const onSubmit = (data: PaymentFormData) => {
    recordMutation.mutate(data)
  }

  const confirmedAppointments = appointments?.filter((apt) => apt.status === "CONFIRMED" || apt.status === "COMPLETED")

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Appointment</CardTitle>
            <CardDescription>Choose the appointment to record payment for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="appointmentId">Appointment</Label>
              <Select value={appointmentId} onValueChange={(value) => setValue("appointmentId", value)}>
                <SelectTrigger id="appointmentId">
                  <SelectValue placeholder="Select an appointment" />
                </SelectTrigger>
                <SelectContent>
                  {confirmedAppointments?.map((apt) => (
                    <SelectItem key={apt.id} value={apt.id}>
                      {apt.patient?.user?.fullName} - {apt.doctor?.user?.fullName} (
                      {new Date(apt.appointmentDate).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.appointmentId && <p className="text-sm text-destructive">{errors.appointmentId.message}</p>}
            </div>

            {selectedAppointment && (
              <div className="mt-4 p-4 rounded-lg bg-muted">
                <p className="text-sm">
                  <span className="text-muted-foreground">Consultation Fee:</span>{" "}
                  <span className="font-semibold text-primary">
                    RWF {selectedAppointment.doctor?.consultationFee?.toLocaleString()}
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {appointmentId && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Payment Amount</CardTitle>
                <CardDescription>Enter the amount received</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (RWF)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="20000"
                    {...register("amount")}
                    defaultValue={selectedAppointment?.doctor?.consultationFee}
                  />
                  {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Select how the payment was made</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={method} onValueChange={(value) => setValue("method", value as any)}>
                  <div className="grid gap-3">
                    {paymentMethods.map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={option.value}
                        className={cn(
                          "flex items-center space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer transition-all hover:bg-accent",
                          method === option.value && "border-primary bg-primary/5",
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
                {errors.method && <p className="text-sm text-destructive mt-2">{errors.method.message}</p>}
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover"
              disabled={recordMutation.isPending}
            >
              {recordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording Payment...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Record Payment
                </>
              )}
            </Button>
          </>
        )}
      </form>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center">Payment Recorded!</DialogTitle>
            <DialogDescription className="text-center text-pretty">
              The payment has been successfully recorded in the system.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowSuccessDialog(false)} className="w-full bg-primary hover:bg-primary-hover">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
