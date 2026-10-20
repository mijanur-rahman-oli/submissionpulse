import type { Metadata } from "next"
import { Geist, Geist_Mono, Hind_Siliguri } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

// Brand font. Wired into --font-sans so Tailwind's `font-sans` + ShadCN's
// html { @apply font-sans } pick it up automatically. Both latin and bengali
// subsets are needed for the product copy that uses Bengali in places.
const hindSiliguri = Hind_Siliguri({
  variable: "--font-sans",
  subsets: ["latin", "bengali"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "SubmissionPulse",
  description: "Submit and review learning artifacts, structured.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${hindSiliguri.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className={cn(
          hindSiliguri.className,
          "min-h-full flex flex-col bg-background font-sans antialiased",
        )}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
