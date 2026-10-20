"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Files, Clock, CheckCircle2, XCircle } from "lucide-react"

type Stats = {
  total: number
  pending: number
  approved: number
  rejected: number
}

export function StatsCards({ stats }: { stats: Stats | null }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  const items = [
    { label: "Total", value: stats.total, icon: Files, accent: "text-foreground" },
    { label: "Pending", value: stats.pending, icon: Clock, accent: "text-amber-600" },
    { label: "Approved", value: stats.approved, icon: CheckCircle2, accent: "text-emerald-600" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, accent: "text-rose-600" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(({ label, value, icon: Icon, accent }) => (
        <Card key={label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <Icon className={`h-4 w-4 ${accent}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${accent}`}>{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
