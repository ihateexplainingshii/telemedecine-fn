"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"

import { authApi } from "@/api/auth"
import { ROUTES } from "@/config/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      setEmailSent(true)
      toast.success("Password reset link sent!")
    },
    onError: () => {
      // Show generic message for security
      setEmailSent(true)
    },
  })

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data)
  }

  if (emailSent) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-balance">Check Your Email</h3>
          <p className="text-sm text-muted-foreground text-pretty">
            If an account exists for <strong>{getValues("email")}</strong>, a password reset link has been sent.
          </p>
        </div>
        <Link href={ROUTES.LOGIN}>
          <Button className="w-full bg-primary hover:bg-primary-hover">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </Link>
      </div>
    )
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
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary-hover text-white"
        disabled={forgotPasswordMutation.isPending}
      >
        {forgotPasswordMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Link...
          </>
        ) : (
          "Send Reset Link"
        )}
      </Button>

      <Link href={ROUTES.LOGIN}>
        <Button variant="ghost" className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Button>
      </Link>
    </form>
  )
}
