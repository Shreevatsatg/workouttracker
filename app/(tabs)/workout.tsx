import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Folder, Routine, useRoutines } from '@/context/RoutinesContext';
import { useWorkout } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface ExerciseDetail {
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  equipment: string;
  images: string[];
}

const EXERCISES_DATA = require('@/assets/data/exercises.json');

export default function RoutineScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const { startWorkout: startWorkoutContext } = useWorkout();
  const { items, setItems, createFolder, deleteItem, moveRoutineToFolder } = useRoutines();

  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [movingRoutine, setMovingRoutine] = useState<Routine | null>(null);

  useEffect(() => {
    if (params.newRoutine) {
      const newRoutine = JSON.parse(params.newRoutine as string);
      if (newRoutine.id && items.some(item => item.id === newRoutine.id)) {
        setItems(items.map(item => item.id === newRoutine.id ? { ...newRoutine, type: 'routine' } : item));
      } else {
        setItems(prevItems => [{ ...newRoutine, id: Date.now().toString(), type: 'routine' }, ...prevItems]);
      }
      router.setParams({ newRoutine: '' });
    }
  }, [params.newRoutine, items, setItems, router]);

  const [allExercises, setAllExercises] = useState<ExerciseDetail[]>([]);

  useEffect(() => {
    setAllExercises(EXERCISES_DATA);
  }, []);

  const getExerciseDetails = (exerciseName: string): ExerciseDetail | undefined => {
    return allExercises.find(ex => ex.name === exerciseName);
  };

  const openRoutineDetails = (routine: Routine) => {
    router.push({
      pathname: '/(tabs)/routine-details',
      params: { routine: JSON.stringify(routine) },
    });
  };

  const startWorkout = (routine: Routine) => {
    const exercisesWithImages = routine.exercises.map(ex => {
      const details = getExerciseDetails(ex.name);
      return {
        ...ex,
        images: details?.images || [],
      };
    });
    startWorkoutContext({ ...routine, exercises: exercisesWithImages });
    router.push('/(tabs)/log-workout');
  };

  const editRoutine = (routine: Routine) => {
    setMenuVisible(null);
    router.push({
      pathname: '/(tabs)/create-routine',
      params: { routine: JSON.stringify(routine) },
    });
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim() !== '') {
      createFolder(newFolderName);
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const startEmptyWorkout = () => {
    startWorkoutContext({
      id: 'empty',
      name: 'Empty Workout',
      exercises: [],
      type: 'routine',
    });
    router.push('/(tabs)/log-workout');
  };

  return (
    <Pressable onPress={() => setMenuVisible(null)} disabled={menuVisible === null} style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: 'transparent' }]} showsVerticalScrollIndicator={false}>
        <ThemedView lightColor="transparent" darkColor="transparent" style={[styles.section, { marginTop: 24 }]}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint, marginTop: 12 }]}
            onPress={() => startEmptyWorkout()}
          >
            <IconSymbol name="play.circle" size={20} color={colors.background} />
            <ThemedText style={[styles.buttonText, { color: colors.background }]}>Start Empty Workout</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint, marginTop: 12 }]}
            onPress={() => router.push('/(tabs)/explore-routine')}
          >
            <IconSymbol name="magnifyingglass" size={20} color={colors.background} />
            <ThemedText style={[styles.buttonText, { color: colors.background }]}>Explore Routines</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {isCreatingFolder && (
          <View style={styles.section}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.tabIconDefault }]}
              placeholder="Folder Name"
              placeholderTextColor={colors.secondary}
              value={newFolderName}
              onChangeText={setNewFolderName}
            />
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.tint, marginTop: 12 }]}
              onPress={handleCreateFolder}
            >
              <ThemedText style={[styles.buttonText, { color: colors.background }]}>Create</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* List of items */}
        <ThemedView lightColor="transparent" darkColor="transparent" style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <ThemedText type="title" style={{ color: colors.tint }}>Your Routines</ThemedText>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => setIsCreatingFolder(true)}>
                <IconSymbol name="folder.badge.plus" size={28} color={colors.tint} />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 16 }} onPress={() => router.push('/(tabs)/create-routine')}>
                <IconSymbol name="plus.circle" size={28} color={colors.tint} />
              </TouchableOpacity>
            </View>
          </View>
          {items.length === 0 ? (
            <ThemedText style={{ color: colors.secondary }}>No items yet. Create one above!</ThemedText>
          ) : (
            items.map((item, idx) => (
              <View key={idx} style={{ position: 'relative' }}>
                {item.type === 'routine' ? (
                  <ThemedView style={[styles.categoryCard, { backgroundColor: 'transparent', borderColor: colors.tabIconDefault }]}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => openRoutineDetails(item as Routine)}>
                          <ThemedText type="defaultSemiBold" style={[styles.categoryTitle, { color: colors.text }]}>{item.name}</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setMenuVisible(menuVisible === item.id ? null : item.id)} style={{ padding: 8 }}>
                          <IconSymbol name="ellipsis" size={24} color={colors.text} />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity style={{ flex: 1 }} onPress={() => openRoutineDetails(item as Routine)}>
                        <ThemedText style={[styles.categorySubtitle, { color: colors.secondary }]}>{(item as Routine).exercises.length} exercises</ThemedText>
                        <ThemedText numberOfLines={2} style={[styles.exerciseList, { color: colors.secondary }]}>
                          {(item as Routine).exercises.map(e => e.name).join(', ')}
                        </ThemedText>
                        <TouchableOpacity
                          style={[styles.startButton, { backgroundColor: colors.tint }]} 
                          onPress={() => startWorkout(item as Routine)}>
                          <IconSymbol name="play.circle" size={20} color={colors.background} />
                          <ThemedText style={[styles.startButtonText, { color: colors.background }]}>Start Workout</ThemedText>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    </View>
                  </ThemedView>
                ) : (
                  <ThemedView style={[styles.categoryCard, { backgroundColor: 'transparent', borderColor: colors.tabIconDefault }]}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push({ pathname: '/(tabs)/folder-details', params: { folderId: item.id } })}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <ThemedText type="defaultSemiBold" style={[styles.categoryTitle, { color: colors.text }]}>{item.name}</ThemedText>
                          <TouchableOpacity onPress={() => setMenuVisible(menuVisible === item.id ? null : item.id)} style={{ padding: 8 }}>
                            <IconSymbol name="ellipsis" size={24} color={colors.text} />
                          </TouchableOpacity>
                        </View>
                        <ThemedText style={[styles.categorySubtitle, { color: colors.secondary }]}>{(item as Folder).routines.length} routines</ThemedText>
                      </View>
                    </TouchableOpacity>
                  </ThemedView>
                )}
                {menuVisible === item.id && (
                  <View style={[styles.menu, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
                    {item.type === 'routine' && (
                      <>
                        <TouchableOpacity style={styles.menuItem} onPress={() => editRoutine(item as Routine)}>
                          <ThemedText style={{ color: colors.secondary }}>Edit</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => setMovingRoutine(item as Routine)}>
                          <ThemedText style={{ color: colors.secondary }}>Move to Folder</ThemedText>
                        </TouchableOpacity>
                      </>
                    )}
                    <TouchableOpacity style={styles.menuItem} onPress={() => deleteItem(item.id)}>
                      <ThemedText style={{ color: colors.secondary }}>Delete</ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </ThemedView>
        <ThemedView style={{ height: 40 }} />
      </ScrollView>

      {movingRoutine && (
        <View style={styles.modalContainer}>
          <ThemedView style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
            <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 12 }}>Move to Folder</ThemedText>
            {items.filter(item => item.type === 'folder').map(folder => (
              <TouchableOpacity key={folder.id} style={styles.menuItem} onPress={() => moveRoutineToFolder(folder.id)}>
                <ThemedText style={{ color: colors.secondary }}>{folder.name}</ThemedText>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.menuItem} onPress={() => setMovingRoutine(null)}>
              <ThemedText style={{ color: colors.secondary }}>Cancel</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  categoryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 14,
  },
  exerciseList: {
    fontSize: 14,
    marginTop: 4,
  },
  menu: {
    position: 'absolute',
    top: 50,
    right: 20,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    zIndex: 10,
  },
  menuItem: {
    padding: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
  },
});