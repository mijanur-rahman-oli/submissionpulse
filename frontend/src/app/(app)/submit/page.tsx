"use client"

// Student submission form (PHASE 3.1).
//
// Scope rules from the hiring brief:
//   - Only Project Name, Repo URL, Live Link (optional), Description.
//   - No drag-and-drop, no file upload UI, no Category Select.
//   - On success: toast + push to /submissions so the history page picks up the
//     new row after the router re-renders. The list itself lives at /submissions
//     now (see src/app/(app)/submissions/page.tsx); this page is just the form.

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Send, Loader2 } from "lucide-react"

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

const schema = z.object({
  name: z.string().trim().min(3, "Min 3 characters").max(100, "Max 100 characters"),
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

function SubmitForm() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", repoUrl: "", liveUrl: "", description: "" },
  })

  const onSubmit = async (values: Values) => {
    setPending(true)
    try {
      const { project } = await apiFetch<{ project: { name: string } }>("/projects", {
        method: "POST",
        body: JSON.stringify({
          name: values.name,
          repoUrl: values.repoUrl,
          liveUrl: values.liveUrl || undefined,
          description: values.description,
        }),
      })
      toast.success(`Submitted "${project.name}"`)
      form.reset({ name: "", repoUrl: "", liveUrl: "", description: "" })
      // Redirect to the dedicated submissions page so the list re-fetches.
      router.push("/submissions")
      router.refresh()
    } catch (err) {
      toast.error(projectErrorToMessage(err))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Submit a Project</CardTitle>
          <CardDescription>
            Provide a link to your repository and a short summary. It takes about two minutes.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input className="h-10" placeholder="e.g. Todo App" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="repoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repo URL</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
                        placeholder="https://github.com/you/project"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Must use HTTPS</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="liveUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Live Link <span className="text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-10"
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
                        rows={6}
                        className="min-h-32"
                        placeholder="What does your project do? Tech stack, features, anything reviewers should know."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={pending}
                size="lg"
                className="h-11 w-full bg-brand-gradient text-white hover:opacity-90"
              >
                {pending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Project
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SubmitPage() {
  return (
    <AuthGuard role="STUDENT">
      <SubmitForm />
    </AuthGuard>
  )
}