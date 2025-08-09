
import { useAuth } from '@/context/AuthContext';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

const StartPage = () => {
  useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default StartPage;
