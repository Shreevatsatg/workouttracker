import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';

// Access from expo config extra
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseKey = Constants.expoConfig?.extra?.supabaseKey;

// Add validation to ensure the variables are loaded
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey ? 'Present' : 'Missing');
  console.log('Full extra config:', Constants.expoConfig?.extra);
  
  // In production, we should still try to create the client with fallback values
  // This prevents the app from crashing completely
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Using fallback Supabase configuration');
  }
}

// Ensure we have valid URLs and keys
const finalSupabaseUrl = supabaseUrl || 'https://yaupadcxrzfdktuouilv.supabase.co';
const finalSupabaseKey = supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdXBhZGN4cnpmZGt0dW91aWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTU4NjUsImV4cCI6MjA2OTg5MTg2NX0.tFYMNG5yE6Kbm_JZpFQgK3y6BWs8_EUSuvQ2iGuZjts';

export const supabase = createClient(
  finalSupabaseUrl,
  finalSupabaseKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)