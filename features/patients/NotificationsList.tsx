"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Bell, Check } from "lucide-react"

import { notificationsApi } from "@/api/notifications"
import { useNotificationStore } from "@/store/notificationStore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SkeletonCard } from "@/components/shared/Skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

export function NotificationsList() {
  const queryClient = useQueryClient()
  const { setNotifications, markAsRead } = useNotificationStore()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const data = await notificationsApi.list()
      setNotifications(data)
      return data
    },
  })

  const markAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: (_, id) => {
      markAsRead(id)
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (!notifications || notifications.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No notifications"
        description="You're all caught up! Notifications will appear here when you have updates."
      />
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={cn(
            "transition-all hover:shadow-md",
            !notification.isRead && "border-l-4 border-l-primary bg-primary/5",
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <div className={cn("rounded-full p-2", notification.isRead ? "bg-muted" : "bg-primary/10")}>
                    <Bell className={cn("h-5 w-5", notification.isRead ? "text-muted-foreground" : "text-primary")} />
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-sm", !notification.isRead && "font-semibold")}>{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(notification.createdAt, "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              </div>

              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsReadMutation.mutate(notification.id)}
                  disabled={markAsReadMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark as read
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
