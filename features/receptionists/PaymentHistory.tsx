"use client"

import { useQuery } from "@tanstack/react-query"
import { DollarSign, Calendar } from "lucide-react"

import { paymentsApi } from "@/api/payments"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SkeletonCard } from "@/components/shared/Skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { formatDate, formatCurrency } from "@/lib/utils"

const methodColors = {
  CASH: "bg-green-100 text-green-800 border-green-200",
  MOBILE_MONEY: "bg-blue-100 text-blue-800 border-blue-200",
  INSURANCE: "bg-purple-100 text-purple-800 border-purple-200",
}

export function PaymentHistory() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: paymentsApi.list,
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

  if (!payments || payments.length === 0) {
    return (
      <EmptyState
        icon={DollarSign}
        title="No payments recorded"
        description="Payment records will appear here once you start recording transactions."
      />
    )
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <Card key={payment.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{payment.appointment?.patient?.user?.fullName}</h3>
                    <p className="text-sm text-muted-foreground">Dr. {payment.appointment?.doctor?.user?.fullName}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(payment.createdAt, "MMM dd, yyyy HH:mm")}
                  </div>
                </div>
              </div>

              <div className="text-right space-y-2">
                <p className="text-2xl font-bold text-primary">{formatCurrency(payment.amount)}</p>
                <Badge variant="outline" className={methodColors[payment.method]}>
                  {payment.method.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
