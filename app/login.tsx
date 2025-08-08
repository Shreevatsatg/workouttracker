
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/utils/supabase';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage(null); // Clear previous errors
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorMessage(error.message);
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        if (error.message === 'User already registered') {
          // If user exists, try to log them in
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) {
            setErrorMessage(signInError.message);
          }
        } else {
          setErrorMessage(error.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null); // Clear previous errors
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) setErrorMessage(error.message);
  };

  return (
    <ThemedView lightColor="transparent" darkColor="transparent" style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.headerContainer}>
          <IconSymbol name="dumbbell.fill" size={50} color={colors.tint} />
          <ThemedText type="title" style={styles.title}>
            Workout Tracker
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Sign in to continue your fitness journey
          </ThemedText>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { backgroundColor: 'transparent', borderColor: colors.tabIconDefault, color: colors.text }]}
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrorMessage(null); // Clear error on input change
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={colors.tabIconDefault}
          />
          <TextInput
            style={[styles.input, { backgroundColor: 'transparent', borderColor: colors.tabIconDefault, color: colors.text }]}
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrorMessage(null); // Clear error on input change
            }}
            secureTextEntry
            placeholderTextColor={colors.tabIconDefault}
          />
          {errorMessage && <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint }]} onPress={handleLogin} disabled={loading}>
            <ThemedText style={[styles.buttonText, { color: colors.background }]}>Sign In</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.signUpButton]} onPress={handleSignUp} disabled={loading}>
            <ThemedText style={[styles.buttonText, { color: colors.tint }]}>Sign Up</ThemedText>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.tabIconDefault }]} />
            <ThemedText style={styles.dividerText}>OR</ThemedText>
            <View style={[styles.divider, { backgroundColor: colors.tabIconDefault }]} />
          </View>

          <TouchableOpacity style={[styles.button, styles.googleButton]} onPress={handleGoogleSignIn} disabled={loading}>
            <IconSymbol name="logo.google" size={20} color="#DB4437" style={{ marginRight: 10 }} />
            <ThemedText style={[styles.buttonText, { color: '#000' }]}>Sign In with Google</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    marginTop: 16,
    fontSize: 28,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: 'gray',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'transparent', // Set background to transparent here
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    color: 'gray',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: -10,
    marginBottom: 10,
    fontSize: 14,
  },
});

export default LoginScreen;
