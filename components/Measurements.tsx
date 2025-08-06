
import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const fetchMeasurements = async () => {
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
    };

    fetchMeasurements();
  }, [user]);

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
            <ThemedText>{new Date(measurement.created_at).toLocaleDateString()}</ThemedText>
            <ThemedText>{measurement.type}: {measurement.value} {measurement.unit}</ThemedText>
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

export default Measurements;
