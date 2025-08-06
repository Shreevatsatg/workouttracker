import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { WorkoutProvider } from '@/context/WorkoutContext';
import WorkoutNotificationBar from '@/components/WorkoutNotificationBar';
import { RoutinesProvider } from '@/context/RoutinesContext';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RoutinesProvider>
          <WorkoutProvider>
            <Stack initialRouteName="(tabs)">
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
            <WorkoutNotificationBar />
          </WorkoutProvider>
        </RoutinesProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
