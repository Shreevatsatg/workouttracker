import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateCustomExerciseScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseInstructions, setExerciseInstructions] = useState('');

  const handleSaveCustomExercise = () => {
    if (!exerciseName.trim()) {
      alert('Exercise name cannot be empty.');
      return;
    }
    // In a real app, you would save this custom exercise to your database or local storage
    const customExercise = {
      id: Date.now().toString(),
      name: exerciseName.trim(),
      instructions: exerciseInstructions.split('\n').map(s => s.trim()).filter(s => s.length > 0),
      // Add other default properties for a custom exercise
      force: null,
      level: 'custom',
      mechanic: null,
      equipment: 'body only',
      primaryMuscles: [],
      secondaryMuscles: [],
      category: 'custom',
      images: [],
    };
    
    router.push({
      pathname: '/(tabs)/create-routine',
      params: { selectedExercises: JSON.stringify([customExercise]) },
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.section}>
        <ThemedText type="title" style={{ color: colors.tint, marginBottom: 24 }}>Create Custom Exercise</ThemedText>

        <ThemedText style={[styles.label, { color: colors.text }]}>Exercise Name:</ThemedText>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="e.g., Custom Bicep Curl"
          placeholderTextColor={colors.secondary}
          value={exerciseName}
          onChangeText={setExerciseName}
        />

        <ThemedText style={[styles.label, { color: colors.text }]}>Instructions (one per line):</ThemedText>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Enter instructions here..."
          placeholderTextColor={colors.secondary}
          multiline
          numberOfLines={4}
          value={exerciseInstructions}
          onChangeText={setExerciseInstructions}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint, marginTop: 24 }]}
          onPress={handleSaveCustomExercise}
        >
          <ThemedText style={[styles.buttonText, { color: colors.background }]}>Save Custom Exercise</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
