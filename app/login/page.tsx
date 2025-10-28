import { AuthLayout } from "@/components/layout/AuthLayout"
import { LoginForm } from "@/features/auth/LoginForm"

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to access your healthcare dashboard">
      <LoginForm />
    </AuthLayout>
  )
}
