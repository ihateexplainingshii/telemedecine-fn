// import axiosInstance from "./axiosInstance"

// export interface Doctor {
//   id: string
//   userId: string
//   hospitalId: string
//   specialization: string
//   licenseNumber: string
//   availability?: string
//   consultationFee: number
//   status: "AVAILABLE" | "BUSY" | "OFFLINE"
//   createdAt: string
//   user?: any
//   hospital?: any
// }

// export interface UpdateDoctorRequest {
//   specialization?: string
//   availability?: string
//   consultationFee?: number
//   status?: "AVAILABLE" | "BUSY" | "OFFLINE"
// }

// export const doctorsApi = {
//   list: async (params?: { hospitalId?: string; specialization?: string }): Promise<Doctor[]> => {
//     const response = await axiosInstance.get("/doctors", { params })
//     return response.data
//   },

//   getById: async (id: string): Promise<Doctor> => {
//     const response = await axiosInstance.get(`/doctors/${id}`)
//     return response.data
//   },

//   update: async (id: string, data: UpdateDoctorRequest): Promise<Doctor> => {
//     const response = await axiosInstance.patch(`/doctors/${id}`, data)
//     return response.data
//   },
// }


import axiosInstance from "./axiosInstance"

export interface Doctor {
  id: string
  userId: string
  hospitalId: string
  specialization: string
  licenseNumber: string
  availability?: string
  consultationFee: number
  status: "AVAILABLE" | "BUSY" | "OFFLINE"
  createdAt: string
  user?: any
  hospital?: any
}

export interface UpdateDoctorRequest {
  specialization?: string
  availability?: string
  consultationFee?: number
  status?: "AVAILABLE" | "BUSY" | "OFFLINE"
}

export const doctorsApi = {
  list: async (params?: { hospitalId?: string; specialization?: string }): Promise<Doctor[]> => {
    const response = await axiosInstance.get("/doctors", { params })
    return response.data
  },

  getById: async (id: string): Promise<Doctor> => {
    const response = await axiosInstance.get(`/doctors/${id}`)
    return response.data
  },

  update: async (id: string, data: UpdateDoctorRequest): Promise<Doctor> => {
    const response = await axiosInstance.patch(`/doctors/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/doctors/${id}`)
  },
}