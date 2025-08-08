import AppBackground from '@/components/AppBackground';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { RoutinesProvider } from '@/context/RoutinesContext';
import { WorkoutProvider } from '@/context/WorkoutContext';
import WorkoutNotificationBar from '@/components/WorkoutNotificationBar';

// This hook protects the routes and handles redirection
function useProtectedRoute() {
  const { session, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return; // Wait until the session is loaded

    const inTabsGroup = segments[0] === '(tabs)';

    if (session && !inTabsGroup) {
      // User is signed in but not in the main app area, redirect them.
      router.replace('/(tabs)/workout');
    } else if (!session) {
      // User is not signed in, redirect to the login screen.
      router.replace('/login');
    }
  }, [session, loading, segments]);
}

function RootLayoutNav() {
  useProtectedRoute();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="welcome" />
      </Stack>
      <StatusBar style="auto" />
      <WorkoutNotificationBar />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider
        value={colorScheme === 'dark'
          ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: 'transparent' } }
          : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: 'transparent' } }
        }
      >
        <RoutinesProvider>
          <WorkoutProvider>
            <AppBackground>
              <RootLayoutNav />
            </AppBackground>
          </WorkoutProvider>
        </RoutinesProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
