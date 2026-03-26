import { createClient } from "@supabase/supabase-js";

export function readEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

export function hasSupabaseAdminConfig(): boolean {
  return Boolean(
    readEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL") &&
      readEnv("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY")
  );
}

export function getSupabaseAdminClient() {
  const supabaseUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  const serviceRoleKey = readEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SERVICE_KEY"
  );

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
