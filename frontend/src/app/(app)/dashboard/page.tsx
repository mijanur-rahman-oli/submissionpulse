"use client"

import { useCallback, useEffect, useState } from "react"

import { apiFetch } from "@/lib/api"
import { AuthGuard } from "@/components/auth-guard"
import { StatsCards } from "@/components/stats-cards"
import { ProjectStatusBadge } from "@/components/project-status-badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  Search,
  ExternalLink,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  X,
} from "lucide-react"

type Status = "PENDING" | "APPROVED" | "REJECTED"
type Filter = "ALL" | Status

type Student = { id: string; name: string; email: string }

type Project = {
  id: string
  name: string
  repoUrl: string
  liveUrl: string | null
  description: string
  status: Status
  createdAt: string
  student: Student
}

type Meta = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

type Stats = {
  total: number
  pending: number
  approved: number
  rejected: number
}

function Inner() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [status, setStatus] = useState<Filter>("ALL")
  const [q, setQ] = useState("")
  const [debouncedQ, setDebouncedQ] = useState("")

  const [data, setData] = useState<Project[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)

  const [loadingData, setLoadingData] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 400)
    return () => clearTimeout(t)
  }, [q])

  // Reset to first page on filter / search / pageSize change
  useEffect(() => {
    setPage(1)
  }, [status, debouncedQ, pageSize])

  const loadProjects = useCallback(async () => {
    setLoadingData(true)
    try {
      const qs = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        status,
      })
      if (debouncedQ) qs.set("q", debouncedQ)
      const res = await apiFetch<{ data: Project[]; meta: Meta }>(
        `/projects?${qs.toString()}`
      )
      setData(res.data)
      setMeta(res.meta)
    } catch {
      toast.error("Could not load projects")
    } finally {
      setLoadingData(false)
    }
  }, [page, pageSize, status, debouncedQ])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const loadStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      setStats(await apiFetch<Stats>("/projects/stats"))
    } catch {
      /* silent — stats are cosmetic */
    } finally {
      setLoadingStats(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const updateStatus = async (id: string, newStatus: Status) => {
    setUpdatingIds((prev) => new Set(prev).add(id))
    try {
      await apiFetch(`/projects/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      })
      toast.success(`Project ${newStatus.toLowerCase()}`)
      await Promise.all([loadProjects(), loadStats()])
    } catch {
      toast.error("Could not update status")
    } finally {
      setUpdatingIds((prev) => {
        const n = new Set(prev)
        n.delete(id)
        return n
      })
    }
  }

  const start = meta ? (meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1) : 0
  const end = meta ? Math.min(meta.page * meta.pageSize, meta.total) : 0

  return (
    <div className="space-y-6">
      <StatsCards stats={loadingStats ? null : stats} />

      <Card className="rounded-xl border-0 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Submissions</CardTitle>
          <CardDescription>Review student submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {/* ---- Filter bar: search on the left, filters on the right ---- */}
          <div className="flex flex-col gap-3 pb-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                className="h-10 pl-9"
                placeholder="Search name, student, or email"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as Filter)}
              >
                <SelectTrigger className="h-10 w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger className="h-10 w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="25">25 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="border-b-0 bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Project
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Student
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Submitted
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Status
                  </TableHead>
                  <TableHead className="w-[64px] text-xs font-medium uppercase tracking-wide text-gray-500">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingData ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`sk-${i}`}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <TableCell key={`sk-${i}-${j}`}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <span className="text-sm text-muted-foreground">
                        No projects match your filters.
                      </span>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((p) => {
                    const updating = updatingIds.has(p.id)
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1 max-w-[320px]">
                            {p.description}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <a
                              href={p.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                            >
                              Repo
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            {p.liveUrl && (
                              <a
                                href={p.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                              >
                                Live
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">{p.student.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {p.student.email}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Intl.DateTimeFormat("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }).format(new Date(p.createdAt))}
                          </span>
                        </TableCell>

                        <TableCell>
                          <ProjectStatusBadge status={p.status} />
                        </TableCell>

                        <TableCell>
                          {updating ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                aria-label="Open actions"
                                className="inline-flex size-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                  Change status
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  disabled={p.status === "APPROVED"}
                                  onSelect={() =>
                                    updateStatus(p.id, "APPROVED")
                                  }
                                >
                                  <Check className="text-green-600" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={p.status === "REJECTED"}
                                  onSelect={() =>
                                    updateStatus(p.id, "REJECTED")
                                  }
                                >
                                  <X className="text-red-600" />
                                  Reject
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={p.status === "PENDING"}
                                  onSelect={() =>
                                    updateStatus(p.id, "PENDING")
                                  }
                                >
                                  Move to pending
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {meta && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
              <span className="text-sm text-muted-foreground">
                Showing {start}–{end} of {meta.total}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(meta.totalPages, p + 1))
                  }
                  disabled={meta.page >= meta.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard role="MENTOR">
      <Inner />
    </AuthGuard>
  )
}