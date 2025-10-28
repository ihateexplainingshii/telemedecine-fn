"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { inviteHospitalAdmin } from "@/api/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus } from "lucide-react"
import { toast } from "react-hot-toast"

export function InviteHospitalAdmin() {
  const [email, setEmail] = useState("")

  const inviteMutation = useMutation({
    mutationFn: inviteHospitalAdmin,
    onSuccess: () => {
      toast.success("Hospital admin invitation sent successfully!")
      setEmail("")
    },
    onError: () => {
      toast.error("Failed to send invitation")
    },
  })

  const handleInvite = () => {
    if (!email) {
      toast.error("Please enter an email address")
      return
    }
    inviteMutation.mutate({ email })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Invite Hospital Admin
        </CardTitle>
        <CardDescription>Send an invitation to a new hospital administrator</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-email">Email Address</Label>
          <Input
            id="admin-email"
            type="email"
            placeholder="admin@hospital.rw"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button
          onClick={handleInvite}
          disabled={inviteMutation.isPending}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
        </Button>
      </CardContent>
    </Card>
  )
}
