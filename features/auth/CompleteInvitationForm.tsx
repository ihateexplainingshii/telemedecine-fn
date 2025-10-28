"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

import { authApi } from "@/api/auth"
import { ROUTES } from "@/config/constants"
import { decodeJWT } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const baseSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

const doctorSchema = baseSchema.extend({
  specialization: z.string().min(1, "Specialization is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  consultationFee: z.coerce.number().min(0, "Consultation fee must be positive"),
})

const patientSchema = baseSchema.extend({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    required_error: "Please select a gender",
  }),
})

type CompleteInvitationFormData = z.infer<typeof baseSchema> & {
  specialization?: string
  licenseNumber?: string
  consultationFee?: number
  dateOfBirth?: string
  gender?: "MALE" | "FEMALE" | "OTHER"
}

export function CompleteInvitationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [showPassword, setShowPassword] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const [dateOfBirth, setDateOfBirth] = useState<Date>()

  useEffect(() => {
    if (token) {
      const decoded = decodeJWT(token)
      if (decoded) {
        setUserRole(decoded.role)
        setUserEmail(decoded.email)
      }
    }
  }, [token])

  const getSchema = () => {
    if (userRole === "DOCTOR") return doctorSchema
    if (userRole === "PATIENT") return patientSchema
    return baseSchema
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CompleteInvitationFormData>({
    resolver: zodResolver(getSchema()),
  })

  const password = watch("password")
  const gender = watch("gender")

  const completeInvitationMutation = useMutation({
    mutationFn: authApi.completeInvitation,
    onSuccess: () => {
      toast.success("Account created! You can now log in.")
      router.push(ROUTES.LOGIN)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to complete account setup."
      toast.error(message)
    },
  })

  const onSubmit = (data: CompleteInvitationFormData) => {
    if (!token) {
      toast.error("Invalid invitation link")
      return
    }

    const payload: any = {
      token,
      fullName: data.fullName,
      phone: data.phone,
      password: data.password,
    }

    if (userRole === "DOCTOR") {
      payload.specialization = data.specialization
      payload.licenseNumber = data.licenseNumber
      payload.consultationFee = data.consultationFee
    } else if (userRole === "PATIENT") {
      payload.dateOfBirth = data.dateOfBirth
      payload.gender = data.gender
    }

    completeInvitationMutation.mutate(payload)
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" }

    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" }
    if (strength <= 3) return { strength, label: "Fair", color: "bg-yellow-500" }
    if (strength <= 4) return { strength, label: "Good", color: "bg-blue-500" }
    return { strength, label: "Strong", color: "bg-green-500" }
  }

  const passwordStrength = getPasswordStrength(password)

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-destructive">Invalid or missing invitation token</p>
        <Button onClick={() => router.push(ROUTES.LOGIN)} className="bg-primary hover:bg-primary-hover">
          Go to Login
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 mb-6">
        <p className="text-sm text-primary font-medium text-center text-balance">
          Welcome to Telemedicine Rwanda! Please complete your profile.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" value={userEmail} disabled className="bg-muted text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          {...register("fullName")}
          className="focus:ring-2 focus:ring-primary"
          aria-invalid={errors.fullName ? "true" : "false"}
        />
        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="0781234567"
          {...register("phone")}
          className="focus:ring-2 focus:ring-primary"
          aria-invalid={errors.phone ? "true" : "false"}
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            {...register("password")}
            className="pr-10 focus:ring-2 focus:ring-primary"
            aria-invalid={errors.password ? "true" : "false"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {password && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium">{passwordStrength.label}</span>
            </div>
          </div>
        )}
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      {/* Dynamic fields based on role */}
      {userRole === "DOCTOR" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              type="text"
              placeholder="e.g., Cardiology, Pediatrics"
              {...register("specialization")}
              className="focus:ring-2 focus:ring-primary"
              aria-invalid={errors.specialization ? "true" : "false"}
            />
            {errors.specialization && <p className="text-sm text-destructive">{errors.specialization.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">License Number</Label>
            <Input
              id="licenseNumber"
              type="text"
              placeholder="MD-12345"
              {...register("licenseNumber")}
              className="focus:ring-2 focus:ring-primary"
              aria-invalid={errors.licenseNumber ? "true" : "false"}
            />
            {errors.licenseNumber && <p className="text-sm text-destructive">{errors.licenseNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="consultationFee">Consultation Fee (RWF)</Label>
            <Input
              id="consultationFee"
              type="number"
              placeholder="20000"
              {...register("consultationFee")}
              className="focus:ring-2 focus:ring-primary"
              aria-invalid={errors.consultationFee ? "true" : "false"}
            />
            {errors.consultationFee && <p className="text-sm text-destructive">{errors.consultationFee.message}</p>}
          </div>
        </>
      )}

      {userRole === "PATIENT" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !dateOfBirth && "text-muted-foreground")}
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
            {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={(value) => setValue("gender", value as any)}>
              <SelectTrigger className="focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
          </div>
        </>
      )}

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary-hover text-white"
        disabled={completeInvitationMutation.isPending}
      >
        {completeInvitationMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Complete Account"
        )}
      </Button>
    </form>
  )
}
