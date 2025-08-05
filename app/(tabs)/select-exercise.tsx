import exercisesData from '@/assets/data/exercises.json';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface Exercise {
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
  id: string;
}

export default function SelectExerciseScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [initialRoutineExercises, setInitialRoutineExercises] = useState<Exercise[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      if (params.currentRoutineExercises) {
        const parsedExercises: Exercise[] = JSON.parse(params.currentRoutineExercises as string);
        setInitialRoutineExercises(parsedExercises);
        setSelectedExercises(parsedExercises); // Initialize selected with existing routine exercises
      } else {
        setInitialRoutineExercises([]);
        setSelectedExercises([]); // Clear selected exercises if no routine exercises are passed
      }
      setSearchQuery(''); // Clear search query on focus
      setFilteredExercises(exercisesData as Exercise[]); // Reset filtered exercises
    }, [params.currentRoutineExercises])
  );

  useEffect(() => {
    setFilteredExercises(
      exercisesData.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) as Exercise[]
    );
  }, [searchQuery]);

  const toggleSelectExercise = (exercise: Exercise) => {
    // Prevent re-selecting exercises already in the routine
    if (initialRoutineExercises.some((ex) => ex.id === exercise.id)) {
      return;
    }
    setSelectedExercises((prevSelected) =>
      prevSelected.some((ex) => ex.id === exercise.id)
        ? prevSelected.filter((ex) => ex.id !== exercise.id)
        : [...prevSelected, exercise]
    );
  };

  const handleAddSelectedExercises = () => {
    // Filter out exercises that were already in the routine initially
    const newExercisesToAdd = selectedExercises.filter(
      (ex) => !initialRoutineExercises.some((initialEx) => initialEx.id === ex.id)
    );
    router.push({
      pathname: '/(tabs)/create-routine',
      params: { selectedExercises: JSON.stringify(newExercisesToAdd) },
    });
  };

  const handleCreateCustomExercise = () => {
    router.push('/(tabs)/create-custom-exercise'); // Navigate to a new screen for custom exercise
  };

  const handleExerciseImagePress = (exercise: Exercise) => {
    router.push({
      pathname: '/(tabs)/exercise-details',
      params: { exerciseId: exercise.id, exerciseName: exercise.name },
    });
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => {
    const isSelected = selectedExercises.some((ex) => ex.id === item.id);
    const isInInitialRoutine = initialRoutineExercises.some((ex) => ex.id === item.id);
    
    // Use placeholder image when exercise images are not available
    const imageSource = item.images && item.images.length > 0
      ? { uri: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${item.images[0]}` }
      : require('../../assets/images/exersiseplaceholder.png');

    return (
      <TouchableOpacity
        style={[
          styles.exerciseItem,
          { borderColor: colors.tabIconDefault, backgroundColor: isSelected ? '#e5e5e54b' : colors.background },
        ]}
        onPress={() => toggleSelectExercise(item)}
        disabled={isInInitialRoutine} // Disable if already in routine
      >
        <View style={styles.exerciseContent}>
          <TouchableOpacity onPress={() => handleExerciseImagePress(item)}>
            <Image source={imageSource} style={styles.exerciseImage} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <ThemedText style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{item.name}</ThemedText>
            <ThemedText style={{ color: colors.secondary, fontSize: 14, marginTop: 4 }}>
              {item.primaryMuscles.join(', ')}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topButtons}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
          onPress={handleCreateCustomExercise}
        >
          <ThemedText style={[styles.buttonText, { color: colors.text }]}>
            Create Custom Exercise
          </ThemedText>
        </TouchableOpacity>
      </View>
      <TextInput
        style={[styles.searchInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.tint, borderWidth: 1 }]}
        placeholder="Search exercises..."
        placeholderTextColor={colors.secondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredExercises}
        renderItem={renderExerciseItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
      
      {/* Floating Add Button */}
      {selectedExercises.filter(ex => !initialRoutineExercises.some(initialEx => initialEx.id === ex.id)).length > 0 && (
        <TouchableOpacity
          style={[styles.floatingButton, { backgroundColor: colors.tint }]}
          onPress={handleAddSelectedExercises}
        >
          <View style={styles.floatingButtonContent}>
            <ThemedText style={[styles.floatingButtonText, { color: colors.background }]}>
              {selectedExercises.filter(ex => !initialRoutineExercises.some(initialEx => initialEx.id === ex.id)).length}
            </ThemedText>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 16,
    marginTop: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  list: {
    // removed flex: 1 to prevent layout issues with the search bar
  },
  exerciseItem: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 5,
  },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 16, 
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 4,
  },
});
