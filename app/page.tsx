"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { ROUTES, USER_ROLES } from "@/config/constants"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN)
      return
    }

    // Redirect to appropriate dashboard based on role
    const dashboardMap: Record<string, string> = {
      [USER_ROLES.PATIENT]: ROUTES.PATIENT_DASHBOARD,
      [USER_ROLES.DOCTOR]: ROUTES.DOCTOR_DASHBOARD,
      [USER_ROLES.RECEPTIONIST]: ROUTES.RECEPTIONIST_DASHBOARD,
      [USER_ROLES.HOSPITAL_ADMIN]: ROUTES.HOSPITAL_ADMIN_DASHBOARD,
      [USER_ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
    }

    if (user?.role) {
      router.push(dashboardMap[user.role] || ROUTES.LOGIN)
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
