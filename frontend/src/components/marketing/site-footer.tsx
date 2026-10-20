import Image from "next/image"
import Link from "next/link"
import { connection } from "next/server"

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/", label: "Homepage" },
      { href: "#solutions", label: "Solutions" },
      { href: "#pricing", label: "Pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "#blog", label: "Blog" },
      { href: "/signup", label: "Sign up" },
      { href: "/login", label: "Log in" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "#", label: "Help center" },
      { href: "#", label: "Community" },
      { href: "#", label: "Status" },
    ],
  },
] as const

export async function SiteFooter() {
  // Request-bound on purpose: the footer prints the current year, which must not
  // be frozen at build time by the static prerender.
  await connection()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#2e1065] text-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center">
              <Image
                src="/splogo.png"
                alt="SubmissionPulse"
                width={160}
                height={40}
                className="h-10 w-auto object-contain brightness-0 invert"
                style={{ width: "auto", height: "auto" }}
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-white/70">
              Submit, review, and get rewarded for the work you make to learn.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/80">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-white/70 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row">
          <p>© {year} SubmissionPulse. All rights reserved.</p>
          <p>Made with care for student creators.</p>
        </div>
      </div>
    </footer>
  )
}