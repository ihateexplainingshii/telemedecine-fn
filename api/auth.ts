import axiosInstance from "./axiosInstance"

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    fullName: string
    role: string
    phone?: string
    profileId?: string
  }
}

export interface RegisterPatientRequest {
  fullName: string
  email: string
  phone: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface CompleteInvitationRequest {
  token: string
  fullName: string
  phone: string
  password: string
  specialization?: string
  licenseNumber?: string
  consultationFee?: number
  dateOfBirth?: string
  gender?: "MALE" | "FEMALE" | "OTHER"
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post("/auth/login", data)
    console.log(response)
    return response.data
  },

  registerPatient: async (data: RegisterPatientRequest) => {
    const response = await axiosInstance.post("/auth/registerPatient", data)
    return response.data
  },

  forgotPassword: async (data: ForgotPasswordRequest) => {
    const response = await axiosInstance.post("/auth/forgot-password", data)
    return response.data
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    const response = await axiosInstance.post("/auth/reset-password", data)
    return response.data
  },

  completeInvitation: async (data: CompleteInvitationRequest) => {
    const response = await axiosInstance.post("/auth/complete-invitation", data)
    return response.data
  },

  changePassword: async (data: ChangePasswordRequest) => {
    const response = await axiosInstance.patch("/auth/change-password", data)
    return response.data
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get("/auth/me")
    return response.data
  },

  logout: async () => {
    const response = await axiosInstance.post("/auth/logout")
    return response.data
  },
}
