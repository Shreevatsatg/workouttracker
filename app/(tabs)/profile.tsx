import History from '@/components/History';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

interface Profile {
  username: string;
  full_name: string;
  avatar_url: string;
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workoutCount, setWorkoutCount] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      const fetchProfileAndStats = async () => {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else if (profileData) {
          setProfile(profileData);
        }

        // Fetch workout count
        const { count, error: countError } = await supabase
          .from('workout_sessions')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);

        if (countError) {
          console.error('Error fetching workout count:', countError);
        } else {
          setWorkoutCount(count);
        }
      };
      fetchProfileAndStats();
    }
  }, [user]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <ThemedView style={styles.header}>
        <ThemedView style={styles.avatarContainer}>
          {profile?.avatar_url ? (
            // You would use an Image component here for the avatar_url
            // For now, using IconSymbol as a placeholder
            <IconSymbol name="person.crop.circle.fill" size={100} color={colors.tint} />
          ) : (
            <IconSymbol name="person.crop.circle.fill" size={100} color={colors.tint} />
          )}
        </ThemedView>
        <ThemedText type="title" style={[styles.profileName, { color: colors.text }]}>
          {profile?.full_name || profile?.username || user?.email || 'User'}
        </ThemedText>
        <ThemedText style={[styles.profileEmail, { color: colors.text }]}>
          {user?.email}
        </ThemedText>
        <TouchableOpacity onPress={() => router.push('/(tabs)/settings')} style={styles.settingsButton}>
          <IconSymbol name="gearshape.fill" size={24} color={colors.tint} />
        </TouchableOpacity>
      </ThemedView>

      {/* Statistics Section */}
      <ThemedView style={styles.statsContainer}>
        <ThemedView style={styles.statBox}>
          <ThemedText type="subtitle" style={{ color: colors.text }}>Total Workouts</ThemedText>
          <ThemedText type="title" style={{ color: colors.tint }}>{workoutCount !== null ? workoutCount : '--'}</ThemedText>
        </ThemedView>
        {/* Add more stats here if needed */}
      </ThemedView>

      {/* Quick Links */}
      <ThemedView style={styles.quickLinksContainer}>
        <TouchableOpacity
          style={[styles.profileActionButton, { backgroundColor: colors.tint }]} // Use tint background for primary action
          onPress={() => router.push('/(tabs)/measurements')}
        >
          <ThemedText style={[styles.profileActionButtonText, { color: colors.background }]}>View & Add Measurements</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* History Section */}
      <ThemedView style={styles.historySection}>
        <ThemedText type="subtitle" style={[styles.historyTitle, { color: colors.tint }]}>Workout History</ThemedText>
        <History />
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
    fontSize: 24,

  },
  profileEmail: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 16,
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.1)', // Example background
    flex: 1,
    marginHorizontal: 5,
  },
  quickLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  profileActionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1, // Make it take full width within its container
  },
  profileActionButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  historySection: {
    paddingHorizontal: 16,
  },
  historyTitle: {
    marginBottom: 10,
  },
});
