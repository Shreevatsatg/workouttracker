
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useWorkout } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Button, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface Set {
  weight: string;
  reps: string;
  loggedWeight?: string;
  loggedReps?: string;
  completed: boolean;
}

interface Exercise {
  name: string;
  sets: Set[];
  loggedSets: Set[];
}

interface Routine {
  name: string;
  exercises: Exercise[];
}

export default function LogWorkoutScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const {
    activeRoutine,
    workoutTime,
    isWorkoutRunning,
    loggedExercises,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    discardWorkout,
    saveWorkout,
    updateLoggedExercises,
    updateWorkoutTime,
  } = useWorkout();

  const handleLoggedSetChange = (exIndex: number, setIndex: number, field: 'loggedWeight' | 'loggedReps', value: string) => {
    const newLoggedExercises = [...loggedExercises];
    newLoggedExercises[exIndex].loggedSets[setIndex][field] = value;
    updateLoggedExercises(newLoggedExercises);
  };

  const addLoggedSet = (exIndex: number) => {
    const newLoggedExercises = [...loggedExercises];
    newLoggedExercises[exIndex].loggedSets.push({ weight: '', reps: '', loggedWeight: '', loggedReps: '', completed: false });
    updateLoggedExercises(newLoggedExercises);
  };

  const addLoggedExercise = () => {
    updateLoggedExercises([...loggedExercises, { name: '', sets: [], loggedSets: [{ weight: '', reps: '', loggedWeight: '', loggedReps: '', completed: false }] }]);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => { saveWorkout(); router.back(); }} style={{ marginRight: 15 }}>
          <ThemedText style={{ color: colors.tint, fontWeight: 'bold' }}>Save</ThemedText>
        </TouchableOpacity>
      ),
    });
  }, [navigation, saveWorkout, router, colors.tint]);

  useEffect(() => {
    if (!activeRoutine && router.canGoBack()) {
      router.back();
    }
  }, [activeRoutine, router]);

  

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={{ color: colors.tint }}>{routine.name}</ThemedText>
        <ThemedText type="subtitle" style={{ color: colors.text }}>Workout Timer: {formatTime(workoutTime)}</ThemedText>
        <View style={styles.timerControls}>
          <Button title={isWorkoutRunning ? "Pause" : "Resume"} onPress={() => isWorkoutRunning ? pauseWorkout() : resumeWorkout()} />
          <Button title="Reset" onPress={discardWorkout} />
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 16 }}>Exercises:</ThemedText>
        {loggedExercises.length === 0 ? (
          <ThemedText style={{ color: colors.secondary }}>No exercises in this routine.</ThemedText>
        ) : (
          loggedExercises.map((exercise, exIndex) => (
            <ThemedView key={exIndex} style={[styles.exerciseCard, { borderColor: colors.tabIconDefault }]}>
              <ThemedText type="defaultSemiBold" style={{ color: colors.text, marginBottom: 8 }}>{exIndex + 1}. {exercise.name}</ThemedText>
              {exercise.loggedSets.map((set, setIndex) => (
                <ThemedView key={setIndex} style={[styles.setRow, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
                  <ThemedText style={{ color: colors.text }}>Set {setIndex + 1}:</ThemedText>
                  <ThemedText style={{ color: colors.text }}>{set.weight} kg</ThemedText>
                  <ThemedText style={{ color: colors.text }}>{set.reps} reps</ThemedText>
                  <TextInput
                    style={[styles.setInput, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
                    placeholder="Logged Weight"
                    placeholderTextColor={colors.secondary}
                    keyboardType="numeric"
                    value={set.loggedWeight}
                    onChangeText={(val) => handleLoggedSetChange(exIndex, setIndex, 'loggedWeight', val)}
                  />
                  <TextInput
                    style={[styles.setInput, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
                    placeholder="Logged Reps"
                    placeholderTextColor={colors.secondary}
                    keyboardType="numeric"
                    value={set.loggedReps}
                    onChangeText={(val) => handleLoggedSetChange(exIndex, setIndex, 'loggedReps', val)}
                  />
                </ThemedView>
              ))}
              <Button title="Add Set" onPress={() => addLoggedSet(exIndex)} />
            </ThemedView>
          ))
        <Button title="Add Exercise" onPress={addLoggedExercise} />
      </ThemedView>
      <Button title="Discard Workout" onPress={() => { discardWorkout(); router.back(); }} color="#f87171" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  timerControls: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  exerciseCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 4,
  },
  setInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    flex: 1,
    marginHorizontal: 4,
    fontSize: 14,
  },
  removeSetButton: {
    padding: 4,
  },
  saveButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  discardButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
});
