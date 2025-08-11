import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ActivityLevel, calculateTDEE } from '@/utils/calorieCalculator';
import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const { user, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | null>(null);
  const [age, setAge] = useState<string>('');
  const [height, setHeight] = useState<string>(''); // in cm
  const [weight, setWeight] = useState<string>(''); // in kg
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const inputRef = useRef(null);

  useEffect(() => {
    const parallelAnimation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    parallelAnimation.start();

    return () => {
      parallelAnimation.stop();
    };
  }, []);

  const handleContinue = async () => {
    if (fullName.trim() === '') {
      Alert.alert('Name Required', 'Please enter your name to continue');
      inputRef.current?.focus();
      return;
    }

    if (!gender || !age || !height || !weight || !activityLevel) {
      Alert.alert('Missing Information', 'Please fill in all personal details to continue.');
      return;
    }

    const ageNum = parseInt(age);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (isNaN(ageNum) || ageNum <= 0 || isNaN(heightNum) || heightNum <= 0 || isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid positive numbers for age, height, and weight.');
      return;
    }

    setIsLoading(true);

    let calorieGoal = 0;
    try {
      calorieGoal = calculateTDEE(gender, ageNum, heightNum, weightNum, activityLevel);
    } catch (error) {
      console.error('Error calculating TDEE:', error);
      Alert.alert('Calculation Error', 'Could not calculate calorie goal. Please check your inputs.');
      setIsLoading(false);
      return;
    }

    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          gender: gender,
          age: ageNum,
          height: heightNum,
          weight: weightNum,
          activity_level: activityLevel,
          calorie_goal: calorieGoal,
        })
        .eq('id', user.id);

      if (error) {
        Alert.alert('Error', 'Unable to update your profile. Please try again.');
        console.error('Supabase update error:', error);
      } else {
        await refreshProfile();
        router.replace('/(tabs)/food-log'); // Navigate to main app screen
      }
    }
    setIsLoading(false);
  };

  const gradientColors = colorScheme === 'dark' 
    ? ['#1a1a2e', '#16213e', '#0f3460'] 
    : ['#667eea', '#764ba2', '#f093fb'];

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />

      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            {/* Hero Icon */}
            <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
              <LinearGradient
                colors={['#ff6b6b', '#ee5a24']}
                style={styles.iconGradient}
              >
                <Ionicons name="fitness" size={60} color="white" />
              </LinearGradient>
            </Animated.View>

            {/* Welcome Text */}
            <Animated.View style={{ opacity: fadeAnim }}>
              <ThemedText style={[styles.title, { color: 'white' }]}>
                Welcome to FitTracker!
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: 'rgba(255,255,255,0.8)' }]}>
                Let's start your fitness journey together.{'\n'}
                First, tell us your name.
              </ThemedText>
            </Animated.View>

            {/* Input Section */}
            <Animated.View 
              style={[
                styles.inputSection,
                { transform: [{ translateY: slideAnim }] }
              ]}
            >
              <ThemedView style={styles.inputContainer}>
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={colors.tabIconDefault} 
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={inputRef}
                  style={[styles.input, { color: colors.text }, { borderColor: colors.tabIconDefault, borderWidth: 1,borderRadius: 12 }]}

                  placeholder="Enter your full name"
                  placeholderTextColor={colors.tabIconDefault}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoComplete="name"
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                />
              </ThemedView>

              {/* Gender Selection */}
              <ThemedText style={[styles.label, { color: colors.text }]}>Gender</ThemedText>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'Male' && { backgroundColor: colors.tint },
                  ]}
                  onPress={() => setGender('Male')}
                >
                  <Ionicons name="male" size={24} color={gender === 'Male' ? 'white' : colors.text} />
                  <ThemedText style={[styles.genderButtonText, { color: gender === 'Male' ? 'white' : colors.text }]}>Male</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'Female' && { backgroundColor: colors.tint },
                  ]}
                  onPress={() => setGender('Female')}
                >
                  <Ionicons name="female" size={24} color={gender === 'Female' ? 'white' : colors.text} />
                  <ThemedText style={[styles.genderButtonText, { color: gender === 'Female' ? 'white' : colors.text }]}>Female</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'Other' && { backgroundColor: colors.tint },
                  ]}
                  onPress={() => setGender('Other')}
                >
                  <Ionicons name="body" size={24} color={gender === 'Other' ? 'white' : colors.text} />
                  <ThemedText style={[styles.genderButtonText, { color: gender === 'Other' ? 'white' : colors.text }]}>Other</ThemedText>
                </TouchableOpacity>
              </View>

              {/* Age, Height, Weight Inputs */}
              <ThemedText style={[styles.label, { color: colors.text }]}>Age</ThemedText>
              <ThemedView style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color={colors.tabIconDefault} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }, { borderColor: colors.tabIconDefault, borderWidth: 1,borderRadius: 12 }]}
                  placeholder="Enter your age"
                  placeholderTextColor={colors.tabIconDefault}
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                />
              </ThemedView>

              <ThemedText style={[styles.label, { color: colors.text }]}>Height (cm)</ThemedText>
              <ThemedView style={styles.inputContainer}>
                <Ionicons name="resize-outline" size={20} color={colors.tabIconDefault} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }, { borderColor: colors.tabIconDefault, borderWidth: 1,borderRadius: 12 }]}
                  placeholder="Enter your height in cm"
                  placeholderTextColor={colors.tabIconDefault}
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
              </ThemedView>

              <ThemedText style={[styles.label, { color: colors.text }]}>Weight (kg)</ThemedText>
              <ThemedView style={styles.inputContainer}>
                <Ionicons name="scale-outline" size={20} color={colors.tabIconDefault} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }, { borderColor: colors.tabIconDefault, borderWidth: 1,borderRadius: 12 }]}
                  placeholder="Enter your weight in kg"
                  placeholderTextColor={colors.tabIconDefault}
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                />
              </ThemedView>

              {/* Activity Level Selection */}
              <ThemedText style={[styles.label, { color: colors.text }]}>Activity Level</ThemedText>
              <View style={styles.activityLevelContainer}>
                {Object.values(ActivityLevel).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.activityLevelButton,
                      activityLevel === level && { backgroundColor: colors.tint },
                    ]}
                    onPress={() => setActivityLevel(level as ActivityLevel)}
                  >
                    <ThemedText style={[styles.activityLevelButtonText, { color: activityLevel === level ? 'white' : colors.text }]}>
                      {level}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  { 
                    backgroundColor: colors.tint,
                    opacity: fullName.trim() && gender && age && height && weight && activityLevel ? 1 : 0.6 
                  }
                ]}
                onPress={handleContinue}
                disabled={isLoading || !fullName.trim() || !gender || !age || !height || !weight || !activityLevel}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <Animated.View style={styles.loadingContainer}>
                    <ThemedText style={styles.buttonText}>Setting up...</ThemedText>
                  </Animated.View>
                ) : (
                  <>
                    <ThemedText style={styles.buttonText}>Continue</ThemedText>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Motivational Quote */}
            <Animated.View 
              style={[
                styles.quoteContainer,
                { opacity: fadeAnim }
              ]}
            >
              <ThemedText style={[styles.quote, { color: 'rgba(255,255,255,0.7)' }]}>
                "The journey of a thousand miles begins with one step."
              </ThemedText>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: height,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 40,
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  inputSection: {
    width: '100%',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent', // Make transparent
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    fontWeight: '500',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    width: '100%',
  },
  genderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  genderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  activityLevelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  activityLevelButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 5,
  },
  activityLevelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  continueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  quoteContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  quote: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default WelcomeScreen;