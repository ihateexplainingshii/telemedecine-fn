import axiosInstance from "./axiosInstance"
import { User } from "./users"

export interface InvitePatientRequest {
  email: string
  fullName: string
  phone: string
}

export interface Receptionist {
  id: string
  userId: string
  hospitalId: string
  user?: User
}

export const receptionistsApi = {
  list: async (params?: { hospitalId?: string }): Promise<Receptionist[]> => {
    const response = await axiosInstance.get("/receptionists", { params })
    return response.data
  },
  invitePatient: async (data: InvitePatientRequest) => {
    const response = await axiosInstance.post("/receptionists/patients/invite", data)
    return response.data
  },
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/receptionists/${id}`)
  },
}