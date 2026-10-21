"use client"

// Pastel pill used across the mentor table and the student submission list.
type Status = "PENDING" | "APPROVED" | "REJECTED"

const STYLES: Record<Status, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
}

const LABEL: Record<Status, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
}

export function ProjectStatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {LABEL[status]}
    </span>
  )
}
