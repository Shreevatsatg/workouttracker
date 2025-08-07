import SuccessModal from '@/components/SuccessModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/utils/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';







export default function WorkoutSummaryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
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
          routine_id: workoutData.id !== 'empty' ? workoutData.id : null, // Link to routine if not empty
          started_at: new Date(Date.now() - workoutDuration * 1000).toISOString(), // Approximate start time
          ended_at: new Date().toISOString(),
          notes: `Duration: ${formatTime(workoutDuration)}`,
        })
        .select();

      if (sessionError) throw sessionError;

      const sessionId = sessionData[0].id;

      // Save session exercises and sets
      for (const exercise of workoutData) {
        const { data: sessionExerciseData, error: sessionExerciseError } = await supabase
          .from('session_exercises')
          .insert({
            session_id: sessionId,
            exercise_name: exercise.name,
            order: 0, // You might want to add an order property to your Exercise interface
          })
          .select();

        if (sessionExerciseError) throw sessionExerciseError;

        const sessionExerciseId = sessionExerciseData[0].id;

        for (const set of exercise.loggedSets) {
          const { error: sessionSetError } = await supabase
            .from('session_sets')
            .insert({
              session_exercise_id: sessionExerciseId,
              weight: set.loggedWeight || set.weight,
              reps: set.loggedReps || set.reps,
              order: 0, // You might want to add an order property to your Set interface
              completed_at: set.completed ? new Date().toISOString() : null,
            });
          
          if (sessionSetError) throw sessionSetError;
        }
      }
      setShowSuccessMessage(true);
    } catch (error: any) {
      alert(`Error saving workout: ${error.message}`);
      console.error('Error saving workout:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user, workoutData, workoutDuration]);

  if (!workoutData) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText>Loading workout summary...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={{ color: colors.tint, marginBottom: 12 }}>Congratulations!</ThemedText>
        <ThemedText type="subtitle" style={{ color: colors.text }}>You completed your workout!</ThemedText>
        <ThemedText style={{ color: colors.secondary, marginTop: 8 }}>Duration: {formatTime(workoutDuration)}</ThemedText>
      </ThemedView>

      <SuccessModal
        isVisible={showSuccessMessage}
        message="Workout saved successfully!"
        onClose={() => {
          setShowSuccessMessage(false);
          router.replace('/(tabs)/workout');
        }}
      />

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 16 }}>Workout Details:</ThemedText>
        <ThemedText type="defaultSemiBold" style={{ color: colors.text, marginBottom: 8 }}>Routine: {workoutData.name}</ThemedText>
        {workoutData.exercises && workoutData.exercises.map((exercise, exIndex) => (
          <View key={exIndex} style={[styles.exerciseCard, { borderColor: colors.tabIconDefault }]}>
            <ThemedText type="defaultSemiBold" style={{ color: colors.text, marginBottom: 4 }}>{exercise.name}</ThemedText>
            {exercise.loggedSets.map((set, setIndex) => (
              <ThemedText key={setIndex} style={{ color: colors.secondary }}>
                Set {setIndex + 1}: {set.loggedWeight || set.weight} {set.loggedWeight ? 'kg' : ''} x {set.loggedReps || set.reps} reps {set.completed ? '(Completed)' : ''}
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
  },
  section: {
    marginBottom: 24,
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
});
