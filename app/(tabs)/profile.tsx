import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [name, setName] = React.useState('Jane Doe');
  const [email, setEmail] = React.useState('jane@example.com');
  const [age, setAge] = React.useState('28');
  const [height, setHeight] = React.useState('5\'7"');
  const [weight, setWeight] = React.useState('140 lbs');
  const [fitnessGoal, setFitnessGoal] = React.useState('Build muscle');
  const [saved, setSaved] = React.useState(false);

  const onSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const stats = [
    { label: 'Workouts', value: '47', icon: 'dumbbell', color: colors.tint },
    { label: 'Streak', value: '12', icon: 'flame', color: colors.tint },
    { label: 'Hours', value: '38', icon: 'clock', color: colors.tint },
  ];

  const preferences = [
    { 
      id: 1, 
      title: 'Workout Reminders', 
      subtitle: 'Get notified to stay consistent',
      icon: 'bell',
      enabled: true 
    },
    { 
      id: 2, 
      title: 'Progress Photos', 
      subtitle: 'Track visual progress over time',
      icon: 'camera',
      enabled: false 
    },
    { 
      id: 3, 
      title: 'Share Achievements', 
      subtitle: 'Celebrate milestones with friends',
      icon: 'share',
      enabled: true 
    },
  ];

  const achievements = [
    { title: 'First Workout', icon: 'star.fill', color: colors.tint },
    { title: '7 Day Streak', icon: 'flame.fill', color: colors.tint },
    { title: '25 Workouts', icon: 'trophy.fill', color: colors.tint },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <ThemedView style={styles.header}>
        <ThemedView style={styles.avatarContainer}>
          <IconSymbol name="person.crop.circle.fill" size={100} color={colors.tint} />
          <TouchableOpacity style={[styles.editAvatarButton, { backgroundColor: colors.tint }]}>
            <IconSymbol name="camera.fill" size={16} color={colors.background} />
          </TouchableOpacity>
        </ThemedView>
        <ThemedText type="title" style={[styles.profileName, { color: colors.text }]}>{name}</ThemedText>
        <ThemedText style={[styles.profileEmail, { color: colors.text }]}>{email}</ThemedText>
      </ThemedView>

      {/* Stats Cards */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>Your Progress</ThemedText>
        <ThemedView style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <ThemedView key={index} style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
              <IconSymbol name={stat.icon} size={24} color={stat.color} />
              <ThemedText type="title" style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.text }]}>{stat.label}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>

      {/* Achievements */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>Achievements</ThemedText>
        <ThemedView style={styles.achievementsContainer}>
          {achievements.map((achievement, index) => (
            <ThemedView key={index} style={[styles.achievementBadge, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
              <IconSymbol name={achievement.icon} size={24} color={achievement.color} />
              <ThemedText style={[styles.achievementText, { color: colors.text }]}>{achievement.title}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>

      {/* Personal Information */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</ThemedText>
        
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={[styles.inputLabel, { color: colors.text }]}>Full Name</ThemedText>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={colors.tabIconDefault}
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={[styles.inputLabel, { color: colors.text }]}>Email Address</ThemedText>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={colors.tabIconDefault}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </ThemedView>

        <ThemedView style={styles.rowInputs}>
          <ThemedView style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <ThemedText style={[styles.inputLabel, { color: colors.text }]}>Age</ThemedText>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
              value={age}
              onChangeText={setAge}
              placeholder="Age"
              placeholderTextColor={colors.tabIconDefault}
              keyboardType="numeric"
            />
          </ThemedView>
          <ThemedView style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <ThemedText style={[styles.inputLabel, { color: colors.text }]}>Height</ThemedText>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
              value={height}
              onChangeText={setHeight}
              placeholder="Height"
              placeholderTextColor={colors.tabIconDefault}
            />
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={[styles.inputLabel, { color: colors.text }]}>Weight</ThemedText>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
            value={weight}
            onChangeText={setWeight}
            placeholder="Enter your weight"
            placeholderTextColor={colors.tabIconDefault}
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={[styles.inputLabel, { color: colors.text }]}>Fitness Goal</ThemedText>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.tabIconDefault, color: colors.text }]}
            value={fitnessGoal}
            onChangeText={setFitnessGoal}
            placeholder="What's your fitness goal?"
            placeholderTextColor={colors.tabIconDefault}
          />
        </ThemedView>
      </ThemedView>

      {/* Preferences */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>Preferences</ThemedText>
        {preferences.map((pref) => (
          <ThemedView key={pref.id} style={[styles.preferenceCard, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
            <ThemedView style={[styles.preferenceIcon, { backgroundColor: colors.tint + '30' }]}>
              <IconSymbol name={pref.icon} size={24} color={colors.tint} />
            </ThemedView>
            <ThemedView style={styles.preferenceContent}>
              <ThemedText type="defaultSemiBold" style={[styles.preferenceTitle, { color: colors.text }]}>
                {pref.title}
              </ThemedText>
              <ThemedText style={[styles.preferenceSubtitle, { color: colors.text }]}>
                {pref.subtitle}
              </ThemedText>
            </ThemedView>
            <ThemedView style={[
              styles.toggle, 
              { backgroundColor: pref.enabled ? colors.tint : colors.tabIconDefault }
            ]}>
              <ThemedView style={[
                styles.toggleThumb,
                { transform: [{ translateX: pref.enabled ? 16 : 2 }] }
              ]} />
            </ThemedView>
          </ThemedView>
        ))}
      </ThemedView>

      {/* Save Button */}
      <ThemedView style={styles.section}>
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            { backgroundColor: saved ? '#10b981' : colors.tint }
          ]} 
          onPress={onSave}
          disabled={saved}
        >
          <IconSymbol 
            name={saved ? 'checkmark.circle.fill' : 'square.and.arrow.down'} 
            size={20} 
            color={colors.background} 
            style={{ marginRight: 8 }}
          />
          <ThemedText style={[styles.saveButtonText, { color: colors.background }]}>
            {saved ? 'Saved Successfully!' : 'Save Changes'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Bottom Spacing */}
      <ThemedView style={{ height: 20 }} />
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
  editAvatarButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  achievementBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
  },
  achievementText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  preferenceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceTitle: {
    marginBottom: 4,
  },
  preferenceSubtitle: {
    fontSize: 14,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    position: 'absolute',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});