import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cckahczimtxechgnfnvr.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNja2FoY3ppbXR4ZWNoZ25mbnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NDY2ODAsImV4cCI6MjEwNzIyMjY4MH0.6Fxinw1DH3ZHmSBXcqksc2Nly4gOhqsjAviZkKcZ9sk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const isSupabaseReady =
  supabaseUrl !== "YOUR_SUPABASE_URL" && supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY";
