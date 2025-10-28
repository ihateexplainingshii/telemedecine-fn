"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getUsers, resendInvite } from "@/api/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { SkeletonTable } from "@/components/shared/Skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { Search, Users, RefreshCw } from "lucide-react"
import { toast } from "react-hot-toast"
import { format } from "date-fns"

export function UserManagement() { // Added export here
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")

  const { data: users, isLoading } = useQuery({
    queryKey: ["users", roleFilter !== "ALL" ? roleFilter : undefined],
    queryFn: () => getUsers(roleFilter !== "ALL" ? { role: roleFilter } : undefined),
  })

  const resendInviteMutation = useMutation({
    mutationFn: resendInvite,
    onSuccess: () => {
      toast.success("Invitation resent successfully!")
    },
    onError: () => {
      toast.error("Failed to resend invitation")
    },
  })

  const filteredUsers = users?.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive"
      case "HOSPITAL_ADMIN":
        return "default"
      case "DOCTOR":
        return "secondary"
      case "RECEPTIONIST":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">View and manage all system users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ADMIN">System Admin</SelectItem>
            <SelectItem value="HOSPITAL_ADMIN">Hospital Admin</SelectItem>
            <SelectItem value="DOCTOR">Doctor</SelectItem>
            <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
            <SelectItem value="PATIENT">Patient</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <SkeletonTable />
      ) : !filteredUsers?.length ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description={searchTerm ? "No users match your search" : "No users in the system"}
        />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>{user.role.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "ACTIVE" ? "default" : user.status === "PENDING" ? "outline" : "secondary"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(user.createdAt), "MMM dd, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    {user.status === "PENDING" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resendInviteMutation.mutate(user.id)}
                        disabled={resendInviteMutation.isPending}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Resend Invite
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}