import FinishWorkoutButton from '@/components/FinishWorkoutButton';
import { HapticTab } from '@/components/HapticTab';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useWorkout } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs, router } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';

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
    <View style={{ 
      backgroundColor: 'rgba(156, 163, 175, 0.1)', 
      paddingHorizontal: 12, 
      paddingVertical: 6, 
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(156, 163, 175, 0.2)'
    }}>
      <ThemedText type="subtitle" style={{ 
        color: Colors[colorScheme ?? 'light'].text,
        fontSize: 16,
        fontWeight: '600'
      }}>
        Workout: {formatTime(workoutTime)}
      </ThemedText>
    </View>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  // Modern color palette
  const modernColors = {
    light: {
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceSecondary: '#F1F5F9',
      border: '#E2E8F0',
      text: '#1E293B',
      textSecondary: '#64748B',
      accent: '#3B82F6',
      accentSecondary: '#6366F1',
    },
    dark: {
      background: '#0F172A',
      surface: '#1E293B',
      surfaceSecondary: '#334155',
      border: '#475569',
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      accent: '#60A5FA',
      accentSecondary: '#818CF8',
    }
  };

  const colors = modernColors[colorScheme ?? 'light'];

  return (
    <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textSecondary,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            height: Platform.OS === 'ios' ? 70 : 70,
            paddingBottom: Platform.OS === 'ios' ? 30 : 20,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 4,
            marginBottom: 2,
          },
          tabBarIconStyle: {
            marginTop: 8,
            marginBottom: 0,
          },
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
          headerTitleStyle: {
            color: colors.text,
            fontSize: 18,
            fontWeight: '700',
            letterSpacing: -0.2,
          },
          headerTitleAlign: 'center',
          sceneContainerStyle: {
            backgroundColor: 'transparent',
          },
        }}>

      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              padding: 4,
              borderRadius: 10,
              backgroundColor: focused ? `${colors.accent}15` : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 32,
              minWidth: 32,
            }}>
              <IconSymbol 
                size={22} 
                name="dumbbell" 
                color={color} 
              />
            </View>
          ),
          headerShown: true,
          headerTitle: 'Your Workout',
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              padding: 4,
              borderRadius: 10,
              backgroundColor: focused ? `${colors.accent}15` : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 32,
              minWidth: 32,
            }}>
              <IconSymbol 
                size={22} 
                name="person.crop.circle.fill" 
                color={color} 
              />
            </View>
          ),
          headerShown: true,
          headerTitle: 'Your Profile',
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/settings')} 
              style={{ 
                marginRight: 16,
                backgroundColor: colors.surfaceSecondary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <ThemedText style={{ 
                color: colors.text,
                fontSize: 14,
                fontWeight: '600'
              }}>
                Settings
              </ThemedText>
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          headerShown: true,
          title: 'Settings',
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.replace('/(tabs)/profile')} 
              style={{ 
                marginLeft: 16,
                padding: 8,
                borderRadius: 12,
                backgroundColor: colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <IconSymbol 
                size={20} 
                name="chevron.backward" 
                color={colors.text} 
              />
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="create-routine"
        options={{
          href: null,
          headerShown: true,
          title: 'Create Routine',
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={{ 
                marginLeft: 16,
                padding: 8,
                borderRadius: 12,
                backgroundColor: colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <IconSymbol 
                size={20} 
                name="chevron.backward" 
                color={colors.text} 
              />
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="explore-routine"
        options={{ 
          href: null,
          headerShown: true,
          title: 'Explore Routines',
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={{ 
                marginLeft: 16,
                padding: 8,
                borderRadius: 12,
                backgroundColor: colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <IconSymbol 
                size={20} 
                name="chevron.backward" 
                color={colors.text} 
              />
            </TouchableOpacity>
          ),
        }}
      />
      
      <Tabs.Screen
        name="routine-details"
        options={{ 
          href: null,
          headerShown: true,
          title: 'Routine Details',
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={{ 
                marginLeft: 16,
                padding: 8,
                borderRadius: 12,
                backgroundColor: colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <IconSymbol 
                size={20} 
                name="chevron.backward" 
                color={colors.text} 
              />
            </TouchableOpacity>
          ),
        }}
      />
      
      
      <Tabs.Screen
        name="log-workout"
        options={{
          href: null,
          headerShown: true,
          headerTitle: () => <WorkoutTitle />,
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
          headerRight: () => (
            <View style={{ marginRight: 16 }}>
              <FinishWorkoutButton />
            </View>
          ),
        }} 
      />
      
      <Tabs.Screen
        name="workout-summary"
        options={{
          href: null,
          headerShown: true,
          title: 'Workout Summary',
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
        }}
      />
      
      <Tabs.Screen
        name="select-exercise"
        options={{
          href: null,
          headerShown: true,
          title: 'Select Exercise',
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={{ 
                marginLeft: 16,
                padding: 8,
                borderRadius: 12,
                backgroundColor: colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <IconSymbol 
                size={20} 
                name="chevron.backward" 
                color={colors.text} 
              />
            </TouchableOpacity>
          ),
        }}
      />
      
      <Tabs.Screen
        name="create-custom-exercise"
        options={{
          href: null,
          headerShown: true,
          title: 'Create Custom Exercise',
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
        }}
      />
      
      <Tabs.Screen
        name="exercise-details"
        options={{
          href: null,
          headerShown: true,
          title: 'Exercise Details',
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
        }}
      />
      
      <Tabs.Screen
        name="folder-details"
        options={{
          href: null,
          headerShown: true,
          title: 'Folder Details',
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
        }}
      />
      
      <Tabs.Screen
        name="measurements"
        options={{
          href: null,
          headerShown: true,
          title: 'Measurements',
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={{ 
                marginLeft: 16,
                padding: 8,
                borderRadius: 12,
                backgroundColor: colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <IconSymbol 
                size={20} 
                name="chevron.backward" 
                color={colors.text} 
              />
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="food-log"
        options={{
          title: 'Food',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              padding: 4,
              borderRadius: 10,
              backgroundColor: focused ? `${colors.accent}15` : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 32,
              minWidth: 32,
            }}>
              <IconSymbol 
                size={22} 
                name="fork.knife" 
                color={color} 
              />
            </View>
          ),
          headerShown: true,
          headerTitle: 'Food Log',
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
        }}
      />
      <Tabs.Screen
        name="add-food"
        options={{
          href: null,
          headerShown: true,
          title: 'Add Food',
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
        }}
      />
      <Tabs.Screen
        name="barcode-scanner"
        options={{
          href: null,
          headerShown: true,
          title: 'Barcode Scanner',
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
        }}
      />
      <Tabs.Screen
        name="manual-food-entry"
        options={{
          href: null,
          headerShown: true,
          title: 'Manual Food Entry',
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
        }}
      />
      <Tabs.Screen
        name="food-details"
        options={{
          href: null,
          headerShown: true,
          title: 'Food Details',
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
        }}
      />
    </Tabs>

  );
}