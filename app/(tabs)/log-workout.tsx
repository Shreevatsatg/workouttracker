
import RestTimer from '@/components/RestTimer';
import RestTimerNotification from '@/components/RestTimerNotification';
import RestTimerSelector from '@/components/RestTimerSelector';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useWorkout } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, Vibration, View } from 'react-native';
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
  restTime?: number;
  images?: string[];
  id?: string;
}



export default function LogWorkoutScreen() {
  // Helper to truncate long exercise names
  const getDisplayExerciseName = (name?: string, maxLength = 24) => {
    if (!name) return '';
    return name.length > maxLength ? name.slice(0, maxLength - 1) + '…' : name;
  };
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const router = useRouter();
  const {
    activeRoutine,
    loggedExercises,
    discardWorkout,
    updateLoggedExercises,
  } = useWorkout();

  // Rest timer state
  const [restTimerSelectorVisible, setRestTimerSelectorVisible] = useState(false);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number | null>(null);
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [restTimerRemaining, setRestTimerRemaining] = useState(0);
  const restTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    router.push({
      pathname: '/(tabs)/select-exercise',
      params: { currentLoggedExercises: JSON.stringify(loggedExercises), callingPage: 'log-workout' },
    });
  };

  const toggleSetCompletion = (exIndex: number, setIndex: number) => {
    const newLoggedExercises = [...loggedExercises];
    const wasCompleted = newLoggedExercises[exIndex].loggedSets[setIndex].completed;
    newLoggedExercises[exIndex].loggedSets[setIndex].completed = !wasCompleted;
    updateLoggedExercises(newLoggedExercises);

    // Start rest timer if set was just completed and rest time is set
    if (!wasCompleted && newLoggedExercises[exIndex].restTime && newLoggedExercises[exIndex].restTime! > 0) {
      startRestTimer(newLoggedExercises[exIndex].restTime!);
    }
  };

  // Rest timer functions
  const triggerTimerEndFeedback = async () => {
    try {
      // Try to use Expo Haptics first (more sophisticated feedback)
      if (Haptics.notificationAsync) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      // Fallback to React Native Vibration
      try {
        Vibration.vibrate([0, 200, 100, 200, 100, 200]); // Pattern: pause, vibrate, pause, vibrate, pause, vibrate
      } catch {
        console.log('Vibration not supported on this device');
      }
    }
  };

  const startRestTimer = (seconds: number) => {
    // Clear any existing timer first
    if (restTimerIntervalRef.current) {
      clearInterval(restTimerIntervalRef.current);
      restTimerIntervalRef.current = null;
    }
    
    setRestTimerActive(true);
    setRestTimerRemaining(seconds);
    
    restTimerIntervalRef.current = setInterval(() => {
      setRestTimerRemaining((prev) => {
        if (prev <= 1) {
          if (restTimerIntervalRef.current) {
            clearInterval(restTimerIntervalRef.current);
            restTimerIntervalRef.current = null;
          }
          // Trigger vibration/haptic feedback when timer ends
          triggerTimerEndFeedback();
          // Hide the timer after 1 second
          setTimeout(() => setRestTimerActive(false), 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const adjustRestTimer = (adjustment: number) => {
    setRestTimerRemaining((prev) => Math.max(0, prev + adjustment));
  };

  const skipRestTimer = () => {
    setRestTimerActive(false);
    setRestTimerRemaining(0);
    if (restTimerIntervalRef.current) {
      clearInterval(restTimerIntervalRef.current);
      restTimerIntervalRef.current = null;
    }
  };

  const openRestTimerSelector = (exerciseIndex: number) => {
    setSelectedExerciseIndex(exerciseIndex);
    setRestTimerSelectorVisible(true);
  };

  

  const handleExercisePress = (exercise: Exercise) => {
    router.push({
      pathname: '/(tabs)/exercise-details',
      params: { exerciseId: exercise.id, exerciseName: exercise.name },
    });
  };

  const [showDropdownForExercise, setShowDropdownForExercise] = useState<number | null>(null);

  const handleExerciseOptionsPress = (index: number) => {
    setShowDropdownForExercise(showDropdownForExercise === index ? null : index);
  };

  const deleteExercise = (index: number) => {
    const newLoggedExercises = loggedExercises.filter((_, i) => i !== index);
    updateLoggedExercises(newLoggedExercises);
    setShowDropdownForExercise(null);
  };

  const replaceExercise = (index: number) => {
    router.push({
      pathname: '/(tabs)/select-exercise',
      params: {
        currentLoggedExercises: JSON.stringify(loggedExercises),
        callingPage: 'log-workout',
        replaceIndex: index,
      },
    });
    setShowDropdownForExercise(null);
  };

  const handleRestTimeSelect = (time: number) => {
    if (selectedExerciseIndex !== null) {
      const newLoggedExercises = [...loggedExercises];
      newLoggedExercises[selectedExerciseIndex].restTime = time;
      updateLoggedExercises(newLoggedExercises);
    }
    setRestTimerSelectorVisible(false);
    setSelectedExerciseIndex(null);
  };

  

  useEffect(() => {
    if (params.selectedExercises) {
      const newSelectedExercises = JSON.parse(params.selectedExercises as string);
      const exercisesToAdd = newSelectedExercises.map((ex: Exercise) => ({
        ...ex,
        loggedSets: [{ weight: '', reps: '', loggedWeight: '', loggedReps: '', completed: false }],
      }));


      if (params.replaceIndex !== undefined && params.replaceIndex !== null) {
        const indexToReplace = parseInt(params.replaceIndex as string, 10);
        const updatedExercises = [...loggedExercises];
        updatedExercises[indexToReplace] = exercisesToAdd[0]; // Assuming only one exercise is selected for replacement
        updateLoggedExercises(updatedExercises);
      } else {
        updateLoggedExercises([...loggedExercises, ...exercisesToAdd]);
      }
      router.setParams({ selectedExercises: undefined, replaceIndex: undefined });
    }
  }, [params.selectedExercises, params.replaceIndex, loggedExercises, router, updateLoggedExercises]);

  // Clean up rest timer on unmount
  useEffect(() => {
    return () => {
      if (restTimerIntervalRef.current) {
        clearInterval(restTimerIntervalRef.current);
      }
    };
  }, []);

  

  

  return (
    <>
      {/* Rest Timer Notification */}
      <RestTimerNotification
        visible={restTimerActive}
        remainingTime={restTimerRemaining}
        onAdjustTime={adjustRestTimer}
        onSkip={skipRestTimer}
      />
      
      <ScrollView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <ThemedView style={[styles.header ,{backgroundColor:'transparent'}]}>
          <ThemedText type="title" style={{ color: colors.tint }}>{activeRoutine && activeRoutine.name ? activeRoutine.name : 'Workout'}</ThemedText>
        </ThemedView>

      <ThemedView style={[styles.section, { backgroundColor: 'transparent' }]}>
        <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 16 }}>Exercises:</ThemedText>
        {loggedExercises.length === 0 ? (
          <ThemedView style={{ alignItems: 'center', backgroundColor: 'transparent' }}>
            <ThemedText style={{ color: colors.secondary, marginBottom: 16 }}>No exercises in this routine.</ThemedText>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint, marginTop: 12, width: '100%' }]} onPress={addLoggedExercise}>
              <IconSymbol name="plus.circle" size={20} color={colors.background} />
              <ThemedText style={[styles.buttonText, { color: colors.background }]}>Add Exercise</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <>
            {loggedExercises.map((exercise, exIndex) => (
              <ThemedView key={exIndex} style={[styles.exerciseCard,{backgroundColor:'transparent'}, { borderColor: colors.tabIconDefault }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <TouchableOpacity onPress={() => handleExercisePress(exercise)} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Image
                      source={exercise.images && exercise.images.length > 0
                        ? { uri: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${exercise.images[0]}` }
                        : require('../../assets/images/exersiseplaceholder.png')
                      }
                      style={styles.exerciseImage}
                    />
                    <ThemedText type="defaultSemiBold" style={{ color: colors.text, marginBottom: 4, fontSize: 20 }}>
                      {exIndex + 1}. {getDisplayExerciseName(exercise.name)}
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
                <RestTimer 
                  restTime={exercise.restTime || 0} 
                  onPress={() => openRestTimerSelector(exIndex)} 
                />
                <ThemedView style={[ styles.headerRow]}>
                  <ThemedText style={[styles.headerText, styles.setColumn, { color: colors.text }]}>Set</ThemedText>
                  <ThemedText style={[styles.headerText, styles.prevColumn, { color: colors.text }]}>Prev</ThemedText>
                  <ThemedText style={[styles.headerText, styles.kgRepsColumn, { color: colors.text }]}>kg</ThemedText>
                  <ThemedText style={[styles.headerText, styles.kgRepsColumn, { color: colors.text }]}>Reps</ThemedText>
                  <ThemedText style={[styles.headerText, styles.checkmarkColumn, { color: colors.text }]}></ThemedText>
                </ThemedView>
                {exercise.loggedSets.map((set, setIndex) => (
                  <ThemedView key={setIndex} style={[styles.setRow, { backgroundColor: set.completed ? colors.success : colors.background }]}> 
                    <ThemedText style={[styles.cellText, styles.setColumn, { color: colors.text }]}>{setIndex + 1}</ThemedText>
                    <ThemedText style={[styles.cellText, styles.prevColumn, { color: colors.text }]}>-</ThemedText>
                    <TextInput
                      style={[styles.setInput, styles.kgRepsColumn, { color: colors.text }]}
                      placeholder={set.weight}
                      placeholderTextColor={colors.secondary}
                      keyboardType="numeric"
                      value={set.loggedWeight}
                      onChangeText={(val) => handleLoggedSetChange(exIndex, setIndex, 'loggedWeight', val)}
                    />
                    <TextInput
                      style={[styles.setInput, styles.kgRepsColumn, { color: colors.text }]}
                      placeholder={set.reps}
                      placeholderTextColor={colors.secondary}
                      keyboardType="numeric"
                      value={set.loggedReps}
                      onChangeText={(val) => handleLoggedSetChange(exIndex, setIndex, 'loggedReps', val)}
                    />
                    <TouchableOpacity style={styles.checkmarkColumn} onPress={() => toggleSetCompletion(exIndex, setIndex)}>
                      <IconSymbol
                        name={set.completed ? "checkmark.circle.fill" : "circle"}
                        size={28}
                        color={set.completed ? colors.tint : colors.tint}
                      />
                    </TouchableOpacity>
                  </ThemedView>
                ))}
                <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint, marginTop: 12 }]} onPress={() => addLoggedSet(exIndex)}>
                    <ThemedText style={[styles.buttonText, { color: colors.background }]}>+Add Set</ThemedText>
                  </TouchableOpacity>
              </ThemedView>
            ))}
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint, marginTop: 12 }]} onPress={addLoggedExercise}>
              <ThemedText style={[styles.buttonText, { color: colors.background }]}>+Add Exercise</ThemedText>
            </TouchableOpacity>
          </>
        )}
      </ThemedView>
        <TouchableOpacity style={[styles.button, { backgroundColor: "#f87171", marginTop: 10 }]} onPress={() => { discardWorkout(); router.push('/(tabs)/workout'); }}>
          <ThemedText style={[styles.buttonText, { color: colors.background }]}>Discard Workout</ThemedText>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Rest Timer Selector Modal */}
      <RestTimerSelector
        visible={restTimerSelectorVisible}
        currentTime={selectedExerciseIndex !== null ? loggedExercises[selectedExerciseIndex]?.restTime || 0 : 0}
        onSelect={handleRestTimeSelect}
        onClose={() => setRestTimerSelectorVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 70,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderColor: '#ccc',
    marginTop:10,
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
  exerciseImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 5,
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
    width: 180, // Added a fixed width
    flexDirection: 'column', // Explicitly set to column
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%', // Ensure item takes full width of menu
  },
  lastDropdownItem: {
    borderBottomWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
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
    padding: 6,
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
