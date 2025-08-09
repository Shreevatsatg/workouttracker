import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useFood } from '@/context/FoodContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

interface FoodEntry {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  logged_at: string;
  created_at: string;
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

const FoodEntryItem: React.FC<{ entry: FoodEntry }> = ({ entry }) => {
  const { getFoodDetails } = useFood();
  const [details, setDetails] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const productDetails = await getFoodDetails(entry.product_id);
        setDetails(productDetails);
      } catch (error) {
        console.error('Failed to fetch product details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [entry.product_id]);

  const calculateMacrosForEntry = () => {
    if (!details || !details.nutriments) return { proteins: 0, carbohydrates: 0, fats: 0 };

    const { proteins_100g, carbohydrates_100g, fat_100g } = details.nutriments;
    const scaleFactor = entry.quantity / 100; // Assuming unit is 'g' or 'ml' and 100g/ml data

    return {
      proteins: proteins_100g * scaleFactor,
      carbohydrates: carbohydrates_100g * scaleFactor,
      fats: fat_100g * scaleFactor,
    };
  };

  const macros = calculateMacrosForEntry();
  const loggedDate = new Date(entry.logged_at);
  const timeString = loggedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = loggedDate.toLocaleDateString();

  return (
    <ThemedView style={[styles.foodEntryItem, { 
      backgroundColor: colors.surfaceSecondary, 
      borderColor: colors.border,
      shadowColor: colorScheme === 'dark' ? '#000' : '#000',
    }]}>
      <View style={styles.entryHeader}>
        <ThemedText style={[styles.foodEntryName, { color: colors.text }]}>
          {entry.product_name}
        </ThemedText>
        <ThemedText style={[styles.timeStamp, { color: colors.textSecondary }]}>
          {timeString}
        </ThemedText>
      </View>
      
      <View style={styles.entryDetails}>
        <ThemedText style={[styles.quantityText, { color: colors.textSecondary }]}>
          {entry.quantity} {entry.unit}
        </ThemedText>
        <ThemedText style={[styles.dateText, { color: colors.textSecondary }]}>
          {dateString}
        </ThemedText>
      </View>
      
      {!isLoading && details && details.nutriments && (
        <View style={[styles.macrosContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.macroItem}>
            <ThemedText style={[styles.macroLabel, { color: colors.textSecondary }]}>Protein</ThemedText>
            <ThemedText style={[styles.macroValue, { color: colors.accent }]}>
              {macros.proteins.toFixed(1)}g
            </ThemedText>
          </View>
          <View style={styles.macroItem}>
            <ThemedText style={[styles.macroLabel, { color: colors.textSecondary }]}>Carbs</ThemedText>
            <ThemedText style={[styles.macroValue, { color: colors.accent }]}>
              {macros.carbohydrates.toFixed(1)}g
            </ThemedText>
          </View>
          <View style={styles.macroItem}>
            <ThemedText style={[styles.macroLabel, { color: colors.textSecondary }]}>Fat</ThemedText>
            <ThemedText style={[styles.macroValue, { color: colors.accent }]}>
              {macros.fats.toFixed(1)}g
            </ThemedText>
          </View>
        </View>
      )}
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading nutrition info...
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
};

const MacroCard: React.FC<{ 
  title: string; 
  value: number; 
  unit: string; 
  icon: string;
  color: string;
  backgroundColor: string;
}> = ({ title, value, unit, icon, color, backgroundColor }) => (
  <View style={[styles.macroCard, { backgroundColor }]}>
    <IconSymbol name={icon} size={20} color={color} />
    <ThemedText style={[styles.macroCardValue, { color }]}>
      {value.toFixed(1)}{unit}
    </ThemedText>
    <ThemedText style={[styles.macroCardTitle, { color }]}>
      {title}
    </ThemedText>
  </View>
);

export default function FoodLogScreen() {
  const { foodEntries, fetchFoodEntries, calculateDailyMacros } = useFood();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [dailyMacros, setDailyMacros] = useState({ proteins: 0, carbohydrates: 0, fats: 0 });
  const [isLoading, setIsLoading] = useState(true);

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
      const macros = await calculateDailyMacros();
      setDailyMacros(macros);
    };
    getMacros();
  }, [foodEntries]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="utensils" size={64} color={colors.tint} />
      <ThemedText style={[styles.emptyStateTitle, { color: colors.text }]}>
        No food entries yet
      </ThemedText>
      <ThemedText style={[styles.emptyStateText, { color: colors.tint }]}>
        Start tracking your nutrition by adding your first meal
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
          Food Log
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.tint }]}>
          Track your daily nutrition
        </ThemedText>
      </View>

      {/* Daily Macros Summary */}
      <View style={styles.macrosSummary}>
        <ThemedText style={[styles.summaryTitle, { color: colors.text }]}>
          Today's Nutrition
        </ThemedText>
        <View style={styles.macroCardsContainer}>
          <MacroCard
            title="Protein"
            value={dailyMacros.proteins}
            unit="g"
            icon="zap"
            color="#FF6B6B"
            backgroundColor={`${colors.surface}dd`}
          />
          <MacroCard
            title="Carbs"
            value={dailyMacros.carbohydrates}
            unit="g"
            icon="battery"
            color="#4ECDC4"
            backgroundColor={`${colors.surface}dd`}
          />
          <MacroCard
            title="Fat"
            value={dailyMacros.fats}
            unit="g"
            icon="droplet"
            color="#45B7D1"
            backgroundColor={`${colors.surface}dd`}
          />
        </View>
      </View>

      {/* Add Food Button */}
      <TouchableOpacity
        style={[styles.addButton, { 
          backgroundColor: colors.text,
          shadowColor: colors.accent,
        }]}
        onPress={() => router.push('/(tabs)/add-food')}
        activeOpacity={0.8}
      >
        <IconSymbol name="plus" size={20} color="white" />
        <ThemedText style={[styles.addButtonText, { color: colors.background }]}>Add Food</ThemedText>
      </TouchableOpacity>

      {/* Food Entries List */}
      <FlatList
        data={foodEntries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FoodEntryItem entry={item} />}
        style={styles.foodList}
        contentContainerStyle={[
          styles.foodListContent,
          foodEntries.length === 0 && styles.foodListEmpty
        ]}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    gap: 12,
  },
  macroCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  macroCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  macroCardTitle: {
    fontSize: 12,
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
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  foodEntryName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  timeStamp: {
    fontSize: 12,
    fontWeight: '500',
  },
  entryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    fontStyle: 'italic',
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
});