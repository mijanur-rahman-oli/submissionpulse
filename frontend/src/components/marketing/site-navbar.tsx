// The landing navbar now lives in @/components/landing-navbar (it became
// session-aware). This module re-exports it so existing imports keep working.
export { LandingNavbar as SiteNavbar, default } from "@/components/landing-navbar"