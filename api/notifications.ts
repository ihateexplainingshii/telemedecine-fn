import axiosInstance from "./axiosInstance"

export interface Notification {
  id: string
  userId: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export const notificationsApi = {
  list: async (): Promise<Notification[]> => {
    const response = await axiosInstance.get("/notifications")
    return response.data
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await axiosInstance.patch(`/notifications/${id}/read`)
    return response.data
  },
}
