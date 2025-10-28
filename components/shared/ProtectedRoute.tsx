"use client"

import type React from "react"

import { useAuthStore } from "@/store/authStore"
import { ROUTES } from "@/config/constants"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN)
      return
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      const dashboardMap: Record<string, string> = {
        PATIENT: ROUTES.PATIENT_DASHBOARD,
        DOCTOR: ROUTES.DOCTOR_DASHBOARD,
        RECEPTIONIST: ROUTES.RECEPTIONIST_DASHBOARD,
        HOSPITAL_ADMIN: ROUTES.HOSPITAL_ADMIN_DASHBOARD,
        ADMIN: ROUTES.ADMIN_DASHBOARD,
      }
      router.push(dashboardMap[user.role] || ROUTES.LOGIN)
    }
  }, [isAuthenticated, user, allowedRoles, router])

  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null
  }

  return <>{children}</>
}
