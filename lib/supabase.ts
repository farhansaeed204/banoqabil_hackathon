import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabaseUrl = url;

// Server-side client with full privileges. NEVER import this in client code.
export function getServerClient() {
  if (!url || !serviceKey) {
    throw new Error("Supabase server credentials missing from env.");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Public read-only client (anon key). Safe for the browser.
export function getBrowserClient() {
  if (!url || !anonKey) {
    throw new Error("Supabase public credentials missing from env.");
  }
  return createClient(url, anonKey);
}
