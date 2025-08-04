import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

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
          title: 'Log Workout',
        }}
      />
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
    </Tabs>
  );
}