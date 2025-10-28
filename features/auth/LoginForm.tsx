"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

import { authApi } from "@/api/auth"
import { useAuthStore } from "@/store/authStore"
import { ROUTES, USER_ROLES } from "@/config/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token)
      toast.success("Welcome back!")

      // Redirect to appropriate dashboard
      const dashboardMap: Record<string, string> = {
        [USER_ROLES.PATIENT]: ROUTES.PATIENT_DASHBOARD,
        [USER_ROLES.DOCTOR]: ROUTES.DOCTOR_DASHBOARD,
        [USER_ROLES.RECEPTIONIST]: ROUTES.RECEPTIONIST_DASHBOARD,
        [USER_ROLES.HOSPITAL_ADMIN]: ROUTES.HOSPITAL_ADMIN_DASHBOARD,
        [USER_ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
      }

      router.push(dashboardMap[data.user.role] || ROUTES.PATIENT_DASHBOARD)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Login failed. Please check your credentials."
      toast.error(message)
    },
  })

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register("email")}
          className="focus:ring-2 focus:ring-primary"
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <span className="sr-only">Error:</span>
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
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
        {errors.password && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <span className="sr-only">Error:</span>
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Link
          href={ROUTES.FORGOT_PASSWORD}
          className="text-sm text-primary hover:text-primary-hover underline-offset-4 hover:underline transition-colors"
        >
          Forgot Password?
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary-hover text-white"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          href={ROUTES.REGISTER}
          className="text-primary hover:text-primary-hover font-medium underline-offset-4 hover:underline transition-colors"
        >
          Register as a patient
        </Link>
      </p>
    </form>
  )
}
