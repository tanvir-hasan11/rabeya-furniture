"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client for auth UI (sign in / sign up / sign out).
// Returns null when env vars are absent so the UI can show a demo notice.
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createBrowserClient(url, anon);
}
