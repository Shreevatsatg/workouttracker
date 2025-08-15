
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

interface BodyWeightChartProps {
  data: {
    value: number;
    date: string;
  }[];
}

const BodyWeightChart: React.FC<BodyWeightChartProps> = ({ data }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View>
      <ThemedText>Body Weight</ThemedText>
      <LineChart
        data={data}
        height={250}
        showVerticalLines
        spacing={40}
        initialSpacing={0}
        color1={colors.tint}
        textColor1="green"
        dataPointsColor1={colors.tint}
        startFillColor1={colors.tint}
        endFillColor1={colors.tint + '20'}
        startOpacity={0.8}
        endOpacity={0.3}
        yAxisTextStyle={{ color: colors.text }}
        xAxisTextStyle={{ color: colors.text }}
      />
    </View>
  );
};

export default BodyWeightChart;
