// src/config/supabase.js
// Supabase configuration

import Constants from 'expo-constants';

// Load from Expo Constants (works in both dev and production builds)
// Falls back to process.env for development mode
export const SUPABASE_URL =
  Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Export default config object
export default {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
};