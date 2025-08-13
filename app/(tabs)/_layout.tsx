import { HapticTab } from '@/components/HapticTab';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useWorkout } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { modernColors } from '@/constants/ModernColors';
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
            height: Platform.OS === 'ios' ? 90 : 70, // Increased height for iOS
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
            backgroundColor: colors.surface, // Changed to use the new dark gray surface color
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
        }}>

      <Tabs.Screen
        name="workout"
        options={{
          tabBarLabel: ({ color, focused }) => (
            <ThemedText style={{ color, fontSize: 11, fontWeight: '600' }}>
              Workout
            </ThemedText>
          ),
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
                size={26} 
                name="dumbbell" 
                color={color} 
              />
            </View>
          ),
          headerShown: true,
          headerTitle: ({ children, tintColor }) => (
            <ThemedText style={{ color: colors.text, fontSize: 18, fontWeight: '700', letterSpacing: -0.2 }}>
              {children}
            </ThemedText>
          ),
          headerStyle: {
            backgroundColor: colors.surface, // Changed to use the new dark gray surface color
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
        name="food-log"
        options={{
          tabBarLabel: ({ color, focused }) => (
            <ThemedText style={{ color, fontSize: 11, fontWeight: '600' }}>
              Food
            </ThemedText>
          ),
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
                size={26} 
                name="fork.knife" 
                color={color} 
              />
            </View>
          ),
          headerShown: true,
          headerTitle: ({ children, tintColor }) => (
            <ThemedText style={{ color: colors.text, fontSize: 18, fontWeight: '700', letterSpacing: -0.2 }}>
              {children}
            </ThemedText>
          ),
          headerStyle: {
            backgroundColor: colors.surface, // Changed to use the new dark gray surface color
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
          tabBarLabel: ({ color, focused }) => (
            <ThemedText style={{ color, fontSize: 11, fontWeight: '600' }}>
              Profile
            </ThemedText>
          ),
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
                size={26} 
                name="person.crop.circle.fill" 
                color={color} 
              />
            </View>
          ),
          headerShown: true,
          headerTitle: ({ children, tintColor }) => (
            <ThemedText style={{ color: colors.text, fontSize: 18, fontWeight: '700', letterSpacing: -0.2 }}>
              {children}
            </ThemedText>
          ),
          headerStyle: {
            backgroundColor: colors.surface, // Changed to use the new dark gray surface color
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
              onPress={() => router.push('/settings')} 
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

    </Tabs>

  );
}
