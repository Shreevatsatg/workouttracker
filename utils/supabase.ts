import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';

// Access from expo config extra
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseKey = Constants.expoConfig?.extra?.supabaseKey;

// Add validation to ensure the variables are loaded
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey ? 'Present' : 'Missing');
  console.log('Full extra config:', Constants.expoConfig?.extra);
}

export const supabase = createClient(
  supabaseUrl!,
  supabaseKey!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)