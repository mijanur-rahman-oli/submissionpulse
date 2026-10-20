import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">SubmissionPulse</h1>
        <p className="text-muted-foreground">
          Submit and review learning artifacts, structured.
        </p>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/login" className="w-full sm:w-auto">
            <Button className="w-full">Sign in</Button>
          </Link>
          <Link href="/signup" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Sign up as Student
            </Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Mentor accounts are provisioned by the admin. Contact your mentor coordinator for access.
        </p>
      </div>
    </div>
  );
}
