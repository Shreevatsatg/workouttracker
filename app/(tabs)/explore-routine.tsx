
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const dummyRoutines = [
  {
    name: 'Full Body Strength',
    description: 'A balanced workout targeting all major muscle groups.',
    exercises: [
      { name: 'Squats', sets: [{ weight: '60', reps: '10' }, { weight: '60', reps: '10' }] },
      { name: 'Bench Press', sets: [{ weight: '50', reps: '8' }, { weight: '50', reps: '8' }] },
      { name: 'Deadlifts', sets: [{ weight: '80', reps: '5' }] },
    ],
  },
  {
    name: 'Upper Body Power',
    description: 'Focuses on building strength and size in the upper body.',
    exercises: [
      { name: 'Pull Ups', sets: [{ weight: '0', reps: '8' }, { weight: '0', reps: '8' }] },
      { name: 'Overhead Press', sets: [{ weight: '30', reps: '10' }] },
      { name: 'Barbell Rows', sets: [{ weight: '40', reps: '12' }] },
    ],
  },
  {
    name: 'Lower Body Burn',
    description: 'An intense workout to build leg strength and endurance.',
    exercises: [
      { name: 'Leg Press', sets: [{ weight: '100', reps: '12' }, { weight: '100', reps: '12' }] },
      { name: 'Lunges', sets: [{ weight: '10', reps: '15' }] },
      { name: 'Calf Raises', sets: [{ weight: '20', reps: '20' }] },
    ],
  },
];

export default function ExploreRoutineScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const openRoutineDetails = (routine: any) => {
    router.push({
      pathname: '/(tabs)/explore-routine-details',
      params: { routine: JSON.stringify(routine) },
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.section}>
        {dummyRoutines.map((routine, index) => (
          <TouchableOpacity key={index} onPress={() => openRoutineDetails(routine)}>
            <ThemedView style={[styles.routineCard, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
              <ThemedText type="subtitle" style={{ color: colors.text }}>{routine.name}</ThemedText>
              <ThemedText style={{ color: colors.text, marginVertical: 8 }}>{routine.description}</ThemedText>
            </ThemedView>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  routineCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
});
        