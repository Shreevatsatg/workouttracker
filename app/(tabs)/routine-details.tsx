
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useWorkout } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function RoutineDetailsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const routine: Routine = JSON.parse(params.routine as string);
  const { startWorkout: startWorkoutContext } = useWorkout();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const startWorkout = () => {
    startWorkoutContext(routine);
    router.push('/(tabs)/log-workout');
  };

  const editRoutine = () => {
    router.push('/(tabs)/log-workout');
  };

  // Remove nextExercise and cancelWorkout if not used, or implement as needed

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.section}>
        <ThemedText type="title" style={{ color: colors.tint, marginBottom: 12 }}>{routine.name}</ThemedText>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint, flex: 1, marginRight: 8 }]}
            onPress={editRoutine}
          >
            <IconSymbol name="pencil" size={20} color={colors.background} />
            <ThemedText style={[styles.buttonText, { color: colors.background }]}>Edit Routine</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint, flex: 1, marginLeft: 8 }]}
            onPress={startWorkout}
          >
            <IconSymbol name="play.circle" size={20} color={colors.background} />
            <ThemedText style={[styles.buttonText, { color: colors.background }]}>Start Workout</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {routine.exercises.map((exercise, exIndex) => (
        <ThemedView key={exIndex} style={[styles.exerciseContainer, { borderColor: colors.tabIconDefault }]}>
          <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 8 }}>{exIndex + 1}. {exercise.name}</ThemedText>
          {exercise.sets.map((set, setIndex) => (
            <ThemedView key={setIndex} style={[styles.setContainer, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
              <ThemedText style={{ color: colors.text }}>Set {setIndex + 1}</ThemedText>
              <ThemedText style={{ color: colors.text }}>{set.weight} kg</ThemedText>
              <ThemedText style={{ color: colors.text }}>{set.reps} reps</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      ))}
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  exerciseContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  setContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 4,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
  },
});
