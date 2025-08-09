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
}> = ({ title, data, colors }) => {
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
            params: { mealType: title },
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

  useEffect(() => {
    const getMacros = async () => {
      setIsCalculatingMacros(true);
      const macros = await calculateDailyMacros();
      const totalCalories = macros.proteins * 4 + macros.carbohydrates * 4 + macros.fats * 9;
      setDailyMacros({ ...macros, calories: totalCalories });
      setIsCalculatingMacros(false);
    };
    getMacros();
  }, [foodEntries]);

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
        No food entries yet
      </ThemedText>
      <ThemedText style={[styles.emptyStateText, { color: colors.tint }]}>
        Log your first meal to get started.
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
              <View style={[styles.macrosSummary, { borderBottomColor: colors.border, borderBottomWidth: 1, paddingBottom: 8, paddingTop: 20 }]}>
                <ThemedText style={[styles.summaryTitle, { color: colors.text }]}>
                  Today’s Nutrition
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
              <SectionHeader title={title} data={data} colors={colors} />
            )}
            renderSectionFooter={({ section: { title } }) => (
              <TouchableOpacity
                style={[styles.addFoodButton, { backgroundColor: colors.accent }]}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/add-food',
                    params: { mealType: title },
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});
