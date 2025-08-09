import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useFood } from '@/context/FoodContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput } from 'react-native';

export default function ManualFoodEntryScreen() {
  const { addManualFood } = useFood();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const handleSubmit = async () => {
    const foodData = {
      product_name: productName,
      brands: brand,
      nutriments: {
        'energy-kcal_100g': parseFloat(calories),
        proteins_100g: parseFloat(protein),
        carbohydrates_100g: parseFloat(carbs),
        fat_100g: parseFloat(fat),
      },
      serving_size: '100g',
    };

    if (!productName || !calories || !protein || !carbs || !fat) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    await addManualFood(foodData);
    router.back();
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedText type="title" style={{ color: colors.text }}>Enter Food Details</ThemedText>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        placeholder="Product Name"
        placeholderTextColor={colors.textSecondary}
        value={productName}
        onChangeText={setProductName}
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        placeholder="Brand"
        placeholderTextColor={colors.textSecondary}
        value={brand}
        onChangeText={setBrand}
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        placeholder="Calories per 100g"
        placeholderTextColor={colors.textSecondary}
        value={calories}
        onChangeText={setCalories}
        keyboardType="numeric"
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        placeholder="Protein per 100g"
        placeholderTextColor={colors.textSecondary}
        value={protein}
        onChangeText={setProtein}
        keyboardType="numeric"
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        placeholder="Carbohydrates per 100g"
        placeholderTextColor={colors.textSecondary}
        value={carbs}
        onChangeText={setCarbs}
        keyboardType="numeric"
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        placeholder="Fat per 100g"
        placeholderTextColor={colors.textSecondary}
        value={fat}
        onChangeText={setFat}
        keyboardType="numeric"
      />
      <Button title="Submit" onPress={handleSubmit} color={colors.accent} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
});
