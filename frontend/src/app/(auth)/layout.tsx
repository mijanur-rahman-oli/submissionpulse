import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            SubmissionPulse
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">{children}</Card>
      </main>
    </div>
  );
}
