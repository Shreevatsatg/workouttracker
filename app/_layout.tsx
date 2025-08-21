import AppBackground from '@/components/AppBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// This hook protects the routes and handles redirection
function useProtectedRoute() {
  const { session, loading, profile } = useAuth();
  const segments = useSegments();
  const [cachedOnboardingComplete, setCachedOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (loading) return;

      // Don't interfere with stack screen navigation
      const isStackScreen = [
        'account-details', 'add-food', 'barcode-scanner', 'create-custom-exercise',
        'create-routine', 'exercise-details', 'explore-routine', 'food-details',
        'log-workout', 'manual-food-entry', 'measurements', 'personal-details',
        'routine-details', 'select-exercise', 'settings', 'workout-details-page',
        'workout-summary', 'calendar'
      ].includes(segments[0]);

      if (isStackScreen) {
        // Let stack screens render normally
        return;
      }

      const inAuthGroup = segments[0] === 'login' || segments[0] === 'onboarding';

      if (session) {
        // Server value is the source of truth
        if (profile?.onboarding_complete) {
          const inMainApp = segments[0] === '(tabs)';
          if (!inMainApp && segments[0] !== 'index') {
            router.replace('/(tabs)/workout');
          }
          return;
        }

        // If profile is loaded but onboarding is not complete
        if (profile && !profile.onboarding_complete) {
          if (segments[0] !== 'onboarding') {
            router.replace('/onboarding');
          }
          return;
        }

        // Offline fallback
        if (!profile) {
          const cachedStatus = await AsyncStorage.getItem('onboardingComplete');
          if (cachedStatus === 'true') {
            if (inAuthGroup || segments[0] === 'index') {
              router.replace('/(tabs)/workout');
            }
          } else {
            if (segments[0] !== 'onboarding') {
              router.replace('/onboarding');
            }
          }
        }

      } else {
        if (!inAuthGroup && segments[0] !== 'index') {
          router.replace('/login');
        }
      }
    };

    checkOnboarding();
  }, [session, profile, loading, segments]);
}

function RootLayoutNav() {
  // 🔥 CRITICAL: This was missing!
  useProtectedRoute();
  
  const colorScheme = useColorScheme();
  const colors = modernColors[colorScheme ?? 'light'];
  const segments = useSegments();

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
          gestureResponseDistance: 35,
          presentation: 'card',
          animationEnabled: true,
          headerStyle: {
            backgroundColor: colors.surface || (colorScheme === 'dark' ? '#000000' : '#FFFFFF'),
            borderBottomWidth: 0,
            elevation: 0,
            shadowColor: 'transparent',
          },
          headerTitleStyle: {
            color: colors.text,
            fontSize: 18,
            fontWeight: '700',
            letterSpacing: -0.2,
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
      {!segments.includes('workout-summary') && <WorkoutNotificationBar />}
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

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
                <RootLayoutNav />
              </AppBackground>
            </WorkoutProvider>
          </RoutinesProvider>
        </FoodProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}