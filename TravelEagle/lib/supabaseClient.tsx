import { createClient } from '@supabase/supabase-js'
import Constants from "expo-constants"
// Create a single supabase client for interacting with your database

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
