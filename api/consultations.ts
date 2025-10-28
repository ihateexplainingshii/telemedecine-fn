import axiosInstance from "./axiosInstance"

export interface Consultation {
  id: string
  appointmentId: string
  doctorId: string
  patientId: string
  doctorNotes?: string
  prescription?: string
  consultationType: "VIDEO" | "AUDIO" | "CHAT"
  createdAt: string
  appointment?: any
  doctor?: any
}

export interface CreateConsultationRequest {
  appointmentId: string
  doctorNotes?: string
  prescription?: string
  consultationType: "VIDEO" | "AUDIO" | "CHAT"
}

export const consultationsApi = {
  list: async (): Promise<Consultation[]> => {
    const response = await axiosInstance.get("/consultations")
    return response.data
  },

  getById: async (id: string): Promise<Consultation> => {
    const response = await axiosInstance.get(`/consultations/${id}`)
    return response.data
  },

  create: async (data: CreateConsultationRequest): Promise<Consultation> => {
    const response = await axiosInstance.post("/consultations", data)
    return response.data
  },
}
