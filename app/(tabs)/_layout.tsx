import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useWorkout } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';

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

const SettingsMenu = () => {
  const [visible, setVisible] = useState(false);
  const { signOut } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View>
      <TouchableOpacity onPress={() => setVisible(true)} style={{ marginRight: 16 }}>
        <ThemedText style={{ fontSize: 16 }}>Settings</ThemedText>
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
              <View style={[styles.caret, { borderBottomColor: colors.background }]} />
              <TouchableOpacity onPress={signOut} style={styles.dropdownItem}>
                <IconSymbol name="arrow.right.to.line" size={16} color={colors.text} style={{ marginRight: 8 }} />
                <ThemedText>Log Out</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
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
          headerRight: () => <SettingsMenu />,
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    right: 16,
    top: 60, // Adjust this value to position the dropdown correctly
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  caret: {
    position: 'absolute',
    top: -10,
    right: 10,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
});
