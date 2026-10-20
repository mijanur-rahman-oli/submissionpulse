"use client";

import { AuthGuard } from "@/components/auth-guard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function SubmitPage() {
  return (
    <AuthGuard role="STUDENT">
      <Card>
        <CardHeader>
          <CardTitle>Submit a Project</CardTitle>
          <CardDescription>
            Link your code and write up what you learned.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Form coming in Phase 3.
          </p>
        </CardContent>
      </Card>
    </AuthGuard>
  );
}
