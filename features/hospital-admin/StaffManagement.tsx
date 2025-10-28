"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { doctorsApi } from "@/api/doctors"
import { receptionistsApi } from "@/api/receptionists"
import { inviteStaff } from "@/api/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog"
import { SkeletonTable } from "@/components/shared/Skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { Search, UserPlus, Eye, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { useAuthStore } from "@/store/authStore"
import Link from "next/link"

export function StaffManagement() {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"DOCTOR" | "RECEPTIONIST">("DOCTOR")

  const { data: doctors, isLoading: loadingDoctors } = useQuery({
    queryKey: ["doctors", user?.hospitalId],
    queryFn: () => doctorsApi.list({ hospitalId: user?.hospitalId }),
    enabled: !!user?.hospitalId,
  })

  const { data: receptionists, isLoading: loadingReceptionists } = useQuery({
    queryKey: ["receptionists", user?.hospitalId],
    queryFn: () => receptionistsApi.list({ hospitalId: user?.hospitalId }),
    enabled: !!user?.hospitalId,
  })

  const inviteMutation = useMutation({
    mutationFn: inviteStaff,
    onSuccess: () => {
      toast.success("Staff invitation sent successfully!")
      setInviteOpen(false)
      setInviteEmail("")
      queryClient.invalidateQueries({ queryKey: ["doctors"] })
      queryClient.invalidateQueries({ queryKey: ["receptionists"] })
    },
    onError: () => {
      toast.error("Failed to send invitation")
    },
  })

  const deleteDoctorMutation = useMutation({
    mutationFn: (doctorId: string) => doctorsApi.delete(doctorId),
    onSuccess: () => {
      toast.success("Doctor removed successfully")
      queryClient.invalidateQueries({ queryKey: ["doctors"] })
    },
    onError: () => {
      toast.error("Failed to remove doctor")
    },
  })

  const deleteReceptionistMutation = useMutation({
    mutationFn: (receptionistId: string) => receptionistsApi.delete(receptionistId),
    onSuccess: () => {
      toast.success("Receptionist removed successfully")
      queryClient.invalidateQueries({ queryKey: ["receptionists"] })
    },
    onError: () => {
      toast.error("Failed to remove receptionist")
    },
  })

  const handleInvite = () => {
    if (!inviteEmail) {
      toast.error("Please enter an email address")
      return
    }
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole })
  }

  const filteredDoctors = doctors?.filter(
    (doc) =>
      doc.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.user?.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredReceptionists = receptionists?.filter(
    (rec) =>
      rec.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.user?.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground mt-1">Manage doctors and receptionists</p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="staff@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={(value: "DOCTOR" | "RECEPTIONIST") => setInviteRole(value)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOCTOR">Doctor</SelectItem>
                    <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleInvite}
                disabled={inviteMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search staff by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="doctors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="doctors">Doctors ({doctors?.length || 0})</TabsTrigger>
          <TabsTrigger value="receptionists">Receptionists ({receptionists?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="doctors" className="space-y-4">
          {loadingDoctors ? (
            <SkeletonTable />
          ) : !filteredDoctors?.length ? (
            <EmptyState
              icon={UserPlus}
              title="No doctors found"
              description="Invite doctors to join your hospital"
              actionLabel="Invite Doctor"
              onAction={() => setInviteOpen(true)}
            />
          ) : (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.user?.fullName}</TableCell>
                      <TableCell>{doctor.user?.email}</TableCell>
                      <TableCell>{doctor.specialization}</TableCell>
                      <TableCell>
                        <Badge variant={doctor.status === "AVAILABLE" ? "default" : "secondary"}>{doctor.status}</Badge>
                      </TableCell>
                      <TableCell>RWF {doctor.consultationFee?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/hospital-admin/staff/doctors/${doctor.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <ConfirmationDialog
                            title="Remove Doctor"
                            description="Are you sure you want to remove this doctor? This action cannot be undone."
                            onConfirm={() => deleteDoctorMutation.mutate(doctor.id)}
                            trigger={
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="receptionists" className="space-y-4">
          {loadingReceptionists ? (
            <SkeletonTable />
          ) : !filteredReceptionists?.length ? (
            <EmptyState
              icon={UserPlus}
              title="No receptionists found"
              description="Invite receptionists to join your hospital"
              actionLabel="Invite Receptionist"
              onAction={() => setInviteOpen(true)}
            />
          ) : (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceptionists.map((receptionist) => (
                    <TableRow key={receptionist.id}>
                      <TableCell className="font-medium">{receptionist.user?.fullName}</TableCell>
                      <TableCell>{receptionist.user?.email}</TableCell>
                      <TableCell>{receptionist.user?.phone || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={receptionist.user?.status === "ACTIVE" ? "default" : "secondary"}>
                          {receptionist.user?.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/hospital-admin/staff/receptionists/${receptionist.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <ConfirmationDialog
                            title="Remove Receptionist"
                            description="Are you sure you want to remove this receptionist? This action cannot be undone."
                            onConfirm={() => deleteReceptionistMutation.mutate(receptionist.id)}
                            trigger={
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}