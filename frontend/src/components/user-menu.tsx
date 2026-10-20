"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearSession, getSession } from "@/lib/auth";

export function UserMenu({ name, role }: { name: string; role: "STUDENT" | "MENTOR" }) {
  const router = useRouter();

  function logout() {
    clearSession();
    router.push("/login");
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-muted-foreground sm:inline">
        {name}
      </span>
      <span
        className="rounded-full border px-2 py-0.5 text-xs font-medium"
        aria-label={`Role: ${role}`}
      >
        {role}
      </span>
      <Button variant="outline" size="sm" onClick={logout}>
        <LogOut className="mr-1 size-4" />
        Logout
      </Button>
    </div>
  );
}

export function CurrentUserMenu() {
  const { user } = getSession();
  if (!user) return null;
  return <UserMenu name={user.name} role={user.role} />;
}
