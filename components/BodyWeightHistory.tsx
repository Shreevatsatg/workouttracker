
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

interface BodyWeightHistoryProps {
  data: {
    id: string;
    value: number;
    created_at: string;
  }[];
}

const BodyWeightHistory: React.FC<BodyWeightHistoryProps> = ({ data }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const renderItem = ({ item }: { item: { id: string; value: number; created_at: string } }) => (
    <ThemedView style={[styles.itemContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <ThemedText style={styles.itemText}>{item.value} kg</ThemedText>
      <ThemedText style={styles.itemDate}>{new Date(item.created_at).toLocaleDateString()}</ThemedText>
    </ThemedView>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<ThemedText style={styles.emptyText}>No weight measurements found.</ThemedText>}
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 16,
  },
  itemDate: {
    fontSize: 14,
    color: 'gray',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
});

export default BodyWeightHistory;
