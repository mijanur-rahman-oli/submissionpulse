"use client"

// Public marketing header. The chrome and the user dropdown come from the
// shared <TopNavbar />, so the logged-in experience on the landing page is
// identical to the dashboard (see PHASE 3.5).
//
// The only thing this file adds is the logged-out Log in / Sign Up pair,
// passed into TopNavbar as its right-hand slot. Everything else — height,
// logo, border, the user dropdown — is TopNavbar's markup, shared verbatim.

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { TopNavbar } from "@/components/top-navbar"

export function LandingNavbar() {
  return (
    <TopNavbar
      loggedOutSlot={
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Log in
          </Link>
          <Link href="/signup">
            <Button className="bg-brand-gradient text-white hover:opacity-90">
              Sign Up
            </Button>
          </Link>
        </div>
      }
    />
  )
}

export default LandingNavbar