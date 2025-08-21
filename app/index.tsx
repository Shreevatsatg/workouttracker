import React from 'react';
import { ActivityIndicator, View } from 'react-native';

const StartPage = () => {
  // Passive splash/loading screen. Navigation is handled by the global guard in _layout.
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default StartPage;