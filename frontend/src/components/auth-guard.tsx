// Auth protection is client-side ONLY. The session token lives in localStorage, which
// Next.js middleware (edge runtime) cannot read. A cookie-based session would allow
// edge middleware guards; this is a documented tradeoff — see README.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, type User } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthGuard({
  role,
  children,
}: {
  role?: "STUDENT" | "MENTOR";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { token, user } = getSession();
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    if (role && user.role !== role) {
      router.replace(user.role === "MENTOR" ? "/dashboard" : "/submit");
      return;
    }
    setReady(true);
  }, [router, role]);

  if (!ready)
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );

  return <>{children}</>;
}