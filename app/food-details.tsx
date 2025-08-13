import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function FoodDetailsScreen() {
  const { name, calories, protein, carbs, fat, servingSize } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <IconSymbol name="arrow.left" size={24} color={colors.text} />
      </TouchableOpacity>
      <ThemedText type="title" style={{ color: colors.text }}>{name}</ThemedText>
      <ThemedText style={{ color: colors.textSecondary, marginBottom: 20 }}>Serving Size: {servingSize}</ThemedText>
      <View style={styles.grid}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <ThemedText style={styles.cardTitle}>Calories</ThemedText>
          <ThemedText style={styles.cardValue}>{calories}</ThemedText>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <ThemedText style={styles.cardTitle}>Protein</ThemedText>
          <ThemedText style={styles.cardValue}>{protein}g</ThemedText>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <ThemedText style={styles.cardTitle}>Carbs</ThemedText>
          <ThemedText style={styles.cardValue}>{carbs}g</ThemedText>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <ThemedText style={styles.cardTitle}>Fat</ThemedText>
          <ThemedText style={styles.cardValue}>{fat}g</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
