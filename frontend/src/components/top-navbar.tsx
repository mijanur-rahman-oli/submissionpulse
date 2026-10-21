"use client"

// Shared top navbar used by BOTH the public landing page and the authenticated
// dashboard, so the chrome and the user dropdown are identical everywhere
// (see PHASE 3.5).
//
// Structure:
//   - Fixed, full-width, h-20, white, bordered, above all content (z-50).
//   - Left: brand logo that always returns to the public landing page.
//   - Right: <UserNav /> when signed in. Logged-out surfaces pass their own
//     controls (Log in / Sign Up) via `loggedOutSlot`; the dashboard passes
//     nothing because every /app page is behind <AuthGuard>.
//
// The session lives in localStorage, which does not exist during SSR, so it is
// read in an effect and the user-aware branch is gated behind `mounted`. The
// header chrome (logo, height) renders unconditionally so the first client
// paint matches the server HTML — no hydration mismatch.

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { UserNav } from "@/components/user-nav"
import { getSession, type User } from "@/lib/auth"

export function TopNavbar({ loggedOutSlot }: { loggedOutSlot?: ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  // `pathname` is a dependency so signing in or out (both of which navigate)
  // re-reads localStorage and swaps between the dropdown and the logged-out
  // controls.
  useEffect(() => {
    setUser(getSession().user)
    setMounted(true)
  }, [pathname])

  return (
    <header className="fixed top-0 left-0 right-0 h-20 z-50 bg-white border-b">
      <div className="flex h-full items-center justify-between gap-6 px-4 md:px-8">
        {/* Logo — always returns to the public landing page */}
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="SubmissionPulse home"
        >
          {/* Plain <img> bypasses next/image optimizer quirks with this asset */}
          <img
            src="/splogo.png"
            alt="SubmissionPulse Logo"
            className="h-10 md:h-12 w-auto object-contain"
          />
        </Link>

        {/* Right slot: <UserNav /> when signed in, else the surface's own
            logged-out controls. Before the session resolves we reserve the
            same width so the header doesn't visibly shift on first paint. */}
        <div className="flex h-20 items-center">
          {!mounted ? (
            <div className="h-10 w-44" aria-hidden />
          ) : user ? (
            // Identical dropdown to the app header (see src/components/user-nav.tsx).
            <UserNav user={user} />
          ) : (
            loggedOutSlot
          )}
        </div>
      </div>
    </header>
  )
}

export default TopNavbar