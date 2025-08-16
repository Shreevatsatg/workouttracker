import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/utils/supabase';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  // State for all analytics data
  const [workoutVolume, setWorkoutVolume] = useState<any[]>([]);
  const [macroData, setMacroData] = useState<any[]>([]);
  const [bodyWeightData, setBodyWeightData] = useState<any[]>([]);
  const [workoutFrequency, setWorkoutFrequency] = useState<any[]>([]);
  const [muscleGroupData, setMuscleGroupData] = useState<any[]>([]);
  const [strengthProgress, setStrengthProgress] = useState<any[]>([]);
  const [calorieData, setCalorieData] = useState<any[]>([]);
  const [prData, setPrData] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('1m');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Summary stats
  const [summaryStats, setSummaryStats] = useState({
    totalWorkouts: 0,
    weeklyWorkouts: 0,
    monthlyWorkouts: 0,
    avgDuration: 0,
    totalVolume: 0,
    currentStreak: 0,
    caloriesConsumed: 0,
    caloriesGoal: 2200,
    proteinGoal: 150,
    proteinConsumed: 0,
    weightChange: 0,
    sleepAvg: 7.5,
  });

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, selectedPeriod]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchWorkoutAnalytics(),
      fetchNutritionData(),
      fetchBodyProgressData(),
      fetchStrengthData(),
      fetchSummaryStats(),
    ]);
  };

  const fetchWorkoutAnalytics = async () => {
    if (!user) return;
    
    // Workout frequency data
    const frequencyData = [
      { value: 4, label: 'Mon' },
      { value: 3, label: 'Tue' },
      { value: 5, label: 'Wed' },
      { value: 2, label: 'Thu' },
      { value: 6, label: 'Fri' },
      { value: 1, label: 'Sat' },
      { value: 0, label: 'Sun' },
    ];
    setWorkoutFrequency(frequencyData);

    // Muscle group distribution
    const muscleData = [
      { value: 25, color: '#6366f1', text: '25%', label: 'Chest' },
      { value: 20, color: '#8b5cf6', text: '20%', label: 'Back' },
      { value: 30, color: '#06b6d4', text: '30%', label: 'Legs' },
      { value: 15, color: '#10b981', text: '15%', label: 'Arms' },
      { value: 10, color: '#f59e0b', text: '10%', label: 'Shoulders' },
    ];
    setMuscleGroupData(muscleData);

    // Volume data
    const { data, error } = await supabase.rpc('get_weekly_volume', { user_id_param: user.id });
    if (!error && data) {
      setWorkoutVolume(data.map((item: any, index: number) => ({ 
        value: item.total_volume,
        label: `W${index + 1}`,
        frontColor: index === data.length - 1 ? colors.tint : '#94a3b8'
      })));
    }

    // Strength progression (mock data)
    const strengthData = [
      { value: 135, label: 'Jan', dataPointText: '135' },
      { value: 145, label: 'Feb', dataPointText: '145' },
      { value: 155, label: 'Mar', dataPointText: '155' },
      { value: 165, label: 'Apr', dataPointText: '165' },
      { value: 175, label: 'May', dataPointText: '175' },
    ];
    setStrengthProgress(strengthData);
  };

  const fetchNutritionData = async () => {
    // Macro data
    setMacroData([
      { value: 40, color: '#6366f1', text: '40%', label: 'Protein' },
      { value: 35, color: '#f59e0b', text: '35%', label: 'Carbs' },
      { value: 25, color: '#10b981', text: '25%', label: 'Fats' },
    ]);

    // Daily calorie data (simple bar chart instead of stacked)
    const dailyCalories = [
      { value: 1900, label: 'Mon', frontColor: '#60a5fa' },
      { value: 1950, label: 'Tue', frontColor: '#34d399' },
      { value: 2100, label: 'Wed', frontColor: '#fbbf24' },
      { value: 1850, label: 'Thu', frontColor: '#f472b6' },
      { value: 2050, label: 'Fri', frontColor: '#8b5cf6' },
      { value: 2200, label: 'Sat', frontColor: '#06b6d4' },
      { value: 1750, label: 'Sun', frontColor: '#10b981' },
    ];
    setCalorieData(dailyCalories);
  };

  const fetchBodyProgressData = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('measurements')
      .select('value, created_at')
      .eq('user_id', user.id)
      .eq('type', 'weight')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setBodyWeightData(data.map((item: any) => ({ 
        value: item.value, 
        dataPointText: item.value.toString() 
      })));
    } else {
      // Mock data
      setBodyWeightData([
        { value: 75.2, dataPointText: '75.2' },
        { value: 75.8, dataPointText: '75.8' },
        { value: 76.1, dataPointText: '76.1' },
        { value: 76.5, dataPointText: '76.5' },
        { value: 77.0, dataPointText: '77.0' },
      ]);
    }
  };

  const fetchStrengthData = async () => {
    // Mock PR data
    setPrData([
      { exercise: 'Bench Press', weight: 175, date: '2 days ago', isNew: true },
      { exercise: 'Squat', weight: 225, date: '1 week ago', isNew: false },
      { exercise: 'Deadlift', weight: 285, date: '3 days ago', isNew: true },
      { exercise: 'Overhead Press', weight: 115, date: '1 week ago', isNew: false },
    ]);
  };

  const fetchSummaryStats = async () => {
    setSummaryStats({
      totalWorkouts: 247,
      weeklyWorkouts: 5,
      monthlyWorkouts: 18,
      avgDuration: 52,
      totalVolume: 12840,
      currentStreak: 12,
      caloriesConsumed: 2150,
      caloriesGoal: 2200,
      proteinGoal: 150,
      proteinConsumed: 128,
      weightChange: +1.8,
      sleepAvg: 7.2,
    });
  };

  const StatCard = ({ title, value, subtitle, icon, trend }: any) => (
    <ThemedView style={styles.statCard}>
      <View style={styles.statCardHeader}>
        <ThemedText style={styles.statTitle}>{title}</ThemedText>
        <ThemedText style={styles.statIcon}>{icon}</ThemedText>
      </View>
      <View style={styles.statValueRow}>
        <ThemedText style={styles.statValue}>{value}</ThemedText>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? '#10b981' : '#ef4444' }]}>
            <ThemedText style={styles.trendText}>{trend > 0 ? '+' : ''}{trend}%</ThemedText>
          </View>
        )}
      </View>
      <ThemedText style={styles.statSubtitle}>{subtitle}</ThemedText>
    </ThemedView>
  );

  const PRCard = ({ exercise, weight, date, isNew }: any) => (
    <View style={styles.prCard}>
      <View style={styles.prCardHeader}>
        <ThemedText style={styles.prExercise}>{exercise}</ThemedText>
        {isNew && <View style={styles.newBadge}><ThemedText style={styles.newBadgeText}>NEW!</ThemedText></View>}
      </View>
      <ThemedText style={styles.prWeight}>{weight} lbs</ThemedText>
      <ThemedText style={styles.prDate}>{date}</ThemedText>
    </View>
  );

  const TabSelector = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabSelector}>
      {[
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'workouts', label: 'Workouts', icon: '💪' },
        { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
        { id: 'body', label: 'Body', icon: '⚖️' },
        { id: 'strength', label: 'Strength', icon: '🏋️' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tabButton, selectedTab === tab.id && styles.tabButtonActive]}
          onPress={() => setSelectedTab(tab.id)}
        >
          <ThemedText style={styles.tabIcon}>{tab.icon}</ThemedText>
          <ThemedText style={[styles.tabText, selectedTab === tab.id && styles.tabTextActive]}>
            {tab.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const PeriodSelector = () => (
    <View style={styles.periodSelector}>
      {['1w', '1m', '3m', '6m', '1y'].map((period) => (
        <TouchableOpacity
          key={period}
          style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod(period)}
        >
          <ThemedText style={[styles.periodText, selectedPeriod === period && styles.periodTextActive]}>
            {period}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverview = () => (
    <>
      <View style={styles.statsGrid}>
        <StatCard title="WORKOUTS" value={summaryStats.weeklyWorkouts} subtitle="This week" icon="💪" trend={12} />
        <StatCard title="STREAK" value={summaryStats.currentStreak} subtitle="Days active" icon="🔥" trend={8} />
        <StatCard title="VOLUME" value="12.8K" subtitle="lbs this month" icon="🏋️" trend={15} />
        <StatCard title="DURATION" value={`${summaryStats.avgDuration}min`} subtitle="Avg per workout" icon="⏱️" trend={-5} />
      </View>

      <View style={styles.statsGrid}>
        <StatCard title="CALORIES" value={`${summaryStats.caloriesConsumed}/${summaryStats.caloriesGoal}`} subtitle="Daily goal" icon="🔥" />
        <StatCard title="PROTEIN" value={`${summaryStats.proteinConsumed}g`} subtitle={`Goal: ${summaryStats.proteinGoal}g`} icon="🥩" />
        <StatCard title="WEIGHT" value={`${summaryStats.weightChange > 0 ? '+' : ''}${summaryStats.weightChange}kg`} subtitle="This month" icon="⚖️" />
        <StatCard title="SLEEP" value={`${summaryStats.sleepAvg}h`} subtitle="Avg per night" icon="😴" />
      </View>

      <ThemedView style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <ThemedText style={styles.chartTitle}>Weekly Volume Trend</ThemedText>
          <ThemedText style={styles.chartSubtitle}>Total weight lifted per week</ThemedText>
        </View>
        <View style={styles.chartContent}>
          <BarChart
            data={workoutVolume}
            barWidth={28}
            barBorderRadius={6}
            yAxisTextStyle={{ color: colors.text, fontSize: 11 }}
            xAxisTextStyle={{ color: colors.text, fontSize: 11 }}
            spacing={20}
            isAnimated
            animationDuration={800}
          />
        </View>
      </ThemedView>
    </>
  );

  const renderWorkouts = () => (
    <>
      <ThemedView style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <ThemedText style={styles.chartTitle}>Workout Frequency</ThemedText>
          <ThemedText style={styles.chartSubtitle}>Workouts per day this week</ThemedText>
        </View>
        <View style={styles.chartContent}>
          <BarChart
            data={workoutFrequency}
            barWidth={35}
            barBorderRadius={8}
            frontColor={colors.tint}
            yAxisTextStyle={{ color: colors.text, fontSize: 11 }}
            xAxisTextStyle={{ color: colors.text, fontSize: 11 }}
            maxValue={6}
            isAnimated
          />
        </View>
      </ThemedView>

      <ThemedView style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <ThemedText style={styles.chartTitle}>Muscle Group Distribution</ThemedText>
          <ThemedText style={styles.chartSubtitle}>Training focus this month</ThemedText>
        </View>
        <View style={styles.chartContent}>
          <PieChart
            data={muscleGroupData}
            donut
            innerRadius={50}
            radius={80}
            centerLabelComponent={() => (
              <View style={{ alignItems: 'center' }}>
                <ThemedText style={{ fontSize: 18, fontWeight: '700' }}>100%</ThemedText>
                <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>coverage</ThemedText>
              </View>
            )}
            isAnimated
          />
          <View style={styles.legendContainer}>
            {muscleGroupData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <ThemedText style={styles.legendLabel}>{item.label} ({item.text})</ThemedText>
              </View>
            ))}
          </View>
        </View>
      </ThemedView>

      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>🏆 Personal Records</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>Your recent achievements</ThemedText>
      </View>
      <View style={styles.prGrid}>
        {prData.map((pr, index) => (
          <PRCard key={index} {...pr} />
        ))}
      </View>
    </>
  );

  const renderNutrition = () => (
    <>
      <View style={styles.gridContainer}>
        <ThemedView style={styles.gridItem}>
          <View style={styles.gridItemHeader}>
            <ThemedText style={styles.gridItemTitle}>Today's Macros</ThemedText>
          </View>
          <View style={styles.gridItemContent}>
            <PieChart
              data={macroData}
              donut
              innerRadius={40}
              radius={65}
              centerLabelComponent={() => (
                <View style={{ alignItems: 'center' }}>
                  <ThemedText style={{ fontSize: 16, fontWeight: '700' }}>{summaryStats.caloriesConsumed}</ThemedText>
                  <ThemedText style={{ fontSize: 11, opacity: 0.6 }}>kcal</ThemedText>
                </View>
              )}
              isAnimated
            />
            <View style={styles.macroLegend}>
              {macroData.map((item, index) => (
                <View key={index} style={styles.macroItem}>
                  <View style={[styles.macroColor, { backgroundColor: item.color }]} />
                  <ThemedText style={styles.macroLabel}>{item.label} ({item.text})</ThemedText>
                </View>
              ))}
            </View>
          </View>
        </ThemedView>

        <ThemedView style={styles.gridItem}>
          <View style={styles.gridItemHeader}>
            <ThemedText style={styles.gridItemTitle}>Weekly Calories</ThemedText>
          </View>
          <View style={styles.gridItemContent}>
            <View style={styles.calorieProgress}>
              <View style={styles.calorieRow}>
                <ThemedText style={styles.calorieLabel}>Consumed</ThemedText>
                <ThemedText style={styles.calorieValue}>{summaryStats.caloriesConsumed}</ThemedText>
              </View>
              <View style={styles.calorieRow}>
                <ThemedText style={styles.calorieLabel}>Goal</ThemedText>
                <ThemedText style={styles.calorieValue}>{summaryStats.caloriesGoal}</ThemedText>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { 
                  width: `${Math.min((summaryStats.caloriesConsumed / summaryStats.caloriesGoal) * 100, 100)}%`,
                  backgroundColor: summaryStats.caloriesConsumed > summaryStats.caloriesGoal ? '#ef4444' : colors.tint 
                }]} />
              </View>
              <ThemedText style={styles.progressText}>
                {Math.round((summaryStats.caloriesConsumed / summaryStats.caloriesGoal) * 100)}% of goal
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      </View>

      <ThemedView style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <ThemedText style={styles.chartTitle}>Daily Calorie Intake</ThemedText>
          <ThemedText style={styles.chartSubtitle}>Weekly calorie consumption vs 2200 goal</ThemedText>
        </View>
        <View style={styles.chartContent}>
          <BarChart
            data={calorieData}
            barWidth={32}
            barBorderRadius={8}
            yAxisTextStyle={{ color: colors.text, fontSize: 11 }}
            xAxisTextStyle={{ color: colors.text, fontSize: 11 }}
            spacing={20}
            isAnimated
            animationDuration={800}
            showReferenceLine1
            referenceLine1Position={2200}
            referenceLine1Color={colors.tint}
            referenceLine1Config={{
              thickness: 2,
              dashWidth: 4,
              dashGap: 4,
            }}
          />
          <View style={styles.calorieInfo}>
            <View style={styles.calorieInfoRow}>
              <View style={[styles.legendColor, { backgroundColor: colors.tint }]} />
              <ThemedText style={styles.legendLabel}>Daily Goal (2200 cal)</ThemedText>
            </View>
            <ThemedText style={styles.calorieNote}>
              Average: 1971 cal/day • 95% of goal achieved
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </>
  );

  const renderBody = () => (
    <>
      <ThemedView style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <ThemedText style={styles.chartTitle}>Weight Progress</ThemedText>
          <ThemedText style={styles.chartSubtitle}>Body weight trend over time</ThemedText>
        </View>
        <View style={styles.chartContent}>
          <PeriodSelector />
          <LineChart
            data={bodyWeightData}
            color={colors.tint}
            thickness={3}
            dataPointsColor={colors.tint}
            dataPointsRadius={5}
            textColor={colors.text}
            textShiftY={-8}
            textShiftX={-10}
            textFontSize={11}
            yAxisTextStyle={{ color: colors.text, fontSize: 11 }}
            xAxisTextStyle={{ color: colors.text, fontSize: 11 }}
            isAnimated
            curved
            areaChart
            startFillColor={colors.tint}
            startOpacity={0.2}
            endOpacity={0.05}
          />
        </View>
      </ThemedView>

      <View style={styles.bodyStatsGrid}>
        <StatCard title="CURRENT" value="77.0kg" subtitle="Latest weight" icon="⚖️" />
        <StatCard title="CHANGE" value={`${summaryStats.weightChange > 0 ? '+' : ''}${summaryStats.weightChange}kg`} subtitle="This month" icon={summaryStats.weightChange > 0 ? '📈' : '📉'} />
        <StatCard title="BMI" value="22.1" subtitle="Normal range" icon="📊" />
        <StatCard title="GOAL" value="80.0kg" subtitle="Target weight" icon="🎯" />
      </View>
    </>
  );

  const renderStrength = () => (
    <>
      <ThemedView style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <ThemedText style={styles.chartTitle}>Bench Press Progress</ThemedText>
          <ThemedText style={styles.chartSubtitle}>1RM progression over time</ThemedText>
        </View>
        <View style={styles.chartContent}>
          <LineChart
            data={strengthProgress}
            color={colors.tint}
            thickness={4}
            dataPointsColor={colors.tint}
            dataPointsRadius={6}
            textColor={colors.text}
            textShiftY={-8}
            textShiftX={-10}
            textFontSize={11}
            yAxisTextStyle={{ color: colors.text, fontSize: 11 }}
            xAxisTextStyle={{ color: colors.text, fontSize: 11 }}
            isAnimated
            showDataPointLabelOnFocus
          />
        </View>
      </ThemedView>

      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>💪 Top Exercises</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>Most performed this month</ThemedText>
      </View>

      <View style={styles.exerciseList}>
        {[
          { name: 'Bench Press', sets: 48, reps: 480, weight: '8,640 lbs' },
          { name: 'Squat', sets: 36, reps: 360, weight: '7,200 lbs' },
          { name: 'Deadlift', sets: 24, reps: 120, weight: '6,000 lbs' },
          { name: 'Overhead Press', sets: 32, reps: 256, weight: '3,840 lbs' },
        ].map((exercise, index) => (
          <View key={index} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
              <ThemedText style={styles.exerciseRank}>#{index + 1}</ThemedText>
            </View>
            <View style={styles.exerciseStats}>
              <View style={styles.exerciseStat}>
                <ThemedText style={styles.exerciseStatValue}>{exercise.sets}</ThemedText>
                <ThemedText style={styles.exerciseStatLabel}>Sets</ThemedText>
              </View>
              <View style={styles.exerciseStat}>
                <ThemedText style={styles.exerciseStatValue}>{exercise.reps}</ThemedText>
                <ThemedText style={styles.exerciseStatLabel}>Reps</ThemedText>
              </View>
              <View style={styles.exerciseStat}>
                <ThemedText style={styles.exerciseStatValue}>{exercise.weight}</ThemedText>
                <ThemedText style={styles.exerciseStatLabel}>Volume</ThemedText>
              </View>
            </View>
          </View>
        ))}
      </View>
    </>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'workouts': return renderWorkouts();
      case 'nutrition': return renderNutrition();
      case 'body': return renderBody();
      case 'strength': return renderStrength();
      default: return renderOverview();
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#0a0a0b' : '#f8fafc',
    },
    header: {
      padding: 24,
      paddingTop: 20,
      paddingBottom: 16,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: '800',
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      opacity: 0.7,
      fontWeight: '500',
    },
    tabSelector: {
      paddingHorizontal: 16,
      marginBottom: 20,
    },
    tabButton: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginRight: 12,
      borderRadius: 20,
      backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#e2e8f0',
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 100,
    },
    tabButtonActive: {
      backgroundColor: colors.tint,
    },
    tabIcon: {
      fontSize: 16,
      marginRight: 8,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      opacity: 0.7,
    },
    tabTextActive: {
      color: '#fff',
      opacity: 1,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      gap: 12,
      marginBottom: 20,
    },
    bodyStatsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      minWidth: (width - 44) / 2,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    statCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    statTitle: {
      fontSize: 11,
      fontWeight: '700',
      opacity: 0.6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    statIcon: {
      fontSize: 16,
    },
    statValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    statValue: {
      fontSize: 22,
      fontWeight: '800',
      marginRight: 8,
    },
    trendBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    trendText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#fff',
    },
    statSubtitle: {
      fontSize: 11,
      opacity: 0.6,
      fontWeight: '500',
    },
    chartContainer: {
      marginHorizontal: 16,
      marginBottom: 20,
      borderRadius: 20,
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
      overflow: 'hidden',
    },
    chartHeader: {
      padding: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#1f2937' : '#e5e7eb',
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
    },
    chartSubtitle: {
      fontSize: 13,
      opacity: 0.6,
      fontWeight: '500',
    },
    chartContent: {
      padding: 20,
    },
    periodSelector: {
      flexDirection: 'row',
      backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#f1f5f9',
      borderRadius: 10,
      padding: 3,
      marginBottom: 16,
    },
    periodButton: {
      flex: 1,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 7,
      alignItems: 'center',
    },
    periodButtonActive: {
      backgroundColor: colors.tint,
    },
    periodText: {
      fontSize: 12,
      fontWeight: '600',
      opacity: 0.7,
    },
    periodTextActive: {
      color: '#fff',
      opacity: 1,
    },
    gridContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 12,
      marginBottom: 20,
    },
    gridItem: {
      flex: 1,
      borderRadius: 20,
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
      overflow: 'hidden',
    },
    gridItemHeader: {
      padding: 16,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#1f2937' : '#e5e7eb',
    },
    gridItemTitle: {
      fontSize: 14,
      fontWeight: '700',
    },
    gridItemContent: {
      padding: 16,
      alignItems: 'center',
    },
    macroLegend: {
      marginTop: 12,
      width: '100%',
    },
    macroItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    macroColor: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 8,
    },
    macroLabel: {
      fontSize: 11,
      fontWeight: '600',
      opacity: 0.8,
    },
    legendContainer: {
      marginTop: 16,
      width: '100%',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    legendColor: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 10,
    },
    legendLabel: {
      fontSize: 12,
      fontWeight: '600',
      opacity: 0.8,
    },
    legendRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    sectionHeader: {
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: 14,
      opacity: 0.6,
      fontWeight: '500',
    },
    prGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      gap: 12,
      marginBottom: 20,
    },
    prCard: {
      flex: 1,
      minWidth: (width - 44) / 2,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    prCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    prExercise: {
      fontSize: 13,
      fontWeight: '600',
      opacity: 0.8,
    },
    newBadge: {
      backgroundColor: '#10b981',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    newBadgeText: {
      fontSize: 9,
      fontWeight: '700',
      color: '#fff',
    },
    prWeight: {
      fontSize: 24,
      fontWeight: '800',
      marginBottom: 2,
    },
    prDate: {
      fontSize: 11,
      opacity: 0.5,
      fontWeight: '500',
    },
    calorieProgress: {
      width: '100%',
      alignItems: 'stretch',
    },
    calorieRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    calorieLabel: {
      fontSize: 12,
      fontWeight: '600',
      opacity: 0.7,
    },
    calorieValue: {
      fontSize: 12,
      fontWeight: '700',
    },
    progressBar: {
      height: 8,
      backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#e5e7eb',
      borderRadius: 4,
      marginVertical: 8,
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    progressText: {
      fontSize: 11,
      textAlign: 'center',
      opacity: 0.6,
      fontWeight: '500',
    },
    mealLegend: {
      marginTop: 16,
      width: '100%',
    },
    exerciseList: {
      paddingHorizontal: 16,
      marginBottom: 20,
    },
    exerciseCard: {
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.surface,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    exerciseHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    exerciseName: {
      fontSize: 16,
      fontWeight: '700',
    },
    exerciseRank: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.tint,
    },
    exerciseStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    exerciseStat: {
      alignItems: 'center',
    },
    exerciseStatValue: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 2,
    },
    exerciseStatLabel: {
      fontSize: 11,
      opacity: 0.6,
      fontWeight: '500',
      textTransform: 'uppercase',
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={[styles.header,{backgroundColor:'transparent'}]}>
        <ThemedText style={styles.headerTitle}>Progress</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Track your fitness journey</ThemedText>
      </ThemedView>

      <TabSelector />
      {renderContent()}
    </ScrollView>
  );
}