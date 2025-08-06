import { HapticTab } from '@/components/HapticTab';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useWorkout } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs, router } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';

// Helper function to format time
const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const WorkoutTitle = () => {
  const { workoutTime } = useWorkout();
  const colorScheme = useColorScheme();
  return (
    <ThemedText type="subtitle" style={{ color: Colors[colorScheme ?? 'light'].secondary }}>
      Workout: {formatTime(workoutTime)}
    </ThemedText>
  );
};


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopColor: Colors[colorScheme ?? 'light'].tabIconDefault,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 80 : 60, // Better height for tab bar
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 3,
          ...Platform.select({
            ios: {
              position: 'absolute',
              backgroundColor: 'rgba(0, 0, 0, 0.95)', // Semi-transparent on iOS
              backdropFilter: 'blur(20px)',
            },
            default: {
              elevation: 8,
              shadowColor: '#000',
              shadowOpacity: 0.3,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: -4 },
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
          color: Colors[colorScheme ?? 'light'].secondary,
        },
        // Enhanced header styling
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderBottomColor: Colors[colorScheme ?? 'light'].tabIconDefault,
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: Colors[colorScheme ?? 'light'].secondary,
          fontSize: 18,
          fontWeight: '700',
        },
        headerTitleAlign: 'center',
      }}>

      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name="dumbbell" 
              color={color} 
            />
          ),
          headerShown: true,
          headerTitle: 'Your Workout',
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderBottomColor: Colors[colorScheme ?? 'light'].tabIconDefault,
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            color: Colors[colorScheme ?? 'light'].secondary,
            fontSize: 20,
            fontWeight: '700',
          },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name="person.crop.circle.fill" 
              color={color} 
            />
          ),
          headerShown: true,
          headerTitle: 'Your Profile',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/(tabs)/settings')} style={{ marginRight: 16 }}>
              <ThemedText style={{ color: Colors[colorScheme ?? 'light'].secondary }}>
                Settings
              </ThemedText>
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderBottomColor: Colors[colorScheme ?? 'light'].tabIconDefault,
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            color: Colors[colorScheme ?? 'light'].secondary,
            fontSize: 20,
            fontWeight: '700',
          },
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          headerShown: true,
          title: 'Settings',
        }}
      />

      <Tabs.Screen
        name="create-routine"
        options={{
          href: null,
          headerShown: true,
          title: 'Create Routine',
        }}
      />

      <Tabs.Screen
        name="explore-routine"
        options={{ 
          href: null,
          headerShown: true,
          title: 'Explore Routines',
         }}
      />
      <Tabs.Screen
        name="routine-details"
        options={{ 
          href: null,
          headerShown: true,
          title: 'Routine Details',
         }}
      />
      <Tabs.Screen
        name="explore-routine-details"
        options={{ 
          href: null,
          headerShown: true,
          title: 'Explore Routine Details',
         }}
      />
      <Tabs.Screen
        name="log-workout"
        options={{
          href: null,
          headerShown: true,
          headerTitle: () => <WorkoutTitle />,
          headerTitleAlign: 'center',
        }} />
      <Tabs.Screen
        name="select-exercise"
        options={{
          href: null,
          headerShown: true,
          title: 'Select Exercise',
        }}
      />
      <Tabs.Screen
        name="create-custom-exercise"
        options={{
          href: null,
          headerShown: true,
          title: 'Create Custom Exercise',
        }}
      />
      
      <Tabs.Screen
        name="exercise-details"
        options={{
          href: null,
          headerShown: true,
          title: 'Exercise Details',
        }}
      />
      <Tabs.Screen
        name="folder-details"
        options={{
          href: null,
          headerShown: true,
          title: 'Folder Details',
        }}
      />
    </Tabs>
  );
}


