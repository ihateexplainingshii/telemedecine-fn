import { AuthLayout } from "@/components/layout/AuthLayout"
import { ResetPasswordForm } from "@/features/auth/ResetPasswordForm"

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Create New Password" subtitle="Enter a strong password for your account">
      <ResetPasswordForm />
    </AuthLayout>
  )
}
