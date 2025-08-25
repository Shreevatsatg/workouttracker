import AppBackground from '@/components/AppBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import WorkoutNotificationBar from '@/components/WorkoutNotificationBar';
import { Colors } from '@/constants/Colors';
import { modernColors } from '@/constants/ModernColors';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { FoodProvider } from '@/context/FoodContext';
import { RoutinesProvider } from '@/context/RoutinesContext';
import { useWorkout, WorkoutProvider } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Helper function to format time
const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const WorkoutTimerHeader = () => {
  const { workoutTime } = useWorkout();
  const colorScheme = useColorScheme();
  const colors = modernColors[colorScheme ?? 'light'];

  return (
    <View style={{ 
      backgroundColor: 'rgba(156, 163, 175, 0.1)', 
      paddingHorizontal: 12, 
      paddingVertical: 6, 
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(156, 163, 175, 0.2)'
    }}>
      <ThemedText type="subtitle" style={{ 
        color: colors.text,
        fontSize: 16,
        fontWeight: '600'
      }}>
        Workout: {formatTime(workoutTime)}
      </ThemedText>
    </View>
  );
};

const FinishButton = ({ onPress }: { onPress: () => void }) => {
  const colorScheme = useColorScheme();
  const colors = modernColors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity 
      onPress={onPress}
      style={{
        backgroundColor: colors.accent,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 10, // Add some right margin
      }}
    >
      <ThemedText style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Finish</ThemedText>
    </TouchableOpacity>
  );
};




// Error boundary component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: Error) => {
      console.error('🚨 App Error:', error);
      setHasError(true);
      
      // Show error alert in development
      if (__DEV__) {
        Alert.alert('App Error', error.message);
      }
    };

    // Add global error handler
    const originalErrorHandler = (globalThis as any).ErrorUtils?.setGlobalHandler;
    if (originalErrorHandler) {
      (globalThis as any).ErrorUtils.setGlobalHandler = (callback: any) => {
        return originalErrorHandler((error: Error, isFatal: boolean) => {
          handleError(error);
          if (callback) callback(error, isFatal);
        });
      };
    }

    return () => {
      if (originalErrorHandler) {
        (globalThis as any).ErrorUtils.setGlobalHandler = originalErrorHandler;
      }
    };
  }, []);

  if (hasError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: 'white', fontSize: 18, textAlign: 'center', padding: 20 }}>
          Something went wrong. Please restart the app.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

// This hook protects the routes and handles redirection
function useProtectedRoute() {
  const { session, loading, profile } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    const checkOnboarding = async () => {
      // Add a small delay to ensure navigation state is ready in production
      if (loading) {
        console.log('🔄 Auth still loading, waiting...');
        return;
      }

      // In production builds, navigationState might take longer to initialize
      // Add a fallback timeout to prevent infinite loading
      if (!navigationState?.key) {
        console.log('⚠️ Navigation state not ready, using fallback logic');
        // Fallback: proceed with auth check even without navigation state
        // This prevents infinite loading in production builds
      }

      const first = segments[0] as string | undefined;
      const inAuthGroup = first === 'login' || first === 'onboarding' || !first;
      const inTabsGroup = first === '(tabs)';

      console.log(`📍 Current route: ${first}, inAuthGroup: ${inAuthGroup}, inTabsGroup: ${inTabsGroup}`);
      console.log(`🔐 Session: ${!!session}, Profile: ${!!profile}, Loading: ${loading}`);

      if (session) {
        if (profile?.onboarding_complete) {
          // Only redirect to tabs from auth/index routes; allow stack screens
          if (inAuthGroup && !inTabsGroup) {
            console.log('✅ User authenticated and onboarded, redirecting to workout');
            router.replace('/(tabs)/workout');
          }
          return;
        }

        if (profile && !profile.onboarding_complete) {
          // Only redirect to onboarding from auth/index routes; allow stack screens
          if (inAuthGroup && segments[0] !== 'onboarding') {
            console.log('📋 User authenticated but not onboarded, redirecting to onboarding');
            router.replace('/onboarding');
          }
          return;
        }

        if (!profile) {
          const cachedStatus = await AsyncStorage.getItem('onboardingComplete');
          if (cachedStatus === 'true') {
            if (inAuthGroup) {
              console.log('✅ Using cached onboarding status, redirecting to workout');
              router.replace('/(tabs)/workout');
            }
          } else {
            if (inAuthGroup && segments[0] !== 'onboarding') {
              console.log('📋 No profile and no cached status, redirecting to onboarding');
              router.replace('/onboarding');
            }
          }
        }

      } else {
        if (!inAuthGroup) {
          console.log('🔓 No session, redirecting to login');
          router.replace('/login');
        }
      }
    };

    // Add a small delay to ensure everything is properly initialized
    const timeoutId = setTimeout(checkOnboarding, 100);
    
    return () => clearTimeout(timeoutId);
  }, [session, profile, loading, segments, navigationState?.key]);
}

