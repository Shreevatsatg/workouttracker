import AppNotification from '@/components/AppNotification';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Folder, Exercise as RoutineExercise, Routine as RoutinesRoutine, useRoutines } from '@/context/RoutinesContext';
import { Exercise as WorkoutExercise, useWorkout } from '@/context/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

interface ExerciseDetail {
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  equipment: string;
  images: string[];
}

interface ParamRoutine {
  id?: string;
  name: string;
  exercises: RoutineExercise[];
  type: 'routine';
  folderId?: string;
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
  const [movingRoutine, setMovingRoutine] = useState<RoutinesRoutine | null>(null);
  const [folderNameError, setFolderNameError] = useState<string | null>(null);
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');


  const styles = getStyles(colors);

  const showNotification = useCallback((message: string) => {
    setNotificationMessage(message);
    setNotificationVisible(true);
    // Auto-hide notification after 2 seconds (reduced from default)
    setTimeout(() => {
      setNotificationVisible(false);
      setNotificationMessage('');
    }, 2000);
  }, []);

  const hideNotification = useCallback(() => {
    setNotificationVisible(false);
    setNotificationMessage('');
  }, []);

  useEffect(() => {
    if (params.newRoutine) {
      const newRoutine: ParamRoutine = JSON.parse(params.newRoutine as string);
      setItems(prevItems => {
        const existingItemIndex = prevItems.findIndex(item => item.id === newRoutine.id && item.type === 'routine');

        if (existingItemIndex !== -1) {
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex] = { ...newRoutine, type: 'routine' } as RoutinesRoutine;
          return updatedItems;
        } else {
          const routineToAdd: RoutinesRoutine = {
            id: newRoutine.id || Date.now().toString(),
            name: newRoutine.name,
            exercises: newRoutine.exercises,
            type: 'routine',
            folderId: newRoutine.folderId,
          };
          return [routineToAdd, ...prevItems];
        }
      });
      router.setParams({ newRoutine: '' });
    }
  }, [params.newRoutine, setItems, router]);

  const [allExercises, setAllExercises] = useState<ExerciseDetail[]>([]);

  useEffect(() => {
    setAllExercises(EXERCISES_DATA);
  }, []);

  const getExerciseDetails = useCallback((exerciseName: string): ExerciseDetail | undefined => {
    return allExercises.find(ex => ex.name === exerciseName);
  }, [allExercises]);

  const openRoutineDetails = useCallback((routine: RoutinesRoutine) => {
    setMenuVisible(null);
    router.push({
      pathname: '/routine-details',
      params: { routine: JSON.stringify(routine) },
    });
  }, [router]);

  const startWorkout = useCallback((routine: RoutinesRoutine) => {
    const exercisesWithImagesAndLoggedSets: WorkoutExercise[] = routine.exercises.map((ex, exIndex) => {
      const details = getExerciseDetails(ex.name);
      return {
        ...ex,
        images: details?.images || [],
        loggedSets: ex.sets.map((set, index) => ({ 
          ...set, 
          loggedWeight: '', 
          loggedReps: '', 
          completed: false,
          id: set.id || `${Date.now()}-${ex.id || exIndex}-${index}-${Math.random()}`
        })),
      };
    });
    startWorkoutContext({ routine: { ...routine, exercises: exercisesWithImagesAndLoggedSets } });
    router.push('/log-workout');
  }, [getExerciseDetails, startWorkoutContext, router]);

  const editRoutine = useCallback((routine: RoutinesRoutine) => {
    setMenuVisible(null);
    router.push({
      pathname: '/create-routine',
      params: { routine: JSON.stringify(routine) },
    });
  }, [router]);

  const handleCreateFolder = useCallback(() => {
    if (newFolderName.trim() === '') {
      setFolderNameError('Folder name cannot be empty');
      return;
    }
    if (items.some(item => item.type === 'folder' && item.name.toLowerCase() === newFolderName.toLowerCase())) {
      setFolderNameError('Folder name already exists');
      return;
    }
    
    createFolder(newFolderName);
    const folderName = newFolderName;
    setNewFolderName('');
    setIsCreatingFolder(false);
    setFolderNameError(null);
    showNotification(`Folder "${folderName}" created successfully!`);
  }, [newFolderName, items, createFolder, showNotification]);

  const handleMoveRoutine = useCallback((folderId: string) => {
    if (movingRoutine) {
      moveRoutineToFolder(movingRoutine.id, folderId);
      showNotification(`Routine "${movingRoutine.name}" moved successfully!`);
    }
    setMovingRoutine(null);
  }, [movingRoutine, moveRoutineToFolder, showNotification]);

  const handleMoveRoutineToRoot = useCallback((routineId: string) => {
    moveRoutineToFolder(routineId, 'root');
    const routineName = items.find(item => item.id === routineId && item.type === 'routine')?.name;
    if (routineName) {
      showNotification(`Routine "${routineName}" moved out of folder!`);
    }
    setMenuVisible(null);
  }, [items, moveRoutineToFolder, showNotification]);

  const handleDeleteItem = useCallback((itemId: string, itemName: string, isInFolder: boolean = false) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${itemName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteItem(itemId);
            setMenuVisible(null);
            showNotification(`"${itemName}" deleted successfully!`);
            // If item was deleted from a folder, we should check if it still exists
            setTimeout(() => {
              const itemStillExists = items.some(item => item.id === itemId);
              if (!itemStillExists) {
                // Item was successfully deleted
                return;
              }
            }, 100);
          },
        },
      ]
    );
  }, [deleteItem, showNotification, items]);

  const toggleFolderExpansion = useCallback((folderId: string) => {
    setMenuVisible(null);
    setExpandedFolderId(expandedFolderId === folderId ? null : folderId);
  }, [expandedFolderId]);

  const startEmptyWorkout = useCallback(() => {
    startWorkoutContext({
      id: 'empty',
      name: 'Empty Workout',
      exercises: [],
      type: 'routine',
    });
    router.push('/log-workout');
  }, [startWorkoutContext, router]);

  const renderRoutineCard = useCallback((routine: RoutinesRoutine, isInFolder: boolean = false) => (
    <View key={routine.id}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => openRoutineDetails(routine)}
        accessibilityLabel={`View details for ${routine.name}`}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <ThemedText type="defaultSemiBold" style={[styles.categoryTitle, { color: colors.text }]}>
            {routine.name}
          </ThemedText>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              setMenuVisible(menuVisible === `${isInFolder ? 'folder-' : ''}routine-${routine.id}` ? null : `${isInFolder ? 'folder-' : ''}routine-${routine.id}`)
            }}
            style={{ padding: 8 }}
            accessibilityLabel={`Open menu for ${routine.name}`}
          >
            <IconSymbol name="ellipsis" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View
          style={{ flex: 1 }}
          accessibilityLabel={`View exercises in ${routine.name}`}
        >
          <ThemedText style={[styles.categorySubtitle, { color: colors.textSecondary }]}>
            {routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''}
          </ThemedText>
          <ThemedText numberOfLines={2} style={[styles.exerciseList, { color: colors.textSecondary }]}>
            {routine.exercises.map(e => e.name).join(', ')}
          </ThemedText>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.tint }]}
            onPress={(e) => {
              e.stopPropagation();
              startWorkout(routine)
            }}
            accessibilityLabel={`Start workout for ${routine.name}`}
          >
            <IconSymbol name="play.circle" size={20} color={colors.background} />
            <ThemedText style={[styles.startButtonText, { color: colors.background }]}>Start Workout</ThemedText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  ), [colors, openRoutineDetails, startWorkout, editRoutine, handleMoveRoutineToRoot, handleDeleteItem]);

  const renderMenu = (item: RoutinesRoutine | Folder, isInFolder: boolean) => {
    const isRoutine = item.type === 'routine';
    const menuId = isInFolder && isRoutine ? `folder-routine-${item.id}` : `${item.type}-${item.id}`;

    if (menuVisible !== menuId) {
      return null;
    }

    return (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={[
          styles.menu,
          {
            backgroundColor: colors.background,
            borderColor: colors.tabIconDefault,
            top: isRoutine ? 40 : 50,
          },
        ]}
      >
        {isRoutine ? (
          <>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => editRoutine(item as RoutinesRoutine)}
              accessibilityLabel={`Edit ${item.name}`}
            >
              <ThemedText style={{ color: colors.secondary }}>Edit</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setMovingRoutine(item as RoutinesRoutine)}
              accessibilityLabel={`Move ${item.name} to folder`}
            >
              <ThemedText style={{ color: colors.secondary }}>Move to Folder</ThemedText>
            </TouchableOpacity>
            {(item as RoutinesRoutine).folderId && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMoveRoutineToRoot(item.id)}
                accessibilityLabel={`Move ${item.name} out of folder`}
              >
                <ThemedText style={{ color: colors.secondary }}>Move Out of Folder</ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleDeleteItem(item.id, item.name, isInFolder)}
              accessibilityLabel={`Delete ${item.name}`}
            >
              <ThemedText style={{ color: colors.error }}>Delete</ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleDeleteItem(item.id, item.name)}
            accessibilityLabel={`Delete folder ${item.name}`}
          >
            <ThemedText style={{ color: colors.error }}>Delete Folder</ThemedText>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  return (
    <Pressable onPress={() => setMenuVisible(null)} style={{ flex: 1 }} accessible={false}>
      <ScrollView style={[styles.container, { backgroundColor: 'transparent' }]} showsVerticalScrollIndicator={false}>
        <ThemedView style={[styles.section, { marginTop: 24 }, { backgroundColor: 'transparent' }]}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={startEmptyWorkout}
            accessibilityLabel="Start an empty workout"
          >
            <IconSymbol name="play.circle" size={20} color={colors.background} />
            <ThemedText style={[styles.buttonText, { color: colors.background }]}>Start Empty Workout</ThemedText>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.tint, flex: 1 }]}
              onPress={() => router.push('/explore-routine')}
              accessibilityLabel="Explore routines"
            >
              <IconSymbol name="magnifyingglass" size={20} color={colors.background} />
              <ThemedText style={[styles.buttonText, { color: colors.background }]}>Explore Routines</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.tint, flex: 1 }]}
              onPress={() => router.push('/create-routine')}
              accessibilityLabel="Create new routine"
            >
              <IconSymbol name="plus" size={20} color={colors.background} />
              <ThemedText style={[styles.buttonText, { color: colors.background }]}>Create Routine</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {isCreatingFolder && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.section}>
            <TextInput
              style={[
                styles.input,
                { 
                  color: colors.text, 
                  borderColor: folderNameError ? colors.error : colors.tabIconDefault,
                  backgroundColor: colors.background 
                },
              ]}
              placeholder="Folder Name"
              placeholderTextColor={colors.secondary}
              value={newFolderName}
              onChangeText={text => {
                setNewFolderName(text);
                setFolderNameError(null);
              }}
              autoFocus
              accessibilityLabel="Enter folder name"
            />
            {folderNameError && (
              <ThemedText style={[styles.errorText, { color: colors.error }]}>{folderNameError}</ThemedText>
            )}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.tint, flex: 1 }]}
                onPress={handleCreateFolder}
                accessibilityLabel="Create folder"
              >
                <ThemedText style={[styles.buttonText, { color: colors.background }]}>Create</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.tabIconDefault, flex: 1 }]}
                onPress={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName('');
                  setFolderNameError(null);
                }}
                accessibilityLabel="Cancel folder creation"
              >
                <ThemedText style={[styles.buttonText, { color: colors.text }]}>Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        <ThemedView style={[styles.section, { backgroundColor: 'transparent' }]}>
          <View style={styles.headerContainer}>
            <ThemedText type="title" style={{ color: colors.tint }}>Your Routines</ThemedText>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity
                onPress={() => setIsCreatingFolder(true)}
                accessibilityLabel="Create new folder"
                style={styles.headerButton}
              >
                <IconSymbol name="folder.badge.plus" size={28} color={colors.tint} />
              </TouchableOpacity>
            </View>
          </View>
          
          {items.length === 0 ? (
            <ThemedText style={{ color: colors.secondary, textAlign: 'center', marginTop: 20 }}>
              No items yet. Create one above!
            </ThemedText>
          ) : (
            items.map((item, idx) => (
              <Animated.View entering={FadeIn} key={`${item.type}-${item.id}`} style={{ position: 'relative' }}>
                {item.type === 'routine' ? (
                  <ThemedView style={[styles.categoryCard, { borderColor: colors.tabIconDefault }]}>
                    {renderRoutineCard(item as RoutinesRoutine, false)}
                    {renderMenu(item, false)}
                  </ThemedView>
                ) : (
                  <ThemedView
                    style={[
                      expandedFolderId === item.id
                        ? [styles.folderContentBorder, { borderColor: colors.tabIconDefault }]
                        : [styles.folderCard, { borderColor: colors.tabIconDefault }],
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.folderHeader}
                      onPress={() => toggleFolderExpansion(item.id)}
                      accessibilityLabel={`Toggle expansion for folder ${item.name}`}
                    >
                      <View style={styles.folderIconContainer}>
                        <IconSymbol
                          name={expandedFolderId === item.id ? 'folder.fill' : 'folder'}
                          size={24}
                          color={colors.tint}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.folderTitleContainer}>
                          <ThemedText type="defaultSemiBold" style={[styles.folderTitle, { color: colors.text }]}>
                            {item.name}
                          </ThemedText>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              setMenuVisible(menuVisible === `folder-${item.id}` ? null : `folder-${item.id}`);
                            }}
                            style={styles.menuButton}
                            accessibilityLabel={`Open menu for folder ${item.name}`}
                          >
                            <IconSymbol name="ellipsis" size={20} color={colors.text} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                    
                    {expandedFolderId === item.id && (
                      <View style={[styles.folderNameBorder, { borderColor: colors.tabIconDefault }]} />
                    )}
                    <View style={styles.folderContent}></View>
                      {expandedFolderId === item.id && (
                        <View style={styles.folderContent}>
                          {(item as Folder).routines.length === 0 ? (
                            <ThemedText style={[styles.emptyFolderText, { color: colors.secondary }]}>
                              No routines in this folder
                          </ThemedText>
                        ) : (
                          (item as Folder).routines.map((routine) => (
                            <ThemedView 
                              key={`folder-${item.id}-routine-${routine.id}`} 
                              style={[styles.folderRoutineCard, { borderColor: colors.tabIconDefault }]}
                            >
                              {renderRoutineCard(routine, true)}
                              {renderMenu(routine, true)}
                            </ThemedView>
                          ))
                        )}
                        <TouchableOpacity
                          style={[styles.addRoutineButton, { backgroundColor: colors.tint }]}
                          onPress={() => router.push({ pathname: '/create-routine', params: { folderId: item.id } })}
                          accessibilityLabel={'Add new routine to folder'}
                        >
                          <IconSymbol name="plus" size={20} color={colors.background} />
                          <ThemedText style={[styles.startButtonText, { color: colors.background }]}>
                            Add Routine to Folder
                          </ThemedText>
                        </TouchableOpacity>
                      </View>
                    )}
                    {renderMenu(item, false)}
                  </ThemedView>
                )}
              </Animated.View>
            ))
          )}
        </ThemedView>
      </ScrollView>

      {movingRoutine && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.modalContainer}>
          <ThemedView style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
            <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 16 }}>
              {`Move "${movingRoutine.name}" to Folder`}
            </ThemedText>
            {items.filter(item => item.type === 'folder').length === 0 ? (
              <ThemedText style={{ color: colors.secondary, marginBottom: 16, textAlign: 'center' }}>
                No folders available. Create one first!
              </ThemedText>
            ) : (
              items
                .filter(item => item.type === 'folder')
                .map(folder => (
                  <TouchableOpacity
                    key={folder.id}
                    style={[styles.folderSelectItem, { borderColor: colors.tabIconDefault }]}
                    onPress={() => handleMoveRoutine(folder.id)}
                    accessibilityLabel={`Move to folder ${folder.name}`}
                  >
                    <IconSymbol name="folder" size={20} color={colors.tint} style={{ marginRight: 12 }} />
                    <ThemedText style={{ color: colors.text, fontSize: 16 }}>{folder.name}</ThemedText>
                  </TouchableOpacity>
                ))
            )}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.tabIconDefault, marginTop: 16 }]}
              onPress={() => setMovingRoutine(null)}
              accessibilityLabel="Cancel moving routine"
            >
              <ThemedText style={[styles.buttonText, { color: colors.text }]}>Cancel</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </Animated.View>
      )}
      
      <AppNotification
        visible={notificationVisible}
        message={notificationMessage}
        onHide={hideNotification}
      />
      <Toast />
    </Pressable>
  );
}


