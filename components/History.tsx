
import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const History = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('workout_sessions')
          .select('*, routines(name)')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false });

        if (error) {
          console.error('Error fetching workout history:', error);
        } else {
          setSessions(data);
        }
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <ThemedView style={styles.container}>
      {sessions.length === 0 ? (
        <ThemedText>No workout history yet.</ThemedText>
      ) : (
        sessions.map((session) => (
          <ThemedView key={session.id} style={[styles.item, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
            <ThemedText>{new Date(session.started_at).toLocaleDateString()}</ThemedText>
            <ThemedText>{session.routines?.name || 'Freestyle Workout'}</ThemedText>
            <ThemedText>Notes: {session.notes}</ThemedText>
          </ThemedView>
        ))
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  item: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
});

export default History;
