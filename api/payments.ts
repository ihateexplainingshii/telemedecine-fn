import axiosInstance from "./axiosInstance"

export interface Payment {
  id: string
  appointmentId: string
  amount: number
  method: "CASH" | "MOBILE_MONEY" | "INSURANCE"
  status: string
  createdAt: string
  appointment?: any
}

export interface RecordPaymentRequest {
  appointmentId: string
  amount: number
  method: "CASH" | "MOBILE_MONEY" | "INSURANCE"
}

export const paymentsApi = {
  list: async (): Promise<Payment[]> => {
    const response = await axiosInstance.get("/payments")
    return response.data
  },

  record: async (data: RecordPaymentRequest): Promise<Payment> => {
    const response = await axiosInstance.post("/payments", data)
    return response.data
  },
}
