import { AuthLayout } from "@/components/layout/AuthLayout"
import { ForgotPasswordForm } from "@/features/auth/ForgotPasswordForm"

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Reset Your Password" subtitle="Enter your email to receive a password reset link">
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
