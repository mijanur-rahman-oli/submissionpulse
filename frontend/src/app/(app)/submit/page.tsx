"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { apiFetch } from "@/lib/api"
import { projectErrorToMessage } from "@/lib/project-errors"
import { AuthGuard } from "@/components/auth-guard"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ExternalLink, Loader2, AlertTriangle } from "lucide-react"

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

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Min 3 characters")
    .max(100, "Max 100 characters"),
  repoUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .refine((u) => u.startsWith("https://"), "Must use HTTPS"),
  liveUrl: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^https:\/\//.test(v), "Must use HTTPS")
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .min(20, "Min 20 characters")
    .max(2000, "Max 2000 characters"),
})

type Values = z.infer<typeof schema>

export default function SubmitPage() {
  const [pending, setPending] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingList, setLoadingList] = useState(true)

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", repoUrl: "", liveUrl: "", description: "" },
  })

  const descriptionValue = form.watch("description")

  const refreshList = useCallback(async () => {
    try {
      setLoadingList(true)
      const { projects } = await apiFetch<{ projects: Project[] }>(
        "/projects/mine"
      )
      setProjects(projects)
    } catch {
      toast.error("Could not load your submissions")
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => {
    refreshList()
  }, [refreshList])

  const onSubmit = async (values: Values) => {
    setPending(true)
    try {
      const { project } = await apiFetch<{ project: Project }>("/projects", {
        method: "POST",
        body: JSON.stringify({
          name: values.name,
          repoUrl: values.repoUrl,
          liveUrl: values.liveUrl || undefined,
          description: values.description,
        }),
      })
      toast.success(`Submitted "${project.name}"`)
      form.reset()
      await refreshList()
    } catch (err) {
      toast.error(projectErrorToMessage(err))
    } finally {
      setPending(false)
    }
  }

  // Live duplicate hints (UX only — server is source of truth)
  const nameVal = form.watch("name").trim().toLowerCase()
  const repoVal = form.watch("repoUrl").trim().toLowerCase()
  const dupName =
    nameVal.length > 0 &&
    projects.some((p) => p.name.toLowerCase() === nameVal)
  const dupRepo =
    repoVal.length > 0 &&
    projects.some((p) => p.repoUrl.toLowerCase() === repoVal)

  return (
    <AuthGuard role="STUDENT">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Submit a Project</CardTitle>
            <CardDescription>
              Provide a link to your repository and a short summary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Todo App"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      {dupName && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          You already used this name
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repository URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://github.com/you/project"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Must use HTTPS
                      </p>
                      <FormMessage />
                      {dupRepo && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          You already submitted this repository
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="liveUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Live URL (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://your-project.vercel.app"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="What does your project do? Tech stack, features, anything reviewers should know."
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        {descriptionValue.length}/2000
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={pending}>
                  {pending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    "Submit Project"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Submissions</CardTitle>
            <CardDescription>
              Status of every project you've submitted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingList ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No submissions yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Live</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {p.description}
                        </div>
                        <a
                          href={p.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {p.repoUrl}
                        </a>
                      </TableCell>
                      <TableCell>
                        {p.liveUrl ? (
                          <a
                            href={p.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm hover:underline"
                          >
                            Open
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
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
                        <Badge
                          variant={
                            p.status === "APPROVED"
                              ? "default"
                              : p.status === "REJECTED"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {p.status.charAt(0) +
                            p.status.slice(1).toLowerCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}