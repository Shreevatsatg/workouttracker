
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase';
import { BarChart, PieChart, LineChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const [workoutVolume, setWorkoutVolume] = useState<any[]>([]);
  const [macroData, setMacroData] = useState<any[]>([]);
  const [bodyWeightData, setBodyWeightData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchWorkoutVolume();
      fetchMacroData();
      fetchBodyWeightData();
    }
  }, [user]);

  const fetchWorkoutVolume = async () => {
    if (!user) return;
    const { data, error } = await supabase.rpc('get_weekly_volume', { user_id_param: user.id });
    if (error) {
      console.error('Error fetching weekly volume:', error);
    } else {
      setWorkoutVolume(data.map((item: any) => ({ value: item.total_volume, label: item.week })))
    }
  };

  const fetchMacroData = async () => {
    // This is a placeholder. In a real app, you would fetch and calculate this data.
    setMacroData([
      { value: 40, color: colors.tint, text: '40%' },
      { value: 35, color: '#f59e0b', text: '35%' },
      { value: 25, color: '#22c55e', text: '25%' },
    ]);
  };

  const fetchBodyWeightData = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('measurements')
      .select('value, created_at')
      .eq('user_id', user.id)
      .eq('type', 'weight')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching body weight data:', error);
    } else {
      setBodyWeightData(data.map((item: any) => ({ value: item.value, dataPointText: item.value.toString() })))
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      padding: 24,
    },
    chartContainer: {
      margin: 16,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.surface,
    },
    chartTitle: {
      marginBottom: 16,
      textAlign: 'center',
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      padding: 16,
    },
    gridItem: {
      width: '48%',
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.surface,
      marginBottom: 16,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Your Progress</ThemedText>
        <ThemedText type="subtitle">Keep up the great work!</ThemedText>
      </ThemedView>

      <ThemedView style={styles.chartContainer}>
        <ThemedText type="subtitle" style={styles.chartTitle}>Weekly Workout Volume</ThemedText>
        <BarChart
          data={workoutVolume}
          barWidth={40}
          barBorderRadius={4}
          frontColor={colors.tint}
          yAxisTextStyle={{ color: colors.text }}
          xAxisTextStyle={{ color: colors.text }}
        />
      </ThemedView>

      <View style={styles.gridContainer}>
        <ThemedView style={styles.gridItem}>
          <ThemedText type="subtitle" style={styles.chartTitle}>Today's Macros</ThemedText>
          <PieChart
            data={macroData}
            donut
            innerRadius={60}
            showText
            textColor={colors.text}
            textSize={16}
            focusOnPress
          />
        </ThemedView>

        <ThemedView style={styles.gridItem}>
          <ThemedText type="subtitle" style={styles.chartTitle}>Body Weight</ThemedText>
          <LineChart
            data={bodyWeightData}
            color={colors.tint}
            textColor={colors.text}
            textShiftY={-8}
            textShiftX={-10}
            textFontSize={16}
            thickness={5}
            yAxisTextStyle={{ color: colors.text }}
            xAxisTextStyle={{ color: colors.text }}
            dataPointsColor={colors.tint}
          />
        </ThemedView>
      </View>
    </ScrollView>
  );
}
