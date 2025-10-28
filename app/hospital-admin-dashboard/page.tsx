"use client"

import { useQuery } from "@tanstack/react-query"
import { getHospitalReport } from "@/api/reports"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton, SkeletonCard } from "@/components/shared/Skeleton"
import { Users, UserCheck, Stethoscope, DollarSign, Calendar } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function HospitalAdminDashboard() {
  const user = useAuthStore((state) => state.user)

  const { data: report, isLoading } = useQuery({
    queryKey: ["hospital-report", user?.hospitalId],
    queryFn: () => getHospitalReport(user?.hospitalId!),
    enabled: !!user?.hospitalId,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[100px] w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  const stats = [
    {
      title: "Total Doctors",
      value: report?.totalDoctors || 0,
      icon: Stethoscope,
      color: "text-blue-600",
    },
    {
      title: "Total Patients",
      value: report?.totalPatients || 0,
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Total Receptionists",
      value: report?.totalReceptionists || 0,
      icon: UserCheck,
      color: "text-purple-600",
    },
    {
      title: "Total Appointments",
      value: report?.totalAppointments || 0,
      icon: Calendar,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Hospital Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your hospital's performance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Total Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary mb-6">RWF {report?.totalEarnings?.toLocaleString() || 0}</div>
          {report?.earningsOverTime && report.earningsOverTime.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={report.earningsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Appointments Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {report?.appointmentsOverTime && report.appointmentsOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report.appointmentsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No appointment data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}