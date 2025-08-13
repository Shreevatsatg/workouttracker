import RestTimer from '@/components/RestTimer';
import RestTimerNotification from '@/components/RestTimerNotification';
import RestTimerSelector from '@/components/RestTimerSelector';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import ConfirmationModal from '@/components/ConfirmationModal';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useWorkout } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, PanResponder, ScrollView, StyleSheet, TextInput, TouchableOpacity, Vibration, View } from 'react-native';

interface Set {
  weight: string;
  reps: string;
  loggedWeight?: string;
  loggedReps?: string;
  completed: boolean;
  id?: string;
}

interface Exercise {
  name: string;
  sets: Set[];
  loggedSets: Set[];
  restTime?: number;
  images?: string[];
  id?: string;
}

// SwipeableSetRow component for individual set rows with swipe functionality
const SwipeableSetRow = ({ 
  set, 
  setIndex, 
  exIndex, 
  colors, 
  handleLoggedSetChange, 
  toggleSetCompletion,
  deleteSet,
  totalSets,
  setId,
  previousSet,
  showValidationIndicator
}: {
  set: Set;
  setIndex: number;
  exIndex: number;
  colors: any;
  handleLoggedSetChange: (exIndex: number, setIndex: number, field: 'loggedWeight' | 'loggedReps', value: string) => void;
  toggleSetCompletion: (exIndex: number, setIndex: number) => void;
  deleteSet: (exIndex: number, setIndex: number, setId: string) => void;
  totalSets: number;
  setId: string;
  previousSet?: Set;
  showValidationIndicator: boolean;
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isDeleting, setIsDeleting] = useState(false);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to horizontal swipes and only if there's more than one set
      return totalSets > 1 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
    },
    onPanResponderGrant: () => {
      // Set the initial value for the animation
      translateX.setOffset(translateX._value);
    },
    onPanResponderMove: (evt, gestureState) => {
      // Only allow left swipes (negative dx)
      if (gestureState.dx < 0) {
        translateX.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      translateX.flattenOffset();
      
      if (gestureState.dx < -80) {
        // Swipe threshold reached - show delete button
        Animated.timing(translateX, {
          toValue: -80,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        // Return to original position
        Animated.timing(translateX, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleDelete = () => {
    setIsDeleting(true);
    Animated.timing(translateX, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start((finished) => {
      if (finished) {
        deleteSet(exIndex, setIndex, setId);
      }
    });
  };

  const resetPosition = () => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Check if set has empty values but user is trying to complete it
  const isEmpty = !set.loggedWeight?.trim() && !set.loggedReps?.trim();
  const hasValidationError = showValidationIndicator && isEmpty && !set.completed;

  return (
    <View style={styles.swipeableContainer}>
      {/* Delete button behind the row - only show if there's more than one set */}
      {totalSets > 1 && (
        <View style={[styles.deleteButtonContainer, { backgroundColor: '#ff4444' }]}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <IconSymbol name="trash" size={20} color="white" />
            <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Main set row */}
      <Animated.View
        style={[
          styles.setRow,
          {
            backgroundColor: set.completed ? colors.success : colors.background,
            borderColor: hasValidationError ? '#ff4444' : colors.tabIconDefault,
            borderWidth: hasValidationError ? 2 : 1,
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          style={styles.resetTouchArea}
          onPress={resetPosition}
          activeOpacity={1}
        >
          <View style={styles.setRowContent}>
            <ThemedText style={[styles.cellText, styles.setColumn, { color: colors.text }]}>
              {setIndex + 1}
            </ThemedText>
            <ThemedText style={[styles.cellText, styles.prevColumn, { color: colors.text }]}>
              {previousSet ? `${previousSet.loggedWeight || previousSet.weight || '-'}x${previousSet.loggedReps || previousSet.reps || '-'}` : '-'}
            </ThemedText>
            <TextInput
              style={[
                styles.setInput, 
                styles.kgRepsColumn, 
                { 
                  color: colors.text,
                  borderColor: hasValidationError ? '#ff4444' : 'transparent',
                  borderWidth: hasValidationError ? 1 : 0,
                }
              ]}
              placeholder={set.weight}
              placeholderTextColor={colors.secondary}
              keyboardType="numeric"
              value={set.loggedWeight}
              onChangeText={(val) => handleLoggedSetChange(exIndex, setIndex, 'loggedWeight', val)}
            />
            <TextInput
              style={[
                styles.setInput, 
                styles.kgRepsColumn, 
                { 
                  color: colors.text,
                  borderColor: hasValidationError ? '#ff4444' : 'transparent',
                  borderWidth: hasValidationError ? 1 : 0,
                }
              ]}
              placeholder={set.reps}
              placeholderTextColor={colors.secondary}
              keyboardType="numeric"
              value={set.loggedReps}
              onChangeText={(val) => handleLoggedSetChange(exIndex, setIndex, 'loggedReps', val)}
            />
            <TouchableOpacity 
              style={styles.checkmarkColumn} 
              onPress={() => toggleSetCompletion(exIndex, setIndex)}
            >
              {hasValidationError && (
                <View style={styles.warningIndicator}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#ff4444" />
                </View>
              )}
              <IconSymbol
                name={set.completed ? "checkmark.circle.fill" : "circle"}
                size={28}
                color={set.completed ? colors.tint : colors.tint}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

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
  const navigation = useNavigation();
  const {
    activeRoutine,
    loggedExercises,
    discardWorkout,
    updateLoggedExercises,
    pauseWorkout,
    saveWorkout,
    workoutTime,
    lastCompletedWorkout,
    clearLastCompletedWorkout,
    updateWorkoutTime,
    loadWorkout,
  } = useWorkout();

  const [showEmptySetsWarning, setShowEmptySetsWarning] = useState(false);
  const [emptySetsWarningMessage, setEmptySetsWarningMessage] = useState('');
  const [showEmptyWorkoutModal, setShowEmptyWorkoutModal] = useState(false);
  const [showValidationIndicators, setShowValidationIndicators] = useState(false);
  const [isProcessingFinish, setIsProcessingFinish] = useState(false);

  // Get previous workout data for each exercise (mock function - you'll need to implement based on your data structure)
  const getPreviousSetData = (exerciseIndex: number, setIndex: number): Set | undefined => {
    // This should return the previous workout data for the same exercise and set
    // For now, returning undefined - you'll need to implement this based on your workout history
    return undefined;
  };

  const handleFinishWorkout = useCallback(() => {
    if (isProcessingFinish) return; // Prevent double-clicks
    
    console.log('Finish workout clicked'); // Debug log
    setIsProcessingFinish(true);
    
    // Check if workout is completely empty (no completed sets)
    const hasAnyCompletedSets = loggedExercises.some(exercise => 
      exercise.loggedSets.some(set => set.completed)
    );

    console.log('Has any completed sets:', hasAnyCompletedSets); // Debug log

    if (!hasAnyCompletedSets) {
      console.log('Showing empty workout modal'); // Debug log
      setShowEmptyWorkoutModal(true);
      setIsProcessingFinish(false);
      return;
    }

    // Check for validation issues
    let hasEmptySets = false;
    let hasIncompleteExercises = false;
    const exercisesWithEmptySets: string[] = [];
    const exercisesWithNoCompletedSets: string[] = [];

    loggedExercises.forEach(exercise => {
      let hasAnyCompletedSetInExercise = false;
      
      exercise.loggedSets.forEach(set => {
        if (set.completed) {
          hasAnyCompletedSetInExercise = true;
          // Check if completed set has empty weight OR reps
          const emptyWeight = !set.loggedWeight || set.loggedWeight.trim() === '';
          const emptyReps = !set.loggedReps || set.loggedReps.trim() === '';
          
          if (emptyWeight || emptyReps) {
            hasEmptySets = true;
            if (!exercisesWithEmptySets.includes(exercise.name)) {
              exercisesWithEmptySets.push(exercise.name);
            }
          }
        }
      });

      // Check for exercises with no completed sets
      if (!hasAnyCompletedSetInExercise && exercise.loggedSets.length > 0) {
        hasIncompleteExercises = true;
        exercisesWithNoCompletedSets.push(exercise.name);
      }
    });

    console.log('Has empty sets:', hasEmptySets); // Debug log
    console.log('Has incomplete exercises:', hasIncompleteExercises); // Debug log

    // Show validation indicators for empty sets
    if (hasEmptySets) {
      setShowValidationIndicators(true);
    }

    // Determine if we need to show warning
    const needsWarning = hasEmptySets || hasIncompleteExercises;

    if (needsWarning) {
      let warningMessage = '';
      
      if (hasEmptySets) {
        warningMessage += `You have completed sets with missing weight or reps in: ${exercisesWithEmptySets.join(', ')}.\n\n`;
      }

      if (hasIncompleteExercises) {
        warningMessage += `The following exercises have no completed sets: ${exercisesWithNoCompletedSets.join(', ')}.\n\n`;
      }

      warningMessage += `Do you want to finish the workout anyway?`;
      
      console.log('Showing warning modal with message:', warningMessage); // Debug log
      setEmptySetsWarningMessage(warningMessage);
      setShowEmptySetsWarning(true);
      setIsProcessingFinish(false);
    } else {
      console.log('All good, finishing workout'); // Debug log
      // All validation passed, finish workout directly
      finishWorkout();
    }
  }, [loggedExercises, workoutTime, activeRoutine, router, saveWorkout, isProcessingFinish]);

  const finishWorkout = () => {
    console.log('Actually finishing workout'); // Debug log
    pauseWorkout();
    router.push({
      pathname: '/workout-summary',
      params: {
        workoutData: JSON.stringify({
          name: activeRoutine?.name || 'Custom Workout',
          exercises: loggedExercises,
        }),
        workoutDuration: workoutTime,
      },
    });
  };

  const handleEmptyWorkoutDiscard = () => {
    console.log('Discarding empty workout'); // Debug log
    setShowEmptyWorkoutModal(false);
    discardWorkout();
    router.push('/(tabs)/workout');
  };

  const handleEmptyWorkoutFinish = () => {
    console.log('Finishing empty workout'); // Debug log
    setShowEmptyWorkoutModal(false);
    finishWorkout();
  };

  const handleWarningConfirm = () => {
    console.log('User confirmed to finish with warnings'); // Debug log
    setShowEmptySetsWarning(false);
    setShowValidationIndicators(false);
    finishWorkout();
  };

  const handleWarningCancel = () => {
    console.log('User cancelled finish'); // Debug log
    setShowEmptySetsWarning(false);
    setShowValidationIndicators(false);
  };

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity 
            onPress={handleFinishWorkout}
            style={{
              backgroundColor: colors.accent,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              marginRight: 10,
            }}
          >
            <ThemedText style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Finish</ThemedText>
          </TouchableOpacity>
        ),
      });
    }, [navigation, handleFinishWorkout, colors.accent])
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        // This will run when the screen blurs (loses focus)
        pauseWorkout();
      };
    }, [pauseWorkout])
  );

  // --- New Metric Calculations ---
  const totalVolume = useMemo(() => {
    return loggedExercises.reduce((acc, exercise) => {
      return acc + exercise.loggedSets.reduce((setAcc, set) => {
        if (set.completed) {
          const weight = Number(set.loggedWeight || set.weight || 0);
          const reps = Number(set.loggedReps || set.reps || 0);
          return setAcc + (weight * reps);
        }
        return setAcc;
      }, 0);
    }, 0);
  }, [loggedExercises]);

  const setsPerformed = useMemo(() => {
    return loggedExercises.reduce((acc, exercise) => {
      return acc + exercise.loggedSets.filter(set => set.completed).length;
    }, 0);
  }, [loggedExercises]);

  const totalPlannedSets = useMemo(() => {
    return loggedExercises.reduce((acc, exercise) => {
      return acc + exercise.loggedSets.length;
    }, 0);
  }, [loggedExercises]);

  const progressPercentage = useMemo(() => {
    if (totalPlannedSets === 0) return 0;
    return Math.round((setsPerformed / totalPlannedSets) * 100);
  }, [setsPerformed, totalPlannedSets]);
  // --- End New Metric Calculations ---

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
    
    // Hide validation indicators when user starts typing
    if (showValidationIndicators) {
      setShowValidationIndicators(false);
    }
  };

  const addLoggedSet = (exIndex: number) => {
    const newLoggedExercises = [...loggedExercises];
    const newSet = { 
      weight: '', 
      reps: '', 
      loggedWeight: '', 
      loggedReps: '', 
      completed: false,
      id: `${Date.now()}-${Math.random()}` // Generate unique ID
    };
    newLoggedExercises[exIndex].loggedSets.push(newSet);
    updateLoggedExercises(newLoggedExercises);
  };

  const deleteSet = (exIndex: number, setIndex: number, setId: string) => {
    const newLoggedExercises = [...loggedExercises];
    // Only allow deletion if there's more than one set
    if (newLoggedExercises[exIndex].loggedSets.length > 1) {
      // Find the set by ID instead of index to ensure we delete the right one
      const setToDeleteIndex = newLoggedExercises[exIndex].loggedSets.findIndex(set => set.id === setId);
      if (setToDeleteIndex !== -1) {
        newLoggedExercises[exIndex].loggedSets.splice(setToDeleteIndex, 1);
        updateLoggedExercises(newLoggedExercises);
      }
    } else {
      // If it's the last set, show some feedback that it can't be deleted
      console.log('Cannot delete the last set');
    }
  };

  const addLoggedExercise = () => {
    router.push({
      pathname: '/(tabs)/select-exercise',
      params: { currentLoggedExercises: JSON.stringify(loggedExercises), callingPage: 'log-workout' },
    });
  };

  const toggleSetCompletion = (exIndex: number, setIndex: number) => {
    const newLoggedExercises = [...loggedExercises];
    const currentSet = newLoggedExercises[exIndex].loggedSets[setIndex];
    const wasCompleted = currentSet.completed;

    // If trying to complete a set with empty values, use previous values or show indicator
    if (!wasCompleted) {
      const isEmpty = !currentSet.loggedWeight?.trim() && !currentSet.loggedReps?.trim();
      
      if (isEmpty) {
        // Try to get previous set data
        const previousSet = getPreviousSetData(exIndex, setIndex);
        
        if (previousSet && (previousSet.loggedWeight || previousSet.loggedReps)) {
          // Use previous values
          currentSet.loggedWeight = previousSet.loggedWeight || previousSet.weight || '';
          currentSet.loggedReps = previousSet.loggedReps || previousSet.reps || '';
          currentSet.completed = true;
        } else {
          // Show validation indicator and don't complete the set
          setShowValidationIndicators(true);
          
          // Show a brief alert to guide the user
          Alert.alert(
            "Missing Values", 
            "Please enter weight and reps before completing the set.", 
            [{ text: "OK" }],
            { cancelable: true }
          );
          return;
        }
      } else {
        // Set has values, complete it normally
        currentSet.completed = true;
      }
    } else {
      // Uncompleting a set
      currentSet.completed = false;
    }

    updateLoggedExercises(newLoggedExercises);

    // Start rest timer if set was just completed and rest time is set
    if (!wasCompleted && currentSet.completed && newLoggedExercises[exIndex].restTime && newLoggedExercises[exIndex].restTime! > 0) {
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
    if (lastCompletedWorkout) {
      loadWorkout(lastCompletedWorkout);
      clearLastCompletedWorkout();
    } else if (params.selectedExercises) {
      const newSelectedExercises = JSON.parse(params.selectedExercises as string);
      const exercisesToAdd = newSelectedExercises.map((ex: Exercise) => ({
        ...ex,
        loggedSets: [{ 
          weight: '', 
          reps: '', 
          loggedWeight: '', 
          loggedReps: '', 
          completed: false,
          id: `${Date.now()}-${Math.random()}`
        }],
      }));

      if (params.replaceIndex !== undefined && params.replaceIndex !== null) {
        const indexToReplace = parseInt(params.replaceIndex as string, 10);
        const updatedExercises = [...loggedExercises];
        updatedExercises[indexToReplace] = exercisesToAdd[0]; // Assuming only one exercise is selected for replacement
        startWorkout({ exercises: updatedExercises }); // Use startWorkout
      } else {
        startWorkout({ exercises: [...loggedExercises, ...exercisesToAdd] }); // Use startWorkout
      }
      router.setParams({ selectedExercises: undefined, replaceIndex: undefined });
    }
  }, [params.selectedExercises, params.replaceIndex, loggedExercises, router, updateLoggedExercises, lastCompletedWorkout, clearLastCompletedWorkout, loadWorkout]);

  // Clean up rest timer and pause workout on unmount
  useEffect(() => {
    return () => {
      if (restTimerIntervalRef.current) {
        clearInterval(restTimerIntervalRef.current);
      }
      // Pause the workout when leaving the log-workout page
      // pauseWorkout(); // This line should remain commented out
    };
  }, [pauseWorkout]);

  return (
    <>
      {/* Rest Timer Notification */}
      <RestTimerNotification
        visible={restTimerActive}
        remainingTime={restTimerRemaining}
        onAdjustTime={adjustRestTimer}
        onSkip={skipRestTimer}
      />
      
      <ScrollView style={[styles.container, { backgroundColor: 'transparent' }]} contentContainerStyle={styles.scrollViewContent}>
        <ThemedView style={[styles.header ,{backgroundColor:'transparent'}]}>
          <ThemedText type="title" style={{ color: colors.tint }}>{activeRoutine && activeRoutine.name ? activeRoutine.name : 'Workout'}</ThemedText>
        </ThemedView>

        {/* --- New Metrics Display --- */}
        <ThemedView style={[styles.metricsContainer, { backgroundColor: colors.cardBackground, borderColor: colors.tabIconDefault }]}>
          <View style={styles.metricItem}>
            <ThemedText type="subtitle" style={{ color: colors.text }}>Volume</ThemedText>
            <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>{totalVolume} kg</ThemedText>
          </View>
          <View style={styles.metricItem}>
            <ThemedText type="subtitle" style={{ color: colors.text }}>Sets</ThemedText>
            <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>{setsPerformed}</ThemedText>
          </View>
          <View style={styles.metricItem}>
            <ThemedText type="subtitle" style={{ color: colors.text }}>Progress</ThemedText>
            <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>{progressPercentage}%</ThemedText>
          </View>
        </ThemedView>
        {/* --- End New Metrics Display --- */}

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
                          : require('../assets/images/exersiseplaceholder.png')
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
                  {exercise.loggedSets.map((set, setIndex) => {
                    // Ensure each set has an ID
                    const setId = set.id || `${exIndex}-${setIndex}-${Date.now()}`;
                    if (!set.id) {
                      set.id = setId;
                    }
                    
                    // Get previous set data for this exercise and set index
                    const previousSet = getPreviousSetData(exIndex, setIndex);
                    
                    return (
                      <SwipeableSetRow
                        key={setId}
                        set={set}
                        setIndex={setIndex}
                        exIndex={exIndex}
                        colors={colors}
                        handleLoggedSetChange={handleLoggedSetChange}
                        toggleSetCompletion={toggleSetCompletion}
                        deleteSet={deleteSet}
                        totalSets={exercise.loggedSets.length}
                        setId={setId}
                        previousSet={previousSet}
                        showValidationIndicator={showValidationIndicators}
                      />
                    );
                  })}
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

      {/* Confirmation Modal for Empty Sets */}
      <ConfirmationModal
        visible={showEmptySetsWarning}
        message={emptySetsWarningMessage}
        onConfirm={handleWarningConfirm}
        onCancel={handleWarningCancel}
        confirmText="Finish Anyway"
        cancelText="Cancel"
      />

      {/* Empty Workout Modal */}
      <ConfirmationModal
        isVisible={showEmptyWorkoutModal}
        message="You haven't completed any sets in this workout. Would you like to discard this empty workout or finish it anyway?"
        onConfirm={handleEmptyWorkoutFinish}
        onCancel={handleEmptyWorkoutDiscard}
        confirmText="Finish Empty Workout"
        cancelText="Discard Workout"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerRow: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  headerText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // New styles for swipeable functionality
  swipeableContainer: {
    marginBottom: 4,
    position: 'relative',
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  resetTouchArea: {
    flex: 1,
  },
  setRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    minHeight: 48,
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
    position: 'relative',
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
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  metricItem: {
    alignItems: 'center',
  },
  scrollViewContent: {
    paddingBottom: 100, // Adjust this value as needed to clear the tab bar
  },
  // New styles for validation indicators
  warningIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    padding: 2,
    zIndex: 1,
  },
});