
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useWorkout } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Define interfaces for exercise and routine structure
interface Set {
  weight: string;
  reps: string;
}

interface Exercise {
  name: string;
  sets: Set[];
  images?: string[]; // Add images property
  id?: string; // Add id property
}

interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface ExerciseDetail {
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  equipment: string;
  images: string[];
}

const EXERCISES_DATA = require('@/assets/data/exercises.json');

export default function RoutineDetailsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const routine: Routine = JSON.parse(params.routine as string);
  const { startWorkout: startWorkoutContext } = useWorkout();

  const [allExercises, setAllExercises] = useState<ExerciseDetail[]>([]);

  useEffect(() => {
    setAllExercises(EXERCISES_DATA);
  }, []);

  const getExerciseDetails = (exerciseName: string): ExerciseDetail | undefined => {
    return allExercises.find(ex => ex.name === exerciseName);
  };

  const startWorkout = () => {
    const exercisesWithImages = routine.exercises.map(ex => {
      const details = getExerciseDetails(ex.name);
      console.log(`Exercise Name: ${ex.name}, Details Found: ${!!details}, Images: ${details?.images}`);
      return {
        ...ex,
        images: details?.images || [],
      };
    });
    startWorkoutContext({ ...routine, exercises: exercisesWithImages });
    router.push('/(tabs)/log-workout');
  };

  const editRoutine = () => {
    const routineWithDetails = {
      ...routine,
      exercises: routine.exercises.map(ex => {
        const details = getExerciseDetails(ex.name);
        return {
          ...ex,
          id: details?.id, // Include id
          images: details?.images || [], // Include images
        };
      }),
    };
    router.push({ pathname: '/(tabs)/create-routine', params: { routine: JSON.stringify(routineWithDetails) } });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <ThemedView style={[styles.section, { backgroundColor: 'transparent' }]}>
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

      {routine.exercises.map((exercise, exIndex) => {
        const details = getExerciseDetails(exercise.name);
        const imageUrl = details?.images && details.images.length > 0
          ? `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${details.images[0]}`
          : '../../assets/images/exersiseplaceholder.png';

        return (
          <ThemedView key={exIndex} style={[styles.exerciseContainer, { borderColor: colors.tabIconDefault }]}>
            <TouchableOpacity
              style={styles.exerciseHeader}
              onPress={() => router.push({ pathname: '/(tabs)/exercise-details', params: { exerciseId: details?.id, exerciseName: exercise.name } })}
            >
              <Image
                                source={imageUrl.startsWith('http') ? { uri: imageUrl } : require('../../assets/images/exersiseplaceholder.png')}
                style={styles.exerciseThumbnail}
              />
              <View>
                <ThemedText type="subtitle" style={{ color: colors.text }}>{exIndex + 1}. {exercise.name}</ThemedText>
                {details && details.primaryMuscles.length > 0 && (
                  <ThemedText style={styles.muscleText}>
                    {details.primaryMuscles.join(', ')}
                  </ThemedText>
                )}
              </View>
            </TouchableOpacity>

            <ThemedText type="subtitle" style={{ color: colors.text, marginTop: 12, marginBottom: 8 }}>Sets:</ThemedText>
            {exercise.sets.map((set, setIndex) => (
              <ThemedView key={setIndex} style={[styles.setContainer, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
                <ThemedText style={{ color: colors.text }}>Set {setIndex + 1}</ThemedText>
                <ThemedText style={{ color: colors.text }}>{set.weight} kg</ThemedText>
                <ThemedText style={{ color: colors.text }}>{set.reps} reps</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        );
      })}
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
