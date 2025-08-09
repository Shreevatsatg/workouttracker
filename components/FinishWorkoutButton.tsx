import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useWorkout } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import ConfirmationModal from './ConfirmationModal';

const FinishWorkoutButton = () => {
  const { loggedExercises, workoutTime, pauseWorkout } = useWorkout();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [showEmptySetModal, setShowEmptySetModal] = useState(false);

  const handleFinishWorkout = () => {
    const hasEmptySets = loggedExercises.some(exercise =>
      exercise.loggedSets.some(set => !set.completed && (!set.loggedWeight && !set.loggedReps))
    );

    if (hasEmptySets) {
      setShowEmptySetModal(true);
    } else {
      finishWorkoutAndNavigate();
    }
  };

  const finishWorkoutAndNavigate = () => {
    pauseWorkout(); // Pause the workout before navigating to summary
    router.replace({
      pathname: '/(tabs)/workout-summary',
      params: { workoutData: JSON.stringify(loggedExercises), workoutDuration: workoutTime },
    });
  };

  return (
    <>
      <TouchableOpacity onPress={handleFinishWorkout} style={{ marginRight: 15 }}>
        <ThemedText style={{ color: colors.tint, fontWeight: 'bold' }}>Finish</ThemedText>
      </TouchableOpacity>

      <ConfirmationModal
        isVisible={showEmptySetModal}
        title="Empty Sets Detected"
        message="You have incomplete or empty sets. Do you want to discard them and finish the workout, or go back to complete/delete them?"
        onConfirm={() => {
          // Filter out incomplete/empty sets before navigating
          const filteredLoggedExercises = loggedExercises.map(exercise => ({
            ...exercise,
            loggedSets: exercise.loggedSets.filter(set => set.completed || (set.loggedWeight || set.loggedReps)),
          }));
          router.replace({
            pathname: '/(tabs)/workout-summary',
            params: { workoutData: JSON.stringify(filteredLoggedExercises), workoutDuration: workoutTime },
          });
          setShowEmptySetModal(false);
        }}
        onCancel={() => setShowEmptySetModal(false)}
        confirmButtonText="Discard & Finish"
        cancelButtonText="Go Back"
      />
    </>
  );
};

export default FinishWorkoutButton;
