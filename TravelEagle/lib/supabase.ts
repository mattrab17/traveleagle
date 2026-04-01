import { createClient } from '@supabase/supabase-js'
import Constants from "expo-constants"
import AsyncStorage from '@react-native-async-storage/async-storage'
// Create a single supabase client for interacting with your database

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}
);
