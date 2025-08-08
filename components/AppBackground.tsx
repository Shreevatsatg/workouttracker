
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';

const AppBackground = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();

  const gradientColors = colorScheme === 'dark' 
    ? ['#1a1a2e', '#16213e', '#0f3460'] 
    : ['#667eea', '#764ba2', '#f093fb'];

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});

export default AppBackground;
