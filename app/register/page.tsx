import { AuthLayout } from "@/components/layout/AuthLayout"
import { RegisterForm } from "@/features/auth/RegisterForm"

export default function RegisterPage() {
  return (
    <AuthLayout title="Create Your Account" subtitle="Join Telemedicine Rwanda for quality healthcare access">
      <RegisterForm />
    </AuthLayout>
  )
}
