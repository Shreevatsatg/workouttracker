import AppBackground from '@/components/AppBackground';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import WorkoutNotificationBar from '@/components/WorkoutNotificationBar';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { FoodProvider } from '@/context/FoodContext';
import { RoutinesProvider } from '@/context/RoutinesContext';
import { WorkoutProvider } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';

// This hook protects the routes and handles redirection
function useProtectedRoute() {
  const { session, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return; // Wait until the session is loaded

    const inTabsGroup = segments[0] === '(tabs)';

    // Prevent unnecessary navigation if already on the target screen
    if (session && !inTabsGroup && segments[0] !== 'login' && segments[0] !== 'welcome') {
      router.replace('/(tabs)/workout');
    } else if (!session && segments[0] !== 'login') {
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
        <FoodProvider>
          <RoutinesProvider>
            <WorkoutProvider>
              <AppBackground>
                <RootLayoutNav />
              </AppBackground>
            </WorkoutProvider>
          </RoutinesProvider>
        </FoodProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
