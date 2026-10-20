"use client";

// Layout shell for authenticated pages. Does NOT gate auth — individual pages
// compose <AuthGuard>. Session is read inside useEffect because localStorage is
// unavailable during SSR/hydration (see src/components/auth-guard.tsx).
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { clearSession, getSession, type User } from "@/lib/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getSession().user);
  }, []);

  function logout() {
    clearSession();
    setUser(null);
    router.push("/login");
    router.refresh();
  }

  // Smart logo redirect: send the user back to their own home, not the
  // public landing page. Defaults to /dashboard so the link is meaningful
  // even before the session has been read from localStorage.
  const homeLink = user?.role === "STUDENT" ? "/submit" : "/dashboard"

  return (
    <div className="flex min-h-full flex-1 flex-col bg-muted/30">
      <header className="sticky top-0 z-20 border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href={homeLink} className="flex shrink-0 items-center">
            {/* Plain <img> bypasses next/image optimizer quirks with this asset */}
            <img
              src="/splogo.png"
              alt="SubmissionPulse"
              className="h-10 w-auto object-contain md:h-12"
            />
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.name}
              </span>
              <Badge variant="outline">{user.role}</Badge>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut data-icon="inline-start" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="h-7 w-24 animate-pulse rounded-lg bg-muted" />
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}