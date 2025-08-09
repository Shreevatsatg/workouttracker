import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
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
  const scaleAnim = useRef(new Animated.Value(0)).current; // Initial scale for pop-in effect
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

  if (!isVisible) {
    return null;
  }

  return (
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
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
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

export default ConfirmationModal;
