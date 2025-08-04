import { Colors } from '@/constants/Colors';
import { useWorkout } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNavigation, usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WorkoutNotificationBar() {
  const { activeRoutine, workoutTime, discardWorkout, resumeWorkout, isWorkoutRunning } = useWorkout();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const navigation = useNavigation();
  const pathname = usePathname();

  if (!activeRoutine || pathname === '/log-workout' || !isWorkoutRunning) {
    return null;
  }

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const router = useRouter();

  const handleDiscard = () => {
    discardWorkout();
    if (pathname !== '/(tabs)/workout') {
      router.push('/(tabs)/workout');
    }
  };

  const handleResume = () => {
    resumeWorkout();
    router.push({
      pathname: '/(tabs)/log-workout',
      params: { routine: JSON.stringify(activeRoutine) },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.tint }]}>
      <View style={styles.textContainer}>
        <Text style={[styles.routineName, { color: colors.background }]}>{activeRoutine.name}</Text>
        <Text style={[styles.timer, { color: colors.background }]}>{formatTime(workoutTime)}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleDiscard} style={styles.button}>
          <Text style={[styles.buttonText, { color: colors.background }]}>Discard</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleResume} style={styles.button}>
          <Text style={[styles.buttonText, { color: colors.background }]}>Resume</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  textContainer: {
    flex: 1,
  },
  routineName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timer: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#fff',
  },
  buttonText: {
    fontWeight: 'bold',
  },
});
