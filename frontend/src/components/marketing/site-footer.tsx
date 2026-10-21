import Link from "next/link"

// Only links that map to a real route in this app. Placeholder entries keep the
// column structure readable without inventing marketing pages that do not exist.
const LINK_COLUMNS = [
  {
    title: "Platform",
    links: [
      { href: "/", label: "Home" },
      { href: "/login", label: "Login" },
      { href: "/signup", label: "Sign Up" },
    ],
  },
  {
    title: "Dashboard",
    links: [
      { href: "/submit", label: "Submit Project" },
      { href: "/submit#list", label: "My Submissions" },
      { href: "/dashboard", label: "Review Projects" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "#", label: "GitHub Repo" },
      { href: "#", label: "Documentation" },
      { href: "#", label: "Contact Support" },
    ],
  },
] as const

// Server Component on purpose: the copyright year is a static string, so the
// footer stays cacheable and prerenders cleanly (no `new Date()` / connection()).
export function SiteFooter() {
  return (
    <footer className="w-full bg-gradient-to-br from-[#4c1d95] via-[#6d28d9] to-[#8b5cf6] text-white pt-16 mt-20 overflow-hidden relative">
      {/* Main content grid — full width, no max-w container */}
      <div className="w-full px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 pb-12">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold mb-4">SubmissionPulse</h2>
          <p className="text-purple-200 text-sm leading-relaxed">
            The structured home for student learning artifacts.
          </p>
        </div>

        {LINK_COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider">
              {col.title}
            </h3>
            <ul>
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-purple-200 hover:text-white transition-colors text-sm mb-3 block"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar: divider + copyright / legal */}
      <div className="w-full px-6 md:px-12 py-8 flex flex-col md:flex-row justify-between items-center border-t border-purple-500/30">
        <p className="text-sm text-purple-200">
          © 2026 SubmissionPulse. All rights reserved.
        </p>
        <div className="flex gap-4 text-sm text-purple-200">
          <a href="#" className="hover:text-white transition-colors">
            Terms of Service
          </a>
          <span>•</span>
          <a href="#" className="hover:text-white transition-colors">
            Privacy Policy
          </a>
        </div>
      </div>

      {/* Oversized watermark wordmark — dark purple with a heavy shadow so it
          reads clearly against the vibrant gradient without being clipped. */}
      <div className="w-full flex justify-center items-end mt-8 translate-y-4 select-none pointer-events-none">
        <h1 className="text-[13vw] font-black text-purple-900 tracking-tighter leading-none whitespace-nowrap drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]">
          Submissionpulse
        </h1>
      </div>
    </footer>
  )
}

export default SiteFooter