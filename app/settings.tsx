import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ActivityLevel, calculateTDEE } from '@/utils/calorieCalculator';
import { supabase } from '@/utils/supabase';
import { Picker } from '@react-native-picker/picker';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signOut, user, profile, updateProfile } = useAuth();
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.calorie_goal && profile.gender && profile.age && profile.height && profile.weight && profile.activity_level) {
      const maintenanceCalories = calculateTDEE(
        profile.gender,
        profile.age,
        profile.height,
        profile.weight,
        profile.activity_level as ActivityLevel
      );

      const diff = profile.calorie_goal - maintenanceCalories;

      if (diff <= -1100) {
        setSelectedGoal('lose1kg');
      } else if (diff <= -825) {
        setSelectedGoal('lose0.75kg');
      } else if (diff <= -550) {
        setSelectedGoal('lose0.5kg');
      } else if (diff <= -275) {
        setSelectedGoal('lose0.25kg');
      } else if (diff >= 550) {
        setSelectedGoal('gain0.5kg');
      } else if (diff >= 275) {
        setSelectedGoal('gain0.25kg');
      } else {
        setSelectedGoal('maintain');
      }
    } else {
      setSelectedGoal('maintain'); // Default to maintain if no calorie goal is set
    }
  }, [profile]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: 'transparent' }]} showsVerticalScrollIndicator={false}>
      <ThemedView lightColor="transparent" darkColor="transparent" style={styles.section}>

        {/* Goal Option */}
        <ThemedView style={[styles.button, { backgroundColor: colors.cardBackground, borderColor: colors.tabIconDefault, borderWidth: 1, flexDirection: 'column', alignItems: 'flex-start' }]}>
          <ThemedText style={[styles.buttonText, { color: colors.text, marginBottom: 5 }]}>Goal :</ThemedText>
          <Picker
            selectedValue={selectedGoal}
            style={[styles.picker, { color: colors.text, width: '100%' }]}
            onValueChange={async (itemValue) => {
              setSelectedGoal(itemValue);

              if (!profile?.gender || !profile?.age || !profile?.height || !profile?.weight || !profile?.activity_level) {
                Alert.alert('Error', 'Please complete your personal details before setting a goal.');
                return;
              }

              const maintenanceCalories = calculateTDEE(
                profile.gender,
                profile.age,
                profile.height,
                profile.weight,
                profile.activity_level as ActivityLevel
              );

              let newCalorieGoal = maintenanceCalories;

              switch (itemValue) {
                case 'lose1kg':
                  newCalorieGoal = maintenanceCalories - 1100;
                  break;
                case 'lose0.75kg':
                  newCalorieGoal = maintenanceCalories - 825;
                  break;
                case 'lose0.5kg':
                  newCalorieGoal = maintenanceCalories - 550;
                  break;
                case 'lose0.25kg':
                  newCalorieGoal = maintenanceCalories - 275;
                  break;
                case 'maintain':
                  newCalorieGoal = maintenanceCalories;
                  break;
                case 'gain0.25kg':
                  newCalorieGoal = maintenanceCalories + 275;
                  break;
                case 'gain0.5kg':
                  newCalorieGoal = maintenanceCalories + 550;
                  break;
                default:
                  newCalorieGoal = maintenanceCalories; // Fallback
                  break;
              }

              try {
                const { error } = await supabase
                  .from('profiles')
                  .update({ calorie_goal: newCalorieGoal })
                  .eq('id', user?.id);

                if (error) {
                  throw error;
                }
                // Update local profile context
                if (profile) {
                  await updateProfile({ ...profile, calorie_goal: newCalorieGoal });
                }
                Alert.alert('Success', `Daily calorie goal updated to ${newCalorieGoal} kcal.`);
              } catch (error: any) {
                Alert.alert('Error', `Failed to update calorie goal: ${error.message}`);
                console.error('Error updating calorie goal:', error);
              }
            }}
          >
            <Picker.Item label="Lose 1 kg per week" value="lose1kg" />
            <Picker.Item label="Lose 0.75 kg per week" value="lose0.75kg" />
            <Picker.Item label="Lose 0.5 kg per week" value="lose0.5kg" />
            <Picker.Item label="Lose 0.25 kg per week" value="lose0.25kg" />
            <Picker.Item label="Maintain current weight" value="maintain" />
            <Picker.Item label="Gain 0.25 kg per week" value="gain0.25kg" />
            <Picker.Item label="Gain 0.5 kg per week" value="gain0.5kg" />
          </Picker>
        </ThemedView>

        {/* Account Option */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.cardBackground, borderColor: colors.tabIconDefault, borderWidth: 1 }]} // Use a distinct color for account
          onPress={() => router.push('/account-details')}
        >
          <ThemedText style={[styles.buttonText, { color: colors.text }]}>Account</ThemedText>
        </TouchableOpacity>

        {/* Personal Details Option */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.cardBackground, borderColor: colors.tabIconDefault, borderWidth: 1 }]} // Use a distinct color for personal details
          onPress={() => router.push('/personal-details')}
        >
          <ThemedText style={[styles.buttonText, { color: colors.text }]}>Personal Details</ThemedText>
        </TouchableOpacity>

        

        {/* Logout Option */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint, marginTop: 80 }]} // Use a distinct color for logout
          onPress={signOut}
        >
          <ThemedText style={[styles.buttonText, { color: colors.background }]}>Log Out</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    {/* App Version */}
    <ThemedView lightColor="transparent" darkColor="transparent">
        <ThemedText style={{ textAlign: 'center', marginTop: 20, color: colors.secondary }}>
          Version: {Constants.expoConfig?.version}
        </ThemedText>
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
  picker: {
    height: 50,
    width: '100%',
  },
});
