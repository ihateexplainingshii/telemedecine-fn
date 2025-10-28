import { create } from "zustand"

interface Notification {
  id: string
  userId: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  setNotifications: (notifications: Notification[]) => void
  markAsRead: (id: string) => void
  addNotification: (notification: Notification) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
    })),
}))
