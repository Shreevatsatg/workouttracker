
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface Set {
  weight: string;
  reps: string;
}

interface Exercise {
  name: string;
  force?: string | null;
  level?: string;
  mechanic?: string | null;
  equipment?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
  category?: string;
  images?: string[];
  id?: string;
  sets: Set[]; // This will be used for the routine's exercises
}

interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
}

export default function CreateRoutineScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const [routineName, setRoutineName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentRoutineId, setCurrentRoutineId] = useState<string | null>(null);
  const [routineNameError, setRoutineNameError] = useState<string | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);


  useFocusEffect(
    React.useCallback(() => {
      const existingRoutine: Routine | null = params.routine ? JSON.parse(params.routine as string) : null;
      const newSelectedExercises: Exercise[] = params.selectedExercises ? JSON.parse(params.selectedExercises as string) : [];

      if (existingRoutine) {
        setRoutineName(existingRoutine.name);
        setExercises(existingRoutine.exercises);
        setCurrentRoutineId(existingRoutine.id);
      } else if (newSelectedExercises.length > 0) {
        setExercises((prevExercises) => [
          ...prevExercises,
          ...newSelectedExercises.map((ex) => ({
              ...ex,
              sets: [{ weight: '', reps: '' }, { weight: '', reps: '' }], // Initialize with two empty sets
            })),
        ]);
        router.setParams({ selectedExercises: undefined });
      }
    }, [params.routine, params.selectedExercises, router])
  );

  const handleExerciseChange = (id: string, name: string) => {
    setExercises((prevExercises) =>
      prevExercises.map((ex) => (ex.id === id ? { ...ex, name } : ex))
    );
  };

  const handleSetChange = (exId: string, setIndex: number, field: keyof Set, value: string) => {
    setExercises((prevExercises) =>
      prevExercises.map((ex) =>
        ex.id === exId
          ? {
              ...ex,
              sets: ex.sets.map((set, sIdx) =>
                sIdx === setIndex ? { ...set, [field]: value } : set
              ),
            }
          : ex
      )
    );
  };

  const addSet = (exId: string) => {
    setExercises((prevExercises) =>
      prevExercises.map((ex) =>
        ex.id === exId
          ? {
              ...ex,
              sets: [...ex.sets, { weight: '', reps: '' }],
            }
          : ex
      )
    );
  };

  const removeSet = (exId: string, setIndex: number) => {
    setExercises((prevExercises) =>
      prevExercises.map((ex) =>
        ex.id === exId
          ? {
              ...ex,
              sets: ex.sets.filter((_, sIdx) => sIdx !== setIndex),
            }
          : ex
      )
    );
  };

  const removeExercise = (id: string) => {
    setExercises((prevExercises) => prevExercises.filter((ex) => ex.id !== id));
  };

  const saveRoutine = () => {
    if (!routineName.trim()) {
      setRoutineNameError('Routine name cannot be empty.');
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setRoutineNameError(null); // Clear error if name is present

    if (exercises.length === 0) {
      Alert.alert('No Exercises', 'Please add at least one exercise to your routine.');
      return;
    }

    const newRoutine = { id: currentRoutineId || Date.now().toString(), name: routineName.trim(), exercises };
    router.push({
      pathname: '/(tabs)/workout',
      params: { newRoutine: JSON.stringify(newRoutine) },
    });
  };

  const discardChanges = () => {
    setRoutineName('');
    setExercises([]);
    setRoutineNameError(null);
  };

  return (
    <ScrollView ref={scrollViewRef} style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.section}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background,  color: colors.text, fontSize: 22, borderColor: routineNameError ? 'red' : colors.tabIconDefault }]}
          placeholder="Routine Name"
          placeholderTextColor={colors.secondary}
          value={routineName}
          onChangeText={(text) => {
            setRoutineName(text);
            if (routineNameError) setRoutineNameError(null);
          }}
        />
        {routineNameError && <ThemedText style={styles.errorText}>{routineNameError}</ThemedText>}

        {exercises.map((exercise, exIndex) => (
          <ThemedView key={exercise.id!} style={[styles.exerciseContainer, { borderColor: colors.tabIconDefault }]}>
            <View style={styles.exerciseHeader}>
              <TextInput
                style={[styles.exerciseInput, { flex: 1, backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
                placeholder={`Exercise ${exIndex + 1} Name`}
                placeholderTextColor={colors.secondary}
                value={exercise.name}
                onChangeText={(name) => handleExerciseChange(exercise.id!, name)}
              />
              <TouchableOpacity onPress={() => removeExercise(exercise.id!)} style={styles.removeButton}>
                  <IconSymbol name="xmark.circle" size={20} color={colors.text} />
                </TouchableOpacity>
            </View>

            {exercise.sets.map((set, setIndex) => (
              <View key={setIndex} style={styles.setContainer}>
                <ThemedText style={{ color: colors.text, marginRight: 8 }}>Set {setIndex + 1}</ThemedText>
                <TextInput
                  style={[styles.setInput, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
                  placeholder="Weight (kg)"
                  placeholderTextColor={colors.secondary}
                  keyboardType="numeric"
                  value={set.weight}
                  onChangeText={(val) => handleSetChange(exercise.id!, setIndex, 'weight', val)}
                />
                <TextInput
                  style={[styles.setInput, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
                  placeholder="Reps"
                  placeholderTextColor={colors.secondary}
                  keyboardType="numeric"
                  value={set.reps}
                  onChangeText={(val) => handleSetChange(exercise.id!, setIndex, 'reps', val)}
                />
                <TouchableOpacity onPress={() => removeSet(exercise.id!, setIndex)} style={styles.removeSetButton}>
                  <IconSymbol name="xmark.circle" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            ))}
            <Button title="Add Set" onPress={() => addSet(exercise.id!)} />
          </ThemedView>
        ))}

        <Button title="Add Exercise" onPress={() => router.push({
          pathname: '/(tabs)/select-exercise',
          params: { currentRoutineExercises: JSON.stringify(exercises) },
        })} />

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.tint, marginTop: 24 }]}
          onPress={saveRoutine}
        >
          <ThemedText style={{ color: colors.background, fontWeight: 'bold' }}>Save Routine</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.discardButton, { borderColor: "red", marginTop: 12 }]}
          onPress={discardChanges}
        >
          <ThemedText style={{ color: "red", fontWeight: 'bold' }}>Discard Changes</ThemedText>
        </TouchableOpacity>
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
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  exerciseContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  removeButton: {
    padding: 8,
  },
  setContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  // ...existing code...
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontSize: 14,
  },
});