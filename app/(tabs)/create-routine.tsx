
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 20) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '..';
  }
  return text;
};

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
  const [showDropdownForExercise, setShowDropdownForExercise] = useState<number | null>(null);

  const handleExerciseOptionsPress = (index: number) => {
    setShowDropdownForExercise(showDropdownForExercise === index ? null : index);
  };

  const deleteExercise = (index: number) => {
    setExercises((prevExercises) => prevExercises.filter((_, i) => i !== index));
    setShowDropdownForExercise(null);
  };

  const replaceExercise = (index: number) => {
    router.push({
      pathname: '/(tabs)/select-exercise',
      params: {
        currentRoutineExercises: JSON.stringify(exercises),
        callingPage: 'create-routine',
        replaceIndex: index,
      },
    });
    setShowDropdownForExercise(null);
  };


  useFocusEffect(
    React.useCallback(() => {
      const existingRoutine: Routine | null = params.routine ? JSON.parse(params.routine as string) : null;
      const newSelectedExercises: Exercise[] = params.selectedExercises ? JSON.parse(params.selectedExercises as string) : [];
      const replaceIndex: number | undefined = params.replaceIndex ? parseInt(params.replaceIndex as string, 10) : undefined;


      if (existingRoutine) {
        setRoutineName(existingRoutine.name);
        setExercises(existingRoutine.exercises);
        setCurrentRoutineId(existingRoutine.id);
      } else if (newSelectedExercises.length > 0) {
        setExercises((prevExercises) => {
          const updatedExercises = [...prevExercises];
          if (replaceIndex !== undefined && newSelectedExercises.length > 0) {
            updatedExercises[replaceIndex] = { ...newSelectedExercises[0], sets: [{ weight: '', reps: '' }, { weight: '', reps: '' }] };
          } else {
            updatedExercises.push(
              ...newSelectedExercises.map((ex) => ({
                ...ex,
                sets: [{ weight: '', reps: '' }, { weight: '', reps: '' }], // Initialize with two empty sets
                images: ex.images, // Preserve images property
              }))
            );
          }
          return updatedExercises;
        });
        router.setParams({ selectedExercises: undefined, replaceIndex: undefined });
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

  const handleExercisePress = (exercise: Exercise) => {
    router.push({
      pathname: '/(tabs)/exercise-details',
      params: { exerciseId: exercise.id, exerciseName: exercise.name },
    });
  };

  const EXERCISES_DATA = require('@/assets/data/exercises.json');

  const getExerciseDetails = (exerciseName: string): Exercise | undefined => {
    return EXERCISES_DATA.find((ex: Exercise) => ex.name === exerciseName);
  };

  return (
    <ScrollView ref={scrollViewRef} style={[styles.container, { backgroundColor: 'transparent' }]}>
      <ThemedView style={[styles.section, { backgroundColor: 'transparent' }]}>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={() => handleExercisePress(exercise)} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Image
                  source={exercise.images && exercise.images.length > 0
                    ? { uri: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${exercise.images[0]}` }
                    : require('../../assets/images/exersiseplaceholder.png')
                  }
                  style={styles.exerciseImage}
                />
                <ThemedText type="defaultSemiBold" style={{ color: colors.text, marginBottom: 4, fontSize: 20, flex: 1 }} numberOfLines={1} ellipsizeMode="tail">
                  {exIndex + 1}. {truncateText(exercise.name)}
                </ThemedText>
              </TouchableOpacity>

              <View>
                <TouchableOpacity onPress={() => handleExerciseOptionsPress(exIndex)} style={{ padding: 8 }}>
                  <IconSymbol name="ellipsis" size={24} color={colors.text} />
                </TouchableOpacity>
                {showDropdownForExercise === exIndex && (
                  <View style={[styles.dropdownMenu, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
                    <TouchableOpacity onPress={() => deleteExercise(exIndex)} style={styles.dropdownItem}>
                      <ThemedText style={{ color: colors.text }}>Delete Exercise</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => replaceExercise(exIndex)} style={[styles.dropdownItem, styles.lastDropdownItem]}>
                      <ThemedText style={{ color: colors.text }}>Replace Exercise</ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
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

        <TouchableOpacity
          style={[styles.addExerciseButton, { backgroundColor: colors.tint, marginTop: 12, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 15, alignItems: 'center' }]}
          onPress={() => router.push({
            pathname: '/(tabs)/select-exercise',
            params: { currentRoutineExercises: JSON.stringify(exercises) },
          })}
        >
          <ThemedText style={{ color: colors.background, fontWeight: 'bold' }}>Add Exercise</ThemedText>
        </TouchableOpacity>

        {exercises.length > 0 && (
          <>
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
          </>
        )}
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
  exerciseImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 5,
  },
  removeButton: {
    padding: 8,
  },
  dropdownMenu: {
    position: 'absolute',
    right: 0,
    top: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    width: 180,
    flexDirection: 'column',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  lastDropdownItem: {
    borderBottomWidth: 0,
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
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontSize: 14,
  },
  addExerciseButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
});
