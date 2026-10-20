"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      onClick={async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase?.auth.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      লগআউট
    </Button>
  );
}
