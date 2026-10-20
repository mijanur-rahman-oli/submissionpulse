import Link from "next/link";
import { CurrentUserMenu } from "@/components/user-menu";

// Layout shell for authenticated pages. Does NOT gate auth — individual pages
// compose <AuthGuard>. Auth protection is client-side only (see auth-guard.tsx).
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            SubmissionPulse
          </Link>
          <CurrentUserMenu />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
