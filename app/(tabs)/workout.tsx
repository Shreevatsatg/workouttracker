import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Set {
  weight: string;
  reps: string;
}

interface Exercise {
  name: string;
  sets: Set[];
}

interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
}

export default function RoutineScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  useEffect(() => {
    if (params.newRoutine) {
      const newRoutine = JSON.parse(params.newRoutine as string);
      if (newRoutine.id && routines.some(r => r.id === newRoutine.id)) {
        setRoutines(routines.map(r => r.id === newRoutine.id ? newRoutine : r));
      } else {
        setRoutines(prevRoutines => [{ ...newRoutine, id: Date.now().toString() }, ...prevRoutines]);
      }
    }
  }, [params.newRoutine]);

  const openRoutineDetails = (routine: Routine) => {
    router.push({
      pathname: '/(tabs)/routine-details',
      params: { routine: JSON.stringify(routine) },
    });
  };

  const deleteRoutine = (id: string) => {
    setRoutines(routines.filter(r => r.id !== id));
    setMenuVisible(null);
  };

  const editRoutine = (routine: Routine) => {
    setMenuVisible(null);
    router.push({
      pathname: '/(tabs)/create-routine',
      params: { routine: JSON.stringify(routine) },
    });
  };

  return (
    <Pressable onPress={() => setMenuVisible(null)} disabled={menuVisible === null} style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        <ThemedView style={[styles.section, { marginTop: 24 }]}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/(tabs)/create-routine')}
          >
            <IconSymbol name="plus.circle" size={20} color={colors.background} />
            <ThemedText style={[styles.buttonText, { color: colors.background }]}>Create Routine</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint, marginTop: 12 }]}
            onPress={() => router.push('/(tabs)/explore-routine')}
          >
            <IconSymbol name="magnifyingglass" size={20} color={colors.background} />
            <ThemedText style={[styles.buttonText, { color: colors.background }]}>Explore Routines</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* List of routines */}
        <ThemedView style={styles.section}>
          <ThemedText type="title" style={{ color: colors.tint, marginBottom: 12 }}>Your Routines</ThemedText>
          {routines.length === 0 ? (
            <ThemedText style={{ color: colors.secondary }}>No routines yet. Create one above!</ThemedText>
          ) : (
            routines.map((routine, idx) => (
              <View key={idx} style={{ position: 'relative' }}>
                <ThemedView style={[styles.categoryCard, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => openRoutineDetails(routine)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <ThemedView style={[styles.categoryIcon, { backgroundColor: colors.tint + '20' }]}>
                        <IconSymbol name="figure.strengthtraining.traditional" size={28} color={colors.tint} />
                      </ThemedView>
                      <ThemedView style={styles.categoryContent}>
                        <ThemedText type="defaultSemiBold" style={[styles.categoryTitle, { color: colors.text }]}>{routine.name}</ThemedText>
                        <ThemedText style={[styles.categorySubtitle, { color: colors.secondary }]}>{routine.exercises.length} exercises</ThemedText>
                      </ThemedView>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setMenuVisible(menuVisible === routine.id ? null : routine.id)} style={{ padding: 8 }}>
                    <IconSymbol name="ellipsis" size={24} color={colors.text} />
                  </TouchableOpacity>
                </ThemedView>
                {menuVisible === routine.id && (
                  <View style={[styles.menu, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => editRoutine(routine)}>
                      <ThemedText style={{ color: colors.secondary }}>Edit</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => deleteRoutine(routine.id)}>
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
});