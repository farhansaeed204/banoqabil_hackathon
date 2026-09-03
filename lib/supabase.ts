import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || "";
const anonKey = process.env.SUPABASE_ANON_KEY || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabaseUrl = url;

// Server-side client. NEVER import this in client code.
export function getServerClient() {
  if (!url || !serviceKey) {
    throw new Error("Supabase server credentials missing from env.");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Public read client. Only used server-side; kept for symmetry with the anon key.
export function getBrowserClient() {
  if (!url || !anonKey) {
    throw new Error("Supabase public credentials missing from env.");
  }
  return createClient(url, anonKey);
}
