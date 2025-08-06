import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface SuccessModalProps {
  isVisible: boolean;
  message: string;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

const SuccessModal: React.FC<SuccessModalProps> = ({ isVisible, message, onClose }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current; // Initial position off-screen top
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (isVisible) {
      Animated.timing(
        slideAnim,
        {
          toValue: 0, // Slide down to top of screen
          duration: 300,
          useNativeDriver: true,
        }
      ).start(() => {
        // Auto-hide after a delay
        setTimeout(() => {
          Animated.timing(
            slideAnim,
            {
              toValue: -100, // Slide back up off-screen
              duration: 300,
              useNativeDriver: true,
            }
          ).start(() => onClose());
        }, 2000); // Display for 2 seconds
      });
    } else {
      slideAnim.setValue(-100); // Reset position when not visible
    }
  }, [isVisible, slideAnim, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.modalContainer,
        { transform: [{ translateY: slideAnim }], backgroundColor: colors.tint },
      ]}
    >
      <ThemedText style={[styles.messageText, { color: colors.background }]}>
        {message}
      </ThemedText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: width,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999, // Ensure it's on top of everything
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
