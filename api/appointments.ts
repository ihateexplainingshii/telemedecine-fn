import axiosInstance from "./axiosInstance"

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  hospitalId: string
  appointmentDate: string
  type: "VIDEO" | "AUDIO" | "CHAT"
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  createdAt: string
  patient?: any
  doctor?: any
  hospital?: any
}

export interface CreateAppointmentRequest {
  patientId: string
  doctorId: string
  hospitalId: string
  appointmentDate: string
  type: "VIDEO" | "AUDIO" | "CHAT"
}

export interface UpdateAppointmentStatusRequest {
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
}

export const appointmentsApi = {
  list: async (): Promise<Appointment[]> => {
    const response = await axiosInstance.get("/appointments")
    return response.data
  },

  getById: async (id: string): Promise<Appointment> => {
    const response = await axiosInstance.get(`/appointments/${id}`)
    return response.data
  },

  create: async (data: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await axiosInstance.post("/appointments", data)
    return response.data
  },

  updateStatus: async (id: string, data: UpdateAppointmentStatusRequest): Promise<Appointment> => {
    const response = await axiosInstance.patch(`/appointments/${id}/status`, data)
    return response.data
  },
}
