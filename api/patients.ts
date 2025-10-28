import axiosInstance from "./axiosInstance"

export interface Patient {
  id: string
  userId: string
  hospitalId?: string
  dateOfBirth?: string
  gender?: "MALE" | "FEMALE" | "OTHER"
  bloodType?: string
  medicalHistory?: any
  insuranceProvider?: string
  insuranceNumber?: string
  createdAt: string
  user?: any
}

export interface UpdatePatientRequest {
  dateOfBirth?: string
  gender?: "MALE" | "FEMALE" | "OTHER"
  bloodType?: string
  medicalHistory?: any
  insuranceProvider?: string
  insuranceNumber?: string
}

export const patientsApi = {
  list: async (params?: {
    hospitalId?: string
    role?: string
    status?: string
  }): Promise<Patient[]> => {
    const response = await axiosInstance.get("/patients", { params })
    return response.data
  },

  getById: async (id: string): Promise<Patient> => {
    const response = await axiosInstance.get(`/patients/${id}`)
    return response.data
  },

  update: async (id: string, data: UpdatePatientRequest): Promise<Patient> => {
    const response = await axiosInstance.patch(`/patients/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/patients/${id}`)
  },
}