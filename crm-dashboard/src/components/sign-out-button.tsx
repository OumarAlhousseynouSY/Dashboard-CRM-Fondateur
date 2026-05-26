"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full text-gray-400 hover:text-white hover:bg-gray-700 text-xs"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Déconnexion
    </Button>
  );
}
