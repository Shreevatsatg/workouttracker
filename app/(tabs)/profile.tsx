import BodyWeightHistory from '@/components/BodyWeightHistory';
import History from '@/components/History';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface WorkoutStreakProps {
  workoutDates?: string[];
  foodDates?: string[];
  colors?: any;
  currentStreak?: number;
  longestStreak?: number;
  totalWorkouts?: number;
  totalFoodLogs?: number;
}

// Enhanced color scheme
const ACTIVITY_COLORS = {
  workout: {
    light: '#10b981', // Emerald-500
    medium: '#059669', // Emerald-600
    dark: '#047857', // Emerald-700
  },
  food: {
    light: '#f59e0b', // Amber-500
    medium: '#d97706', // Amber-600
    dark: '#b45309', // Amber-700
  },
  both: {
    light: '#6366f1', // Indigo-500
    medium: '#4f46e5', // Indigo-600
    dark: '#4338ca', // Indigo-700
  },
  none: 'transparent',
};

const WorkoutStreak: React.FC<WorkoutStreakProps> = ({ 
  workoutDates = [], 
  foodDates = [],
  colors = {}, 
  currentStreak = 0,
  longestStreak = 0,
  totalWorkouts = 0,
  totalFoodLogs = 0
}) => {
  // Fallback colors in case colors prop is undefined or incomplete
  const safeColors = {
    text: colors?.text || '#000000',
    background: colors?.background || '#FFFFFF',
    surface: colors?.surface || '#F5F5F5',
    tint: colors?.tint || '#007AFF',
    ...colors
  };

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'year' | '3month'>('3month');
  
  const today = new Date();
  const displayYear = new Date().getFullYear();
  
  // Calculate date range based on view mode
  const { startDate, endDate } = useMemo(() => {
    if (viewMode === '3month') {
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      start.setDate(1);
      return { startDate: start, endDate: today };
    }
    return { 
      startDate: new Date(displayYear, 0, 1), 
      endDate: new Date(displayYear, 11, 31) 
    };
  }, [viewMode, displayYear]);

  const generateDateGrid = () => {
    const dates = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const dateGrid = generateDateGrid();
  const workoutDateSet = new Set((workoutDates || []).map(date => date.split('T')[0]));
  const foodDateSet = new Set((foodDates || []).map(date => date.split('T')[0]));

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDateActivity = (date: Date) => {
    const dateStr = formatDate(date);
    const hasWorkout = workoutDateSet.has(dateStr);
    const hasFood = foodDateSet.has(dateStr);
    const isToday = date.toDateString() === today.toDateString();
    
    if (hasWorkout && hasFood) return { type: 'both', isToday };
    if (hasWorkout) return { type: 'workout', isToday };
    if (hasFood) return { type: 'food', isToday };
    return { type: 'none', isToday };
  };

  const getActivityIntensity = (date: Date, type: string) => {
    if (type === 'none') return 'none';
    return 'medium';
  };

  const getWeeks = () => {
    const weeks = [];
    let currentWeek = [];
    
    const firstDay = viewMode === '3month' ? startDate : new Date(displayYear, 0, 1);
    const dayOfWeekOfFirstDay = firstDay.getDay();
    
    for (let i = 0; i < dayOfWeekOfFirstDay; i++) {
      currentWeek.push(null);
    }

    dateGrid.forEach((date) => {
      currentWeek.push(date);
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const weeks = getWeeks();

  const monthOffsets = useMemo(() => {
    const offsets = [];
    let currentMonth = -1;
    weeks.forEach((week, index) => {
      const firstDayInWeek = week.find(day => day !== null);
      if (firstDayInWeek && firstDayInWeek.getMonth() !== currentMonth) {
        currentMonth = firstDayInWeek.getMonth();
        offsets.push({
          month: firstDayInWeek.toLocaleString('default', { month: 'short' }),
          weekIndex: index,
          leftOffset: index * 14,
        });
      }
    });
    return offsets;
  }, [weeks]);

  const getActivityStats = () => {
    const periodWorkouts = (workoutDates || []).filter(date => {
      const d = new Date(date);
      return d >= startDate && d <= endDate;
    }).length;
    
    const periodFoodLogs = (foodDates || []).filter(date => {
      const d = new Date(date);
      return d >= startDate && d <= endDate;
    }).length;
    
    const totalDays = dateGrid.length;
    const workoutPercentage = totalDays > 0 ? Math.round((periodWorkouts / totalDays) * 100) : 0;
    const foodPercentage = totalDays > 0 ? Math.round((periodFoodLogs / totalDays) * 100) : 0;
    
    return {
      periodWorkouts,
      periodFoodLogs,
      workoutPercentage,
      foodPercentage
    };
  };

  const { periodWorkouts, periodFoodLogs, workoutPercentage, foodPercentage } = getActivityStats();

  const handleDatePress = (date: Date) => {
    setSelectedDate(selectedDate?.getTime() === date.getTime() ? null : date);
  };

  return (
    <ThemedView style={[streakStyles.streakContainer, { 
      borderColor: safeColors.text + '15', 
      backgroundColor: safeColors.surface,
      shadowColor: safeColors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    }]}>
      {/* Enhanced Header */}
      <View style={streakStyles.streakHeader}>
        <View style={streakStyles.yearInfo}>
          <ThemedText type="subtitle" style={[streakStyles.streakTitle, { color: safeColors.text }]}>
            Activity Overview
          </ThemedText>
          <ThemedText style={[streakStyles.yearSubtitle, { color: safeColors.text + 'CC' }]}>
            {viewMode === 'year' ? `${displayYear}` : 'Last 3 months'}
          </ThemedText>
        </View>
        
        {/* View Mode Toggle */}
        <View style={[streakStyles.viewToggle, { backgroundColor: safeColors.text + '08' }]}>
          <TouchableOpacity
            style={[
              streakStyles.toggleButton,
              viewMode === 'year' && { backgroundColor: safeColors.tint }
            ]}
            onPress={() => setViewMode('year')}
          >
            <Text style={[
              streakStyles.toggleText,
              { color: viewMode === 'year' ? safeColors.background : safeColors.text + 'AA' }
            ]}>
              Year
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              streakStyles.toggleButton,
              viewMode === '3month' && { backgroundColor: safeColors.tint }
            ]}
            onPress={() => setViewMode('3month')}
          >
            <Text style={[
              streakStyles.toggleText,
              { color: viewMode === '3month' ? safeColors.background : safeColors.text + 'AA' }
            ]}>
              3M
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Enhanced Activity Stats */}
      <View style={streakStyles.activityStats}>
        <View style={streakStyles.statItem}>
          <View style={[streakStyles.statIconContainer, { backgroundColor: ACTIVITY_COLORS.workout.light + '20' }]}>
            <IconSymbol name="figure.strengthtraining.traditional" size={16} color={ACTIVITY_COLORS.workout.medium} />
          </View>
          <ThemedText style={[streakStyles.statValue, { color: ACTIVITY_COLORS.workout.medium }]}>
            {periodWorkouts}
          </ThemedText>
          <ThemedText style={[streakStyles.statLabel, { color: safeColors.text + 'AA' }]}>
            Workouts
          </ThemedText>
          <ThemedText style={[streakStyles.statPercentage, { color: ACTIVITY_COLORS.workout.medium }]}>
            {workoutPercentage}%
          </ThemedText>
        </View>
        
        <View style={streakStyles.statItem}>
          <View style={[streakStyles.statIconContainer, { backgroundColor: ACTIVITY_COLORS.food.light + '20' }]}>
            <IconSymbol name="fork.knife" size={16} color={ACTIVITY_COLORS.food.medium} />
          </View>
          <ThemedText style={[streakStyles.statValue, { color: ACTIVITY_COLORS.food.medium }]}>
            {periodFoodLogs}
          </ThemedText>
          <ThemedText style={[streakStyles.statLabel, { color: safeColors.text + 'AA' }]}>
            Food Logs
          </ThemedText>
          <ThemedText style={[streakStyles.statPercentage, { color: ACTIVITY_COLORS.food.medium }]}>
            {foodPercentage}%
          </ThemedText>
        </View>
        
        <View style={streakStyles.statItem}>
          <View style={[streakStyles.statIconContainer, { backgroundColor: safeColors.tint + '20' }]}>
            <IconSymbol name="flame.fill" size={16} color={safeColors.tint} />
          </View>
          <ThemedText style={[streakStyles.statValue, { color: safeColors.tint }]}>
            {currentStreak}
          </ThemedText>
          <ThemedText style={[streakStyles.statLabel, { color: safeColors.text + 'AA' }]}>
            Current Streak
          </ThemedText>
          <ThemedText style={[streakStyles.statPercentage, { color: safeColors.tint }]}>
            Best: {longestStreak}
          </ThemedText>
        </View>
      </View>
      
      {/* Enhanced Calendar Grid */}
      <View style={streakStyles.calendarWrapper}>
        <View style={streakStyles.calendarHeader}>
          <View style={streakStyles.dayLabelsContainer}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <Text key={index} style={[streakStyles.dayLabel, { color: safeColors.text + '88' }]}>
                {day}
              </Text>
            ))}
          </View>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={streakStyles.calendarScrollContent}
          style={streakStyles.calendarScroll}
        >
          {/* Month Labels */}
          <View style={streakStyles.monthLabelsRow}>
            {monthOffsets.map((offset, index) => (
              <Text 
                key={index} 
                style={[
                  streakStyles.monthLabel, 
                  { 
                    left: offset.leftOffset,
                    color: safeColors.text + 'AA'
                  }
                ]}
              >
                {offset.month}
              </Text>
            ))}
          </View>
          
          {/* Enhanced Calendar Grid */}
          <View style={streakStyles.calendarGrid}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={streakStyles.weekColumn}>
                {week.map((date, dayIndex) => {
                  if (!date) {
                    return <View key={dayIndex} style={streakStyles.emptyDay} />;
                  }
                  
                  const activity = getDateActivity(date);
                  const intensity = getActivityIntensity(date, activity.type);
                  
                  let backgroundColor = safeColors.text + '06';
                  let borderColor = 'transparent';
                  let borderWidth = 0;
                  
                  if (activity.type !== 'none') {
                    backgroundColor = ACTIVITY_COLORS[activity.type][intensity];
                  }
                  
                  if (activity.isToday) {
                    borderColor = safeColors.tint;
                    borderWidth = 2;
                  }
                  
                  if (selectedDate && selectedDate.getTime() === date.getTime()) {
                    borderColor = safeColors.text;
                    borderWidth = 2;
                  }
                  
                  return (
                    <TouchableOpacity
                      key={dayIndex}
                      onPress={() => handleDatePress(date)}
                      style={[
                        streakStyles.daySquare,
                        { 
                          backgroundColor,
                          borderColor,
                          borderWidth,
                        }
                      ]}
                      activeOpacity={0.7}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Selected Date Info */}
      {selectedDate && (
        <View style={[streakStyles.selectedDateInfo, { backgroundColor: safeColors.text + '08' }]}>
          <View style={streakStyles.selectedDateHeader}>
            <ThemedText style={[streakStyles.selectedDateText, { color: safeColors.text }]}>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </ThemedText>
            <TouchableOpacity onPress={() => setSelectedDate(null)}>
              <IconSymbol name="xmark.circle.fill" size={20} color={safeColors.text + 'AA'} />
            </TouchableOpacity>
          </View>
          
          <View style={streakStyles.selectedDateActivities}>
            {(() => {
              const activity = getDateActivity(selectedDate);
              const dateStr = formatDate(selectedDate);
              
              return (
                <View style={streakStyles.activityList}>
                  {workoutDateSet.has(dateStr) && (
                    <View style={streakStyles.activityItem}>
                      <View style={[streakStyles.activityDot, { backgroundColor: ACTIVITY_COLORS.workout.medium }]} />
                      <ThemedText style={[streakStyles.activityText, { color: safeColors.text }]}>Workout logged</ThemedText>
                    </View>
                  )}
                  {foodDateSet.has(dateStr) && (
                    <View style={streakStyles.activityItem}>
                      <View style={[streakStyles.activityDot, { backgroundColor: ACTIVITY_COLORS.food.medium }]} />
                      <ThemedText style={[streakStyles.activityText, { color: safeColors.text }]}>Food logged</ThemedText>
                    </View>
                  )}
                  {activity.type === 'none' && (
                    <ThemedText style={[streakStyles.noActivityText, { color: safeColors.text + 'AA' }]}>
                      No activities logged
                    </ThemedText>
                  )}
                </View>
              );
            })()}
          </View>
        </View>
      )}
      
      {/* Enhanced Legend */}
      <View style={streakStyles.legend}>
        <View style={streakStyles.legendSection}>
          <ThemedText style={[streakStyles.legendTitle, { color: safeColors.text }]}>Activity Types</ThemedText>
          <View style={streakStyles.legendItems}>
            <View style={streakStyles.legendItem}>
              <View style={[streakStyles.legendSquare, { backgroundColor: ACTIVITY_COLORS.workout.medium }]} />
              <Text style={[streakStyles.legendText, { color: safeColors.text + 'AA' }]}>Workout</Text>
            </View>
            <View style={streakStyles.legendItem}>
              <View style={[streakStyles.legendSquare, { backgroundColor: ACTIVITY_COLORS.food.medium }]} />
              <Text style={[streakStyles.legendText, { color: safeColors.text + 'AA' }]}>Food</Text>
            </View>
            <View style={streakStyles.legendItem}>
              <View style={[streakStyles.legendSquare, { backgroundColor: ACTIVITY_COLORS.both.medium }]} />
              <Text style={[streakStyles.legendText, { color: safeColors.text + 'AA' }]}>Both</Text>
            </View>
            <View style={streakStyles.legendItem}>
              <View style={[streakStyles.legendSquare, { backgroundColor: safeColors.text + '06' }]} />
              <Text style={[streakStyles.legendText, { color: safeColors.text + 'AA' }]}>None</Text>
            </View>
          </View>
        </View>
      </View>
    </ThemedView>
  );
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, profile } = useAuth();
  const router = useRouter();
  const [workoutCount, setWorkoutCount] = useState<number | null>(null);
  const [allWorkoutDates, setAllWorkoutDates] = useState<string[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('Workouts');
  const [bodyWeightHistory, setBodyWeightHistory] = useState<any[]>([]);

  const calculateStreaks = useCallback((dates: string[]) => {
    if (dates.length === 0) return { current: 0, longest: 0 };
    
    const dateSet = new Set(dates.map(date => date.split('T')[0]));
    const sortedDates = Array.from(dateSet).sort();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Calculate current streak from today backwards
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (dateSet.has(dateStr)) {
        currentStreak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffTime = currDate.getTime() - prevDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return { current: currentStreak, longest: longestStreak };
  }, []);

  const fetchWorkoutData = useCallback(async () => {
    if (!user) return;
    
    const { count, error: countError } = await supabase
      .from('workout_sessions')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id);

    if (countError) {
      console.error('Error fetching workout count:', countError);
    } else {
      setWorkoutCount(count);
    }

    const { data: sessions, error: datesError } = await supabase
      .from('workout_sessions')
      .select('completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (datesError) {
      console.error('Error fetching workout dates:', datesError);
    } else {
      const dates = sessions?.map(session => session.completed_at) || [];
      setAllWorkoutDates(dates);
      
      const streaks = calculateStreaks(dates);
      setCurrentStreak(streaks.current);
      setLongestStreak(streaks.longest);
    }
  }, [user, calculateStreaks]);

  const fetchBodyWeightHistory = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('measurements')
      .select('id, value, created_at')
      .eq('user_id', user.id)
      .eq('type', 'weight')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching body weight history:', error);
    } else {
      setBodyWeightHistory(data || []);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWorkoutData();
      fetchBodyWeightHistory();
    }
  }, [user, fetchWorkoutData, fetchBodyWeightHistory]);

  const filteredWorkoutDates = useMemo(() => {
    const displayYear = new Date().getFullYear();
    return allWorkoutDates.filter(dateString => new Date(dateString).getFullYear() === displayYear);
  }, [allWorkoutDates]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            {/* Enhanced Profile Header */}
            <ThemedView style={[styles.modernHeader, { backgroundColor: 'transparent' }]}>
              <View style={styles.profileSection}>
                <View style={[styles.modernAvatar, { borderColor: colors.tint + '30', backgroundColor: colors.tint + '08' }]}>
                  <IconSymbol name="person.crop.circle.fill" size={64} color={colors.tint} />
                </View>
                <View style={styles.profileInfo}>
                  <ThemedText style={[styles.greeting, { color: colors.text + 'AA' }]}>
                    {getGreeting()}
                  </ThemedText>
                  <ThemedText type="title" style={[styles.modernName, { color: colors.text }]}>
                    {profile?.full_name || 'User'}
                  </ThemedText>
                </View>
              </View>
            </ThemedView>

            {/* Enhanced Activity Tracker - Fixed Layout */}
            <View style={styles.cardsContainer}>
              {/* Workout Streak Card */}
              <View style={styles.cardWrapper}>
                <WorkoutStreak 
                  workoutDates={filteredWorkoutDates} 
                  foodDates={[]} // Add food dates when available
                  colors={colors} 
                  currentStreak={currentStreak}
                  longestStreak={longestStreak}
                  totalWorkouts={workoutCount || 0}
                  totalFoodLogs={0} // Add food logs count when available
                />
              </View>
            </View>

            {/* Enhanced Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.modernActionButton, { backgroundColor: colors.tint }]}
                onPress={() => router.push('/measurements')}
              >
                <IconSymbol name="ruler" size={20} color={colors.background} />
                <ThemedText style={[styles.modernActionText, { color: colors.background }]}>
                  Measurements
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modernActionButton, { backgroundColor: colors.tint }]}
                onPress={() => router.push('/calendar')}
              >
                <IconSymbol name="calendar" size={20} color={colors.background} />
                <ThemedText style={[styles.modernActionText, { color: colors.background }]}>
                  Calendar
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Enhanced History Section */}
            <ThemedView style={[styles.modernHistorySection, { backgroundColor: 'transparent' }]}>
              <View style={styles.historyHeader}>
                <View style={styles.historyTitleContainer}>
                  <ThemedText type="subtitle" style={[styles.modernHistoryTitle, { color: colors.text }]}>
                    History
                  </ThemedText>
                  <ThemedText style={[styles.historySubtitle, { color: colors.text + 'AA' }]}>
                    Your latest sessions and measurements
                  </ThemedText>
                </View>
              </View>
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'Workouts' && styles.activeTabButton, { borderBottomColor: activeTab === 'Workouts' ? colors.tint : colors.surface }]}
                  onPress={() => setActiveTab('Workouts')}
                >
                  <ThemedText style={[styles.tabButtonText, { color: activeTab === 'Workouts' ? colors.text : colors.text + 'AA' }]}>Workouts</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'Weight' && styles.activeTabButton, { borderBottomColor: activeTab === 'Weight' ? colors.tint : colors.surface }]}
                  onPress={() => setActiveTab('Weight')}
                >
                  <ThemedText style={[styles.tabButtonText, { color: activeTab === 'Weight' ? colors.text : colors.text + 'AA' }]}>Weight</ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </>
        }
        data={[{ key: 'content' }]}
        renderItem={() => activeTab === 'Workouts' ? <History onWorkoutDeleted={fetchWorkoutData} /> : <BodyWeightHistory data={bodyWeightHistory} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  modernHeader: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  modernAvatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  modernName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  
  // Fixed Cards Container
  cardsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  cardWrapper: {
    marginBottom: 16,
  },

  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  modernActionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  modernActionText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // History Section
  modernHistorySection: {
    paddingHorizontal: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  historyTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  modernHistoryTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  historySubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderBottomWidth: 5,
  },
  activeTabButton: {
    // Additional styles for active tab if needed
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

// Enhanced Streak Styles
const streakStyles = StyleSheet.create({
  streakContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  yearInfo: {
    alignItems: 'flex-start',
    gap: 4,
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  yearSubtitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  statPercentage: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  calendarWrapper: {
    marginBottom: 20,
  },
  calendarHeader: {
    marginBottom: 12,
  },
  dayLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: 24,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    width: 12,
  },
  calendarScroll: {
    maxHeight: 140,
  },
  calendarScrollContent: {
    paddingRight: 24,
  },
  monthLabelsRow: {
    height: 20,
    position: 'relative',
    marginBottom: 8,
  },
  monthLabel: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '700',
    top: 0,
  },
  calendarGrid: {
    flexDirection: 'row',
    gap: 3,
  },
  weekColumn: {
    flexDirection: 'column',
    gap: 3,
  },
  daySquare: {
    width: 11,
    height: 11,
    borderRadius: 3,
  },
  emptyDay: {
    width: 11,
    height: 11,
  },
  selectedDateInfo: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedDateActivities: {
    gap: 8,
  },
  activityList: {
    gap: 6,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activityText: {
    fontSize: 13,
    fontWeight: '500',
  },
  noActivityText: {
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  legend: {
    alignItems: 'center',
  },
  legendSection: {
    alignItems: 'center',
    gap: 12,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  legendItems: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSquare: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
});