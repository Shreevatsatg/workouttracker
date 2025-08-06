import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/utils/supabase';
import React from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signOut, user } = useAuth();

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account and all related data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            if (!user) {
              alert('No user logged in.');
              return;
            }

            try {
              const { data, error } = await supabase.functions.invoke('delete-user', {
                method: 'POST',
              });

              if (error) {
                throw error;
              }

              alert('Account and all related data deleted successfully.');
              signOut();
            } catch (error: any) {
              alert(`Error deleting account: ${error.message}`);
              console.error('Error deleting account:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.section}>
        <ThemedText type="title" style={{ color: colors.tint, marginBottom: 24 }}>Settings</ThemedText>

        {/* Logout Option */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]} // Use a distinct color for logout
          onPress={signOut}
        >
          <ThemedText style={[styles.buttonText, { color: colors.background }]}>Log Out</ThemedText>
        </TouchableOpacity>

        {/* Delete Account Option */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.error }]} // Use a distinct color for delete
          onPress={handleDeleteAccount}
        >
          <ThemedText style={[styles.buttonText, { color: colors.background }]}>Delete Account</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
