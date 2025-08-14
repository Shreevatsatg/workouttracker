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
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface WorkoutStreakProps {
  workoutDates: string[];
  colors: any;
  displayYear: number;
  onYearChange: (year: number) => void;
  availableYears: number[];
  canGoToPreviousYear: boolean;
  canGoToNextYear: boolean;
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
}

const WorkoutStreak: React.FC<WorkoutStreakProps> = ({ 
  workoutDates, 
  colors, 
  displayYear, 
  onYearChange, 
  availableYears, 
  canGoToPreviousYear, 
  canGoToNextYear,
  currentStreak,
  longestStreak,
  totalWorkouts
}) => {
  const today = new Date();
  const startDate = new Date(displayYear, 0, 1);
  const endDate = new Date(displayYear, 11, 31);

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
  const workoutDateSet = new Set(workoutDates.map(date => date.split('T')[0]));

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDateStatus = (date: Date) => {
    const dateStr = formatDate(date);
    if (workoutDateSet.has(dateStr)) return 'workout';
    if (date.toDateString() === today.toDateString()) return 'today';
    return 'none';
  };

  const getWorkoutIntensity = (date: Date) => {
    const dateStr = formatDate(date);
    // You could extend this to have different intensities based on workout data
    if (workoutDateSet.has(dateStr)) return 'high';
    return 'none';
  };

  const getWeeks = () => {
    const weeks = [];
    let currentWeek = [];
    
    const firstDayOfYear = new Date(displayYear, 0, 1);
    const dayOfWeekOfFirstDay = firstDayOfYear.getDay();
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
          leftOffset: index * 12,
        });
      }
    });
    return offsets;
  }, [weeks]);

  const getActivityStats = () => {
    const yearWorkouts = workoutDates.filter(date => 
      new Date(date).getFullYear() === displayYear
    ).length;
    
    return {
      yearWorkouts,
      percentage: Math.round((yearWorkouts / dateGrid.length) * 100)
    };
  };

  const { yearWorkouts, percentage } = getActivityStats();

  return (
    <ThemedView style={[styles.streakContainer, { borderColor: colors.text + '10' }]}>
      {/* Header with Year Navigation */}
      <View style={styles.streakHeader}>
        <TouchableOpacity 
          onPress={() => onYearChange(displayYear - 1)}
          disabled={!canGoToPreviousYear}
          style={[styles.yearButton, { 
            opacity: canGoToPreviousYear ? 1 : 0.3,
            backgroundColor: colors.text + '05'
          }]}
        >
          <IconSymbol name="chevron.left" size={18} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.yearInfo}>
          <ThemedText type="subtitle" style={[styles.streakTitle, { color: colors.text }]}>
            {displayYear}
          </ThemedText>
          <ThemedText style={[styles.yearSubtitle, { color: colors.text + 'AA' }]}>
            {yearWorkouts} workouts • {percentage}% active
          </ThemedText>
        </View>
        
        <TouchableOpacity 
          onPress={() => onYearChange(displayYear + 1)}
          disabled={!canGoToNextYear}
          style={[styles.yearButton, { 
            opacity: canGoToNextYear ? 1 : 0.3,
            backgroundColor: colors.text + '05'
          }]}
        >
          <IconSymbol name="chevron.right" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Activity Stats */}
      <View style={styles.activityStats}>
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: colors.tint }]}>
            {currentStreak}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.text + 'AA' }]}>
            Current Streak
          </ThemedText>
        </View>
        
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: '#f59e0b' }]}>
            {yearWorkouts}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.text + 'AA' }]}>
            This Year
          </ThemedText>
        </View>
        
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: '#22c55e' }]}>
            {totalWorkouts}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.text + 'AA' }]}>
            Total Workouts
          </ThemedText>
        </View>
      </View>
      
      {/* Calendar Grid */}
      <View style={styles.calendarWrapper}>
        <View style={styles.calendarHeader}>
          <View style={styles.dayLabelsContainer}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <Text key={index} style={[styles.dayLabel, { color: colors.text + '66' }]}>
                {day}
              </Text>
            ))}
          </View>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.calendarScrollContent}
          style={styles.calendarScroll}
        >
          {/* Month Labels */}
          <View style={styles.monthLabelsRow}>
            {monthOffsets.map((offset, index) => (
              <Text 
                key={index} 
                style={[
                  styles.monthLabel, 
                  { 
                    left: offset.leftOffset,
                    color: colors.text + '88'
                  }
                ]}
              >
                {offset.month}
              </Text>
            ))}
          </View>
          
          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekColumn}>
                {week.map((date, dayIndex) => {
                  if (!date) {
                    return <View key={dayIndex} style={styles.emptyDay} />;
                  }
                  
                  const status = getDateStatus(date);
                  const intensity = getWorkoutIntensity(date);
                  
                  let backgroundColor = colors.text + '08'; // Very light for empty days
                  let borderColor = 'transparent';
                  
                  if (status === 'workout') {
                    // Different shades of green based on intensity
                    backgroundColor = intensity === 'high' ? '#16a34a' : '#22c55e';
                  } else if (status === 'today') {
                    backgroundColor = colors.text + '15';
                    borderColor = colors.tint;
                  }
                  
                  return (
                    <View
                      key={dayIndex}
                      style={[
                        styles.daySquare,
                        { 
                          backgroundColor,
                          borderColor,
                          borderWidth: status === 'today' ? 1.5 : 0
                        }
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      
      {/* Enhanced Legend */}
      <View style={styles.legend}>
        <Text style={[styles.legendLabel, { color: colors.text + '88' }]}>Less</Text>
        <View style={styles.legendItems}>
          <View style={[styles.legendSquare, { backgroundColor: colors.text + '08' }]} />
          <View style={[styles.legendSquare, { backgroundColor: '#22c55e' + '60' }]} />
          <View style={[styles.legendSquare, { backgroundColor: '#22c55e' + '90' }]} />
          <View style={[styles.legendSquare, { backgroundColor: '#16a34a' }]} />
        </View>
        <Text style={[styles.legendLabel, { color: colors.text + '88' }]}>More</Text>
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
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear());

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
        // If no workout today, check yesterday
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

  useEffect(() => {
    if (user) {
      fetchWorkoutData();
    }
  }, [user, fetchWorkoutData]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    allWorkoutDates.forEach(dateString => {
      years.add(new Date(dateString).getFullYear());
    });
    // Always include current year
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [allWorkoutDates]);

  const handleYearChange = useCallback((year: number) => {
    setDisplayYear(year);
  }, []);

  const filteredWorkoutDates = useMemo(() => {
    return allWorkoutDates.filter(dateString => new Date(dateString).getFullYear() === displayYear);
  }, [allWorkoutDates, displayYear]);

  const currentYearIndex = useMemo(() => {
    return availableYears.indexOf(displayYear);
  }, [availableYears, displayYear]);

  const canGoToPreviousYear = currentYearIndex < availableYears.length - 1;
  const canGoToNextYear = currentYearIndex > 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
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

      

      {/* Enhanced Activity Tracker */}
      <WorkoutStreak 
        workoutDates={filteredWorkoutDates} 
        colors={colors} 
        displayYear={displayYear}
        onYearChange={handleYearChange}
        availableYears={availableYears}
        canGoToPreviousYear={canGoToPreviousYear}
        canGoToNextYear={canGoToNextYear}
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        totalWorkouts={workoutCount || 0}
      />

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
        
        
      </View>

      {/* Enhanced History Section */}
      <ThemedView style={[styles.modernHistorySection, { backgroundColor: 'transparent' }]}>
        <View style={styles.historyHeader}>
          <View>
            <ThemedText type="subtitle" style={[styles.modernHistoryTitle, { color: colors.text }]}>
              Recent Activity
            </ThemedText>
            <ThemedText style={[styles.historySubtitle, { color: colors.text + 'AA' }]}>
              Your latest workout sessions
            </ThemedText>
          </View>
        </View>
        <History onWorkoutDeleted={fetchWorkoutData} />
      </ThemedView>
    </ScrollView>
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
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  statIconContainer: {
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  streakContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  yearButton: {
    padding: 8,
    borderRadius: 12,
  },
  yearInfo: {
    alignItems: 'center',
    gap: 4,
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  yearSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  calendarWrapper: {
    marginBottom: 20,
  },
  calendarHeader: {
    marginBottom: 8,
  },
  dayLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: 20,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    width: 12,
  },
  calendarScroll: {
    maxHeight: 120,
  },
  calendarScrollContent: {
    paddingRight: 20,
  },
  monthLabelsRow: {
    height: 18,
    position: 'relative',
    marginBottom: 6,
  },
  monthLabel: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: '600',
    top: 0,
  },
  calendarGrid: {
    flexDirection: 'row',
    gap: 2,
  },
  weekColumn: {
    flexDirection: 'column',
    gap: 2,
  },
  daySquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  emptyDay: {
    width: 10,
    height: 10,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  legendItems: {
    flexDirection: 'row',
    gap: 3,
  },
  legendSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
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
  modernHistorySection: {
    paddingHorizontal: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
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
});