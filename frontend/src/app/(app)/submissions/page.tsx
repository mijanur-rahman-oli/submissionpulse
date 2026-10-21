"use client"

// /submissions — a student's own submission history, read from GET /projects/mine.
// The submit form deliberately does not render this list any more; it lives here
// so "Submit Project" and "My Submissions" stay separate pages/routes.

import { useCallback, useEffect, useState } from "react"

import { apiFetch } from "@/lib/api"
import { AuthGuard } from "@/components/auth-guard"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ExternalLink, FileText } from "lucide-react"

type ProjectStatus = "PENDING" | "APPROVED" | "REJECTED"

type Project = {
  id: string
  name: string
  repoUrl: string
  liveUrl: string | null
  description: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
}

// Badge variants ship a fixed palette; status needs its own colors, so the class
// is selected here and the badge stays on the shared outline treatment.
const STATUS_STYLES: Record<ProjectStatus, string> = {
  PENDING: "border-yellow-200 bg-yellow-50 text-yellow-700",
  APPROVED: "border-green-200 bg-green-50 text-green-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
}

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

function SubmissionsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { projects } = await apiFetch<{ projects: Project[] }>("/projects/mine")
      setProjects(projects)
    } catch {
      toast.error("Could not load your submissions")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card className="rounded-xl border-0 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">My Submissions</CardTitle>
          <CardDescription>Every project you&apos;ve submitted and its review status.</CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <FileText className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No submissions yet.</p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Project Name
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Repo URL
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="whitespace-normal">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Submitted {dateFormat.format(new Date(p.createdAt))}
                        </div>
                      </TableCell>

                      <TableCell>
                        <a
                          href={p.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex max-w-[280px] items-center gap-1 truncate text-sm text-primary hover:underline"
                        >
                          <span className="truncate">{p.repoUrl}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                        {p.liveUrl && (
                          <a
                            href={p.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 block text-xs text-muted-foreground hover:underline"
                          >
                            Live site
                          </a>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={STATUS_STYLES[p.status]}>
                          {STATUS_LABELS[p.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard role="STUDENT">
      <SubmissionsPage />
    </AuthGuard>
  )
}