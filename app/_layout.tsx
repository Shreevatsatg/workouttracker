import AppBackground from '@/components/AppBackground';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/context/AuthContext';
import { RoutinesProvider } from '@/context/RoutinesContext';
import { WorkoutProvider } from '@/context/WorkoutContext';
import WorkoutNotificationBar from '@/components/WorkoutNotificationBar';

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
      <ThemeProvider value={colorScheme === 'dark' ? 
        { ...DarkTheme, colors: { ...DarkTheme.colors, background: 'transparent' } } : 
        { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: 'transparent' } }
      }>
        <RoutinesProvider>
          <WorkoutProvider>
            <AppBackground>
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
            </AppBackground>
          </WorkoutProvider>
        </RoutinesProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
