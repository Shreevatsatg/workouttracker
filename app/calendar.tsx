import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/utils/supabase';
import { Picker } from '@react-native-picker/picker';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const getDaysInMonth = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days: Date[] = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [foodDates, setFoodDates] = useState<Set<string>>(new Set());
  const [workoutDates, setWorkoutDates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const dayWidth = (screenWidth - 60) / 7; // Increased padding

  const fetchCalendarData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const { data: foodData, error: foodError } = await supabase
      .from('food_entries')
      .select('logged_at')
      .eq('user_id', user.id)
      .gte('logged_at', startOfMonth.toISOString())
      .lte('logged_at', endOfMonth.toISOString());

    if (foodError) {
      console.error('Error fetching food entries for calendar:', foodError);
    } else {
      const dates = new Set(foodData.map(entry => new Date(entry.logged_at).toDateString()));
      setFoodDates(dates);
    }

    const { data: workoutData, error: workoutError } = await supabase
      .from('workout_sessions')
      .select('completed_at')
      .eq('user_id', user.id)
      .gte('completed_at', startOfMonth.toISOString())
      .lte('completed_at', endOfMonth.toISOString());

    if (workoutError) {
      console.error('Error fetching workout sessions for calendar:', workoutError);
    } else {
      const dates = new Set(workoutData.map(session => new Date(session.completed_at).toDateString()));
      setWorkoutDates(dates);
    }

    setIsLoading(false);
  }, [user, currentMonth, currentYear]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const days = useMemo(() => getDaysInMonth(new Date(currentYear, currentMonth)), [currentYear, currentMonth]);
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isCurrentMonthDate = (date: Date) => date.getMonth() === currentMonth;

  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer, { backgroundColor: 'transparent' }]}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading calendar...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Enhanced Header */}
      <View style={[styles.header, { backgroundColor: 'transparent' }]}>
        <View style={styles.headerTop}>
          <View style={styles.monthYearContainer}>
            <ThemedText style={[styles.monthText, { color: colors.text }]}>
              {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })}
            </ThemedText>
            <ThemedText style={[styles.yearText, { color: colors.textSecondary }]}>
              {currentYear}
            </ThemedText>
          </View>
          <View style={styles.navigationContainer}>
            <TouchableOpacity 
              style={[styles.navButton, { backgroundColor: colors.tint + '15' }]}
              onPress={() => navigateMonth('prev')}
            >
              <Text style={[styles.navButtonText, { color: colors.tint }]}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.navButton, { backgroundColor: colors.tint + '15' }]}
              onPress={() => navigateMonth('next')}
            >
              <Text style={[styles.navButtonText, { color: colors.tint }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Picker Row */}
        <View style={[styles.pickerRow, { borderTopColor: colors.border }]}>
          <View style={[styles.pickerContainer, { backgroundColor: 'transparent' }]}>
            <Picker
              selectedValue={currentMonth}
              onValueChange={(itemValue) => setCurrentMonth(itemValue)}
              style={[styles.picker, { color: colors.text }]}
            >
              {months.map((month) => (
                <Picker.Item 
                  key={month} 
                  label={new Date(currentYear, month).toLocaleString('default', { month: 'long' })} 
                  value={month} 
                  color={colors.text}
                />
              ))}
            </Picker>
          </View>
          <View style={[styles.pickerContainer, { backgroundColor: 'transparent' }]}>
            <Picker
              selectedValue={currentYear}
              onValueChange={(itemValue) => setCurrentYear(itemValue)}
              style={[styles.picker, { color: colors.text }]}
            >
              {years.map((year) => (
                <Picker.Item 
                  key={year} 
                  label={year.toString()} 
                  value={year} 
                  color={colors.text}
                />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {/* Day Names Header */}
      <View style={[styles.dayNamesRow, { backgroundColor: 'transparent', borderBottomColor: colors.border }]}>
        {dayNames.map((day) => (
          <View key={day} style={[styles.dayNameCell, { width: dayWidth }]}>
            <ThemedText style={[styles.dayNameText, { color: colors.textSecondary }]}>
              {day}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
        <View style={styles.calendarGrid}>
          {Array.from({ length: 6 }, (_, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => {
                const isTodayDate = isSameDay(date, today);
                const hasFood = foodDates.has(date.toDateString());
                const hasWorkout = workoutDates.has(date.toDateString());
                const isCurrentMonth = isCurrentMonthDate(date);

                let dayBackgroundColor = 'transparent';
                let indicatorColor = 'transparent';
                let hasBorder = false;

                if (hasFood && hasWorkout) {
                  indicatorColor = '#6366f1'; // Indigo for both
                } else if (hasWorkout) {
                  indicatorColor = '#10b981'; // Emerald for workout
                } else if (hasFood) {
                  indicatorColor = '#f59e0b'; // Amber for food
                }

                if (isTodayDate) {
                  hasBorder = true;
                  dayBackgroundColor = colors.tint + '10';
                }

                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.dayCell,
                      { 
                        width: dayWidth,
                        backgroundColor: dayBackgroundColor,
                        borderColor: hasBorder ? colors.tint : 'transparent',
                        borderWidth: hasBorder ? 2 : 0,
                        opacity: isCurrentMonth ? 1 : 0.4,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.dayText,
                        { color: isCurrentMonth ? colors.text : colors.textSecondary },
                        isTodayDate && { fontWeight: '700' }
                      ]}
                    >
                      {date.getDate()}
                    </ThemedText>
                    {/* Activity Indicator */}
                    {indicatorColor !== 'transparent' && (
                      <View style={[styles.activityIndicator, { backgroundColor: indicatorColor }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Enhanced Legend */}
      <View style={[styles.legendContainer, { 
        borderTopColor: colors.border, 
        backgroundColor: 'transparent'
      }]}>
        <ThemedText style={[styles.legendTitle, { color: colors.text }]}>
          Activity Legend
        </ThemedText>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: '#10b981' }]} />
            <ThemedText style={[styles.legendText, { color: colors.text }]}>Workout</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: '#f59e0b' }]} />
            <ThemedText style={[styles.legendText, { color: colors.text }]}>Food</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: '#6366f1' }]} />
            <ThemedText style={[styles.legendText, { color: colors.text }]}>Both</ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center', 
    alignItems: 'center'
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthYearContainer: {
    flex: 1,
  },
  monthText: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  yearText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
  },
  navigationContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: '600',
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  pickerContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  dayNamesRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  dayNameCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNameText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  scrollContainer: {
    flex: 1,
  },
  calendarGrid: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 4,
  },
  dayCell: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    position: 'relative',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activityIndicator: {
    position: 'absolute',
    bottom: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '500',
  },
});