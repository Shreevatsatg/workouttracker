import AddMeasurementModal from '@/components/AddMeasurementModal';
import History from '@/components/History';
import Measurements from '@/components/Measurements';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('History');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleMeasurementAdded = () => {
    // You might want to refresh the measurements data here
    // For now, we'll just close the modal
  };

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
        <TouchableOpacity onPress={() => router.push('/(tabs)/settings')} style={styles.settingsButton}>
          <IconSymbol name="gearshape.fill" size={24} color={colors.tint} />
        </TouchableOpacity>
      </ThemedView>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('History')} style={[styles.tab, activeTab === 'History' && styles.activeTab, { borderColor: colors.tint }]}>
          <ThemedText style={{ color: activeTab === 'History' ? colors.tint : colors.text }}>History</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Measurements')} style={[styles.tab, activeTab === 'Measurements' && styles.activeTab, { borderColor: colors.tint }]}>
          <ThemedText style={{ color: activeTab === 'Measurements' ? colors.tint : colors.text }}>Measurements</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'History' ? <History /> : (
        <ThemedView>
          <Measurements />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={() => setIsModalVisible(true)}
          >
            <ThemedText style={[styles.addButtonText, { color: colors.background }]}>Add Measurement</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      {/* Bottom Spacing */}
      <ThemedView style={{ height: 20 }} />

      <AddMeasurementModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onMeasurementAdded={handleMeasurementAdded}
      />
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
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  tab: {
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  addButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  addButtonText: {
    fontWeight: 'bold',
  },
});