const getStyles = (colors: any) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    section: {
      marginHorizontal: 16,
      marginBottom: 24,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    input: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      color: colors.text,
    },
    errorText: {
      fontSize: 14,
      marginTop: 4,
      marginLeft: 8,
      color: colors.error,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerButton: {
      padding: 4,
    },
    categoryCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    folderCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    folderContentBorder: {
      borderRadius: 16,
      borderWidth: 1,
      marginBottom: 12,
      padding: 16,
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    folderHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    folderIconContainer: {
      marginRight: 12,
    },
    folderTitleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    folderTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    folderSubtitle: {
      fontSize: 14,
      marginTop: 4,
      color: colors.textSecondary,
    },
    folderNameBorder: {
      borderBottomWidth: 1,
      marginHorizontal: 8,
      marginBottom: 12,
      marginTop: 8,
      borderColor: colors.border,
    },
    folderContent: {
      paddingHorizontal: 8,
    },
    folderRoutineCard: {
      borderRadius: 12,
      borderWidth: 1,
      marginVertical: 8,
      padding: 12,
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    emptyFolderText: {
      marginVertical: 16,
      fontStyle: 'italic',
      textAlign: 'center',
      color: colors.textSecondary,
    },
    addRoutineButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginTop: 8,
      marginHorizontal: 16,
      backgroundColor: colors.tint,
    },
    categoryTitle: {
      fontSize: 18,
      marginBottom: 8,
      fontWeight: '600',
      color: colors.text,
    },
    categorySubtitle: {
      fontSize: 14,
      marginBottom: 8,
      color: colors.textSecondary,
    },
    exerciseList: {
      fontSize: 14,
      marginBottom: 12,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    menu: {
      position: 'absolute',
      right: 16,
      borderRadius: 12,
      borderWidth: 1,
      padding: 8,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
      zIndex: 10,
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    menuItem: {
      padding: 12,
      borderRadius: 8,
    },
    menuButton: {
      padding: 8,
    },
    startButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: colors.tint,
    },
    startButtonText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
      color: colors.background,
    },
    modalContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 20,
    },
    modalContent: {
      borderRadius: 20,
      padding: 24,
      width: '85%',
      maxWidth: 400,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    folderSelectItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 8,
      borderColor: colors.border,
    },
  });
