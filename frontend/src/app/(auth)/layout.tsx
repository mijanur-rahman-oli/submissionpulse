import Image from "next/image"

import { cn } from "@/lib/utils"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <section className="flex w-full flex-col items-center justify-center bg-white px-6 py-12 md:w-1/2">
        <div className="flex w-full max-w-sm flex-col">
          <div className="mb-8 flex items-center">
            {/* Plain <img> bypasses next/image optimizer quirks with this asset */}
            <img
              src="/splogo.png"
              alt="SubmissionPulse Logo"
              className="h-12 w-auto object-contain md:h-14"
            />
          </div>
          {children}
        </div>
      </section>

      <aside
        aria-hidden
        className={cn(
          "relative hidden overflow-hidden md:flex md:w-1/2",
          "items-center justify-center bg-brand-light",
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-brand-light to-violet-200" />
        <div className="absolute -top-24 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-violet-300/50 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-[320px] rounded-full bg-sky-200/60 blur-3xl" />

        <Image
          src="/hero.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="relative z-10 mx-auto h-auto w-[80%] max-w-md object-contain drop-shadow-[0_30px_60px_rgba(124,58,237,0.25)]"
        />
      </aside>
    </div>
  )
}