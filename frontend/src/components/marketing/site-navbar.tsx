import Link from "next/link"

import { Button } from "@/components/ui/button"

const NAV_LINKS = [
  { href: "/", label: "Homepage" },
  { href: "#solutions", label: "Solutions" },
  { href: "#blog", label: "Blog" },
  { href: "#pricing", label: "Pricing" },
]

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4">
        <Link href="/" className="flex shrink-0 items-center">
          {/* Plain <img> bypasses next/image optimizer quirks with this asset */}
          <img
            src="/splogo.png"
            alt="SubmissionPulse Logo"
            className="h-10 w-auto object-contain md:h-12"
          />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

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
      </nav>
    </header>
  )
}