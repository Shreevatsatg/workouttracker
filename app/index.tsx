import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

const StartPage = () => {
  const { loading, user, session } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    // Set a timeout to show debug info if loading takes too long
    const timer = setTimeout(() => {
      setTimeoutReached(true);
      console.log('Loading timeout reached');
      console.log('Loading state:', loading);
      console.log('User state:', !!user);
      console.log('Session state:', !!session);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [loading, user, session]);

  if (timeoutReached && loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 20, textAlign: 'center' }}>
          Loading is taking longer than expected...
        </Text>
        <Text style={{ marginTop: 10, fontSize: 12, color: 'gray' }}>
          Check console for debug information
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default StartPage;