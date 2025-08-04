
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useWorkout } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
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

  const toggleSetCompletion = (exIndex: number, setIndex: number) => {
    const newLoggedExercises = [...loggedExercises];
    newLoggedExercises[exIndex].loggedSets[setIndex].completed = !newLoggedExercises[exIndex].loggedSets[setIndex].completed;
    updateLoggedExercises(newLoggedExercises);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => { saveWorkout(); router.back(); }} style={{ marginRight: 15 }}>
          <ThemedText style={{ color: colors.tint, fontWeight: 'bold' }}>Finish</ThemedText>
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
        <ThemedText type="title" style={{ color: colors.tint }}>{activeRoutine && activeRoutine.name ? activeRoutine.name : 'Workout'}</ThemedText>
        <ThemedText type="subtitle" style={{ color: colors.text }}>Workout Timer: {formatTime(workoutTime)}</ThemedText>
        <View style={styles.timerControls}>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint }]} onPress={() => isWorkoutRunning ? pauseWorkout() : resumeWorkout()}>
            <ThemedText style={[styles.buttonText, { color: colors.background }]}>{isWorkoutRunning ? "Pause" : "Resume"}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint }]} onPress={discardWorkout}>
            <ThemedText style={[styles.buttonText, { color: colors.background }]}>Reset</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 16 }}>Exercises:</ThemedText>
        {loggedExercises.length === 0 ? (
          <ThemedText style={{ color: colors.secondary }}>No exercises in this routine.</ThemedText>
        ) : (
          <>
            {loggedExercises.map((exercise, exIndex) => (
              <ThemedView key={exIndex} style={[styles.exerciseCard, { borderColor: colors.tabIconDefault }]}> 
                <ThemedText type="defaultSemiBold" style={{ color: colors.text, marginBottom: 8 }}>{exIndex + 1}. {exercise.name}</ThemedText>
                <ThemedView style={[styles.setRow, styles.headerRow]}>
                  <ThemedText style={[styles.headerText, styles.setColumn, { color: colors.text }]}>Set</ThemedText>
                  <ThemedText style={[styles.headerText, styles.prevColumn, { color: colors.text }]}>Prev</ThemedText>
                  <ThemedText style={[styles.headerText, styles.kgRepsColumn, { color: colors.text }]}>kg</ThemedText>
                  <ThemedText style={[styles.headerText, styles.kgRepsColumn, { color: colors.text }]}>Reps</ThemedText>
                  <ThemedText style={[styles.headerText, styles.checkmarkColumn, { color: colors.text }]}></ThemedText>
                </ThemedView>
                {exercise.loggedSets.map((set, setIndex) => (
                  <ThemedView key={setIndex} style={[styles.setRow, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}> 
                    <ThemedText style={[styles.cellText, styles.setColumn, { color: colors.text }]}>{setIndex + 1}</ThemedText>
                    <ThemedText style={[styles.cellText, styles.prevColumn, { color: colors.text }]}>-</ThemedText>
                    <TextInput
                      style={[styles.setInput, styles.kgRepsColumn, { backgroundColor: colors.background, color: colors.text }]}
                      placeholder={set.weight}
                      placeholderTextColor={colors.secondary}
                      keyboardType="numeric"
                      value={set.loggedWeight}
                      onChangeText={(val) => handleLoggedSetChange(exIndex, setIndex, 'loggedWeight', val)}
                    />
                    <TextInput
                      style={[styles.setInput, styles.kgRepsColumn, { backgroundColor: colors.background, color: colors.text }]}
                      placeholder={set.reps}
                      placeholderTextColor={colors.secondary}
                      keyboardType="numeric"
                      value={set.loggedReps}
                      onChangeText={(val) => handleLoggedSetChange(exIndex, setIndex, 'loggedReps', val)}
                    />
                    <TouchableOpacity style={styles.checkmarkColumn} onPress={() => toggleSetCompletion(exIndex, setIndex)}>
                      <IconSymbol
                        name={set.completed ? "checkmark.circle.fill" : "circle"}
                        size={24}
                        color={set.completed ? colors.tint : colors.secondary}
                      />
                    </TouchableOpacity>
                  </ThemedView>
                ))}
                <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint, marginTop: 12 }]} onPress={() => addLoggedSet(exIndex)}>
                    <ThemedText style={[styles.buttonText, { color: colors.background }]}>Add Set</ThemedText>
                  </TouchableOpacity>
              </ThemedView>
            ))}
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint, marginTop: 12 }]} onPress={addLoggedExercise}>
              <ThemedText style={[styles.buttonText, { color: colors.background }]}>Add Exercise</ThemedText>
            </TouchableOpacity>
          </>
        )}
      </ThemedView>
      <TouchableOpacity style={[styles.button, { backgroundColor: "#f87171", marginTop: 24 }]} onPress={() => { discardWorkout(); }}>
        <ThemedText style={[styles.buttonText, { color: colors.background }]}>Discard Workout</ThemedText>
      </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  headerText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 4,
  },
  setColumn: {
    width: 40,
    textAlign: 'center',
  },
  prevColumn: {
    width: 60,
    textAlign: 'center',
  },
  kgRepsColumn: {
    flex: 1,
    textAlign: 'center',
  },
  checkmarkColumn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },
  cellText: {
    textAlign: 'center',
  },
  cellInput: {
    textAlign: 'center',
  },
  checkmarkIcon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeSetButton: {
    padding: 4,
  },
  saveButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    marginBottom: 4,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  discardButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
});
