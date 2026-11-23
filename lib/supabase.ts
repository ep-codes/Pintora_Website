import { createClient } from "@supabase/supabase-js";

// The browser's connection to Supabase. Both values are public and end up in the built site, so what
// people can read or change is decided by each table's Row Level Security, not by this key.
// Set them in .env.local (see README). Next.js only inlines the full `process.env.NAME` form.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !publishableKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Add them to .env.local, then restart the dev server.");

export const supabase = createClient(url, publishableKey);