function RootLayoutNav() {
  // 🔥 CRITICAL: This was missing!
  useProtectedRoute();
  
  const colorScheme = useColorScheme();
  const colors = modernColors[colorScheme ?? 'light'];
  const segments = useSegments();
  const router = useRouter();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true,
          contentStyle: { 
            backgroundColor: colors.surface || (colorScheme === 'dark' ? '#000000' : '#FFFFFF')
          },
          animationDuration: 200,
          animationTypeForReplace: 'push',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          // gestureResponseDistance removed to satisfy types
          presentation: 'card',
          headerStyle: {
            backgroundColor: colors.surface || (colorScheme === 'dark' ? '#000000' : '#FFFFFF'),
          },
          headerTitleStyle: {
            color: colors.text,
            fontSize: 18,
            fontWeight: '700',
          },
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="account-details" />
        <Stack.Screen name="add-food" />
        <Stack.Screen name="barcode-scanner" options={{ headerShown: false }} />
        <Stack.Screen name="create-custom-exercise" />
        <Stack.Screen name="create-routine" />
        <Stack.Screen name="exercise-details" />
        <Stack.Screen name="explore-routine" />
        <Stack.Screen name="food-details" />
        <Stack.Screen name="index" options={{ headerShown: false }}/>
        <Stack.Screen 
          name="log-workout" 
          options={{
            headerTitle: () => <WorkoutTimerHeader />,
            headerRight: () => <FinishButton onPress={() => {}} />
          }}
        />
        <Stack.Screen name="manual-food-entry" />
        <Stack.Screen name="measurements" />
        <Stack.Screen name="personal-details" />
        <Stack.Screen name="routine-details" />
        <Stack.Screen name="select-exercise" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="workout-details-page" />
        <Stack.Screen name="workout-summary" />
        <Stack.Screen 
          name="calendar" 
          options={{ 
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <IconSymbol name="chevron.left" size={24} color={colors.text} />
              </TouchableOpacity>
            ), 
            title: "Calendar" 
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
      {segments[0] !== 'workout-summary' && <WorkoutNotificationBar />}
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    console.log('🎨 Font loading status:', loaded);
    if (loaded) {
      console.log('✅ Fonts loaded, hiding splash screen');
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Add a fallback timeout to prevent infinite loading
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      console.log('⚠️ Font loading timeout - proceeding anyway');
      SplashScreen.hideAsync();
    }, 5000); // 5 second timeout

    return () => clearTimeout(fallbackTimeout);
  }, []);

  console.log('🏗️ RootLayout rendering, fonts loaded:', loaded);

  if (!loaded) {
    console.log('⏳ Fonts not loaded yet, showing loading state');
    return null;
  }

  console.log('✅ RootLayout ready, rendering app');

  return (
    <AuthProvider>
      <ThemeProvider
        value={colorScheme === 'dark'
          ? { 
              ...DarkTheme, 
              colors: { 
                ...DarkTheme.colors, 
                background: Colors.dark?.surface || '#000000'
              } 
            }
          : { 
              ...DefaultTheme, 
              colors: { 
                ...DefaultTheme.colors, 
                background: Colors.light?.surface || '#FFFFFF'
              } 
            }
        }
      >
        <FoodProvider>
          <RoutinesProvider>
            <WorkoutProvider>
              <AppBackground>
                <ErrorBoundary>
                  <RootLayoutNav />
                </ErrorBoundary>
              </AppBackground>
            </WorkoutProvider>
          </RoutinesProvider>
        </FoodProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}