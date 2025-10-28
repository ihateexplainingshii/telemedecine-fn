"use client"

import { useQuery } from "@tanstack/react-query"
import { FileText, Calendar, User } from "lucide-react"
import { useState } from "react"

import { consultationsApi } from "@/api/consultations"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SkeletonCard } from "@/components/shared/Skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { formatDate } from "@/lib/utils"

export function ConsultationsList() {
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null)

  const { data: consultations, isLoading } = useQuery({
    queryKey: ["consultations"],
    queryFn: consultationsApi.list,
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

  if (!consultations || consultations.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No consultations yet"
        description="Your consultation records will appear here after your appointments."
      />
    )
  }

  return (
    <>
      <div className="space-y-4">
        {consultations.map((consultation) => (
          <Card
            key={consultation.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedConsultation(consultation)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Dr. {consultation.doctor?.user?.fullName || "Doctor"}</h3>
                      <p className="text-sm text-muted-foreground">{consultation.doctor?.specialization}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(consultation.createdAt, "MMM dd, yyyy HH:mm")}
                  </div>

                  {consultation.doctorNotes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{consultation.doctorNotes}</p>
                  )}
                </div>

                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedConsultation} onOpenChange={() => setSelectedConsultation(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Consultation Details</DialogTitle>
            <DialogDescription>Consultation with Dr. {selectedConsultation?.doctor?.user?.fullName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Date & Time</h4>
              <p className="text-sm text-muted-foreground">
                {selectedConsultation && formatDate(selectedConsultation.createdAt, "MMM dd, yyyy HH:mm")}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Consultation Type</h4>
              <p className="text-sm text-muted-foreground">{selectedConsultation?.consultationType}</p>
            </div>

            {selectedConsultation?.doctorNotes && (
              <div>
                <h4 className="font-semibold mb-2">Doctor's Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedConsultation.doctorNotes}</p>
              </div>
            )}

            {selectedConsultation?.prescription && (
              <div>
                <h4 className="font-semibold mb-2">Prescription</h4>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm whitespace-pre-wrap">{selectedConsultation.prescription}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => window.print()}>
                Print
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary-hover"
                onClick={() => setSelectedConsultation(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
