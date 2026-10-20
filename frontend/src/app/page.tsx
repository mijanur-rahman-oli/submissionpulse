import { Hero } from "@/components/marketing/hero"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteNavbar } from "@/components/marketing/site-navbar"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNavbar />
      <main className="flex-1">
        <Hero />
        <div id="how-it-works">
          <HowItWorks />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}