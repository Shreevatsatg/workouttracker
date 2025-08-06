import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Button } from 'react-native';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <ThemedView style={styles.header}>
        <ThemedView style={styles.avatarContainer}>
          <IconSymbol name="person.crop.circle.fill" size={100} color={colors.tint} />
        </ThemedView>
        <ThemedText type="title" style={[styles.profileName, { color: colors.text }]}>
          {user?.email || 'User'}
        </ThemedText>
      </ThemedView>

      {/* Stats Cards */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>Your Progress</ThemedText>
        <ThemedView style={[styles.placeholder, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
          <ThemedText style={{ color: colors.text }}>Your workout stats will appear here soon!</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Achievements */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>Achievements</ThemedText>
        <ThemedView style={[styles.placeholder, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
          <ThemedText style={{ color: colors.text }}>Your achievements will be displayed here!</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Bottom Spacing */}
      <ThemedView style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileName: {
    marginBottom: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  placeholder: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    height: 100,
  },
});
