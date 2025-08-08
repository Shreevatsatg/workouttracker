import AddMeasurementModal from '@/components/AddMeasurementModal';
import Measurements from '@/components/Measurements';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function MeasurementsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshMeasurements, setRefreshMeasurements] = useState(false);

  const handleMeasurementAdded = () => {
    setRefreshMeasurements(prev => !prev); // Toggle to trigger refresh
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={[styles.title, { color: colors.tint }]}>Your Measurements</ThemedText>
        <Measurements refresh={refreshMeasurements} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.tint }]}
        onPress={() => setIsModalVisible(true)}
      >
        <ThemedText style={[styles.addButtonText, { color: colors.background }]}>Add New Measurement</ThemedText>
      </TouchableOpacity>

      <AddMeasurementModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onMeasurementAdded={handleMeasurementAdded}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
