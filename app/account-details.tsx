import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function AccountDetailsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  

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
            // Implement actual deletion logic here
            // This typically involves a Supabase Edge Function or a secure backend call
            Alert.alert('Delete Account', 'Account deletion functionality not yet implemented.');
            // After successful deletion, log out the user and navigate to login screen
            // await supabase.auth.signOut();
            // router.replace('/login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.appBackgroundbackground }]}>
      <ThemedText type="title" style={{ color: colors.text, marginBottom: 20 }}>Account Details</ThemedText>

      

      {/* Delete Account Section */}
      <ThemedView lightColor="transparent" darkColor="transparent" style={[styles.personalDetailsContainer, { marginTop: 20 }]}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>Danger Zone</ThemedText>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.error }]} // Use a red color for delete
          onPress={handleDeleteAccount}
        >
          <ThemedText style={[styles.editButtonText, { color: colors.background }]}>Delete Account</ThemedText>
        </TouchableOpacity>
      </ThemedView>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  deleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
});