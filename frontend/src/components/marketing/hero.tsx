import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-light">
      <div
        aria-hidden
        className="absolute -top-24 -left-24 size-[420px] rounded-full bg-purple-200/60 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -right-24 size-[460px] rounded-full bg-violet-300/50 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pt-10 pb-20 md:pt-12 lg:grid-cols-2 lg:items-center lg:gap-8">
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center rounded-full border border-violet-200 bg-white/60 px-3 py-1 text-xs font-medium text-brand-gradient">
            Built for student creators
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Showcase Your Work,{" "}
            <span className="text-brand-gradient">Earn Your Success</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
            SubmissionPulse is the structured home for your learning artifacts.
            Submit, get reviewed, and get paid — without juggling a dozen tools.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-brand-gradient px-6 text-white hover:opacity-90"
              >
                Get Started
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="px-6">
                Learn More
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Free to start. No credit card required.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 mx-auto size-[320px] rounded-[40%] bg-gradient-to-br from-violet-300/70 via-purple-200/60 to-fuchsia-200/70 blur-2xl sm:size-[420px]"
          />
          <Image
            src="/hero.webp"
            alt="Student wearing a graduation cap working on a laptop"
            width={720}
            height={720}
            priority
            sizes="(min-width: 1024px) 36rem, (min-width: 640px) 28rem, 80vw"
            className="relative mx-auto h-auto w-full object-contain drop-shadow-[0_30px_60px_rgba(124,58,237,0.25)]"
          />
        </div>
      </div>
    </section>
  )
}