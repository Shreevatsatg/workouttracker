
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/utils/supabase';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

const History = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const fetchHistory = useCallback(async () => {
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
  }, [user]);

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            const { error } = await supabase
              .from('workout_sessions')
              .delete()
              .eq('id', sessionId);

            if (error) {
              console.error('Error deleting session:', error);
              Alert.alert('Error', 'Failed to delete workout session.');
            } else {
              setSessions(sessions.filter(session => session.id !== sessionId));
              setMenuVisible(null); // Close menu after deletion
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [sessions]);

  useEffect(() => {
    fetchHistory();
  }, [user, fetchHistory, handleDeleteSession]);

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
            <View style={styles.itemHeader}>
              <ThemedText style={styles.itemTitle}>{session.routines?.name || 'Freestyle Workout'}</ThemedText>
              <TouchableOpacity onPress={() => setMenuVisible(menuVisible === session.id ? null : session.id)}>
                <IconSymbol name="ellipsis" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.itemDate}>{new Date(session.started_at).toLocaleDateString()}</ThemedText>
            <ThemedText style={styles.itemNotes}>Notes: {session.notes}</ThemedText>
            {menuVisible === session.id && (
              <View style={[styles.menu, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity onPress={() => handleDeleteSession(session.id)} style={styles.menuItem}>
                  <ThemedText style={{ color: colors.text }}>Delete</ThemedText>
                </TouchableOpacity>
              </View>
            )}
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  itemNotes: {
    fontSize: 14,
  },
  menu: {
    position: 'absolute',
    top: 30,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    zIndex: 10,
  },
  menuItem: {
    padding: 8,
  },
});

export default History;
