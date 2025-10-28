export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001"

export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  COMPLETE_PROFILE: "/complete-profile",
  PATIENT_DASHBOARD: "/patient-dashboard",
  DOCTOR_DASHBOARD: "/doctor-dashboard",
  RECEPTIONIST_DASHBOARD: "/receptionist-dashboard",
  HOSPITAL_ADMIN_DASHBOARD: "/hospital-admin-dashboard",
  ADMIN_DASHBOARD: "/admin-dashboard",
} as const

export const USER_ROLES = {
  PATIENT: "PATIENT",
  DOCTOR: "DOCTOR",
  RECEPTIONIST: "RECEPTIONIST",
  HOSPITAL_ADMIN: "HOSPITAL_ADMIN",
  ADMIN: "ADMIN",
} as const

export const APPOINTMENT_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const

export const CONSULTATION_TYPE = {
  VIDEO: "VIDEO",
  AUDIO: "AUDIO",
  CHAT: "CHAT",
} as const

export const PAYMENT_METHOD = {
  CASH: "CASH",
  MOBILE_MONEY: "MOBILE_MONEY",
  INSURANCE: "INSURANCE",
} as const

export const DOCTOR_STATUS = {
  AVAILABLE: "AVAILABLE",
  BUSY: "BUSY",
  OFFLINE: "OFFLINE",
} as const

export const GENDER = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const
