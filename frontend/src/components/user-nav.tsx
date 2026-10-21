"use client"

// The single user dropdown rendered inside the shared <TopNavbar /> on BOTH
// the landing page and the authenticated dashboard, so the logged-in
// experience is identical everywhere (see PHASE 3.1 / 3.5).
//
// This component is presentational: the resolved `user` is handed in by
// <TopNavbar />, which owns the one session read. Reading localStorage here
// too would mean two independent snapshots that can briefly disagree (e.g.
// right after logout). It stays a client component because the dropdown and
// the router navigation are interactive.
//
// Trigger: Avatar + Name + ChevronDown (the name is hidden on small screens,
// matching the PHASE 3.5 className `hidden md:block`).
//
// Menu: ONLY "Dashboard" and "Logout" (per PHASE 3.5). Every other action
// lives in the page or in the app sidebar.

import { useRouter } from "next/navigation"
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { clearSession, type User } from "@/lib/auth"

function initialOf(name: string | undefined | null): string {
  const trimmed = (name ?? "").trim()
  return (trimmed[0] ?? "?").toUpperCase()
}

export function UserNav({ user }: { user: User }) {
  const router = useRouter()

  function handleLogout() {
    clearSession()
    // Navigate away from any authenticated page first; the pathname change
    // makes <TopNavbar /> re-read the (now empty) session and swap the
    // dropdown for the logged-out controls.
    router.push("/")
    router.refresh()
  }

  return (
    <DropdownMenu>
      {/*
        DropdownMenuTrigger already renders a native <button>; applying the
        ghost-button styling directly avoids nesting one button inside
        another. Classes mirror the PHASE 3.5 spec: flex, gap-2, px-2,
        hover:bg-gray-100, rounded-full.
      */}
      <DropdownMenuTrigger
        className="flex items-center gap-2 px-2 h-10 rounded-full hover:bg-gray-100 data-[popup-open]:bg-gray-100"
        aria-label="Open user menu"
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-brand-gradient font-semibold text-white">
            {initialOf(user.name)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium hidden md:block">
          {user.name}
        </span>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem
          onSelect={() =>
            router.push(user.role === "MENTOR" ? "/dashboard" : "/submit")
          }
        >
          <LayoutDashboard />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout}>
          <LogOut />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserNav