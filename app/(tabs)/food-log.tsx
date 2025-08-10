import FoodEntryModal from '@/components/FoodEntryModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useFood } from '@/context/FoodContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
  onToggleDropdown: () => void;
  isDropdownOpen: boolean;
  onMove: (mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks') => void;
  onDelete: () => void;
}> = ({ entry, onPress, onToggleDropdown, isDropdownOpen, onMove, onDelete }) => {
  const { getFoodDetails } = useFood();
  const [details, setDetails] = useState<ProductDetails | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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

  return (
    <TouchableOpacity 
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
        <TouchableOpacity onPress={onToggleDropdown} style={{ padding: 8 }}>
          <IconSymbol name="ellipsis" size={20} color={colors.text} />
        </TouchableOpacity>
        {isDropdownOpen && (
          <View style={[styles.dropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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

const MacroCard: React.FC<{
  title: string;
  value: number;
  unit: string;
  icon: any;
  color: string;
  backgroundColor: string;
  isLoading: boolean;
}> = ({ title, value, unit, icon, color, backgroundColor, isLoading }) => (
  <View style={[styles.macroCard, { backgroundColor }]}>
    <IconSymbol name={icon} size={20} color={color} />
    {isLoading ? (
      <ActivityIndicator size="small" color={color} style={{ marginTop: 8, marginBottom: 4 }} />
    ) : (
      <ThemedText style={[styles.macroCardValue, { color }]}>
        {value.toFixed(1)}{unit}
      </ThemedText>
    )}
    <ThemedText style={[styles.macroCardTitle, { color }]}>
      {title}
    </ThemedText>
  </View>
);

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

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchFoodEntries();
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter food entries by selected date
  const filteredFoodEntries = useMemo(() => {
    return foodEntries.filter((entry) => {
      const entryDate = new Date(entry.logged_at);
      return isSameDay(entryDate, selectedDate);
    });
  }, [foodEntries, selectedDate]);

  useEffect(() => {
    const getMacros = async () => {
      setIsCalculatingMacros(true);
      
      // Calculate macros for filtered entries
      let proteins = 0;
      let carbohydrates = 0;
      let fats = 0;

      for (const entry of filteredFoodEntries) {
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
  }, [filteredFoodEntries, getFoodDetails]);

  const handleToggleDropdown = (entry: FoodEntry) => {
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
      data: filteredFoodEntries.filter((entry) => entry.meal_type === mealType),
    }));
  }, [filteredFoodEntries]);

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

                {/* Macros Summary */}
                <View style={[styles.macrosSummary, { borderBottomColor: colors.border, borderBottomWidth: 1, paddingBottom: 8, paddingTop: 20 }]}>
                  <ThemedText style={[styles.summaryTitle, { color: colors.text }]}>
                    {formatDateForDisplay(selectedDate)}'s Nutrition
                  </ThemedText>
                  <View style={[styles.macroCardsContainer, { height: 80 }]}>
                    <MacroCard
                      title="Calories"
                      value={dailyMacros.calories}
                      unit="k"
                      icon="flame.fill"
                      color="#FF9F43"
                      backgroundColor={`${colors.surface}dd`}
                      isLoading={isCalculatingMacros}
                    />
                    <MacroCard
                      title="Protein"
                      value={dailyMacros.proteins}
                      unit="g"
                      icon="bolt.fill"
                      color="#FF6B6B"
                      backgroundColor={`${colors.surface}dd`}
                      isLoading={isCalculatingMacros}
                    />
                    <MacroCard
                      title="Carbs"
                      value={dailyMacros.carbohydrates}
                      unit="g"
                      icon="flame.fill"
                      color="#4ECDC4"
                      backgroundColor={`${colors.surface}dd`}
                      isLoading={isCalculatingMacros}
                    />
                    <MacroCard
                      title="Fat"
                      value={dailyMacros.fats}
                      unit="g"
                      icon="drop.fill"
                      color="#45B7D1"
                      backgroundColor={`${colors.surface}dd`}
                      isLoading={isCalculatingMacros}
                    />
                  </View>
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <FoodEntryItem
                entry={item}
                onPress={() => handlePressItem(item)}
                onToggleDropdown={() => handleToggleDropdown(item)}
                isDropdownOpen={openDropdownEntryId === item.id}
                onMove={handleMove}
                onDelete={handleDelete}
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
  macrosSummary: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  macroCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  macroCard: {
    flex: 1,
    padding: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  macroCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 6,
    marginBottom: 2,
  },
  macroCardTitle: {
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.8,
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
    top: 40, // Adjust as needed to position below the ellipsis
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 5,
    zIndex: 999, // Increased zIndex to ensure it appears on top
    minWidth: 150,
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
});
