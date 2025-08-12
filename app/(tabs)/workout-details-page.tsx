import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { supabase } from '../../utils/supabase';

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 25) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '..';
  }
  return text;
};

const EXERCISES_DATA = require('../../assets/data/exercises.json');

interface ExerciseDetail {
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  equipment: string;
  images: string[];
  id?: string; // Add id property to resolve TS error
}

interface SessionSet {
  id: string;
  reps: number;
  weight: number;
  unit: string;
  session_exercise_id: string;
  created_at: string;
}

interface SessionExercise {
  id: string;
  exercise_name: string;
  workout_session_id: string;
  created_at: string;
  session_sets: SessionSet[];
}

export interface WorkoutSession {
  id: string;
  completed_at: string;
  duration: number;
  notes: string | null;
  user_id: string;
  routine_name: string | null;
  created_at: string;
  session_exercises: SessionExercise[];
}

export default function WorkoutDetailsPage() {
  const { workoutId } = useLocalSearchParams();
  const [workoutDetails, setWorkoutDetails] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [allExercises, setAllExercises] = useState<ExerciseDetail[]>([]);

  useEffect(() => {
    setAllExercises(EXERCISES_DATA);
  }, []);

  const getExerciseDetails = (exerciseName: string): ExerciseDetail | undefined => {
    return allExercises.find(ex => ex.name === exerciseName);
  };

  useEffect(() => {
    async function fetchWorkoutDetails() {
      if (!workoutId) {
        setError('Workout ID not provided.');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('workout_sessions')
          .select(`
            *,
            session_exercises!session_exercises_session_id_fkey (
              *,
              session_sets!session_sets_session_exercise_id_fkey (*)
            )
          `)
          .eq('id', workoutId)
          .single();

        if (error) {
          throw error;
        }

        setWorkoutDetails(data as WorkoutSession);
      } catch (err: any) {
        console.error('Error fetching workout details:', err.message);
        setError('Failed to load workout details: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkoutDetails();
  }, [workoutId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading workout details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!workoutDetails) {
    return (
      <View style={styles.container}>
        <Text>No workout details found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.appBackground, marginHorizontal: 6 }]}>
      <ThemedText type="title" style={[styles.title, { color: colors.tint }]}>{workoutDetails.routine_name || 'Freestyle Workout'} Details</ThemedText>
      <ThemedText style={[styles.label, { color: colors.text }]}>Date:</ThemedText>
      <ThemedText style={[styles.value, { color: colors.text }]}>{new Date(workoutDetails.completed_at).toLocaleDateString()}</ThemedText>

      <ThemedText style={[styles.label, { color: colors.text }]}>Duration:</ThemedText>
      <ThemedText style={[styles.value, { color: colors.text }]}>{Math.floor(workoutDetails.duration / 60)} minutes {workoutDetails.duration % 60} seconds</ThemedText>

      <ThemedText style={[styles.label, { color: colors.text }]}>Notes:</ThemedText>
      <ThemedText style={[styles.value, { color: colors.text }]}>{workoutDetails.notes || 'No notes'}</ThemedText>

      <ThemedText type="subtitle" style={[styles.subtitle, { color: colors.tint }]}>Exercises:</ThemedText>
      {workoutDetails.session_exercises && workoutDetails.session_exercises.length > 0 ? (
        workoutDetails.session_exercises.map((exercise: any, index: number) => {
          const details = getExerciseDetails(exercise.exercise_name);
          const imageUrl = details?.images && details.images.length > 0
            ? `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${details.images[0]}`
            : '../../assets/images/exersiseplaceholder.png';

          return (
            <ThemedView key={index} style={[styles.exerciseContainer, { borderColor: colors.tabIconDefault }]}>
              <TouchableOpacity
                style={styles.exerciseHeader}
                onPress={() => router.push({ pathname: '/(tabs)/exercise-details', params: { exerciseId: details?.id, exerciseName: exercise.exercise_name } })}
              >
                <Image
                  source={imageUrl.startsWith('http') ? { uri: imageUrl } : require('../../assets/images/exersiseplaceholder.png')}
                  style={styles.exerciseThumbnail}
                />
                <View style={{ flex: 1 }}>
                  <ThemedText type="subtitle" style={{ color: colors.text }} numberOfLines={1} ellipsizeMode="tail">{index + 1}. {truncateText(exercise.exercise_name)}</ThemedText>
                  {details && details.primaryMuscles.length > 0 && (
                    <ThemedText style={styles.muscleText}>
                      {details.primaryMuscles.join(', ')}
                    </ThemedText>
                  )}
                </View>
              </TouchableOpacity>

              <ThemedText type="subtitle" style={{ color: colors.text, marginTop: 12, marginBottom: 8 }}>Sets:</ThemedText>
              {exercise.session_sets && exercise.session_sets.length > 0 ? (
                exercise.session_sets.map((set: any, setIndex: number) => (
                  <ThemedView key={setIndex} style={[styles.setContainer, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
                    <ThemedText style={{ color: colors.text }}>Set {setIndex + 1}</ThemedText>
                    <ThemedText style={{ color: colors.text }}>{set.weight} {set.unit}</ThemedText>
                    <ThemedText style={{ color: colors.text }}>{set.reps} reps</ThemedText>
                  </ThemedView>
                ))
              ) : (
                <ThemedText style={[styles.value, { color: colors.text }]}>No sets recorded for this exercise.</ThemedText>
              )}
            </ThemedView>
          );
        })
      ) : (
        <ThemedText style={[styles.value, { color: colors.text }]}>No exercises recorded for this workout.</ThemedText>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  exerciseContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0', // Placeholder background
  },
  muscleText: {
    fontSize: 14,
    color: '#888', // Adjust color as needed
  },
  setContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 4,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
});
