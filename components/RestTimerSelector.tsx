import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface RestTimerSelectorProps {
  visible: boolean;
  currentTime: number;
  onSelect: (time: number) => void;
  onClose: () => void;
}

export default function RestTimerSelector({ visible, currentTime, onSelect, onClose }: RestTimerSelectorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  // Time options from "off" (0) to 5 minutes
  const timeOptions = [
    { label: 'Off', value: 0 },
    { label: '30s', value: 30 },
    { label: '45s', value: 45 },
    { label: '1m', value: 60 },
    { label: '1m 15s', value: 75 },
    { label: '1m 30s', value: 90 },
    { label: '1m 45s', value: 105 },
    { label: '2m', value: 120 },
    { label: '2m 30s', value: 150 },
    { label: '3m', value: 180 },
    { label: '3m 30s', value: 210 },
    { label: '4m', value: 240 },
    { label: '4m 30s', value: 270 },
    { label: '5m', value: 300 },
  ];

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleSelect = (time: number) => {
    onSelect(time);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          justifyContent: 'flex-end' 
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '60%',
          }}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <ThemedView style={{ 
              padding: 20, 
              borderBottomWidth: 1, 
              borderBottomColor: colors.tabIconDefault,
              alignItems: 'center'
            }}>
              <ThemedText type="subtitle" style={{ color: colors.text }}>
                Select Rest Time
              </ThemedText>
            </ThemedView>
            
            <ScrollView style={{ maxHeight: 300 }}>
              {timeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.tabIconDefault + '30',
                    backgroundColor: currentTime === option.value ? colors.tint + '20' : 'transparent',
                  }}
                  onPress={() => handleSelect(option.value)}
                >
                  <ThemedText style={{ 
                    color: currentTime === option.value ? colors.tint : colors.text,
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: currentTime === option.value ? 'bold' : 'normal'
                  }}>
                    {option.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={{
                backgroundColor: colors.tint,
                margin: 20,
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
              onPress={onClose}
            >
              <ThemedText style={{ color: colors.background, fontWeight: 'bold', fontSize: 16 }}>
                Done
              </ThemedText>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}
