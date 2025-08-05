import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, KeyboardEvent, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface RestTimerNotificationProps {
  visible: boolean;
  remainingTime: number; // in seconds
  onAdjustTime: (adjustment: number) => void; // +15 or -15 seconds
  onSkip: () => void;
}

export default function RestTimerNotification({ 
  visible, 
  remainingTime, 
  onAdjustTime, 
  onSkip 
}: RestTimerNotificationProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const slideAnim = useRef(new Animated.Value(100)).current;
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: keyboardHeight > 0 ? keyboardHeight + 10 : 20,
        left: 16,
        right: 16,
        zIndex: 1000,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <ThemedView
        style={{
          backgroundColor: colors.tint,
          borderRadius: 0,
          paddingVertical: 6,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          shadowColor: '#000',
          shadowOpacity: 0.4,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
          }}
      >
        {/* -15 Button */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.background + '25',
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.background + '30',
          }}
          onPress={() => onAdjustTime(-15)}
        >
          <ThemedText style={{ 
            color: colors.background, 
            fontWeight: 'bold',
            fontSize: 14
          }}>
            -15
          </ThemedText>
        </TouchableOpacity>

        {/* Timer Display */}
        <ThemedView style={{ 
          alignItems: 'center',
          backgroundColor: 'transparent',
          flex: 1,
          marginHorizontal: 12
        }}>
          <ThemedText style={{ 
            color: colors.background, 
            fontSize: 24,
            fontWeight: 'bold'
          }}>
            {formatTime(remainingTime)}
          </ThemedText>
        </ThemedView>

        {/* +15 Button */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.background + '25',
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.background + '30',
          }}
          onPress={() => onAdjustTime(15)}
        >
          <ThemedText style={{ 
            color: colors.background, 
            fontWeight: 'bold',
            fontSize: 14
          }}>
            +15
          </ThemedText>
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.background + '25',
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.background + '30',
            marginLeft: 8,
          }}
          onPress={onSkip}
        >
          <ThemedText style={{ 
            color: colors.background, 
            fontWeight: 'bold',
            fontSize: 14
          }}>
            Skip
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </Animated.View>
  );
}
