import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRoutines, Folder, Routine } from '@/context/RoutinesContext';

export default function FolderDetailsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const { items } = useRoutines();
  const folderId = params.folderId as string;
  const folder = items.find(item => item.id === folderId && item.type === 'folder') as Folder;
  const routinesInFolder = items.filter(item => item.type === 'routine' && item.folderId === folderId) as Routine[];

  if (!folder) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText>Folder not found!</ThemedText>
      </ThemedView>
    );
  }

  const openRoutineDetails = (routine: Routine) => {
    router.push({
      pathname: '/(tabs)/routine-details',
      params: { routine: JSON.stringify(routine) },
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.section}>
        <ThemedText type="title" style={{ color: colors.tint, marginBottom: 12 }}>{folder.name}</ThemedText>
      </ThemedView>

      {routinesInFolder.map((routine, exIndex) => (
        <TouchableOpacity key={exIndex} onPress={() => openRoutineDetails(routine)}>
          <ThemedView style={[styles.exerciseContainer, { borderColor: colors.tabIconDefault }]}>
            <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 8 }}>{routine.name}</ThemedText>
            <ThemedText style={{ color: colors.secondary }}>{routine.exercises.length} exercises</ThemedText>
          </ThemedView>
        </TouchableOpacity>
      ))}
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
  exerciseContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
});
