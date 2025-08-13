// src/config/supabase.js
// Supabase configuration

// You can set these in your .env file, or use these direct values
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ocmhylirrfijyosxwtph.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jbWh5bGlycmZpanlvc3h3dHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNTc1MzEsImV4cCI6MjA1OTYzMzUzMX0.84G1zb-uzBuzj4cRjvWvJ3nHZM-ICa9gA-BRh2pV8b0';

// Export default config object
export default {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
};