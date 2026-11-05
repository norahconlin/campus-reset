"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut();
        router.push("/login");
        router.refresh();
      }}
      className="rounded-full px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200"
    >
      Log out
    </button>
  );
}
