
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ActivityIndicator, TouchableOpacity, Alert, View } from 'react-native';
import { IconSymbol } from './ui/IconSymbol';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const Measurements = () => {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const fetchMeasurements = useCallback(async () => {
    if (user) {
      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching measurements:', error);
      } else {
        setMeasurements(data);
      }
      setLoading(false);
    }
  }, [user]);

  const handleDeleteMeasurement = useCallback(async (measurementId: string) => {
    Alert.alert(
      'Delete Measurement',
      'Are you sure you want to delete this measurement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            const { error } = await supabase
              .from('measurements')
              .delete()
              .eq('id', measurementId);

            if (error) {
              console.error('Error deleting measurement:', error);
              Alert.alert('Error', 'Failed to delete measurement.');
            } else {
              setMeasurements(measurements.filter(measurement => measurement.id !== measurementId));
              setMenuVisible(null); // Close menu after deletion
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [measurements]);

  useEffect(() => {
    fetchMeasurements();
  }, [user, fetchMeasurements, handleDeleteMeasurement]);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <ThemedView style={styles.container}>
      {measurements.length === 0 ? (
        <ThemedText>No measurements recorded yet.</ThemedText>
      ) : (
        measurements.map((measurement) => (
          <ThemedView key={measurement.id} style={[styles.item, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
            <View style={styles.itemHeader}>
              <ThemedText style={styles.itemTitle}>{measurement.type}: {measurement.value} {measurement.unit}</ThemedText>
              <TouchableOpacity onPress={() => setMenuVisible(menuVisible === measurement.id ? null : measurement.id)}>
                <IconSymbol name="ellipsis" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.itemDate}>{new Date(measurement.created_at).toLocaleDateString()}</ThemedText>
            {menuVisible === measurement.id && (
              <View style={[styles.menu, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity onPress={() => handleDeleteMeasurement(measurement.id)} style={styles.menuItem}>
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

export default Measurements;
