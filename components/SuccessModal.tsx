import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface SuccessModalProps {
  isVisible: boolean;
  message: string;
  onClose: () => void;
}



const SuccessModal: React.FC<SuccessModalProps> = ({ isVisible, message, onClose }) => {
  const opacityAnim = useRef(new Animated.Value(0)).current; // Initial opacity for fade effect
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (isVisible) {
      Animated.timing(
        opacityAnim,
        {
          toValue: 1, // Fade in
          duration: 300,
          useNativeDriver: true,
        }
      ).start(() => {
        // Auto-hide after a delay
        setTimeout(() => {
          Animated.timing(
            opacityAnim,
            {
              toValue: 0, // Fade out
              duration: 300,
              useNativeDriver: true,
            }
          ).start(() => onClose());
        }, 2000); // Display for 2 seconds
      });
    } else {
      opacityAnim.setValue(0); // Reset opacity when not visible
    }
  }, [isVisible, opacityAnim, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.modalContainer,
        { opacity: opacityAnim }, // Apply opacity animation
      ]}
    >
      <ThemedView style={[styles.modalContent, { backgroundColor: colors.tint }]}>
        <ThemedText style={[styles.messageText, { color: colors.background }]}>
          {message}
        </ThemedText>
      </ThemedView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent overlay
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999, // Ensure it's on top of everything
  },
  modalContent: {
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  messageText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SuccessModal;
