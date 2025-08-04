
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLocalSearchParams, useRouter, useNavigation, useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface Set {
  weight: string;
  reps: string;
}

interface Exercise {
  name: string;
  sets: Set[];
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
  const navigation = useNavigation();
  const [routineName, setRoutineName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentRoutineId, setCurrentRoutineId] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const existingRoutine: Routine | null = params.routine ? JSON.parse(params.routine as string) : null;
      if (existingRoutine) {
        setRoutineName(existingRoutine.name);
        setExercises(existingRoutine.exercises);
        setCurrentRoutineId(existingRoutine.id);
      } else {
        setRoutineName('');
        setExercises([]);
        setCurrentRoutineId(null);
      }
      navigation.setOptions({ title: existingRoutine ? 'Edit Routine' : 'Create Routine' });
    }, [params.routine, navigation])
  );

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: [{ weight: '', reps: '' }] }]);
  };

  const handleExerciseChange = (index: number, name: string) => {
    const newExercises = [...exercises];
    newExercises[index].name = name;
    setExercises(newExercises);
  };

  const handleSetChange = (exIndex: number, setIndex: number, field: keyof Set, value: string) => {
    const newExercises = [...exercises];
    newExercises[exIndex].sets[setIndex][field] = value;
    setExercises(newExercises);
  };

  const addSet = (exIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exIndex].sets.push({ weight: '', reps: '' });
    setExercises(newExercises);
  };

  const removeSet = (exIndex: number, setIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exIndex].sets.splice(setIndex, 1);
    setExercises(newExercises);
  };

  const removeExercise = (exIndex: number) => {
    const newExercises = [...exercises];
    newExercises.splice(exIndex, 1);
    setExercises(newExercises);
  };

  const saveRoutine = () => {
    if (!routineName.trim()) {
      Alert.alert('Missing Routine Name', 'Please enter a name for your routine.');
      return;
    }

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
    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.section}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background,  color: colors.text, fontSize: 22 }]}
          placeholder="Routine Name"
          placeholderTextColor={colors.secondary}
          value={routineName}
          onChangeText={setRoutineName}
        />

        {exercises.map((exercise, exIndex) => (
          <ThemedView key={exIndex} style={[styles.exerciseContainer, { borderColor: colors.tabIconDefault }]}>
            <View style={styles.exerciseHeader}>
              <TextInput
                style={[styles.exerciseInput, { flex: 1, backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
                placeholder={`Exercise ${exIndex + 1} Name`}
                placeholderTextColor={colors.secondary}
                value={exercise.name}
                onChangeText={(name) => handleExerciseChange(exIndex, name)}
              />
              <TouchableOpacity onPress={() => removeExercise(exIndex)} style={styles.removeButton}>
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
                  onChangeText={(val) => handleSetChange(exIndex, setIndex, 'weight', val)}
                />
                <TextInput
                  style={[styles.setInput, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
                  placeholder="Reps"
                  placeholderTextColor={colors.secondary}
                  keyboardType="numeric"
                  value={set.reps}
                  onChangeText={(val) => handleSetChange(exIndex, setIndex, 'reps', val)}
                />
                <TouchableOpacity onPress={() => removeSet(exIndex, setIndex)} style={styles.removeSetButton}>
                  <IconSymbol name="xmark.circle" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            ))}
            <Button title="Add Set" onPress={() => addSet(exIndex)} />
          </ThemedView>
        ))}

        <Button title="Add Exercise" onPress={addExercise} />

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.tint, marginTop: 24 }]}
          onPress={saveRoutine}
          disabled={!routineName.trim() || exercises.length === 0}
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
});
        