import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useWorkout } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from './ThemedView';

interface ConfirmationModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const { width } = Dimensions.get('window');

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isVisible, title, message, onConfirm, onCancel, confirmButtonText, cancelButtonText }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (isVisible) {
      Animated.spring(
        scaleAnim,
        {
          toValue: 1,
          friction: 7,
          useNativeDriver: true,
        }
      ).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [isVisible, scaleAnim]);

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <ThemedView style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ scale: scaleAnim }], backgroundColor: colors.background, borderColor: colors.tabIconDefault },
          ]}
        >
          <ThemedText type="subtitle" style={[styles.modalTitle, { color: colors.tint }]}>{title}</ThemedText>
          <ThemedText style={[styles.modalMessage, { color: colors.text }]}>{message}</ThemedText>
          <ThemedView style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton, { borderColor: colors.secondary }]} onPress={onCancel}>
              <ThemedText style={[styles.buttonText, { color: colors.secondary }]}>{cancelButtonText || 'Cancel'}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmButton, { backgroundColor: colors.error }]} onPress={onConfirm}>
              <ThemedText style={[styles.buttonText, { color: colors.background }]}>{confirmButtonText || 'Delete'}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </Animated.View>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    width: width * 0.8,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    marginLeft: 10,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

const FinishWorkoutButton = () => {
  const { loggedExercises, workoutTime, saveWorkout } = useWorkout();
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
    saveWorkout();
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