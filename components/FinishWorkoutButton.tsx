import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useWorkout } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

const FinishWorkoutButton = () => {
  const { loggedExercises, workoutTime, pauseWorkout } = useWorkout();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const handleFinishWorkout = () => {
    pauseWorkout(); // Pause the workout before navigating to summary
    router.replace({
      pathname: '/(tabs)/workout-summary',
      params: { workoutData: JSON.stringify(loggedExercises), workoutDuration: workoutTime },
    });
  };

  return (
    <TouchableOpacity onPress={handleFinishWorkout} style={{ marginRight: 15 }}>
      <ThemedText style={{ color: colors.tint, fontWeight: 'bold' }}>Finish</ThemedText>
    </TouchableOpacity>
  );
};

export default FinishWorkoutButton;
