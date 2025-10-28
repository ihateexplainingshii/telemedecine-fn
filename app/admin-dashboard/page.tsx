"use client"

import { useQuery } from "@tanstack/react-query"
import { getSystemReport } from "@/api/reports"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton, SkeletonCard } from "@/components/shared/Skeleton"
import { Building2, Users, Stethoscope, UserCheck, Calendar, DollarSign } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function AdminDashboard() {
  const { data: report, isLoading } = useQuery({
    queryKey: ["system-report"],
    queryFn: getSystemReport,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[100px] w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
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
      title: "Total Hospitals",
      value: report?.totalHospitals || 0,
      icon: Building2,
      color: "text-blue-600",
    },
    {
      title: "Total Users",
      value: report?.totalUsers || 0,
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Total Doctors",
      value: report?.totalDoctors || 0,
      icon: Stethoscope,
      color: "text-purple-600",
    },
    {
      title: "Total Patients",
      value: report?.totalPatients || 0,
      icon: UserCheck,
      color: "text-orange-600",
    },
    {
      title: "Total Appointments",
      value: report?.totalAppointments || 0,
      icon: Calendar,
      color: "text-pink-600",
    },
    {
      title: "Total Earnings",
      value: `RWF ${report?.totalEarnings?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "text-primary",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of the entire telemedicine platform</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            {report?.usersByRole && report.usersByRole.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={report.usersByRole}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ role, count }) => `${role}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {report.usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No user data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hospitals Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {report?.hospitalsOverTime && report.hospitalsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.hospitalsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No hospital data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}