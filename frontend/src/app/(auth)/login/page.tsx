"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { API_URL } from "@/lib/api";
import { saveSession } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type Values = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: Values) {
    setPending(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 429) toast.error("Too many attempts. Try again in 15 minutes.");
        else toast.error(data?.error ?? "Login failed");
        return;
      }
      saveSession(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}`);
      router.replace(data.user.role === "MENTOR" ? "/dashboard" : "/submit");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Enter your credentials</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
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
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign up as student
          </Link>
        </p>
      </CardFooter>
    </>
  );
}
