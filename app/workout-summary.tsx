import SuccessModal from '@/components/SuccessModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useWorkout } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/utils/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';







export default function WorkoutSummaryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { discardWorkout, saveWorkout } = useWorkout();
  const parsedWorkoutData = useMemo(() => {
    if (params.workoutData) {
      return JSON.parse(params.workoutData as string);
    }
    return null;
  }, [params.workoutData]);

  const parsedWorkoutDuration = useMemo(() => {
    if (params.workoutDuration) {
      return parseInt(params.workoutDuration as string, 10);
    }
    return 0;
  }, [params.workoutDuration]);

  const workoutData = parsedWorkoutData;
  const workoutDuration = parsedWorkoutDuration;
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [workoutNotes, setWorkoutNotes] = useState(''); // New state for notes
  const [workoutDate, setWorkoutDate] = useState(''); // New state for date

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    setWorkoutDate(today.toLocaleDateString(undefined, options));
  }, []);

  const totalVolume = useMemo(() => {
    if (!workoutData || !Array.isArray(workoutData.exercises)) return 0;
    return workoutData.exercises.reduce((acc: number, exercise: any) => {
      if (!exercise || !Array.isArray(exercise.loggedSets)) return acc;
      return acc + exercise.loggedSets.reduce((setAcc: number, set: any) => {
        if (set && set.completed) {
          return setAcc + (Number(set.loggedWeight || set.weight || 0) * Number(set.loggedReps || set.reps || 0));
        }
        return setAcc;
      }, 0);
    }, 0);
  }, [workoutData]);

  const completedExercisesCount = useMemo(() => {
    if (!workoutData || !Array.isArray(workoutData.exercises)) return 0;
    return workoutData.exercises.filter((exercise: any) =>
      exercise && Array.isArray(exercise.loggedSets) && exercise.loggedSets.some((set: any) => set && set.completed)
    ).length;
  }, [workoutData]);

  const totalSetsPerformed = useMemo(() => {
    if (!workoutData || !Array.isArray(workoutData.exercises)) return 0;
    return workoutData.exercises.reduce((acc: number, exercise: any) => {
      if (!exercise || !Array.isArray(exercise.loggedSets)) return acc;
      return acc + exercise.loggedSets.filter((set: any) => set && set.completed).length;
    }, 0);
  }, [workoutData]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const saveWorkoutToDb = useCallback(async () => {
    if (!user || !workoutData) {
      return;
    }

    setIsSaving(true);
    try {
      // Save workout session
      const { data: sessionData, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          routine_name: workoutData.name,
          duration: workoutDuration,
          completed_at: new Date().toISOString(),
          notes: workoutNotes,
        })
        .select();

      if (sessionError) throw sessionError;

      if (!sessionData || sessionData.length === 0) {
        throw new Error("Failed to retrieve session ID after saving workout.");
      }
      const sessionId = sessionData[0].id;

      // Save session exercises and sets
      if (Array.isArray(workoutData.exercises)) {
        for (const exercise of workoutData.exercises) {
          if (exercise) { // Ensure exercise is not null/undefined
            // Insert into session_exercises
            const { data: sessionExerciseData, error: sessionExerciseError } = await supabase
              .from('session_exercises')
              .insert({
                session_id: sessionId,
                exercise_name: exercise.name,
                order: workoutData.exercises.indexOf(exercise), // Assuming order is based on array index
              })
              .select();

            if (sessionExerciseError) throw sessionExerciseError;

            if (!sessionExerciseData || sessionExerciseData.length === 0) {
              throw new Error(`Failed to retrieve session exercise ID for ${exercise.name}.`);
            }
            const sessionExerciseId = sessionExerciseData[0].id;

            if (Array.isArray(exercise.loggedSets)) {
              for (const set of exercise.loggedSets) {
                if (set && set.completed) {
                  const { error: sessionSetError } = await supabase
                    .from('session_sets')
                    .insert({
                      session_id: sessionId, // Still link to session
                      session_exercise_id: sessionExerciseId, // Link to session_exercise
                      weight: String(Number(set.loggedWeight || set.weight || 0)), // Ensure weight is text
                      reps: String(Number(set.loggedReps || set.reps || 0)),     // Ensure reps is text
                      order: exercise.loggedSets.indexOf(set), // Assuming order is based on array index
                      completed_at: new Date().toISOString(),
                    });

                  if (sessionSetError) throw sessionSetError;
                }
              }
            }
          }
        }
      }
      setShowSuccessMessage(true);
      saveWorkout();
    } catch (error: any) {
      alert(`Error saving workout: ${error.message}`);
      console.error('Error saving workout:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user, workoutData, workoutDuration, workoutNotes]);

  if (!workoutData) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText>Loading workout summary...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: 'transparent', paddingHorizontal: 16 }]} 
      contentContainerStyle={styles.scrollViewContent}
    >
      <ThemedView style={[styles.header, { backgroundColor: colors.cardBackground, borderColor: colors.tabIconDefault }]}>
        <ThemedText type="title" style={{ color: colors.tint, marginBottom: 12, fontSize: 28 }}>Congratulations!</ThemedText>
        <ThemedText type="subtitle" style={{ color: colors.text, fontSize: 20, marginBottom: 16 }}>You completed your workout!</ThemedText>
        <ThemedText style={[styles.summaryMetric, { color: colors.secondary }]}>Date: {workoutDate}</ThemedText>
        <ThemedText style={[styles.summaryMetric, { color: colors.secondary }]}>Duration: {formatTime(workoutDuration)}</ThemedText>
        <ThemedText style={[styles.summaryMetric, { color: colors.secondary }]}>Total Exercises: {completedExercisesCount}</ThemedText>
        <ThemedText style={[styles.summaryMetric, { color: colors.secondary }]}>Total Sets Performed: {totalSetsPerformed}</ThemedText>
        <ThemedText style={[styles.summaryMetric, { color: colors.secondary }]}>Total Volume: {totalVolume} kg</ThemedText>
      </ThemedView>

      <SuccessModal
        isVisible={showSuccessMessage}
        message="Workout saved successfully!"
        onClose={() => {
          setShowSuccessMessage(false);
          router.replace('/(tabs)/workout');
        }}
      />

      <ThemedView style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.tabIconDefault }]}>
        <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 16 }}>Workout Details:</ThemedText>
        <ThemedText type="defaultSemiBold" style={{ color: colors.text, marginBottom: 8 }}>Routine: {workoutData.name}</ThemedText>

        <ThemedText type="defaultSemiBold" style={{ color: colors.text, marginTop: 16, marginBottom: 8 }}>Notes:</ThemedText>
        <TextInput
          style={[styles.notesInput, { borderColor: colors.tabIconDefault, color: colors.text, backgroundColor: colors.background }]}
          placeholder="Add any notes about your workout here..."
          placeholderTextColor={colors.secondary}
          multiline
          numberOfLines={4}
          value={workoutNotes}
          onChangeText={setWorkoutNotes}
        />
        {Array.isArray(workoutData.exercises) && workoutData.exercises.map((exercise: any, exIndex: number) => (
          <View key={exIndex} style={[styles.exerciseCard, { borderColor: colors.tabIconDefault }]}>
            <ThemedText type="defaultSemiBold" style={{ color: colors.text, marginBottom: 4 }}>{exercise.name}</ThemedText>
            {Array.isArray(exercise.loggedSets) && exercise.loggedSets.map((set: any, setIndex: number) => (
              <ThemedText key={setIndex} style={{ color: colors.secondary }}>
                Set {setIndex + 1}: {set.loggedWeight || set.weight}kg x {set.loggedReps || set.reps} reps {set.completed ? '(Completed)' : ''}
              </ThemedText>
            ))}
          </View>
        ))}
      </ThemedView>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.tint, marginTop: 24 }]}
        onPress={async () => {
          await saveWorkoutToDb();
        }}
        disabled={isSaving}
      >
        <ThemedText style={[styles.buttonText, { color: colors.background }]}>
          {isSaving ? 'Saving...' : 'Save Workout'}
        </ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  section: {
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  exerciseCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  successMessage: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  summaryMetric: {
    fontSize: 16,
    marginBottom: 4,
  },
  scrollViewContent: {
    paddingBottom: 60, // Adjust this value as needed to clear the tab bar
  },
});
