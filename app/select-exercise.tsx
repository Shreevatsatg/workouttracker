import exercisesData from '@/assets/data/exercises.json';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Modal, PanResponder, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Common muscle groups - you can expand this list based on your exercise data


export default function SelectExerciseScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [initialRoutineExercises, setInitialRoutineExercises] = useState<Exercise[]>([]);
  const [activeLetter, setActiveLetter] = useState<string>('');
  const [showMuscleFilter, setShowMuscleFilter] = useState(false);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [availableMuscles, setAvailableMuscles] = useState<string[]>([]);
  
  const flatListRef = useRef<FlatList>(null);
  const scrollBarRef = useRef<View>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (params.currentRoutineExercises) {
        const parsedExercises: Exercise[] = JSON.parse(params.currentRoutineExercises as string);
        setInitialRoutineExercises(parsedExercises);
        setSelectedExercises(parsedExercises);
      } else {
        setInitialRoutineExercises([]);
        setSelectedExercises([]);
      }
      setSearchQuery('');
      setSelectedMuscles([]);
      
      // Get all unique primary muscles from the exercise data
      const uniqueMuscles = Array.from(
        new Set(
          exercisesData.flatMap((exercise: Exercise) => exercise.primaryMuscles)
        )
      ).sort();
      setAvailableMuscles(uniqueMuscles);
      
      applyFilters(exercisesData as Exercise[], '', []);
    }, [params.currentRoutineExercises])
  );

  const applyFilters = (exercises: Exercise[], searchText: string, muscleFilters: string[]) => {
    let filtered = [...exercises];

    // Apply search filter
    if (searchText) {
      filtered = filtered.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply muscle filter
    if (muscleFilters.length > 0) {
      filtered = filtered.filter((exercise) =>
        exercise.primaryMuscles.some(muscle => 
          muscleFilters.some(selectedMuscle => 
            muscle.toLowerCase().includes(selectedMuscle.toLowerCase())
          )
        )
      );
    }

    // Sort exercises alphabetically
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    setFilteredExercises(filtered);
  };

  useEffect(() => {
    applyFilters(exercisesData as Exercise[], searchQuery, selectedMuscles);
  }, [searchQuery, selectedMuscles]);

  const toggleMuscleFilter = (muscle: string) => {
    const updatedMuscles = selectedMuscles.includes(muscle)
      ? selectedMuscles.filter(m => m !== muscle)
      : [...selectedMuscles, muscle];
    
    setSelectedMuscles(updatedMuscles);
  };

  const clearAllFilters = () => {
    setSelectedMuscles([]);
    setSearchQuery('');
  };

  // Create a map of letters to their first occurrence index in the filtered list
  const getLetterIndexMap = () => {
    const letterMap: { [key: string]: number } = {};
    filteredExercises.forEach((exercise, index) => {
      const firstLetter = exercise.name[0].toUpperCase();
      if (!letterMap[firstLetter]) {
        letterMap[firstLetter] = index;
      }
    });
    return letterMap;
  };

  const scrollToLetter = (letter: string) => {
    const letterIndexMap = getLetterIndexMap();
    const index = letterIndexMap[letter];
    
    if (index !== undefined && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0,
      });
      setActiveLetter(letter);
      
      setTimeout(() => setActiveLetter(''), 1000);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      handleScrollBarTouch(evt.nativeEvent.locationY);
    },
    onPanResponderMove: (evt) => {
      handleScrollBarTouch(evt.nativeEvent.locationY);
    },
  });

  const handleScrollBarTouch = (y: number) => {
    const screenHeight = Dimensions.get('window').height;
    const scrollBarHeight = screenHeight * 0.6;
    const letterIndex = Math.floor((y / scrollBarHeight) * ALPHABET.length);
    const letter = ALPHABET[Math.max(0, Math.min(letterIndex, ALPHABET.length - 1))];
    
    if (letter) {
      scrollToLetter(letter);
    }
  };

  const toggleSelectExercise = (exercise: Exercise) => {
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
    const newExercisesToAdd = selectedExercises.filter(
      (ex) => !initialRoutineExercises.some((initialEx) => initialEx.id === ex.id)
    );

    if (params.callingPage === 'log-workout') {
      const navParams: any = { selectedExercises: JSON.stringify(newExercisesToAdd) };
      if (params.replaceIndex !== undefined) {
        navParams.replaceIndex = params.replaceIndex;
      }
      router.push({
        pathname: '/log-workout',
        params: navParams,
      });
    } else if (params.callingPage === 'create-routine') {
      const navParams: any = { selectedExercises: JSON.stringify(newExercisesToAdd) };
      if (params.replaceIndex !== undefined) {
        navParams.replaceIndex = params.replaceIndex;
      }
      router.push({
        pathname: '/create-routine',
        params: navParams,
      });
    } else {
      router.push({
        pathname: '/create-routine',
        params: { selectedExercises: JSON.stringify(newExercisesToAdd) },
      });
    }
  };

  const handleCreateCustomExercise = () => {
    router.push('/create-custom-exercise');
  };

  const handleExerciseImagePress = (exercise: Exercise) => {
    router.push({
      
      pathname: '/exercise-details',
      params: { exerciseId: exercise.id, exerciseName: exercise.name },
    });
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => {
    const isSelected = selectedExercises.some((ex) => ex.id === item.id);
    const isInInitialRoutine = initialRoutineExercises.some((ex) => ex.id === item.id);
    
    const imageSource = item.images && item.images.length > 0
      ? { uri: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${item.images[0]}` }
      : require('../assets/images/exersiseplaceholder.png');

    return (
      <TouchableOpacity
        style={[
          styles.exerciseItem,
          { borderColor: colors.tabIconDefault, backgroundColor: isSelected ? '#e5e5e54b' : colors.background },
        ]}
        onPress={() => toggleSelectExercise(item)}
        disabled={isInInitialRoutine}
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
            {item.equipment && (
              <ThemedText style={{ color: colors.tabIconDefault, fontSize: 12, marginTop: 2 }}>
                Equipment: {item.equipment}
              </ThemedText>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderScrollBarLetter = (letter: string) => {
    const letterIndexMap = getLetterIndexMap();
    const hasExercises = letterIndexMap[letter] !== undefined;
    
    return (
      <TouchableOpacity
        key={letter}
        style={[
          styles.scrollBarLetter,
          { backgroundColor: activeLetter === letter ? colors.tint : 'transparent' }
        ]}
        onPress={() => scrollToLetter(letter)}
        disabled={!hasExercises}
      >
        <ThemedText
          style={[
            styles.scrollBarLetterText,
            {
              color: hasExercises 
                ? (activeLetter === letter ? colors.background : colors.tint)
                : colors.tabIconDefault,
              fontWeight: activeLetter === letter ? 'bold' : 'normal'
            }
          ]}
        >
          {letter}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  const renderMuscleFilterModal = () => (
    <Modal
      visible={showMuscleFilter}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowMuscleFilter(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowMuscleFilter(false)}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Filter by Muscle</ThemedText>
            <TouchableOpacity
              onPress={() => setShowMuscleFilter(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {selectedMuscles.length > 0 && (
            <TouchableOpacity 
              style={[styles.clearButton, { backgroundColor: colors.tint }]}
              onPress={clearAllFilters}
            >
              <ThemedText style={[styles.clearButtonText, { color: colors.background }]}>
                Clear All Filters
              </ThemedText>
            </TouchableOpacity>
          )}

          <ScrollView style={styles.muscleList} showsVerticalScrollIndicator={false}>
            {availableMuscles.map((muscle) => {
              const isSelected = selectedMuscles.includes(muscle);
              return (
                <TouchableOpacity
                  key={muscle}
                  style={[
                    styles.muscleItem,
                    { 
                      backgroundColor: isSelected ? colors.tint : colors.card,
                      borderColor: colors.border 
                    }
                  ]}
                  onPress={() => toggleMuscleFilter(muscle)}
                >
                  <ThemedText 
                    style={[
                      styles.muscleText,
                      { color: isSelected ? colors.background : colors.text }
                    ]}
                  >
                    {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                  </ThemedText>
                  {isSelected && (
                    <Ionicons 
                      name="checkmark" 
                      size={20} 
                      color={colors.background} 
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Enhanced Create Custom Exercise Button */}
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.tint, borderColor: colors.tint }]}
        onPress={handleCreateCustomExercise}
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.background} style={styles.createButtonIcon} />
        <ThemedText style={[styles.createButtonText, { color: colors.background }]}>
          Create Custom Exercise
        </ThemedText>
      </TouchableOpacity>

      {/* Search Bar with Filter Button */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.tint }]}
          placeholder="Search exercises..."
          placeholderTextColor={colors.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: selectedMuscles.length > 0 ? colors.tint : colors.card, borderColor: colors.border }]}
          onPress={() => setShowMuscleFilter(true)}
        >
          <Ionicons 
            name="filter" 
            size={20} 
            color={selectedMuscles.length > 0 ? colors.background : colors.text} 
          />
          {selectedMuscles.length > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: colors.background }]}>
              <ThemedText style={[styles.filterBadgeText, { color: colors.tint }]}>
                {selectedMuscles.length}
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active Filters Display */}
      {selectedMuscles.length > 0 && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFiltersList}>
            {selectedMuscles.map((muscle) => (
              <TouchableOpacity
                key={muscle}
                style={[styles.activeFilterChip, { backgroundColor: colors.tint }]}
                onPress={() => toggleMuscleFilter(muscle)}
              >
                <ThemedText style={[styles.activeFilterText, { color: colors.background }]}>
                  {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                </ThemedText>
                <Ionicons name="close" size={16} color={colors.background} style={styles.removeFilterIcon} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.contentContainer}>
        <FlatList
          ref={flatListRef}
          data={filteredExercises}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToIndex({
                  index: Math.min(info.index, filteredExercises.length - 1),
                  animated: true,
                });
              }
            }, 100);
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={48} color={colors.tabIconDefault} />
              <ThemedText style={[styles.emptyText, { color: colors.secondary }]}>
                No exercises found
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
                Try adjusting your search or filters
              </ThemedText>
            </View>
          }
        />
        
        {/* A-Z Scroll Bar */}
        <View 
          ref={scrollBarRef}
          style={[styles.scrollBar, { backgroundColor: colors.card }]}
          {...panResponder.panHandlers}
        >
          {ALPHABET.map(renderScrollBarLetter)}
        </View>
      </View>
      
      {/* Floating Add Button */}
      {selectedExercises.filter(ex => !initialRoutineExercises.some(initialEx => initialEx.id === ex.id)).length > 0 && (
        <TouchableOpacity
          style={[styles.floatingButton, { backgroundColor: colors.tint }]}
          onPress={handleAddSelectedExercises}
        >
          <View style={styles.floatingButtonContent}>
            <ThemedText style={[styles.floatingButtonText, { color: colors.background }]}>Add</ThemedText>
            <ThemedText style={[styles.floatingButtonText, { color: colors.background }]}>
              {selectedExercises.filter(ex => !initialRoutineExercises.some(initialEx => initialEx.id === ex.id)).length}
            </ThemedText>
          </View>
        </TouchableOpacity>
      )}

      {/* Muscle Filter Modal */}
      {renderMuscleFilterModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeFiltersContainer: {
    marginBottom: 16,
    maxHeight: 40,
  },
  activeFiltersList: {
    flexDirection: 'row',
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeFilterIcon: {
    marginLeft: 6,
  },
  list: {
    flex: 1,
    marginRight: 8,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 80,
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
  scrollBar: {
    width: 30,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 15,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollBarLetter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 1,
  },
  scrollBarLetterText: {
    fontSize: 11,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  clearButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  clearButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  muscleList: {
    maxHeight: 400,
  },
  muscleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  muscleText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  checkIcon: {
    marginLeft: 8,
  },
});