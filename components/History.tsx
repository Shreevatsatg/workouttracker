import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/utils/supabase';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import ConfirmationModal from './ConfirmationModal';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

const History = () => {
  const { user } = useAuth();

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const fetchHistory = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*, session_sets(*)')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching workout history:', error);
      setSessions([]);
    } else {
      setSessions(data || []);
    }
    setLoading(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setShowDeleteConfirm(true);
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;

    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', sessionToDelete);

    if (error) {
      console.error('Error deleting session:', error);
      Alert.alert('Error', 'Failed to delete workout session.');
    } else {
      setSessions(sessions.filter(session => session && session.id !== sessionToDelete));
      setMenuVisible(null);
    }
    setShowDeleteConfirm(false);
    setSessionToDelete(null);
  };

  const renderHistoryList = () => {
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return <ThemedText style={{ backgroundColor: 'transparent' }}>No workout history yet.</ThemedText>;
    }

    return sessions.filter(Boolean).map((session) => (
      <ThemedView key={session.id} style={[styles.item, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
        <TouchableOpacity onPress={() => setExpandedSession(expandedSession === session.id ? null : session.id)}>
          <View style={styles.itemHeader}>
          <ThemedText style={styles.itemTitle}>{session.routine_name || 'Freestyle Workout'}</ThemedText>
            <IconSymbol name={expandedSession === session.id ? "chevron.up" : "chevron.down"} size={20} color={colors.text} />
          </View>
          <ThemedText style={styles.itemDate}>{new Date(session.completed_at).toLocaleDateString()}</ThemedText>
          <ThemedText style={styles.itemDuration}>Duration: {formatTime(session.duration)}</ThemedText>
        </TouchableOpacity>
        {expandedSession === session.id && (
          <View style={styles.detailsContainer}>
            <ThemedText style={styles.detailSummary}>Total Exercises: {new Set(session.session_sets.map((s: any) => s.exercise_name)).size}</ThemedText>
            <ThemedText style={styles.detailSummary}>Total Volume: {session.session_sets.reduce((acc: number, set: any) => acc + (Number(set.weight || 0) * Number(set.reps || 0)), 0)} kg</ThemedText>
            {Array.isArray(session.session_sets) && session.session_sets.length > 0 ? (
              session.session_sets.map((set: any) => (
                <ThemedText key={set.id} style={styles.detailText}>
                  {set.exercise_name}: {set.weight}kg x {set.reps} reps
                </ThemedText>
              ))
            ) : (
              <ThemedText style={styles.detailText}>No sets recorded for this workout.</ThemedText>
            )}
          </View>
        )}
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(menuVisible === session.id ? null : session.id)}>
          <IconSymbol name="ellipsis" size={20} color={colors.text} />
        </TouchableOpacity>
        {menuVisible === session.id && (
          <View style={[styles.menu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity onPress={() => handleDeleteSession(session.id)} style={styles.menuItem}>
              <ThemedText style={{ color: colors.text }}>Delete</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
    ));
  };

  return (
    <ThemedView style={styles.container} lightColor="transparent" darkColor="transparent">
      <ConfirmationModal
        isVisible={showDeleteConfirm}
        title="Delete Workout"
        message="Are you sure you want to delete this workout session? This action cannot be undone."
        onConfirm={confirmDeleteSession}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSessionToDelete(null);
        }}
      />
      {loading ? <ActivityIndicator /> : renderHistoryList()}
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
  itemDuration: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  itemNotes: {
    fontSize: 14,
  },
  detailSummary: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  detailsContainer: {
    marginTop: 10,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 5,
  },
  menuButton: {
    position: 'absolute',
    top: 10,
    right: 40,
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
