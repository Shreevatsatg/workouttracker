import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, KeyboardEvent, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface AppNotificationProps {
  visible: boolean;
  message: string;
  onHide: () => void;
  duration?: number; // in milliseconds, default to 3000
}

export default function AppNotification({
  visible,
  message,
  onHide,
  duration = 3000,
}: AppNotificationProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const slideAnim = useRef(new Animated.Value(100)).current; // Start off-screen
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const hideTimeout = useRef<number | null>(null);

  useEffect(() => {
    const keyboardDidShow = (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates.height);
    };

    const keyboardDidHide = () => {
      setKeyboardHeight(0);
    };

    const showSubscription = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    const hideSubscription = Keyboard.addListener('keyboardDidHide', keyboardDidHide);

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      // Clear any existing timeout
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }

      Animated.spring(slideAnim, {
        toValue: 0, // Slide in
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start(() => {
        // Set a timeout to hide the notification after 'duration'
        hideTimeout.current = setTimeout(() => {
          Animated.timing(slideAnim, {
            toValue: 100, // Slide out
            duration: 300,
            useNativeDriver: true,
          }).start(() => onHide());
        }, duration);
      });
    } else {
      // If visibility changes to false, slide out immediately
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, [visible, slideAnim, onHide, duration]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: keyboardHeight > 0 ? keyboardHeight + 40 : 80,
        left: 16,
        right: 16,
        zIndex: 1000,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <ThemedView
        style={{
          backgroundColor: colors.tint,
          borderRadius: 10,
          paddingVertical: 12,
          paddingHorizontal: 20,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.4,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        }}
      >
        <ThemedText style={{
          color: colors.background,
          fontSize: 16,
          fontWeight: 'bold',
          textAlign: 'center',
        }}>
          {message}
        </ThemedText>
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Styles are mostly inline for Animated.View and ThemedView for dynamic positioning and colors
});
