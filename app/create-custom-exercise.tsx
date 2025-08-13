import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateCustomExerciseScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseInstructions, setExerciseInstructions] = useState('');
  const [equipment, setEquipment] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [force, setForce] = useState('');
  const [mechanic, setMechanic] = useState('');
  const [primaryMuscles, setPrimaryMuscles] = useState<string[]>([]);
  const [showMuscleModal, setShowMuscleModal] = useState(false);

  const toggleMuscle = (muscle: string) => {
    setPrimaryMuscles(prevMuscles => 
      prevMuscles.includes(muscle) 
        ? prevMuscles.filter(m => m !== muscle)
        : [...prevMuscles, muscle]
    );
  };

  const handleSaveCustomExercise = () => {
    if (!exerciseName.trim() || !equipment || !category || !level || !force || !mechanic || primaryMuscles.length === 0) {
      alert('Please fill in all fields and select at least one primary muscle.');
      return;
    }
    // In a real app, you would save this custom exercise to your database or local storage
    const customExercise = {
      id: Date.now().toString(),
      name: exerciseName.trim(),
      instructions: exerciseInstructions.split('\n').map(s => s.trim()).filter(s => s.length > 0),
      // Add other default properties for a custom exercise
      force,
      level,
      mechanic,
      equipment,
      primaryMuscles,
      secondaryMuscles: [],
      category,
      images: [],
    };
    
    router.push({
      pathname: '/(tabs)/create-routine',
      params: { selectedExercises: JSON.stringify([customExercise]) },
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: 'transparent' }]}>
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

        <ThemedText style={[styles.label, { color: colors.text }]}>Equipment:</ThemedText>
        <Picker
          selectedValue={equipment}
          onValueChange={(itemValue, itemIndex) => setEquipment(itemValue)}
          style={[styles.picker, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        >
          <Picker.Item label="Select Equipment" value="" />
          <Picker.Item label="Bands" value="bands" />
          <Picker.Item label="Barbell" value="barbell" />
          <Picker.Item label="Body Only" value="body only" />
          <Picker.Item label="Cable" value="cable" />
          <Picker.Item label="Dumbbell" value="dumbbell" />
          <Picker.Item label="E-Z Curl Bar" value="e-z curl bar" />
          <Picker.Item label="Exercise Ball" value="exercise ball" />
          <Picker.Item label="Foam Roll" value="foam roll" />
          <Picker.Item label="Kettlebells" value="kettlebells" />
          <Picker.Item label="Machine" value="machine" />
          <Picker.Item label="Medicine Ball" value="medicine ball" />
          <Picker.Item label="Other" value="other" />
        </Picker>

        <ThemedText style={[styles.label, { color: colors.text }]}>Category:</ThemedText>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue, itemIndex) => setCategory(itemValue)}
          style={[styles.picker, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        >
          <Picker.Item label="Select Category" value="" />
          <Picker.Item label="Cardio" value="cardio" />
          <Picker.Item label="Olympic Weightlifting" value="olympic weightlifting" />
          <Picker.Item label="Plyometrics" value="plyometrics" />
          <Picker.Item label="Powerlifting" value="powerlifting" />
          <Picker.Item label="Strength" value="strength" />
          <Picker.Item label="Stretching" value="stretching" />
          <Picker.Item label="Strongman" value="strongman" />
        </Picker>

        <ThemedText style={[styles.label, { color: colors.text }]}>Level:</ThemedText>
        <Picker
          selectedValue={level}
          onValueChange={(itemValue, itemIndex) => setLevel(itemValue)}
          style={[styles.picker, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        >
          <Picker.Item label="Select Level" value="" />
          <Picker.Item label="Beginner" value="beginner" />
          <Picker.Item label="Intermediate" value="intermediate" />
          <Picker.Item label="Expert" value="expert" />
        </Picker>

        <ThemedText style={[styles.label, { color: colors.text }]}>Force:</ThemedText>
        <Picker
          selectedValue={force}
          onValueChange={(itemValue, itemIndex) => setForce(itemValue)}
          style={[styles.picker, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        >
          <Picker.Item label="Select Force" value="" />
          <Picker.Item label="Push" value="push" />
          <Picker.Item label="Pull" value="pull" />
          <Picker.Item label="Static" value="static" />
        </Picker>

        <ThemedText style={[styles.label, { color: colors.text }]}>Mechanic:</ThemedText>
        <Picker
          selectedValue={mechanic}
          onValueChange={(itemValue, itemIndex) => setMechanic(itemValue)}
          style={[styles.picker, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        >
          <Picker.Item label="Select Mechanic" value="" />
          <Picker.Item label="Compound" value="compound" />
          <Picker.Item label="Isolation" value="isolation" />
        </Picker>

        <ThemedText style={[styles.label, { color: colors.text }]}>Primary Muscles:</ThemedText>
        <TouchableOpacity
          style={[styles.multiSelectButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowMuscleModal(true)}
        >
          <ThemedText style={{ color: colors.text }}>
            {primaryMuscles.length > 0 ? `${primaryMuscles.length} muscle(s) selected` : 'Select muscles'}
          </ThemedText>
        </TouchableOpacity>
        
        {showMuscleModal && (
          <View style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <FlatList
              data={[
                'abdominals', 'abductors', 'adductors', 'biceps', 'calves', 'chest',
                'forearms', 'glutes', 'hamstrings', 'lats', 'lower back', 'middle back',
                'neck', 'quadriceps', 'shoulders', 'traps', 'triceps'
              ]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.muscleItem,
                    { backgroundColor: primaryMuscles.includes(item) ? colors.tint : 'transparent' }
                  ]}
                  onPress={() => toggleMuscle(item)}
                >
                  <ThemedText style={{
                    color: primaryMuscles.includes(item) ? colors.background : colors.text,
                    textTransform: 'capitalize'
                  }}>
                    {item}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: colors.tint }]}
              onPress={() => setShowMuscleModal(false)}
            >
              <ThemedText style={{ color: colors.background }}>Done</ThemedText>
            </TouchableOpacity>
          </View>
        )}

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
  picker: {
    height: 50,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  multiSelectButton: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    justifyContent: 'center',
  },
  modal: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    maxHeight: 200,
    padding: 8,
  },
  muscleItem: {
    padding: 8,
    borderRadius: 4,
    marginVertical: 2,
  },
  doneButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
});
