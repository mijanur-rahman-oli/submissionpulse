"use client"

import { Badge } from "@/components/ui/badge"

type Status = "PENDING" | "APPROVED" | "REJECTED"

export function ProjectStatusBadge({ status }: { status: Status }) {
  if (status === "APPROVED") {
    return (
      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
        Approved
      </Badge>
    )
  }
  if (status === "REJECTED") {
    return <Badge variant="destructive">Rejected</Badge>
  }
  return <Badge variant="secondary">Pending</Badge>
}
