import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Check if we're in a browser environment (not SSR)
const isBrowser = typeof window !== 'undefined';

// Secure storage adapter for Supabase Auth
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (!isBrowser) return null;
    if (Platform.OS === 'web') {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (!isBrowser) return;
    if (Platform.OS === 'web') {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // noop
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (!isBrowser) return;
    if (Platform.OS === 'web') {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // noop
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: isBrowser,
    detectSessionInUrl: false,
  },
});
