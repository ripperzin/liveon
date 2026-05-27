import '../global.css';
import '../lib/i18n';
import { useEffect, useState } from 'react';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { Colors } from '@/constants/Colors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, setSession, setLoading, isLoading, fetchProfile, isOnboarded } = useAuthStore();
  const [appReady, setAppReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile().finally(() => {
          setLoading(false);
          setAppReady(true);
        });
      } else {
        setLoading(false);
        setAppReady(true);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          await fetchProfile();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Route protection
  useEffect(() => {
    if (!appReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session && !inAuthGroup) {
      // Not logged in, redirect to auth
      router.replace('/(auth)/welcome');
    } else if (session) {
      if (!isOnboarded && !inOnboarding) {
        // Logged in but not onboarded
        router.replace('/onboarding');
      } else if (isOnboarded && (inAuthGroup || inOnboarding)) {
        // Logged in and onboarded, redirect to main app
        router.replace('/(tabs)');
      }
    }
  }, [session, segments, appReady, isOnboarded]);

  if (!appReady || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surfaceDark }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <AuthGate>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.surfaceDark }, animation: 'slide_from_right' }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="levelup-modal"
            options={{
              presentation: 'transparentModal',
              animation: 'fade',
              headerShown: false,
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </AuthGate>
    </QueryClientProvider>
  );
}
