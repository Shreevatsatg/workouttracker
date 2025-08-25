import { modernColors } from '@/constants/ModernColors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

const StartPage = () => {
  const { loading, session } = useAuth();
  const colorScheme = useColorScheme();
  const colors = modernColors[colorScheme ?? 'light'];
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Add a fallback timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('⚠️ Index page timeout - showing fallback');
      setShowFallback(true);
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeoutId);
  }, []);

  // Passive splash/loading screen. Navigation is handled by the global guard in _layout.
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: colors.surface 
    }}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={{ 
        marginTop: 16, 
        color: colors.textSecondary,
        fontSize: 16 
      }}>
        {showFallback ? 'Loading...' : 'Initializing app...'}
      </Text>
      {showFallback && (
        <Text style={{ 
          marginTop: 8, 
          color: colors.textSecondary,
          fontSize: 14,
          textAlign: 'center',
          paddingHorizontal: 32
        }}>
          If this takes too long, please restart the app
        </Text>
      )}
    </View>
  );
};

export default StartPage;