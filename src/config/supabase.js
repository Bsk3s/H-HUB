// src/config/supabase.js
// Supabase configuration

// You can set these in your .env file
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Export default config object
export default {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
}; 