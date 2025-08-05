import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';

interface RestTimerProps {
  restTime: number; // in seconds, 0 means "off"
  onPress: () => void;
}

export default function RestTimer({ restTime, onPress }: RestTimerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const formatRestTime = (seconds: number) => {
    if (seconds === 0) return 'off';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <TouchableOpacity onPress={onPress} style={{ marginBottom: 8 }}>
      <ThemedText style={{ color: colors.secondary, fontSize: 14 }}>
        Rest Timer: {formatRestTime(restTime)}
      </ThemedText>
    </TouchableOpacity>
  );
}
