
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ExploreRoutineDetailsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const routine = JSON.parse(params.routine as string);

  const saveRoutine = () => {
    router.push({
      pathname: '/(tabs)/workout',
      params: { newRoutine: JSON.stringify(routine) },
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.section}>
        <ThemedText type="title" style={{ color: colors.tint, marginBottom: 8 }}>{routine.name}</ThemedText>
        <ThemedText style={{ color: colors.text, marginBottom: 16 }}>{routine.description}</ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={saveRoutine}
        >
          <IconSymbol name="plus.circle" size={20} color={colors.background} />
          <ThemedText style={[styles.buttonText, { color: colors.background }]}>Add to My Routines</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {routine.exercises.map((exercise: any, exIndex: number) => (
        <ThemedView key={exIndex} style={[styles.exerciseContainer, { borderColor: colors.tabIconDefault }]}>
          <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 8 }}>{exIndex + 1}. {exercise.name}</ThemedText>
          {exercise.sets.map((set: any, setIndex: number) => (
            <ThemedView key={setIndex} style={[styles.setContainer, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
              <ThemedText style={{ color: colors.text }}>Set {setIndex + 1}</ThemedText>
              <ThemedText style={{ color: colors.text }}>{set.weight} kg</ThemedText>
              <ThemedText style={{ color: colors.text }}>{set.reps} reps</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  exerciseContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  setContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 4,
  },
});
