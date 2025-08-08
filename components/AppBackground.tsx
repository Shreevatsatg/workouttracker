
import { useColorScheme } from '@/hooks/useColorScheme';

import { Colors } from '@/constants/Colors';
import { View } from 'react-native';

const AppBackground = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBackground }}>
      {children}
    </View>
  );
};

export default AppBackground;
