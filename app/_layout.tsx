import AppBackground from '@/components/AppBackground';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Dimensions, Platform, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import WorkoutNotificationBar from '@/components/WorkoutNotificationBar';
import { Colors } from '@/constants/Colors';
import { modernColors } from '@/constants/ModernColors';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { FoodProvider } from '@/context/FoodContext';
import { RoutinesProvider } from '@/context/RoutinesContext';
import { useWorkout, WorkoutProvider } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';


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

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'welcome';
    const inAppGroup = segments[0] === '(tabs)' || [
      'account-details',
      'add-food',
      'barcode-scanner',
      'create-custom-exercise',
      'create-routine',
      'exercise-details',
      'explore-routine',
      'food-details',
      'index',
      'log-workout',
      'manual-food-entry',
      'measurements',
      'personal-details',
      'routine-details',
      'select-exercise',
      'settings',
      'workout-details-page',
      'workout-summary',
    ].includes(segments[0]);

    if (session) {
      if (!profile?.full_name) {
        if (segments[0] !== 'welcome') {
          router.replace('/welcome');
        }
      } else {
        if (!inAppGroup) {
          router.replace('/(tabs)/workout');
        }
      }
    } else {
      if (!inAuthGroup) {
        router.replace('/login');
      }
    }
  }, [session, profile, loading, segments]);
}

function RootLayoutNav() {
  useProtectedRoute();
  const colorScheme = useColorScheme();
  const colors = modernColors[colorScheme ?? 'light'];
  const segments = useSegments();

  // 🔥 ZERO-GLITCH SOLUTION: Pre-render approach
  const zeroGlitchTransition = ({ current, next, inverted, layouts, insets }) => {
    const isAndroid = Platform.OS === 'android';
    
    return {
      cardStyle: {
        // Pre-fill the screen immediately
        backgroundColor: colors.surface || (colorScheme === 'dark' ? '#000000' : '#FFFFFF'),
        
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
              extrapolate: 'clamp',
            }),
          },
        ],
        
        // Shadow for depth (iOS-style)
        ...(!isAndroid && {
          shadowColor: '#000',
          shadowOffset: {
            width: -2,
            height: 0,
          },
          shadowOpacity: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.1],
            extrapolate: 'clamp',
          }),
          shadowRadius: 8,
        }),
      },
      
      // Previous screen scaling (iOS-style)
      overlayStyle: {
        backgroundColor: 'transparent',
      },
    };
  };

  // 🎨 MODERN MATERIAL 3 STYLE (Google's Latest)
  const material3Transition = ({ current, next, inverted, layouts }) => {
    return {
      cardStyle: {
        backgroundColor: colors.surface || (colorScheme === 'dark' ? '#000000' : '#FFFFFF'),
        
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width * 0.3, 0],
              extrapolate: 'clamp',
            }),
          },
          {
            scale: current.progress.interpolate({
              inputRange: [0, 0.7, 1],
              outputRange: [0.95, 0.99, 1],
              extrapolate: 'clamp',
            }),
          },
        ],
        
        opacity: current.progress.interpolate({
          inputRange: [0, 0.1, 1],
          outputRange: [0, 1, 1],
          extrapolate: 'clamp',
        }),
        
        // Modern shadow
        shadowColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, colorScheme === 'dark' ? 0.1 : 0.05],
          extrapolate: 'clamp',
        }),
        shadowRadius: 12,
        elevation: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 8],
          extrapolate: 'clamp',
        }),
      },
    };
  };

  // 💫 DISCORD-STYLE SMOOTH (Gaming App Standard)
  const discordStyleTransition = ({ current, next, inverted, layouts }) => {
    return {
      cardStyle: {
        backgroundColor: colors.surface || (colorScheme === 'dark' ? '#36393f' : '#FFFFFF'),
        
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width * 0.2, 0],
              extrapolate: 'clamp',
            }),
          },
        ],
        
        opacity: current.progress.interpolate({
          inputRange: [0, 0.15, 1],
          outputRange: [0, 0.95, 1],
          extrapolate: 'clamp',
        }),
      },
    };
  };

  // 🚀 NATIVE iOS PUSH (Apple's Standard)
  const nativeIOSTransition = ({ current, next, inverted, layouts }) => {
    return {
      cardStyle: {
        backgroundColor: colors.surface || (colorScheme === 'dark' ? '#000000' : '#FFFFFF'),
        
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
              extrapolate: 'clamp',
            }),
          },
        ],
        
        // iOS-style shadow
        shadowColor: '#000',
        shadowOffset: {
          width: -1,
          height: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
    };
  };

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true,
          
          // 🎯 CRITICAL: Set background immediately
          contentStyle: { 
            backgroundColor: colors.surface || (colorScheme === 'dark' ? '#000000' : '#FFFFFF')
          },
          
          // 🔥 Choose your glitch-free animation:
          cardStyleInterpolator: zeroGlitchTransition, // Current: Zero-glitch
          // cardStyleInterpolator: material3Transition, // Google Material 3
          // cardStyleInterpolator: discordStyleTransition, // Discord-style
          // cardStyleInterpolator: nativeIOSTransition, // Native iOS
          
          // ⚡ Performance settings
          animationDuration: 200, // Faster = less glitch opportunity
          animationTypeForReplace: 'push',
          
          // 🎨 Gestures
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          gestureResponseDistance: 35,
          
          // 📱 Presentation
          presentation: 'card', // Ensures proper layering
          animationEnabled: true,
          
          // 🎨 Header styling
          headerStyle: {
            backgroundColor: colors.surface || (colorScheme === 'dark' ? '#000000' : '#FFFFFF'),
            borderBottomWidth: 0,
            elevation: 0,
            shadowColor: 'transparent', // Remove header shadow to prevent glitch
          },
          headerTitleStyle: {
            color: colors.text,
            fontSize: 18,
            fontWeight: '700',
            letterSpacing: -0.2,
          },
          headerTitleAlign: 'center',
          
          // 🔥 Instant header appearance (no animation)
          headerStyleInterpolator: ({ current }) => ({
            opacity: current.progress.interpolate({
              inputRange: [0, 0.05, 1],
              outputRange: [0, 1, 1],
              extrapolate: 'clamp',
            }),
          }),
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="account-details" />
        <Stack.Screen name="add-food" />
        <Stack.Screen name="barcode-scanner" options={{ headerShown: false }} />
        <Stack.Screen name="create-custom-exercise" />
        <Stack.Screen name="create-routine" />
        <Stack.Screen name="exercise-details" />
        <Stack.Screen name="explore-routine" />
        <Stack.Screen name="food-details" />
        <Stack.Screen name="index" />
        <Stack.Screen 
          name="log-workout" 
          options={{
            headerTitle: () => <WorkoutTimerHeader />,
            headerRight: () => <FinishButton onPress={() => {}} /> // Placeholder onPress
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
      </Stack>
      <StatusBar style="auto" />
      {/* Conditionally render WorkoutNotificationBar */}
      {!segments.includes('workout-summary') && <WorkoutNotificationBar />}
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
          ? { 
              ...DarkTheme, 
              colors: { 
                ...DarkTheme.colors, 
                background: Colors.dark?.surface || '#000000' // Solid background
              } 
            }
          : { 
              ...DefaultTheme, 
              colors: { 
                ...DefaultTheme.colors, 
                background: Colors.light?.surface || '#FFFFFF' // Solid background
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