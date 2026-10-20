"use client";

import { AuthGuard } from "@/components/auth-guard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <AuthGuard role="MENTOR">
      <Card>
        <CardHeader>
          <CardTitle>Review Dashboard</CardTitle>
          <CardDescription>
            Pending submissions across your students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Table coming in Phase 3.
          </p>
        </CardContent>
      </Card>
    </AuthGuard>
  );
}