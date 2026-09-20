"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/lib/auth/session";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut}>
      Sair
    </Button>
  );
}
