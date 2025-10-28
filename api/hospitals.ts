import axiosInstance from "./axiosInstance"

export interface Hospital {
  id: string
  name: string
  licenseNumber: string
  address: string
  contactEmail: string
  contactPhone: string
  adminId?: string
  createdAt: string
}

export interface CreateHospitalRequest {
  name: string
  licenseNumber: string
  address: string
  contactEmail: string
  contactPhone: string
  adminId?: string
}

export const hospitalsApi = {
  list: async (): Promise<Hospital[]> => {
    const response = await axiosInstance.get("/hospitals")
    return response.data
  },

  getById: async (id: string): Promise<Hospital> => {
    const response = await axiosInstance.get(`/hospitals/${id}`)
    return response.data
  },

  create: async (data: CreateHospitalRequest): Promise<Hospital> => {
    const response = await axiosInstance.post("/hospitals", data)
    return response.data
  },

  update: async (id: string, data: Partial<CreateHospitalRequest>): Promise<Hospital> => {
    const response = await axiosInstance.patch(`/hospitals/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/hospitals/${id}`)
  },
}
