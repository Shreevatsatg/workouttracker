import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import { Routine, useRoutines } from '@/context/RoutinesContext';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function ExploreRoutineScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { setItems } = useRoutines();
  const [addedRoutineIds, setAddedRoutineIds] = useState<string[]>([]);

  const exampleRoutines: Routine[] = [
    {
      id: 'push-routine',
      name: 'Push Day',
      exercises: [
        { name: 'Barbell Bench Press - Medium Grip', sets: [{ weight: '60', reps: '8' }, { weight: '65', reps: '8' }, { weight: '70', reps: '6' }] },
        { name: 'Barbell Shoulder Press', sets: [{ weight: '40', reps: '8' }, { weight: '45', reps: '8' }, { weight: '50', reps: '6' }] },
        { name: 'Incline Dumbbell Press', sets: [{ weight: '20', reps: '10' }, { weight: '22.5', reps: '10' }, { weight: '25', reps: '8' }] },
        { name: 'Dumbbell Lateral Raise', sets: [{ weight: '8', reps: '12' }, { weight: '10', reps: '12' }, { weight: '12', reps: '10' }] },
        { name: 'Triceps Pushdown', sets: [{ weight: '30', reps: '10' }, { weight: '35', reps: '10' }, { weight: '40', reps: '8' }] },
      ],
      type: 'routine',
    },
    {
      id: 'pull-routine',
      name: 'Pull Day',
      exercises: [
        { name: 'Barbell Deadlift', sets: [{ weight: '80', reps: '5' }, { weight: '90', reps: '5' }, { weight: '100', reps: '3' }] },
        { name: 'Pullups', sets: [{ weight: 'body only', reps: '8' }, { weight: 'body only', reps: '8' }, { weight: 'body only', reps: '6' }] },
        { name: 'Bent Over Barbell Row', sets: [{ weight: '50', reps: '8' }, { weight: '55', reps: '8' }, { weight: '60', reps: '6' }] },
        { name: 'Barbell Curl', sets: [{ weight: '20', reps: '10' }, { weight: '25', reps: '10' }, { weight: '30', reps: '8' }] },
        { name: 'Hammer Curls', sets: [{ weight: '12', reps: '12' }, { weight: '15', reps: '12' }, { weight: '17.5', reps: '10' }] },
      ],
      type: 'routine',
    },
    {
      id: 'legs-routine',
      name: 'Leg Day',
      exercises: [
        { name: 'Barbell Full Squat', sets: [{ weight: '70', reps: '8' }, { weight: '75', reps: '8' }, { weight: '80', reps: '6' }] },
        { name: 'Leg Press', sets: [{ weight: '100', reps: '10' }, { weight: '110', reps: '10' }, { weight: '120', reps: '8' }] },
        { name: 'Leg Extensions', sets: [{ weight: '40', reps: '12' }, { weight: '45', reps: '12' }, { weight: '50', reps: '10' }] },
        { name: 'Leg Curls', sets: [{ weight: '30', reps: '12' }, { weight: '35', reps: '12' }, { weight: '40', reps: '10' }] },
        { name: 'Barbell Seated Calf Raise', sets: [{ weight: '50', reps: '15' }, { weight: '55', reps: '15' }, { weight: '60', reps: '12' }] },
      ],
      type: 'routine',
    },
    {
      id: 'upper-routine',
      name: 'Upper Body',
      exercises: [
        { name: 'Barbell Bench Press - Medium Grip', sets: [{ weight: '60', reps: '8' }, { weight: '65', reps: '8' }, { weight: '70', reps: '6' }] },
        { name: 'Bent Over Barbell Row', sets: [{ weight: '50', reps: '8' }, { weight: '55', reps: '8' }, { weight: '60', reps: '6' }] },
        { name: 'Barbell Shoulder Press', sets: [{ weight: '40', reps: '8' }, { weight: '45', reps: '8' }, { weight: '50', reps: '6' }] },
        { name: 'Close-Grip Barbell Bench Press', sets: [{ weight: '40', reps: '10' }, { weight: '45', reps: '10' }, { weight: '50', reps: '8' }] },
        { name: 'Barbell Curl', sets: [{ weight: '20', reps: '10' }, { weight: '25', reps: '10' }, { weight: '30', reps: '8' }] },
      ],
      type: 'routine',
    },
    {
      id: 'lower-routine',
      name: 'Lower Body',
      exercises: [
        { name: 'Barbell Full Squat', sets: [{ weight: '70', reps: '8' }, { weight: '75', reps: '8' }, { weight: '80', reps: '6' }] },
        { name: 'Romanian Deadlift', sets: [{ weight: '60', reps: '8' }, { weight: '65', reps: '8' }, { weight: '70', reps: '6' }] },
        { name: 'Leg Press', sets: [{ weight: '100', reps: '10' }, { weight: '110', reps: '10' }, { weight: '120', reps: '8' }] },
        { name: 'Standing Calf Raises', sets: [{ weight: '40', reps: '15' }, { weight: '45', reps: '15' }, { weight: '50', reps: '12' }] },
        { name: 'Glute Ham Raise', sets: [{ weight: 'body only', reps: '10' }, { weight: 'body only', reps: '10' }, { weight: 'body only', reps: '8' }] },
      ],
      type: 'routine',
    },
  ];

  const handleAddRoutine = (routine: Routine) => {
    setItems(prevItems => {
      // Check if routine already exists to prevent duplicates
      const exists = prevItems.some(item => item.id === routine.id);
      if (exists) {
        // Optionally, provide visual feedback that it already exists, e.g., by briefly changing button text
        return prevItems;
      }
      setAddedRoutineIds(prev => [...prev, routine.id]);
      setTimeout(() => {
        setAddedRoutineIds(prev => prev.filter(id => id !== routine.id));
      }, 2000); // Show "Routine Added" for 2 seconds
      return [...prevItems, { ...routine, id: Date.now().toString() }]; // Assign a new unique ID
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.section}>
        <ThemedText type="title" style={{ color: colors.tint, marginBottom: 12 }}>Explore Routines</ThemedText>
        {exampleRoutines.map((routine) => (
          <ThemedView key={routine.id} style={styles.routineCard}>
            <ThemedText type="subtitle" style={styles.routineName}>{routine.name}</ThemedText>
            {routine.exercises.map((exercise, index) => (
              <ThemedText key={index} style={styles.exerciseText}>
                - {exercise.name} ({exercise.sets.length} sets)
              </ThemedText>
            ))}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.tint }]}
              onPress={() => handleAddRoutine(routine)}
            >
              <ThemedText style={[styles.addButtonText, { color: colors.background }]}>
                {addedRoutineIds.includes(routine.id) ? 'Routine Added !' : 'Add to Your Routines'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
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
    backgroundColor: 'rgba(255,255,255,0.1)', // Adjust as needed for dark/light theme
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  routineName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exerciseText: {
    fontSize: 14,
    marginBottom: 4,
  },
  addButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    fontWeight: 'bold',
  },
});
