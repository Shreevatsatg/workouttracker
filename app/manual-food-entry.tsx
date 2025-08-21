import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useFood } from '@/context/FoodContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput, ScrollView, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ManualFoodEntryScreen() {
  const { addFoodEntry } = useFood(); // Use addFoodEntry instead of addManualFood
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();

  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'>(
    (params.mealType as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks') || 'Breakfast'
  );
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async () => {
    if (!productName || !quantity || !unit || !calories || !protein || !carbs || !fat) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    const quantityNum = parseFloat(quantity);
    const caloriesNum = parseFloat(calories);
    const proteinNum = parseFloat(protein);
    const carbsNum = parseFloat(carbs);
    const fatNum = parseFloat(fat);

    if (isNaN(quantityNum) || quantityNum <= 0 || isNaN(caloriesNum) || isNaN(proteinNum) || isNaN(carbsNum) || isNaN(fatNum)) {
      Alert.alert('Error', 'Please enter valid numeric values for quantity and macros.');
      return;
    }

    setIsAdding(true);
    try {
      // Generate a unique product_id for manual entries
      const productId = `manual_${Date.now()}`; 
      const loggedAt = params.selectedDate as string || new Date().toISOString();

      await addFoodEntry(
        productId,
        productName,
        quantityNum,
        unit,
        mealType,
        loggedAt
      );

      // For manual entries, we also need to store the nutrient info somewhere
      // This part is missing in the current FoodContext.
      // For now, we'll just log the food entry.
      // A more complete solution would involve adding a new table for manual product definitions
      // or extending the existing product details fetching to include manual ones.

      Alert.alert('Success', 'Food entry added!');
      router.back();
    } catch (error) {
      console.error('Failed to add manual food entry:', error);
      Alert.alert('Error', 'Failed to add food entry. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={{ color: colors.text, marginBottom: 20 }}>Enter Food Details</ThemedText>
        
        <ThemedText style={[styles.inputLabel, { color: colors.text }]}>Product Name</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="e.g., Apple, Chicken Breast"
          placeholderTextColor={colors.textSecondary}
          value={productName}
          onChangeText={setProductName}
        />
        
        <ThemedText style={[styles.inputLabel, { color: colors.text }]}>Brand (Optional)</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="e.g., Dole, Tyson"
          placeholderTextColor={colors.textSecondary}
          value={brand}
          onChangeText={setBrand}
        />

        <ThemedText style={[styles.inputLabel, { color: colors.text }]}>Quantity</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="e.g., 100"
          placeholderTextColor={colors.textSecondary}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />

        <ThemedText style={[styles.inputLabel, { color: colors.text }]}>Unit</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="e.g., g, ml, piece"
          placeholderTextColor={colors.textSecondary}
          value={unit}
          onChangeText={setUnit}
        />

        <ThemedText style={[styles.inputLabel, { color: colors.text }]}>Meal Type</ThemedText>
        <View style={[styles.pickerContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Picker
            selectedValue={mealType}
            onValueChange={(itemValue) => setMealType(itemValue)}
            style={[styles.picker, { color: colors.text }]}
            dropdownIconColor={colors.text}
          >
            <Picker.Item label="Breakfast" value="Breakfast" />
            <Picker.Item label="Lunch" value="Lunch" />
            <Picker.Item label="Dinner" value="Dinner" />
            <Picker.Item label="Snacks" value="Snacks" />
          </Picker>
        </View>

        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Nutritional Information (per 100g/ml)</ThemedText>
        
        <ThemedText style={[styles.inputLabel, { color: colors.text }]}>Calories</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="kcal"
          placeholderTextColor={colors.textSecondary}
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
        />
        
        <ThemedText style={[styles.inputLabel, { color: colors.text }]}>Protein</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="g"
          placeholderTextColor={colors.textSecondary}
          value={protein}
          onChangeText={setProtein}
          keyboardType="numeric"
        />
        
        <ThemedText style={[styles.inputLabel, { color: colors.text }]}>Carbohydrates</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="g"
          placeholderTextColor={colors.textSecondary}
          value={carbs}
          onChangeText={setCarbs}
          keyboardType="numeric"
        />
        
        <ThemedText style={[styles.inputLabel, { color: colors.text }]}>Fat</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="g"
          placeholderTextColor={colors.textSecondary}
          value={fat}
          onChangeText={setFat}
          keyboardType="numeric"
        />
        
        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: colors.accent, opacity: isAdding ? 0.7 : 1 }]} 
          onPress={handleSubmit}
          disabled={isAdding}
        >
          {isAdding ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={styles.submitButtonText}>Add Food Entry</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Ensure content is scrollable above the bottom bar
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
  },
  submitButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
