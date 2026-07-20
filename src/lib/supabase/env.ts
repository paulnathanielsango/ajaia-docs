/**
 * Next.js only inlines `NEXT_PUBLIC_*` when accessed with a static key
 * (`process.env.NEXT_PUBLIC_FOO`). Dynamic access (`process.env[name]`) is
 * undefined in the browser and breaks client-side auth.
 */
export function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL"
    );
  }
  return value;
}

export function getSupabasePublishableKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!value) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }
  return value;
}
