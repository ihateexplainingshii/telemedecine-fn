import axiosInstance from "./axiosInstance"

export interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  role: "PATIENT" | "DOCTOR" | "RECEPTIONIST" | "HOSPITAL_ADMIN" | "ADMIN"
  status: "ACTIVE" | "INACTIVE" | "PENDING"
  createdAt: string
  updatedAt: string
}

export interface InviteStaffRequest {
  email: string
  role: "DOCTOR" | "RECEPTIONIST"
}

export interface InviteHospitalAdminRequest {
  email: string
}

export interface InviteStaffResponse {
  message: string
  invitationToken: string
}

export const inviteStaff = async (data: InviteStaffRequest): Promise<InviteStaffResponse> => {
  const response = await axiosInstance.post("/users/invite-staff", data)
  return response.data
}

export const inviteHospitalAdmin = async (data: InviteHospitalAdminRequest): Promise<InviteStaffResponse> => {
  const response = await axiosInstance.post("/users/invite-hospital-admin", data)
  return response.data
}

export const resendInvite = async (userId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post(`/users/resend-invite`, { userId })
  return response.data
}

export const getUsers = async (params?: { role?: string }): Promise<User[]> => {
  const response = await axiosInstance.get("/users", { params })
  return response.data
}

export const getUser = async (id: string): Promise<User> => {
  const response = await axiosInstance.get(`/users/${id}`)
  return response.data
}

export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  const response = await axiosInstance.patch(`/users/${id}`, data)
  return response.data
}

export const uploadAvatar = async (userId: string, file: File): Promise<{ avatarUrl: string }> => {
  const formData = new FormData()
  formData.append("avatar", file)
  const response = await axiosInstance.post(`/users/${userId}/avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data
}
