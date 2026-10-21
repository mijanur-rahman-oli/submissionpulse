import { Hero } from "@/components/marketing/hero"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { SiteFooter } from "@/components/marketing/site-footer"
import { LandingNavbar } from "@/components/landing-navbar"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar />
      {/* pt-20 clears the fixed h-20 <TopNavbar /> rendered by <LandingNavbar /> */}
      <main className="flex-1 pt-20">
        <Hero />
        <div id="how-it-works">
          <HowItWorks />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}