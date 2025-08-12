import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/utils/supabase';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function PersonalDetailsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, profile, updateProfile } = useAuth();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editableProfile, setEditableProfile] = useState({
    gender: profile?.gender || '',
    age: profile?.age ? String(profile.age) : '',
    height: profile?.height ? String(profile.height) : '',
    weight: profile?.weight ? String(profile.weight) : '',
    activity_level: profile?.activity_level || '',
  });

  useEffect(() => {
    if (profile) {
      setEditableProfile({
        gender: profile.gender || '',
        age: profile.age ? String(profile.age) : '',
        height: profile.height ? String(profile.height) : '',
        weight: profile.weight ? String(profile.weight) : '',
        activity_level: profile.activity_level || '',
      });
    }
  }, [profile]);

  const handleCancelEdit = () => {
    if (profile) {
      setEditableProfile({
        gender: profile.gender || '',
        age: profile.age ? String(profile.age) : '',
        height: profile.height ? String(profile.height) : '',
        weight: profile.weight ? String(profile.weight) : '',
        activity_level: profile.activity_level || '',
      });
    }
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    if (!user) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    // Basic validation
    const updates: { [key: string]: any } = {};
    let hasChanges = false;

    if (editableProfile.gender !== (profile?.gender || '')) {
      updates.gender = editableProfile.gender;
      hasChanges = true;
    }
    if (editableProfile.age !== (profile?.age ? String(profile.age) : '')) {
      const ageNum = parseInt(editableProfile.age);
      if (isNaN(ageNum) || ageNum <= 0) {
        Alert.alert('Validation Error', 'Please enter a valid age.');
        return;
      }
      updates.age = ageNum;
      hasChanges = true;
    }
    if (editableProfile.height !== (profile?.height ? String(profile.height) : '')) {
      const heightNum = parseFloat(editableProfile.height);
      if (isNaN(heightNum) || heightNum <= 0) {
        Alert.alert('Validation Error', 'Please enter a valid height.');
        return;
      }
      updates.height = heightNum;
      hasChanges = true;
    }
    if (editableProfile.weight !== (profile?.weight ? String(profile.weight) : '')) {
      const weightNum = parseFloat(editableProfile.weight);
      if (isNaN(weightNum) || weightNum <= 0) {
        Alert.alert('Validation Error', 'Please enter a valid weight.');
        return;
      }
      updates.weight = weightNum;
      hasChanges = true;
    }
    if (editableProfile.activity_level !== (profile?.activity_level || '')) {
      updates.activity_level = editableProfile.activity_level;
      hasChanges = true;
    }

    if (!hasChanges) {
      Alert.alert('No Changes', 'No changes were made to your profile.');
      setIsEditingProfile(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update the profile in AuthContext
      await updateProfile({ ...profile, ...updates });

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update profile: ' + error.message);
      console.error('Error updating profile:', error);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.appBackground }]}>
      <ThemedText type="title" style={{ color: colors.text, marginBottom: 20 }}>Personal Details</ThemedText>

      {/* Personal Details Section */}
      <ThemedView lightColor="transparent" darkColor="transparent" style={styles.personalDetailsContainer}>
        <ThemedView style={[styles.sectionHeader, { backgroundColor: 'transparent' }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>Personal Details</ThemedText>
          <TouchableOpacity onPress={() => setIsEditingProfile(!isEditingProfile)}>
            <IconSymbol name={isEditingProfile ? "xmark.circle.fill" : "pencil.circle.fill"} size={24} color={colors.tint} />
          </TouchableOpacity>
        </ThemedView>

        {/* Gender */}
        <ThemedView style={[styles.detailRow, { backgroundColor: 'transparent' }]}>
          <ThemedText style={[styles.detailLabel, { color: colors.text }]}>Gender:</ThemedText>
          {isEditingProfile ? (
            <Picker
              selectedValue={editableProfile.gender}
              style={[styles.picker, { color: colors.tint, backgroundColor: colors.inputBackground }]}
              onValueChange={(itemValue) => setEditableProfile({ ...editableProfile, gender: itemValue as string })}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          ) : (
            <ThemedText style={[styles.detailValue, { color: colors.tint }]}>{profile?.gender || 'N/A'}</ThemedText>
          )}
        </ThemedView>

        {/* Age */}
        <ThemedView style={[styles.detailRow, { backgroundColor: 'transparent' }]}>
          <ThemedText style={[styles.detailLabel, { color: colors.text }]}>Age:</ThemedText>
          {isEditingProfile ? (
            <TextInput
              style={[styles.textInput, { color: colors.tint, borderColor: colors.border, backgroundColor: colors.inputBackground }]}
              keyboardType="numeric"
              value={editableProfile.age}
              onChangeText={(text) => setEditableProfile({ ...editableProfile, age: text })}
            />
          ) : (
            <ThemedText style={[styles.detailValue, { color: colors.tint }]}>{profile?.age ? `${profile.age} years` : 'N/A'}</ThemedText>
          )}
        </ThemedView>

        {/* Height */}
        <ThemedView style={[styles.detailRow, { backgroundColor: 'transparent' }]}>
          <ThemedText style={[styles.detailLabel, { color: colors.text }]}>Height:</ThemedText>
          {isEditingProfile ? (
            <TextInput
              style={[styles.textInput, { color: colors.tint, borderColor: colors.border, backgroundColor: colors.inputBackground }]}
              keyboardType="numeric"
              value={editableProfile.height}
              onChangeText={(text) => setEditableProfile({ ...editableProfile, height: text })}
            />
          ) : (
            <ThemedText style={[styles.detailValue, { color: colors.tint }]}>{profile?.height ? `${profile.height} cm` : 'N/A'}</ThemedText>
          )}
        </ThemedView>

        {/* Weight */}
        <ThemedView style={[styles.detailRow, { backgroundColor: 'transparent' }]}>
          <ThemedText style={[styles.detailLabel, { color: colors.text }]}>Weight:</ThemedText>
          {isEditingProfile ? (
            <TextInput
              style={[styles.textInput, { color: colors.tint, borderColor: colors.border, backgroundColor: colors.inputBackground }]}
              keyboardType="numeric"
              value={editableProfile.weight}
              onChangeText={(text) => setEditableProfile({ ...editableProfile, weight: text })}
            />
          ) : (
            <ThemedText style={[styles.detailValue, { color: colors.tint }]}>{profile?.weight ? `${profile.weight} kg` : 'N/A'}</ThemedText>
          )}
        </ThemedView>

        {/* Activity Level */}
        <ThemedView style={[styles.detailRow, { backgroundColor: 'transparent' }]}>
          <ThemedText style={[styles.detailLabel, { color: colors.text }]}>Activity Level:</ThemedText>
          {isEditingProfile ? (
            <Picker
              selectedValue={editableProfile.activity_level}
              style={[styles.picker, { color: colors.tint, backgroundColor: colors.inputBackground }]}
              onValueChange={(itemValue) => setEditableProfile({ ...editableProfile, activity_level: itemValue as string })}
            >
              <Picker.Item label="Select Activity Level" value="" />
              <Picker.Item label="Sedentary" value="sedentary" />
              <Picker.Item label="Lightly Active" value="lightly_active" />
              <Picker.Item label="Moderately Active" value="moderately_active" />
              <Picker.Item label="Very Active" value="very_active" />
              <Picker.Item label="Extremely Active" value="extremely_active" />
            </Picker>
          ) : (
            <ThemedText style={[styles.detailValue, { color: colors.tint }]}>{profile?.activity_level || 'N/A'}</ThemedText>
          )}
        </ThemedView>

        

        {isEditingProfile && (
          <ThemedView style={[styles.editButtonsContainer, { backgroundColor: 'transparent' }]}>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.tint, marginRight: 10 }]}
              onPress={handleSaveProfile}
            >
              <ThemedText style={[styles.editButtonText, { color: colors.background }]}>Save</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.error }]} // Use a different color for cancel
              onPress={handleCancelEdit}
            >
              <ThemedText style={[styles.editButtonText, { color: colors.background }]}>Cancel</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedView>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  personalDetailsContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)', // Example background
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    width: 120, // Fixed width for labels
    marginRight: 10,
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    height: 40,
  },
  picker: {
    flex: 1,
    height: 40,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  editButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
