import exercisesData from '@/assets/data/exercises.json';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

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

export default function ExerciseDetailsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const exerciseId = params.exerciseId as string;
    const exerciseName = params.exerciseName as string;
    
    // Find exercise by ID or name
    let foundExercise = exercisesData.find((ex) => ex.id === exerciseId);
    if (!foundExercise && exerciseName) {
      foundExercise = exercisesData.find((ex) => ex.name === exerciseName);
    }
    
    if (foundExercise) {
      setExercise(foundExercise as Exercise);
    }
  }, [params.exerciseId, params.exerciseName]);

  const nextImage = () => {
    if (exercise && exercise.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % exercise.images.length);
    }
  };

  const previousImage = () => {
    if (exercise && exercise.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + exercise.images.length) % exercise.images.length);
    }
  };

  const capitalizeWords = (str: string) => {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return '#22c55e'; // green
      case 'intermediate':
        return '#f59e0b'; // yellow
      case 'expert':
        return '#ef4444'; // red
      default:
        return colors.text;
    }
  };

  if (!exercise) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText style={{ color: colors.text }}>Exercise not found</ThemedText>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.tint, marginTop: 20 }]}
          onPress={() => router.back()}
        >
          <ThemedText style={[styles.buttonText, { color: colors.background }]}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.tint} />
        </TouchableOpacity>
        <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
          {exercise.name}
        </ThemedText>
      </ThemedView>

      {/* Exercise Images */}
      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            const contentOffsetX = event.nativeEvent.contentOffset.x;
            const index = Math.round(contentOffsetX / screenWidth);
            setCurrentImageIndex(index);
          }}
          scrollEventThrottle={16}
          snapToInterval={screenWidth}
          decelerationRate="fast"
          snapToAlignment="center" // Add this line
          style={{ width: screenWidth }}
        >
          {exercise.images.length > 0 ? (
            exercise.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${image}` }}
                style={[styles.exerciseImage, { width: screenWidth }]} 
              />
            ))
          ) : (
            <Image
              source={require('../../assets/images/exersiseplaceholder.png')}
              style={[styles.exerciseImage, { width: screenWidth }]} 
            />
          )}
        </ScrollView>
        {exercise.images.length > 0 && (
          <View style={styles.imageIndicatorBelow}>
            <ThemedText style={[styles.imageIndicatorText, { color: colors.text }]}>
              {currentImageIndex + 1} / {exercise.images.length}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Exercise Info Cards */}
      <ThemedView style={styles.section}>
        {/* Basic Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.tint }]}>
            Basic Information
          </ThemedText>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: colors.secondary }]}>Category</ThemedText>
              <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                {capitalizeWords(exercise.category)}
              </ThemedText>
            </View>
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: colors.secondary }]}>Level</ThemedText>
              <ThemedText style={[styles.infoValue, { color: getDifficultyColor(exercise.level) }]}>
                {capitalizeWords(exercise.level)}
              </ThemedText>
            </View>
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: colors.secondary }]}>Equipment</ThemedText>
              <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                {exercise.equipment ? capitalizeWords(exercise.equipment) : 'None'}
              </ThemedText>
            </View>
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: colors.secondary }]}>Mechanic</ThemedText>
              <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                {exercise.mechanic ? capitalizeWords(exercise.mechanic) : 'N/A'}
              </ThemedText>
            </View>
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: colors.secondary }]}>Force</ThemedText>
              <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                {exercise.force ? capitalizeWords(exercise.force) : 'N/A'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Primary Muscles */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.tint }]}>
            Primary Muscles
          </ThemedText>
          <View style={styles.muscleContainer}>
            {exercise.primaryMuscles.map((muscle, index) => (
              <View key={index} style={[styles.muscleTag, { backgroundColor: colors.tint + '20', borderColor: colors.tint }]}>
                <ThemedText style={[styles.muscleText, { color: colors.tint }]}>
                  {capitalizeWords(muscle)}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Secondary Muscles */}
        {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.tint }]}>
              Secondary Muscles
            </ThemedText>
            <View style={styles.muscleContainer}>
              {exercise.secondaryMuscles.map((muscle, index) => (
                <View key={index} style={[styles.muscleTag, { backgroundColor: colors.secondary + '20', borderColor: colors.secondary }]}>
                  <ThemedText style={[styles.muscleText, { color: colors.secondary }]}>
                    {capitalizeWords(muscle)}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Instructions */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.tint }]}>
            Instructions
          </ThemedText>
          {exercise.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.tint }]}>
                <ThemedText style={[styles.stepNumberText, { color: colors.background }]}>
                  {index + 1}
                </ThemedText>
              </View>
              <ThemedText style={[styles.instructionText, { color: colors.text }]}>
                {instruction}
              </ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60, // Account for status bar
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 16, // Added for spacing
  },
  exerciseImage: {
    height: 250,
  },
  imageNavButton: {
    position: 'absolute',
    top: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
  prevButton: {
    left: 24,
  },
  nextButton: {
    right: 24,
  },
  imageIndicatorBelow: {
    marginTop: 8,
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageIndicatorText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  muscleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  muscleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
