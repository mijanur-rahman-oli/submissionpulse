"use client"

// Mobile-only navigation drawer. The desktop sidebar (src/app/(app)/layout.tsx)
// is `hidden md:flex`, so on small screens there is no way to reach the app
// routes — this sheet provides them.
//
// The session lives in localStorage, which does not exist during SSR, so the
// role is read inside an effect and the links render once it resolves.

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, Send, Inbox, LayoutDashboard } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { getSession, type User } from "@/lib/auth"

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

// Same role → routes mapping as the desktop sidebar.
function navForRole(role: User["role"] | undefined): NavItem[] {
  if (role === "MENTOR") {
    return [
      { href: "/dashboard", label: "Review Dashboard", icon: LayoutDashboard },
    ]
  }
  // STUDENT (default)
  return [
    { href: "/submit", label: "Submit Project", icon: Send },
    { href: "/submissions", label: "My Submissions", icon: Inbox },
  ]
}

export function MobileNav() {
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setUser(getSession().user)
  }, [])

  const navItems = user ? navForRole(user.role) : []

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        }
      />

      <SheetContent side="left">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <nav className="flex flex-col gap-1 px-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

export default MobileNav
