import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://sbslimrugkzgnfacmlnm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNic2xpbXJ1Z2t6Z25mYWNtbG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MDEyMDAsImV4cCI6MjA5NjQ3NzIwMH0.NdGbm-SGKoC-UpSL5jNNaPvdF7KKcZXAOY5yCX1mfrE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

export const SITE_CONFIG_ROW_ID = "main";