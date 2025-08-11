import FoodEntryModal from '@/components/FoodEntryModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useFood } from '@/context/FoodContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import Svg, { Circle } from 'react-native-svg';

interface FoodEntry {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  logged_at: string;
  created_at: string;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
}

interface ProductDetails {
  product_name: string;
  brands: string;
  image_small_url: string;
  nutriments: {
    proteins_100g: number;
    carbohydrates_100g: number;
    fat_100g: number;
  };
  serving_size: string;
}

// Helper function to format date for display
const formatDateForDisplay = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Reset time for accurate comparison
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const compareToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const compareYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  const compareTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

  if (compareDate.getTime() === compareToday.getTime()) {
    return 'Today';
  } else if (compareDate.getTime() === compareYesterday.getTime()) {
    return 'Yesterday';
  } else if (compareDate.getTime() === compareTomorrow.getTime()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
};

// Helper function to get days in a month
const getDaysInMonth = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday of the week

  const days: Date[] = [];
  const currentDate = new Date(startDate);
  
  // Get 6 weeks worth of days to fill the calendar grid
  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

const CalendarModal: React.FC<{
  visible: boolean;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
  colors: any;
  foodEntries: FoodEntry[];
}> = ({ visible, selectedDate, onDateSelect, onClose, colors, foodEntries }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const screenWidth = Dimensions.get('window').width;
  const dayWidth = (screenWidth - 60) / 7; // Account for padding

  // Get dates that have food entries
  const datesWithEntries = useMemo(() => {
    const dates = new Set<string>();
    foodEntries.forEach(entry => {
      const entryDate = new Date(entry.logged_at);
      dates.add(entryDate.toDateString());
    });
    return dates;
  }, [foodEntries]);

  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateSelect = (date: Date) => {
    onDateSelect(date);
    onClose();
  };

  const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth.getMonth();
  const isToday = (date: Date) => isSameDay(date, today);
  const isSelected = (date: Date) => isSameDay(date, selectedDate);
  const hasEntries = (date: Date) => datesWithEntries.has(date.toDateString());

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.calendarContainer, { backgroundColor: colors.background }, { borderWidth: 1, borderColor: colors.border }]}>
              {/* Calendar Header */}
              <View style={[styles.calendarHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthNavButton}>
                  <IconSymbol name="chevron.left" size={20} color={colors.text} />
                </TouchableOpacity>
                
                <ThemedText style={[styles.monthYearText, { color: colors.text }]}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </ThemedText>
                
                <TouchableOpacity onPress={goToNextMonth} style={styles.monthNavButton}>
                  <IconSymbol name="chevron.right" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Day Names Header */}
              <View style={styles.dayNamesRow}>
                {dayNames.map((day) => (
                  <View key={day} style={[styles.dayNameCell, { width: dayWidth }]}>
                    <ThemedText style={[styles.dayNameText, { color: colors.tint }]}>
                      {day}
                    </ThemedText>
                  </View>
                ))}
              </View>

              {/* Calendar Grid */}
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.calendarGrid}>
                  {Array.from({ length: 6 }, (_, weekIndex) => (
                    <View key={weekIndex} style={styles.weekRow}>
                      {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => {
                        const isCurrentMonthDate = isCurrentMonth(date);
                        const isTodayDate = isToday(date);
                        const isSelectedDate = isSelected(date);
                        const hasEntriesDate = hasEntries(date);
                        const isFutureDate = date > today;

                        return (
                          <TouchableOpacity
                            key={dayIndex}
                            onPress={() => !isFutureDate && handleDateSelect(date)}
                            disabled={isFutureDate}
                            style={[
                              styles.dayCell,
                              { width: dayWidth },
                              isSelectedDate && { backgroundColor: colors.accent },
                              isTodayDate && !isSelectedDate && { borderColor: colors.accent, borderWidth: 2 },
                            ]}
                          >
                            <ThemedText
                              style={[
                                styles.dayText,
                                {
                                  color: isSelectedDate
                                    ? 'white'
                                    : isCurrentMonthDate
                                    ? colors.text
                                    : colors.tint,
                                  opacity: isFutureDate ? 0.4 : isCurrentMonthDate ? 1 : 0.6,
                                  fontWeight: isTodayDate ? 'bold' : 'normal',
                                },
                              ]}
                            >
                              {date.getDate()}
                            </ThemedText>
                            {hasEntriesDate && (
                              <View
                                style={[
                                  styles.entryDot,
                                  {
                                    backgroundColor: isSelectedDate ? 'white' : colors.accent,
                                  },
                                ]}
                              />
                            )}
                            {isTodayDate && !isSelectedDate && (
                              <View style={[styles.todayIndicator, { backgroundColor: colors.accent }]} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </ScrollView>

              {/* Quick Actions and Close Button */}
              <View style={[styles.calendarFooter, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  onPress={() => handleDateSelect(new Date())}
                  style={[styles.quickActionButton, { backgroundColor: colors.surface }]}
                >
                  <ThemedText style={[styles.quickActionText, { color: colors.text }]}>
                    Today
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    handleDateSelect(yesterday);
                  }}
                  style={[styles.quickActionButton, { backgroundColor: colors.surface }]}
                >
                  <ThemedText style={[styles.quickActionText, { color: colors.text }]}>
                    Yesterday
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.primary }]}>
                  <ThemedText style={styles.closeButtonText}>Done</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Helper function to check if two dates are on the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const DateNavigator: React.FC<{
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  colors: any;
  onDatePress: () => void;
}> = ({ selectedDate, onDateChange, colors, onDatePress }) => {
  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    onDateChange(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay);
  };

  const isToday = isSameDay(selectedDate, new Date());
  const isNextDayFuture = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) > new Date();

  return (
    <View style={[styles.dateNavigator, { borderBottomColor: colors.border }]}>
      <TouchableOpacity
        onPress={goToPreviousDay}
        style={[styles.dateNavButton, { backgroundColor: colors.surface }]}
      >
        <IconSymbol name="chevron.left" size={20} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onDatePress} style={styles.dateDisplay}>
        <ThemedText style={[styles.dateText, { color: colors.text }]}>
          {formatDateForDisplay(selectedDate)}
        </ThemedText>
        <ThemedText style={[styles.fullDateText, { color: colors.tint }]}>
          {selectedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={goToNextDay}
        style={[
          styles.dateNavButton,
          {
            backgroundColor: colors.surface,
            opacity: isNextDayFuture ? 0.5 : 1,
          },
        ]}
        disabled={isNextDayFuture}
      >
        <IconSymbol name="chevron.right" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const FoodEntryItem: React.FC<{
  entry: FoodEntry;
  onPress: () => void;
  onToggleDropdown: (y: number, height: number) => void;
  isDropdownOpen: boolean;
  onMove: (mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks') => void;
  onDelete: () => void;
  dropdownDirection: 'up' | 'down';
}> = ({ entry, onPress, onToggleDropdown, isDropdownOpen, onMove, onDelete, dropdownDirection }) => {
  const { getFoodDetails } = useFood();
  const [details, setDetails] = useState<ProductDetails | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const itemRef = useRef<TouchableOpacity>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const productDetails = await getFoodDetails(entry.product_id);
      setDetails(productDetails);
    };
    fetchDetails();
  }, [entry.product_id, getFoodDetails]);

  const totalCalories = useMemo(() => {
    if (!details?.nutriments) return 0;
    const { proteins_100g = 0, carbohydrates_100g = 0, fat_100g = 0 } = details.nutriments;
    const scale = entry.quantity / 100;
    return proteins_100g * 4 * scale + carbohydrates_100g * 4 * scale + fat_100g * 9 * scale;
  }, [details, entry.quantity]);

  const handleEllipsisPress = () => {
    if (itemRef.current) {
      itemRef.current.measureInWindow((x, y, width, height) => {
        onToggleDropdown(y, height);
      });
    }
  };

  return (
    <TouchableOpacity 
      ref={itemRef}
      onPress={onPress} 
      style={[
        styles.foodEntryItem, 
        { 
          backgroundColor: colors.surface,
          zIndex: isDropdownOpen ? 1000 : 1, // Ensure the active item is on top
        }
      ]}
    >
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.foodEntryName}>{entry.product_name}</ThemedText>
        <ThemedText style={styles.foodEntryServing}>
          {entry.quantity} {entry.unit}
        </ThemedText>
      </View>
      <ThemedText style={styles.foodEntryCalories}>{totalCalories.toFixed(0)} kcal</ThemedText>
      <View>
        <TouchableOpacity onPress={handleEllipsisPress} style={{ padding: 8 }}>
          <IconSymbol name="ellipsis" size={20} color={colors.text} />
        </TouchableOpacity>
        {isDropdownOpen && (
          <View style={[
            styles.dropdownMenu,
            { backgroundColor: colors.surface, borderColor: colors.border },
            dropdownDirection === 'up' ? styles.dropdownMenuUp : styles.dropdownMenuDown,
          ]}>
            <ThemedText style={styles.dropdownTitle}>Move to...</ThemedText>
            {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((mealType) => (
              <TouchableOpacity
                key={mealType}
                style={styles.dropdownItem}
                onPress={() => onMove(mealType as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks')}
              >
                <ThemedText style={{ color: colors.text }}>{mealType}</ThemedText>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.dropdownItem, styles.deleteButton]} onPress={onDelete}>
              <ThemedText style={{ color: 'red' }}>Delete</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const SectionHeader: React.FC<{
  title: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  data: FoodEntry[];
  colors: any;
  selectedDate: Date;
}> = ({ title, data, colors, selectedDate }) => {
  const { getFoodDetails } = useFood();
  const [totalCalories, setTotalCalories] = useState(0);

  // Create a stable dependency to prevent infinite loops
  const dependency = data.map((e) => `${e.id}-${e.quantity}`).join(',');

  useEffect(() => {
    const calculateTotalCalories = async () => {
      let sum = 0;
      for (const entry of data) {
        const details = await getFoodDetails(entry.product_id);
        if (details?.nutriments) {
          const { proteins_100g = 0, carbohydrates_100g = 0, fat_100g = 0 } =
            details.nutriments;
          const scale = entry.quantity / 100;
          sum +=
            proteins_100g * 4 * scale +
            carbohydrates_100g * 4 * scale +
            fat_100g * 9 * scale;
        }
      }
      setTotalCalories(sum);
    };
    calculateTotalCalories();
  }, [dependency]);

  return (
    <View style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <ThemedText style={styles.sectionCalories}>{totalCalories.toFixed(0)} kcal</ThemedText>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/(tabs)/add-food',
            params: { 
              mealType: title,
              selectedDate: selectedDate.toISOString().split('T')[0] // Pass date as YYYY-MM-DD
            },
          })
        }
      >
        <IconSymbol name="plus.circle.fill" size={24} color={colors.accent} />
      </TouchableOpacity>
    </View>
  );
};

const ModernMacroCard: React.FC<{
  title: string;
  value: number;
  unit: string;
  percentage: number;
  icon: any;
  color: string;
  backgroundColor: string;
  isLoading: boolean;
  colors: any;
}> = ({ title, value, unit, percentage, icon, color, backgroundColor, isLoading, colors }) => (
  <View style={[styles.modernMacroCard, { backgroundColor }]}>
    <View style={styles.macroCardHeader}>
      <View style={[styles.macroCardIcon, { backgroundColor: color + '20' }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <View style={styles.macroCardProgress}>
        <View style={[styles.progressBar, { backgroundColor: color + '20' }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: color,
                width: `${Math.min(percentage, 100)}%`,
              },
            ]}
          />
        </View>
        <ThemedText style={[styles.macroPercentage, { color: colors.textSecondary }]}>
          {percentage.toFixed(0)}%
        </ThemedText>
      </View>
    </View>
    <View style={styles.macroCardContent}>
      <ThemedText style={[styles.macroCardTitle, { color: colors.textSecondary }]}>
        {title}
      </ThemedText>
      <View style={styles.macroCardValue}>
        {isLoading ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <ThemedText style={[styles.macroValue, { color: colors.text }]}>
            {value.toFixed(1)} {unit}
          </ThemedText>
        )}
      </View>
    </View>
  </View>
);

const CircularProgress: React.FC<{
  progress: number;
  radius: number;
  strokeWidth: number;
  color: string;
}> = ({ progress, radius, strokeWidth, color }) => {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Svg width={(radius + strokeWidth) * 2} height={(radius + strokeWidth) * 2}>
      <Circle
        cx={radius + strokeWidth}
        cy={radius + strokeWidth}
        r={radius}
        stroke={color + '20'}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <Circle
        cx={radius + strokeWidth}
        cy={radius + strokeWidth}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        fill="transparent"
        transform={`rotate(-90 ${radius + strokeWidth} ${radius + strokeWidth})`}
      />
    </Svg>
  );
};

export default function FoodLogScreen() {
  const {
    foodEntries,
    fetchFoodEntries,
    calculateDailyMacros,
    updateFoodEntryMealType,
    deleteFoodEntry,
    getFoodDetails,
    updateFoodEntry,
  } = useFood();
  const { profile } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Add selected date state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [dailyMacros, setDailyMacros] = useState({
    proteins: 0,
    carbohydrates: 0,
    fats: 0,
    calories: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculatingMacros, setIsCalculatingMacros] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<FoodEntry | null>(null);
  const [openDropdownEntryId, setOpenDropdownEntryId] = useState<string | null>(null);
  const [dropdownDirection, setDropdownDirection] = useState<'up' | 'down'>('down');
  const [activePagerPage, setActivePagerPage] = useState(0);
  const itemRefs = useRef<{ [key: string]: TouchableOpacity | null }>({});

  // Calculate remaining calories
  const calorieGoal = profile?.calorie_goal || 2000;
  const totalCaloriesToday = dailyMacros.calories;
  const exerciseCaloriesBurned = 0;
  const remainingCalories = calorieGoal - totalCaloriesToday + exerciseCaloriesBurned;

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchFoodEntries(selectedDate);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedDate]);

  useEffect(() => {
    const getMacros = async () => {
      setIsCalculatingMacros(true);
      
      // Calculate macros for filtered entries
      let proteins = 0;
      let carbohydrates = 0;
      let fats = 0;

      for (const entry of foodEntries) {
        const details = await getFoodDetails(entry.product_id);
        if (details?.nutriments) {
          const scale = entry.quantity / 100;
          proteins += (details.nutriments.proteins_100g || 0) * scale;
          carbohydrates += (details.nutriments.carbohydrates_100g || 0) * scale;
          fats += (details.nutriments.fat_100g || 0) * scale;
        }
      }

      const totalCalories = proteins * 4 + carbohydrates * 4 + fats * 9;
      setDailyMacros({ proteins, carbohydrates, fats, calories: totalCalories });
      setIsCalculatingMacros(false);
    };
    getMacros();
  }, [foodEntries, getFoodDetails]);

  const handleToggleDropdown = (entry: FoodEntry, y: number, height: number) => {
    const screenHeight = Dimensions.get('window').height;
    const dropdownHeight = 200; // Approximate height of the dropdown menu

    // Check if there's enough space below the item
    if (y + height + dropdownHeight > screenHeight) {
      setDropdownDirection('up');
    } else {
      setDropdownDirection('down');
    }

    setSelectedEntry(entry);
    setOpenDropdownEntryId(openDropdownEntryId === entry.id ? null : entry.id);
  };

  const handleMove = (mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks') => {
    if (selectedEntry) {
      updateFoodEntryMealType(selectedEntry.id, mealType);
    }
    setOpenDropdownEntryId(null); // Close dropdown
  };

  const handleDelete = () => {
    if (selectedEntry) {
      Alert.alert('Delete Food Entry', 'Are you sure you want to delete this entry?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteFoodEntry(selectedEntry.id),
        },
      ]);
    }
    setOpenDropdownEntryId(null); // Close dropdown
  };

  const handlePressItem = async (entry: FoodEntry) => {
    const details = await getFoodDetails(entry.product_id);
    if (details) {
      const totalCalories = details.nutriments.proteins_100g * 4 + details.nutriments.carbohydrates_100g * 4 + details.nutriments.fat_100g * 9;
      router.push({
        pathname: '/(tabs)/food-details',
        params: {
          name: entry.product_name,
          calories: totalCalories.toFixed(0),
          protein: details.nutriments.proteins_100g.toFixed(1),
          carbs: details.nutriments.carbohydrates_100g.toFixed(1),
          fat: details.nutriments.fat_100g.toFixed(1),
          servingSize: details.serving_size,
        },
      });
    } else {
      Alert.alert('Error', 'Could not fetch food details.');
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsCalendarVisible(false);
  };

  const handleSaveFoodEntry = (quantity: number, unit: string) => {
    if (selectedEntry) {
      updateFoodEntry(selectedEntry.id, { ...selectedEntry, quantity, unit });
    }
  };

  const sections = useMemo(() => {
    const mealTypes: ('Breakfast' | 'Lunch' | 'Dinner' | 'Snacks')[] = [
      'Breakfast',
      'Lunch',
      'Dinner',
      'Snacks',
    ];
    return mealTypes.map((mealType) => ({
      title: mealType,
      data: foodEntries.filter((entry) => entry.meal_type === mealType),
    }));
  }, [foodEntries]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="fork.knife" size={64} color={colors.tint} />
      <ThemedText style={[styles.emptyStateTitle, { color: colors.text }]}>
        No food entries for {formatDateForDisplay(selectedDate)}
      </ThemedText>
      <ThemedText style={[styles.emptyStateText, { color: colors.tint }]}>
        Log your first meal for this day to get started.
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <TouchableWithoutFeedback onPress={() => setOpenDropdownEntryId(null)} disabled={!openDropdownEntryId}>
        <View style={{ flex: 1 }}>
          <SectionList
            contentContainerStyle={{ paddingHorizontal: 17, paddingVertical: 20 }}
            sections={sections}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <View>
                {/* Date Navigator */}
                <DateNavigator
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  onDatePress={() => setIsCalendarVisible(true)}
                  colors={colors}
                />

                {/* Modern Header with Gradient Background */}
                <View style={[styles.modernHeader, { backgroundColor: colors.surface }]}>
                  <LinearGradient
                    colors={[colors.accent + '15', colors.accent + '05']}
                    style={styles.headerGradient}
                  >
                    <ThemedText style={[styles.modernTitle, { color: colors.text }]}>
                      {formatDateForDisplay(selectedDate)}'s Progress
                    </ThemedText>
                    <View style={styles.headerStats}>
                      <View style={styles.quickStat}>
                        <ThemedText style={[styles.quickStatValue, { color: colors.accent }]}>
                          {((totalCaloriesToday / calorieGoal) * 100).toFixed(0)}%
                        </ThemedText>
                        <ThemedText style={[styles.quickStatLabel, { color: colors.textSecondary }]}>
                          Goal Progress
                        </ThemedText>
                      </View>
                    </View>
                  </LinearGradient>
                </View>

                <PagerView
                  style={styles.pagerView}
                  initialPage={0}
                  onPageSelected={(e) => setActivePagerPage(e.nativeEvent.position)}
                >
                  <View key="goal" style={styles.modernPage}>
                    <View style={[styles.modernGoalContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <View style={styles.goalHeader}>
                        <ThemedText style={[styles.goalTitle, { color: colors.text }]}>
                          Calorie Breakdown
                        </ThemedText>
                      </View>

                      {/* Modern Breakdown Cards */}
                      <View style={styles.breakdownGrid}>
                        <View style={[styles.breakdownCard, { backgroundColor: colors.background }]}>
                          <View style={styles.cardHeader}>
                            <View style={[styles.cardIcon, { backgroundColor: colors.accent + '20' }]}>
                              <Feather name="target" size={16} color={colors.accent} />
                            </View>
                            <ThemedText style={[styles.cardValue, { color: colors.text }]}>
                              {calorieGoal.toFixed(0)}
                            </ThemedText>
                          </View>
                          <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>Goal</ThemedText>
                        </View>

                        <View style={[styles.breakdownCard, { backgroundColor: colors.background }]}>
                          <View style={styles.cardHeader}>
                            <View style={[styles.cardIcon, { backgroundColor: remainingCalories >= 0 ? '#4CAF50' + '20' : '#FF5722' + '20' }]}>
                              <Feather name="trending-down" size={16} color={remainingCalories >= 0 ? '#4CAF50' : '#FF5722'} />
                            </View>
                            <ThemedText style={[styles.cardValue, { color: remainingCalories >= 0 ? '#4CAF50' : '#FF5722' }]}>
                              {Math.abs(remainingCalories).toFixed(0)}
                            </ThemedText>
                          </View>
                          <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>Remaining</ThemedText>
                        </View>
                      </View>

                      <View style={styles.formulaContainer}>
                        <View style={styles.formulaItem}>
                          <ThemedText style={styles.formulaValue}>{calorieGoal.toFixed(0)}</ThemedText>
                          <ThemedText style={styles.formulaLabel}>Goal</ThemedText>
                        </View>
                        <ThemedText style={styles.operator}>-</ThemedText>
                        <View style={styles.formulaItem}>
                          <ThemedText style={styles.formulaValue}>{totalCaloriesToday.toFixed(0)}</ThemedText>
                          <ThemedText style={styles.formulaLabel}>Food</ThemedText>
                        </View>
                        <ThemedText style={styles.operator}>+</ThemedText>
                        <View style={styles.formulaItem}>
                          <ThemedText style={styles.formulaValue}>{exerciseCaloriesBurned.toFixed(0)}</ThemedText>
                          <ThemedText style={styles.formulaLabel}>Exercise</ThemedText>
                        </View>
                        <ThemedText style={styles.operator}>=</ThemedText>
                        <View style={styles.formulaItem}>
                          <ThemedText style={[styles.formulaValue, { color: remainingCalories >= 0 ? '#4CAF50' : '#FF5722' }]}>{remainingCalories.toFixed(0)}</ThemedText>
                          <ThemedText style={styles.formulaLabel}>Remaining</ThemedText>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Page 2: Enhanced Macro Cards */}
                  <View key="macros" style={styles.modernPage}>
                    <View style={[styles.modernMacrosContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <View style={styles.macrosHeader}>
                        <ThemedText style={[styles.macrosTitle, { color: colors.text }]}>
                          Macronutrients
                        </ThemedText>
                        <View style={styles.macrosTotalCalories}>
                          <ThemedText style={[styles.macrosTotalValue, { color: colors.accent }]}>
                            {dailyMacros.calories.toFixed(0)}
                          </ThemedText>
                          <ThemedText style={[styles.macrosTotalLabel, { color: colors.textSecondary }]}>
                            kcal
                          </ThemedText>
                        </View>
                      </View>

                      <View style={styles.modernMacroGrid}>
                        <ModernMacroCard
                          title="Protein"
                          value={dailyMacros.proteins}
                          unit="g"
                          percentage={(dailyMacros.proteins * 4 / dailyMacros.calories) * 100}
                          icon="shield"
                          color="#FF6B6B"
                          backgroundColor={colors.background}
                          isLoading={isCalculatingMacros}
                          colors={colors}
                        />
                        <ModernMacroCard
                          title="Carbs"
                          value={dailyMacros.carbohydrates}
                          unit="g"
                          percentage={(dailyMacros.carbohydrates * 4 / dailyMacros.calories) * 100}
                          icon="zap"
                          color="#4ECDC4"
                          backgroundColor={colors.background}
                          isLoading={isCalculatingMacros}
                          colors={colors}
                        />
                        <ModernMacroCard
                          title="Fat"
                          value={dailyMacros.fats}
                          unit="g"
                          percentage={(dailyMacros.fats * 9 / dailyMacros.calories) * 100}
                          icon="droplet"
                          color="#45B7D1"
                          backgroundColor={colors.background}
                          isLoading={isCalculatingMacros}
                          colors={colors}
                        />
                      </View>

                      <View style={styles.distributionContainer}>
                        <ThemedText style={[styles.distributionTitle, { color: colors.textSecondary }]}>
                          Distribution
                        </ThemedText>
                        <View style={[styles.distributionBar, { backgroundColor: colors.border }]}>
                          <View 
                            style={[
                              styles.distributionSegment, 
                              { 
                                backgroundColor: '#FF6B6B',
                                flex: dailyMacros.proteins * 4 
                              }
                            ]} 
                          />
                          <View 
                            style={[
                              styles.distributionSegment, 
                              { 
                                backgroundColor: '#4ECDC4',
                                flex: dailyMacros.carbohydrates * 4 
                              }
                            ]} 
                          />
                          <View 
                            style={[
                              styles.distributionSegment, 
                              { 
                                backgroundColor: '#45B7D1',
                                flex: dailyMacros.fats * 9 
                              }
                            ]} 
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                </PagerView>

                {/* Modern Pagination Dots */}
                <View style={styles.modernPaginationContainer}>
                  {[0, 1].map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {}}
                      style={[
                        styles.modernPaginationDot,
                        { 
                          backgroundColor: activePagerPage === index ? colors.accent : colors.tint,
                          width: activePagerPage === index ? 24 : 8,
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <FoodEntryItem
                entry={item}
                onPress={() => handlePressItem(item)}
                onToggleDropdown={(y, height) => handleToggleDropdown(item, y, height)}
                isDropdownOpen={openDropdownEntryId === item.id}
                onMove={handleMove}
                onDelete={handleDelete}
                dropdownDirection={dropdownDirection}
              />
            )}
            renderSectionHeader={({ section: { title, data } }) => (
              <SectionHeader 
                title={title} 
                data={data} 
                colors={colors} 
                selectedDate={selectedDate}
              />
            )}
            renderSectionFooter={({ section: { title } }) => (
              <TouchableOpacity
                style={[styles.addFoodButton, { backgroundColor: colors.accent }]}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/add-food',
                    params: { 
                      mealType: title,
                      selectedDate: selectedDate.toISOString().split('T')[0] // Pass date as YYYY-MM-DD
                    },
                  })
                }
              >
                <IconSymbol name="plus" size={20} color="white" />
                <ThemedText style={styles.addFoodButtonText}>Add Food</ThemedText>
              </TouchableOpacity>
            )}
            ListEmptyComponent={!isLoading ? renderEmptyState : null}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </TouchableWithoutFeedback>

      {selectedEntry && editModalVisible && ( // Only render if editModalVisible is true
        <FoodEntryModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          entry={selectedEntry}
          onSave={handleSaveFoodEntry}
        />
      )}

      {/* Calendar Modal */}
      <CalendarModal
        visible={isCalendarVisible}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onClose={() => setIsCalendarVisible(false)}
        colors={colors}
        foodEntries={foodEntries}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 15,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  dateNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  dateDisplay: {
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  fullDateText: {
    fontSize: 12,
    opacity: 0.7,
  },
  foodList: {
    flex: 1,
  },
  foodListContent: {
    paddingBottom: 20,
  },
  foodListEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  foodEntryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  foodEntryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  foodEntryServing: {
    fontSize: 14,
    opacity: 0.7,
  },
  foodEntryCalories: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionCalories: {
    fontSize: 16,
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  addFoodButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  dropdownMenu: {
    position: 'absolute',
    right: 0,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 5,
    zIndex: 999, // Increased zIndex to ensure it appears on top
    minWidth: 150,
  },
  dropdownMenuUp: {
    bottom: '100%', // Position above the item
    marginBottom: 10, // Add some space
  },
  dropdownMenuDown: {
    top: 40, // Position below the ellipsis
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    paddingVertical: 8,
    opacity: 0.7,
  },
  dropdownItem: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  deleteButton: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 5,
    paddingTop: 8,
  },
  // Calendar Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    width: Dimensions.get('window').width * 0.9,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  monthNavButton: {
    padding: 10,
  },
  monthYearText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dayNamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayNameCell: {
    alignItems: 'center',
  },
  dayNameText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  calendarGrid: {
    flexDirection: 'column',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  dayCell: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 2,
  },
  dayText: {
    fontSize: 16,
  },
  entryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  calendarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
  },
  quickActionButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white', // Assuming primary color is dark enough for white text
  },
  pagerView: {
    height: 280, // Increased height for modern layout
    marginBottom: 16,
  },
  modernPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  modernPaginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modernPaginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    transition: 'width 0.3s',
  },
  modernHeader: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  headerGradient: {
    padding: 20,
  },
  modernTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  quickStatLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  modernGoalContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  remainingCaloriesContainer: {
    alignItems: 'flex-end',
  },
  remainingValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  remainingLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  breakdownCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  formulaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 24,
  },
  formulaItem: {
    alignItems: 'center',
  },
  formulaValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  formulaLabel: {
    fontSize: 12,
    marginTop: 4,
    color: 'gray',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  modernMacrosContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  macrosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  macrosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  macrosTotalCalories: {
    alignItems: 'flex-end',
  },
  macrosTotalValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  macrosTotalLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  modernMacroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  modernMacroCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  macroCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  macroCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  macroCardProgress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  macroPercentage: {
    fontSize: 12,
    opacity: 0.8,
  },
  macroCardContent: {},
  macroCardTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  macroCardValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  distributionContainer: {
    marginTop: 16,
  },
  distributionTitle: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  distributionBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionSegment: {
    height: '100%',
  },
});