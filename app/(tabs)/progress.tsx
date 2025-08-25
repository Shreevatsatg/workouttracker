import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/utils/supabase';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  // State for all analytics data
  const [workoutVolume, setWorkoutVolume] = useState<any[]>([]);
  const [macroData, setMacroData] = useState<any[]>([]);
  const [workoutFrequency, setWorkoutFrequency] = useState<any[]>([]);
  const [muscleGroupData, setMuscleGroupData] = useState<any[]>([]);
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
      fetchSummaryStats(),
    ]);
  };

  const fetchWorkoutAnalytics = async () => {
    if (!user) return;
    
    // Workout frequency data
    const frequencyData = [
      { value: 4, label: 'Mon', frontColor: colors.tint },
      { value: 3, label: 'Tue', frontColor: colors.tint },
      { value: 5, label: 'Wed', frontColor: colors.tint },
      { value: 2, label: 'Thu', frontColor: colors.tint },
      { value: 6, label: 'Fri', frontColor: colors.tint },
      { value: 1, label: 'Sat', frontColor: colors.tint },
      { value: 0, label: 'Sun', frontColor: colors.tint },
    ];
    setWorkoutFrequency(frequencyData);

    // Muscle group distribution with modern colors
    const muscleData = [
      { value: 25, color: '#6366f1', text: '25%', label: 'Chest' },
      { value: 20, color: '#8b5cf6', text: '20%', label: 'Back' },
      { value: 30, color: '#06b6d4', text: '30%', label: 'Legs' },
      { value: 15, color: '#10b981', text: '15%', label: 'Arms' },
      { value: 10, color: '#f59e0b', text: '10%', label: 'Shoulders' },
    ];
    setMuscleGroupData(muscleData);

    // Volume data with gradient effect
    const { data, error } = await supabase.rpc('get_weekly_volume', { user_id_param: user.id });
    if (!error && data) {
      setWorkoutVolume(data.map((item: any, index: number) => ({ 
        value: item.total_volume,
        label: `W${index + 1}`,
        frontColor: index === data.length - 1 ? colors.tint : '#94a3b8',
        gradientColor: index === data.length - 1 ? '#3b82f6' : '#64748b'
      })));
    } else {
      // Mock data with better styling
      setWorkoutVolume([
        { value: 8500, label: 'W1', frontColor: '#94a3b8', gradientColor: '#64748b' },
        { value: 9200, label: 'W2', frontColor: '#94a3b8', gradientColor: '#64748b' },
        { value: 8800, label: 'W3', frontColor: '#94a3b8', gradientColor: '#64748b' },
        { value: 10100, label: 'W4', frontColor: colors.tint, gradientColor: '#3b82f6' },
      ]);
    }

    // Enhanced PR data
    setPrData([
      { exercise: 'Bench Press', weight: 175, date: '2 days ago', isNew: true, trend: '+15' },
      { exercise: 'Squat', weight: 225, date: '1 week ago', isNew: false, trend: '+5' },
      { exercise: 'Deadlift', weight: 285, date: '3 days ago', isNew: true, trend: '+20' },
      { exercise: 'Overhead Press', weight: 115, date: '1 week ago', isNew: false, trend: '+10' },
    ]);
  };

  const fetchNutritionData = async () => {
    // Enhanced macro data with better colors
    setMacroData([
      { value: 40, color: '#6366f1', text: '40%', label: 'Protein' },
      { value: 35, color: '#f59e0b', text: '35%', label: 'Carbs' },
      { value: 25, color: '#10b981', text: '25%', label: 'Fats' },
    ]);

    // Enhanced calorie data with gradient bars
    const dailyCalories = [
      { value: 1900, label: 'Mon', frontColor: '#60a5fa', gradientColor: '#3b82f6' },
      { value: 1950, label: 'Tue', frontColor: '#34d399', gradientColor: '#10b981' },
      { value: 2100, label: 'Wed', frontColor: '#fbbf24', gradientColor: '#f59e0b' },
      { value: 1850, label: 'Thu', frontColor: '#f472b6', gradientColor: '#ec4899' },
      { value: 2050, label: 'Fri', frontColor: '#8b5cf6', gradientColor: '#7c3aed' },
      { value: 2200, label: 'Sat', frontColor: '#06b6d4', gradientColor: '#0891b2' },
      { value: 1750, label: 'Sun', frontColor: '#10b981', gradientColor: '#059669' },
    ];
    setCalorieData(dailyCalories);
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

  const StatCard = ({ title, value, subtitle, icon, trend, highlight = false }: any) => (
    <ThemedView style={[styles.statCard, highlight && styles.statCardHighlight]}>
      <View style={styles.statCardHeader}>
        <View style={styles.statCardTop}>
          <Text style={[styles.statIcon, { fontSize: 20 }]}>{icon}</Text>
          {trend && (
            <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? '#10b981' : '#ef4444' }]}>
              <Text style={styles.trendText}>{trend > 0 ? '+' : ''}{trend}%</Text>
            </View>
          )}
        </View>
        <ThemedText style={styles.statTitle}>{title}</ThemedText>
      </View>
      <ThemedText style={[styles.statValue, highlight && styles.statValueHighlight]}>{value}</ThemedText>
      <ThemedText style={styles.statSubtitle}>{subtitle}</ThemedText>
    </ThemedView>
  );

  const PRCard = ({ exercise, weight, date, isNew, trend }: any) => (
    <View style={styles.prCard}>
      <View style={styles.prCardHeader}>
        <View style={styles.prCardTitleRow}>
          <ThemedText style={styles.prExercise}>{exercise}</ThemedText>
          {isNew && <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW!</Text></View>}
        </View>
        <View style={styles.prTrendContainer}>
          <Text style={styles.prTrend}>+{trend} lbs</Text>
        </View>
      </View>
      <ThemedText style={styles.prWeight}>{weight} lbs</ThemedText>
      <ThemedText style={styles.prDate}>{date}</ThemedText>
    </View>
  );

  const ModernTabSelector = () => (
    <View style={styles.modernTabContainer}>
      <View style={styles.tabButtonsContainer}>
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'workouts', label: 'Workouts', icon: '💪' },
          { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.modernTabButton, selectedTab === tab.id && styles.modernTabButtonActive]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Text style={[styles.modernTabIcon, selectedTab === tab.id && styles.modernTabIconActive]}>{tab.icon}</Text>
            <ThemedText style={[styles.modernTabText, selectedTab === tab.id && styles.modernTabTextActive]}>
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
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
      {/* Hero Stats */}
      <View style={styles.heroSection}>
        <ThemedText style={styles.heroSubtitle}>Keep up the great work! 🚀</ThemedText>
      </View>

      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard title="WORKOUT STREAK" value={summaryStats.currentStreak} subtitle="Days active" icon="🔥" trend={8} highlight />
        <StatCard title="THIS WEEK" value={summaryStats.weeklyWorkouts} subtitle="Workouts completed" icon="💪" trend={12} />
      </View>

      <View style={styles.statsGrid}>
        <StatCard title="VOLUME" value="12.8K" subtitle="lbs this month" icon="🏋️" trend={15} />
        <StatCard title="DURATION" value={`${summaryStats.avgDuration}min`} subtitle="Avg per workout" icon="⏱️" trend={-5} />
      </View>

      {/* Quick Nutrition Stats */}
      <View style={styles.nutritionOverview}>
        <View style={styles.nutritionCard}>
          <View style={styles.nutritionHeader}>
            <Text style={styles.nutritionEmoji}>🔥</Text>
            <ThemedText style={styles.nutritionTitle}>Today's Calories</ThemedText>
          </View>
          <View style={styles.nutritionProgress}>
            <ThemedText style={styles.nutritionValue}>{summaryStats.caloriesConsumed}</ThemedText>
            <ThemedText style={styles.nutritionGoal}>/ {summaryStats.caloriesGoal}</ThemedText>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { 
              width: `${Math.min((summaryStats.caloriesConsumed / summaryStats.caloriesGoal) * 100, 100)}%`,
              backgroundColor: summaryStats.caloriesConsumed > summaryStats.caloriesGoal ? '#ef4444' : colors.tint 
            }]} />
          </View>
          <ThemedText style={styles.nutritionPercent}>
            {Math.round((summaryStats.caloriesConsumed / summaryStats.caloriesGoal) * 100)}% of goal
          </ThemedText>
        </View>

        <View style={styles.nutritionCard}>
          <View style={styles.nutritionHeader}>
            <Text style={styles.nutritionEmoji}>🥩</Text>
            <ThemedText style={styles.nutritionTitle}>Today's Protein</ThemedText>
          </View>
          <View style={styles.nutritionProgress}>
            <ThemedText style={styles.nutritionValue}>{summaryStats.proteinConsumed}g</ThemedText>
            <ThemedText style={styles.nutritionGoal}>/ {summaryStats.proteinGoal}g</ThemedText>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { 
              width: `${Math.min((summaryStats.proteinConsumed / summaryStats.proteinGoal) * 100, 100)}%`,
              backgroundColor: '#10b981'
            }]} />
          </View>
          <ThemedText style={styles.nutritionPercent}>
            {Math.round((summaryStats.proteinConsumed / summaryStats.proteinGoal) * 100)}% of goal
          </ThemedText>
        </View>
      </View>

      {/* Weekly Volume Chart */}
      <ThemedView style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <ThemedText style={styles.chartTitle}>Weekly Volume Trend</ThemedText>
          <ThemedText style={styles.chartSubtitle}>Total weight lifted per week</ThemedText>
        </View>
        <View style={styles.chartContent}>
          <BarChart
            data={workoutVolume}
            barWidth={32}
            barBorderRadius={12}
            yAxisTextStyle={{ color: colors.text, fontSize: 11 }}
            xAxisTextStyle={{ color: colors.text, fontSize: 11 }}
            spacing={25}
            isAnimated
            animationDuration={1000}
            showGradient
          />
        </View>
      </ThemedView>
    </>
  );

  const renderWorkouts = () => (
    <>
      {/* Workout Frequency */}
      <ThemedView style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <ThemedText style={styles.chartTitle}>Weekly Activity</ThemedText>
          <ThemedText style={styles.chartSubtitle}>Workouts completed each day</ThemedText>
        </View>
        <View style={styles.chartContent}>
          <BarChart
            data={workoutFrequency}
            barWidth={35}
            barBorderRadius={12}
            yAxisTextStyle={{ color: colors.text, fontSize: 11 }}
            xAxisTextStyle={{ color: colors.text, fontSize: 11 }}
            maxValue={6}
            isAnimated
            animationDuration={800}
            showGradient
          />
        </View>
      </ThemedView>

      {/* Muscle Group Distribution */}
      <ThemedView style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <ThemedText style={styles.chartTitle}>Training Focus</ThemedText>
          <ThemedText style={styles.chartSubtitle}>Muscle group distribution this month</ThemedText>
        </View>
        <View style={styles.chartContent}>
          <View style={styles.pieChartContainer}>
            <PieChart
              data={muscleGroupData}
              donut
              innerRadius={60}
              radius={90}
              centerLabelComponent={() => (
                <View style={styles.pieCenter}>
                  <ThemedText style={styles.pieCenterValue}>100%</ThemedText>
                  <ThemedText style={styles.pieCenterLabel}>balanced</ThemedText>
                </View>
              )}
              isAnimated
              animationDuration={1200}
            />
          </View>
          <View style={styles.modernLegend}>
            {muscleGroupData.map((item, index) => (
              <View key={index} style={styles.modernLegendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <ThemedText style={styles.legendText}>{item.label}</ThemedText>
                <ThemedText style={styles.legendPercent}>{item.text}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      </ThemedView>

      {/* Personal Records */}
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
      {/* Macro Distribution */}
      <View style={styles.nutritionGrid}>
        <ThemedView style={styles.macroCard}>
          <View style={styles.macroCardHeader}>
            <Text style={styles.macroEmoji}>📊</Text>
            <ThemedText style={styles.macroCardTitle}>Today's Macros</ThemedText>
          </View>
          <View style={styles.macroChartContainer}>
            <PieChart
              data={macroData}
              donut
              innerRadius={45}
              radius={70}
              centerLabelComponent={() => (
                <View style={styles.macroCenter}>
                  <ThemedText style={styles.macroCenterValue}>{summaryStats.caloriesConsumed}</ThemedText>
                  <ThemedText style={styles.macroCenterLabel}>kcal</ThemedText>
                </View>
              )}
              isAnimated
              animationDuration={1000}
            />
          </View>
          <View style={styles.macroLegendCompact}>
            {macroData.map((item, index) => (
              <View key={index} style={styles.macroLegendItemCompact}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <ThemedText style={styles.macroLegendTextCompact}>{item.label} {item.text}</ThemedText>
              </View>
            ))}
          </View>
        </ThemedView>

        <View style={styles.nutritionStatsCard}>
          <View style={styles.nutritionStatItem}>
            <Text style={styles.nutritionStatEmoji}>🎯</Text>
            <ThemedText style={styles.nutritionStatValue}>{summaryStats.caloriesConsumed}</ThemedText>
            <ThemedText style={styles.nutritionStatLabel}>Calories Today</ThemedText>
            <ThemedText style={styles.nutritionStatGoal}>Goal: {summaryStats.caloriesGoal}</ThemedText>
          </View>
          <View style={styles.nutritionStatItem}>
            <Text style={styles.nutritionStatEmoji}>💪</Text>
            <ThemedText style={styles.nutritionStatValue}>{summaryStats.proteinConsumed}g</ThemedText>
            <ThemedText style={styles.nutritionStatLabel}>Protein</ThemedText>
            <ThemedText style={styles.nutritionStatGoal}>Goal: {summaryStats.proteinGoal}g</ThemedText>
          </View>
        </View>
      </View>

      {/* Weekly Calorie Intake */}
      <ThemedView style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <ThemedText style={styles.chartTitle}>Weekly Calorie Intake</ThemedText>
          <ThemedText style={styles.chartSubtitle}>Daily consumption vs 2200 cal goal</ThemedText>
        </View>
        <View style={styles.chartContent}>
          <BarChart
            data={calorieData}
            barWidth={32}
            barBorderRadius={12}
            yAxisTextStyle={{ color: colors.text, fontSize: 11 }}
            xAxisTextStyle={{ color: colors.text, fontSize: 11 }}
            spacing={22}
            isAnimated
            animationDuration={1000}
            showGradient
            showReferenceLine1
            referenceLine1Position={2200}
            referenceLine1Color={colors.tint}
            referenceLine1Config={{
              thickness: 2,
              dashWidth: 6,
              dashGap: 6,
            }}
          />
          <View style={styles.calorieInfo}>
            <View style={styles.calorieInfoItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.tint }]} />
              <ThemedText style={styles.calorieInfoText}>Daily Goal (2200 cal)</ThemedText>
            </View>
            <ThemedText style={styles.calorieAverage}>
              Weekly avg: 1971 cal • 95% of goal achieved
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'workouts': return renderWorkouts();
      case 'nutrition': return renderNutrition();
      default: return renderOverview();
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    heroSection: {
      paddingHorizontal: 20,
      paddingVertical: 24,
      alignItems: 'center',
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: '800',
      marginBottom: 6,
      textAlign: 'center',
    },
    heroSubtitle: {
      fontSize: 16,
      opacity: 0.7,
      fontWeight: '500',
      textAlign: 'center',
    },
    modernTabContainer: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#1f2937' : '#e5e7eb',
      marginBottom: 5,
    },
    tabButtonsContainer: {
      flexDirection: 'row',
      backgroundColor: 'transparent',
      borderRadius: 16,
      padding: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    modernTabButton: {
      flex: 1,
      paddingVertical: 2,
      paddingHorizontal: 12,
      borderRadius: 12,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      transition: 'all 0.2s ease',
    },
    modernTabButtonActive: {
      backgroundColor: colors.background,
      shadowColor: colors.tint,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
      transform: [{ scale: 1.02 }],
    },
    modernTabIcon: {
      fontSize: 20,
      marginBottom: 4,
      opacity: 0.6,
    },
    modernTabIconActive: {
      opacity: 1,
    },
    modernTabText: {
      fontSize: 12,
      fontWeight: '700',
      opacity: 0.6,
      textAlign: 'center',
    },
    modernTabTextActive: {
      color: '#fff',
      opacity: 1,
    },
    statsGrid: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      gap: 16,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      padding: 20,
      borderRadius: 20,
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? '#1f2937' : '#e5e7eb',
    },
    statCardHighlight: {
      borderColor: colors.tint,
      borderWidth: 2,
      shadowColor: colors.tint,
      shadowOpacity: 0.2,
    },
    statCardHeader: {
      marginBottom: 12,
    },
    statCardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    statTitle: {
      fontSize: 12,
      fontWeight: '700',
      opacity: 0.6,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    statIcon: {
      fontSize: 18,
    },
    statValue: {
      fontSize: 28,
      fontWeight: '900',
      marginBottom: 4,
    },
    statValueHighlight: {
      color: colors.tint,
    },
    trendBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    trendText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#fff',
    },
    statSubtitle: {
      fontSize: 12,
      opacity: 0.6,
      fontWeight: '500',
    },
    nutritionOverview: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      gap: 16,
      marginBottom: 24,
    },
    nutritionCard: {
      flex: 1,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    nutritionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    nutritionEmoji: {
      fontSize: 16,
      marginRight: 8,
    },
    nutritionTitle: {
      fontSize: 13,
      fontWeight: '700',
      opacity: 0.8,
    },
    nutritionProgress: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 8,
    },
    nutritionValue: {
      fontSize: 20,
      fontWeight: '800',
    },
    nutritionGoal: {
      fontSize: 14,
      fontWeight: '600',
      opacity: 0.5,
      marginLeft: 4,
    },
    progressBar: {
      height: 6,
      backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#e5e7eb',
      borderRadius: 3,
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    nutritionPercent: {
      fontSize: 11,
      opacity: 0.6,
      fontWeight: '600',
    },
    chartContainer: {
      marginHorizontal: 20,
      marginBottom: 24,
      borderRadius: 20,
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? '#1f2937' : '#e5e7eb',
    },
    chartHeader: {
      padding: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#1f2937' : '#e5e7eb',
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: '800',
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
    pieChartContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    pieCenter: {
      alignItems: 'center',
    },
    pieCenterValue: {
      fontSize: 20,
      fontWeight: '800',
    },
    pieCenterLabel: {
      fontSize: 12,
      opacity: 0.6,
      fontWeight: '600',
    },
    modernLegend: {
      gap: 12,
    },
    modernLegendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 12,
    },
    legendText: {
      fontSize: 14,
      fontWeight: '600',
      flex: 1,
    },
    legendPercent: {
      fontSize: 14,
      fontWeight: '700',
      opacity: 0.8,
    },
    sectionHeader: {
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '800',
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
      paddingHorizontal: 20,
      gap: 16,
      marginBottom: 24,
    },
    prCard: {
      flex: 1,
      minWidth: (width - 56) / 2,
      padding: 18,
      borderRadius: 18,
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? '#1f2937' : '#e5e7eb',
    },
    prCardHeader: {
      marginBottom: 12,
    },
    prCardTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    prExercise: {
      fontSize: 13,
      fontWeight: '700',
      opacity: 0.8,
      flex: 1,
    },
    newBadge: {
      backgroundColor: '#10b981',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    newBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      color: '#fff',
    },
    prTrendContainer: {
      alignItems: 'flex-end',
    },
    prTrend: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.tint,
      opacity: 0.8,
    },
    prWeight: {
      fontSize: 26,
      fontWeight: '900',
      marginBottom: 2,
      color: colors.tint,
    },
    prDate: {
      fontSize: 11,
      opacity: 0.5,
      fontWeight: '500',
    },
    periodSelector: {
      flexDirection: 'row',
      backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#f1f5f9',
      borderRadius: 12,
      padding: 4,
      marginBottom: 20,
    },
    periodButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    periodButtonActive: {
      backgroundColor: colors.tint,
      shadowColor: colors.tint,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    periodText: {
      fontSize: 12,
      fontWeight: '700',
      opacity: 0.7,
    },
    periodTextActive: {
      color: '#fff',
      opacity: 1,
    },
    nutritionGrid: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      gap: 16,
      marginBottom: 24,
    },
    macroCard: {
      flex: 1,
      padding: 18,
      borderRadius: 18,
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? '#1f2937' : '#e5e7eb',
    },
    macroCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    macroEmoji: {
      fontSize: 18,
      marginRight: 10,
    },
    macroCardTitle: {
      fontSize: 14,
      fontWeight: '700',
    },
    macroChartContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    macroCenter: {
      alignItems: 'center',
    },
    macroCenterValue: {
      fontSize: 16,
      fontWeight: '800',
    },
    macroCenterLabel: {
      fontSize: 11,
      opacity: 0.6,
      fontWeight: '600',
    },
    macroLegendCompact: {
      gap: 8,
    },
    macroLegendItemCompact: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    macroLegendTextCompact: {
      fontSize: 11,
      fontWeight: '600',
      opacity: 0.8,
    },
    nutritionStatsCard: {
      flex: 1,
      gap: 16,
    },
    nutritionStatItem: {
      flex: 1,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? '#1f2937' : '#e5e7eb',
    },
    nutritionStatEmoji: {
      fontSize: 20,
      marginBottom: 8,
    },
    nutritionStatValue: {
      fontSize: 20,
      fontWeight: '800',
      marginBottom: 2,
    },
    nutritionStatLabel: {
      fontSize: 12,
      fontWeight: '600',
      opacity: 0.7,
      marginBottom: 2,
    },
    nutritionStatGoal: {
      fontSize: 10,
      opacity: 0.5,
      fontWeight: '500',
    },
    calorieInfo: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colorScheme === 'dark' ? '#1f2937' : '#e5e7eb',
    },
    calorieInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    calorieInfoText: {
      fontSize: 12,
      fontWeight: '600',
      opacity: 0.8,
    },
    calorieAverage: {
      fontSize: 11,
      opacity: 0.6,
      fontWeight: '500',
      textAlign: 'center',
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ModernTabSelector />
      {renderContent()}
    </ScrollView>
  );
}