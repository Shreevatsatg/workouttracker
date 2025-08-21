import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
const StartPage = () => {
  const { loading, user, session, profile } = useAuth();
  const [navigationAttempted, setNavigationAttempted] = useState(false);
  useEffect(() => {
    if (!loading && !navigationAttempted) {
      setNavigationAttempted(true);
      
      if (user && session) {
        // Check if user has completed onboarding
        if (profile?.onboarding_complete) {
          // Replace with your main app route
          router.replace('/(tabs)/workout' as any); // or whatever your main route is
        } else {
          // Replace with your onboarding route
          router.replace('/onboarding' as any);
        }
      } else {
        // Replace with your auth/login route
        router.replace('/login' as any); // or '/auth' or whatever your login route is
      }
    }
  }, [loading, user, session, profile, navigationAttempted]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
};
export default StartPage;