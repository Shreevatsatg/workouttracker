import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function AccountDetailsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, deleteUser, signOut, profile } = useAuth();
  const router = useRouter();

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser();
              await signOut();
              router.replace('/login');
              Alert.alert('Success', 'Your account has been deleted.');
            } catch (error: any) {
              Alert.alert('Error', `Failed to delete account: ${error.message}`);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <ThemedText type="title" style={{ color: colors.text, marginBottom: 20 }}>Account Details</ThemedText>

        {/* Personal Information Section */}
        <ThemedView lightColor="transparent" darkColor="transparent" style={styles.personalDetailsContainer}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</ThemedText>
          <ThemedView style={[styles.infoRow,{backgroundColor:'transparent'}]}>
            <ThemedText style={styles.infoLabel}>Full Name:</ThemedText>
            <ThemedText style={styles.infoValue}>{profile?.full_name || 'N/A'}</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.infoRow,{backgroundColor:'transparent'}]}>
            <ThemedText style={styles.infoLabel}>Email:</ThemedText>
            <ThemedText style={styles.infoValue}>{user?.email || 'N/A'}</ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>

      {/* Delete Account Section */}
      <ThemedView lightColor="transparent" darkColor="transparent" style={styles.deleteContainer}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>Danger Zone</ThemedText>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.error }]} // Use a red color for delete
          onPress={handleDeleteAccount}
        >
          <ThemedText style={[styles.editButtonText, { color: colors.background }]}>Delete Account</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  personalDetailsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
  },
  deleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteContainer: {
    paddingVertical: 20,
  },
});