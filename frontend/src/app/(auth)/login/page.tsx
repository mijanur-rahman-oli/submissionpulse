"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { API_URL } from "@/lib/api"
import { saveSession } from "@/lib/auth"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type Values = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const form = useForm<Values>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: Values) {
    setPending(true)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json().catch(() => ({} as { error?: string; token?: string; user?: { name: string; role: "STUDENT" | "MENTOR" } }))
      if (!res.ok) {
        if (res.status === 429) {
          toast.error("Too many attempts. Try again in 15 minutes.")
        } else {
          toast.error(data?.error ?? "Login failed")
        }
        return
      }
      if (!data.token || !data.user) {
        toast.error("Unexpected response from the server")
        return
      }
      saveSession(data.token, data.user)
      toast.success(`Welcome back, ${data.user.name}`)
      router.replace(data.user.role === "MENTOR" ? "/dashboard" : "/submit")
    } catch {
      toast.error("Network error. Is the API running on localhost:4000?")
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">Welcome back!</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Log in to keep submitting and tracking your learning artifacts.
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
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
            className="h-10 w-full bg-brand-gradient text-white hover:opacity-90"
          >
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link
          href="/signup"
          className="font-semibold text-brand-gradient hover:opacity-80"
        >
          Create an account
        </Link>
      </p>
    </div>
  )
}