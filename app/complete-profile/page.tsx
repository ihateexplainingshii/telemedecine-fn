import { Suspense } from "react"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { CompleteInvitationForm } from "@/features/auth/CompleteInvitationForm"
import { Loader2 } from "lucide-react"

function FormLoading() {
  return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export default function CompleteProfilePage() {
  return (
    <AuthLayout title="Complete Your Profile" subtitle="Just a few more details to get started">
      <Suspense fallback={<FormLoading />}>
        <CompleteInvitationForm />
      </Suspense>
    </AuthLayout>
  )
}