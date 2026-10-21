"use client"

// Four SaaS-style stat cards: Total / Pending / Approved / Rejected.
// Each icon sits in a soft tinted square so the row reads as a single KPI band.
import { Files, Clock, CheckCircle2, XCircle } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"

type Stats = {
  total: number
  pending: number
  approved: number
  rejected: number
}

const ITEMS = [
  {
    key: "total",
    label: "Total",
    icon: Files,
    iconBox: "bg-gray-100 text-gray-600",
    value: "text-gray-900",
  },
  {
    key: "pending",
    label: "Pending",
    icon: Clock,
    iconBox: "bg-yellow-100 text-yellow-600",
    value: "text-gray-900",
  },
  {
    key: "approved",
    label: "Approved",
    icon: CheckCircle2,
    iconBox: "bg-green-100 text-green-600",
    value: "text-gray-900",
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: XCircle,
    iconBox: "bg-red-100 text-red-600",
    value: "text-gray-900",
  },
] as const

export function StatsCards({ stats }: { stats: Stats | null }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {ITEMS.map(({ key, label, icon: Icon, iconBox, value }) => (
        <div
          key={key}
          className="rounded-xl border border-transparent bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <span
              className={`flex size-9 items-center justify-center rounded-lg ${iconBox}`}
            >
              <Icon className="size-4.5" />
            </span>
          </div>
          <p className={`mt-3 text-3xl font-semibold tabular-nums ${value}`}>
            {stats[key]}
          </p>
        </div>
      ))}
    </div>
  )
}
