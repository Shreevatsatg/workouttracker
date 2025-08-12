import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/utils/supabase';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function MeasurementsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const MEASUREMENT_TYPES = useMemo(() => [
    { name: 'Body Weight', type: 'weight', unit: 'kg' },
    { name: 'Waist', type: 'waist', unit: 'cm' },
    { name: 'Body Fat', type: 'body_fat', unit: '%' },
    { name: 'Neck', type: 'neck', unit: 'cm' },
    { name: 'Shoulder', type: 'shoulder', unit: 'cm' },
    { name: 'Chest', type: 'chest', unit: 'cm' },
    { name: 'Left Biceps', type: 'left_biceps', unit: 'cm' },
    { name: 'Right Biceps', type: 'right_biceps', unit: 'cm' },
    { name: 'Left Forearm', type: 'left_forearm', unit: 'cm' },
    { name: 'Right Forearm', type: 'right_forearm', unit: 'cm' },
    { name: 'Abdomen', type: 'abdomen', unit: 'cm' },
    { name: 'Hips', type: 'hips', unit: 'cm' },
    { name: 'Left Thigh', type: 'left_thigh', unit: 'cm' },
    { name: 'Right Thigh', type: 'right_thigh', unit: 'cm' },
    { name: 'Left Calves', type: 'left_calves', unit: 'cm' },
    { name: 'Right Calves', type: 'right_calves', unit: 'cm' },
  ], []);

  const [measurementsData, setMeasurementsData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [inputValues, setInputValues] = useState<{[key: string]: string}>({});
  const [hasChanges, setHasChanges] = useState(false);

  const fetchMeasurements = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('measurements')
        .select('type, value, unit, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const newMeasurementsData: any = {};
      const newInputValues: {[key: string]: string} = {};

      MEASUREMENT_TYPES.forEach(typeDef => {
        const filteredData = data.filter(m => m.type === typeDef.type);
        if (filteredData.length > 0) {
          const sortedData = [...filteredData].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          newMeasurementsData[typeDef.type] = {
            starting: sortedData[0].value,
            latest: sortedData[sortedData.length - 1].value,
            unit: sortedData[0].unit, // Assuming unit is consistent for a type
          };
          newInputValues[typeDef.type] = String(sortedData[sortedData.length - 1].value); // Set latest as input default
        } else {
          newMeasurementsData[typeDef.type] = { starting: '--', latest: '--', unit: typeDef.unit };
          newInputValues[typeDef.type] = ''; // No previous value
        }
      });
      setMeasurementsData(newMeasurementsData);
      setInputValues(newInputValues);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch measurements: ' + error.message);
      console.error('Error fetching measurements:', error);
    } finally {
      setLoading(false);
    }
  }, [user, MEASUREMENT_TYPES]);

  useEffect(() => {
    fetchMeasurements();
  }, [fetchMeasurements]);

  const handleSaveAllMeasurements = async () => {
    if (!user) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    const measurementsToSave: { type: string; value: number; unit: string }[] = [];

    MEASUREMENT_TYPES.forEach(typeDef => {
      const currentValue = inputValues[typeDef.type];
      const latestRecordedValue = measurementsData[typeDef.type]?.latest;

      // Only save if the value has changed and is a valid number
      if (currentValue !== String(latestRecordedValue) && !isNaN(Number(currentValue)) && currentValue !== '') {
        measurementsToSave.push({
          type: typeDef.type,
          value: parseFloat(currentValue),
          unit: typeDef.unit,
        });
      }
    });

    if (measurementsToSave.length === 0) {
      Alert.alert('No Changes', 'No new measurements to save.');
      setHasChanges(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('measurements')
        .insert(measurementsToSave.map(m => ({ ...m, user_id: user.id })));

      if (error) throw error;

      Alert.alert('Success', 'Measurements saved successfully!');
      fetchMeasurements(); // Re-fetch all measurements to update starting and latest values
      setHasChanges(false);
    } catch (error: any) {
      Alert.alert('Error', `Failed to save measurements: ${error.message}`);
      console.error('Error saving measurements:', error);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.appBackground}]}>
      <ThemedText type="title" style={[styles.title, { color: colors.tint }]}>Your Measurements</ThemedText>

      {loading ? (
        <ActivityIndicator size="large" color={colors.tint} />
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.tableHeader}>
            <ThemedText style={[styles.headerText, { color: colors.text, flex: 2 }]}>Measurement</ThemedText>
            <ThemedText style={[styles.headerText, { color: colors.text, flex: 2 }]}>Starting</ThemedText>
            <ThemedText style={[styles.headerText, { color: colors.text, flex: 2 }]}>New Entry</ThemedText>
            <ThemedText style={[styles.headerText, { color: colors.text, flex: 1 }]}></ThemedText>
          </View>
          {MEASUREMENT_TYPES.map((measurement, index) => (
            <View key={index} style={styles.tableRow}>
              <ThemedText style={[styles.rowText, { color: colors.text, flex: 2 }]}>{measurement.name}</ThemedText>
              <ThemedText style={[styles.rowText, { color: colors.text, flex: 2 }]}>{measurementsData[measurement.type]?.starting || '--'}</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.inputBackground, flex: 2 }]}
                keyboardType="numeric"
                value={inputValues[measurement.type]}
                onChangeText={(text) => {
                  setInputValues({ ...inputValues, [measurement.type]: text });
                  setHasChanges(true);
                }}
                placeholder={String(measurementsData[measurement.type]?.latest || '')}
                placeholderTextColor={colors.secondary}
              />
              <ThemedText style={[styles.rowText, { color: colors.text, flex: 1 }]}>{measurement.unit}</ThemedText>
            </View>
          ))}
          <View style={{ height: 50 }} />{/* Add some bottom padding */}
        </ScrollView>
      )}

      {hasChanges && (
        <TouchableOpacity
          style={[styles.floatingSaveButton, { backgroundColor: colors.tint }]}
          onPress={handleSaveAllMeasurements}
        >
          <ThemedText style={[styles.saveButtonText, { color: colors.background }]}>Save </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerText: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    textAlign: 'center',
    marginHorizontal: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  floatingSaveButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
