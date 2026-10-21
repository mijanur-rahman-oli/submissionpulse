"use client"

// Layout shell for authenticated pages. Does NOT gate auth — individual pages
// compose <AuthGuard>. Session is read inside useEffect because localStorage is
// unavailable during SSR/hydration (see src/components/auth-guard.tsx).
//
// Shell structure (PHASE 3.5):
//   - Fixed full-width <TopNavbar />  (h-20, shared with the landing page)
//   - Sidebar pinned directly below it (top-20) — route links only.
//     No logo (it lives in the navbar) and no Settings placeholder.
//   - Main content offset by the sidebar width and pushed below the navbar.
import { useEffect, useState, type ComponentType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Send,
  Inbox,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { getSession, type User } from "@/lib/auth"
import { TopNavbar } from "@/components/top-navbar"

type NavItem = {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
}

// Each role sees exactly the links it has a page for. Every href is a distinct
// route, so "active" is a plain prefix match with no special cases.
function navForRole(role: User["role"] | undefined): NavItem[] {
  if (role === "MENTOR") {
    return [{ href: "/dashboard", label: "Review Projects", icon: LayoutDashboard }]
  }
  // STUDENT (default)
  return [
    { href: "/submit", label: "Submit Project", icon: Send },
    { href: "/submissions", label: "My Submissions", icon: Inbox },
  ]
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setUser(getSession().user)
    setMounted(true)
  }, [pathname])

  // Until the session resolves, `navForRole` would guess STUDENT and briefly
  // show a mentor the wrong links — so render the shell without nav items.
  const navItems = mounted ? navForRole(user?.role) : []

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* ---- Shared navbar (same component the landing page renders) ---- */}
      <TopNavbar />

      {/* ---- Sidebar: starts below the navbar, route links only ---- */}
      <aside className="fixed top-20 left-0 bottom-0 w-64 bg-white border-r hidden md:flex flex-col z-40">
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = (pathname ?? "").startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-purple-50 text-purple-700"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground",
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "size-4",
                      active
                        ? "text-purple-600"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  {item.label}
                </span>
                {active && <ChevronRight className="size-4 text-purple-600" />}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* ---- Main content: clears the navbar (pt-28) and the sidebar (md:ml-64) ---- */}
      <main className="md:ml-64 pt-28 px-6 pb-12">{children}</main>
    </div>
  )
}