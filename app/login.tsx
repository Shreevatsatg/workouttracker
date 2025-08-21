import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { modernColors } from '@/constants/ModernColors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const FormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  error,
  colors,
}: any) => (
  <View style={styles.fieldContainer}>
    <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      style={[
        styles.input,
        {
          backgroundColor: colors.surfaceSecondary,
          color: colors.text,
          borderColor: error ? colors.danger : colors.border,
        },
      ]}
    />
    {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}
  </View>
);

const LoginScreen = () => {
  const colorScheme = useColorScheme();
  const colors = modernColors[colorScheme ?? 'light'];
  const { session, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const emailValid = /.+@.+\..+/.test(email.trim());
    const passwordValid = password.length >= 6;
    return emailValid && passwordValid && !loading;
  }, [email, password, loading]);

  const handleAuth = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setAuthError(null); // Clear previous errors
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        router.replace('/');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.user && !data.session) {
          Alert.alert('Confirm your email', 'Check your inbox to verify your account before signing in.');
        } else if (data.session) {
          router.replace('/');
        }
      }
    } catch (e: any) {
      setAuthError(e.message ?? 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && session) {
      router.replace('/');
    }
  }, [authLoading, session]);

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <Image source={require('@/assets/images/splash-icon.png')} style={{ width: 92, height: 92 }} />
            <ThemedText type="title" style={{ color: colors.text }}>
              {mode === 'signin' ? 'Welcome Back' : 'Get Started'}
            </ThemedText>
            <ThemedText type="subtitle" style={{ color: colors.textSecondary, marginTop: 4 }}>
              {mode === 'signin' ? 'Sign in to access your account' : 'Create an account to begin'}
            </ThemedText>
          </View>

          <View style={styles.formContainer}>
            <FormField
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              colors={colors}
            />
            <FormField
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              colors={colors}
            />
            {authError && <Text style={[styles.authErrorText, { color: colors.danger }]}>{authError}</Text>}
          </View>

          <TouchableOpacity
            onPress={handleAuth}
            disabled={!canSubmit || loading}
            style={[styles.button, { backgroundColor: canSubmit ? colors.accent : colors.border }]}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={{ color: colors.textSecondary }}>
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
            </Text>
            <TouchableOpacity onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
              <Text style={[styles.footerLink, { color: colors.accent }]}>
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  formContainer: {
    gap: 16,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
  },
  authErrorText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  button: {
    marginTop: 24,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  footerLink: {
    fontWeight: '700',
  },
});

export default LoginScreen;
