import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { modernColors } from '@/constants/ModernColors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

const LoginScreen = () => {
  const colorScheme = useColorScheme();
  const colors = modernColors[colorScheme ?? 'light'];
  const { session, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    const emailValid = /.+@.+\..+/.test(email.trim());
    const passwordValid = password.length >= 6;
    return emailValid && passwordValid && !loading;
  }, [email, password, loading]);

  const handleAuth = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        // Nudge navigation immediately; guard will route appropriately
        router.replace('/');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: undefined },
        });
        if (error) throw error;
        if (data.user && !data.session) {
          Alert.alert('Confirm your email', 'Check your inbox to verify your account before signing in.');
        } else if (data.session) {
          // In case auto-session is returned
          router.replace('/');
        }
      }
    } catch (e: any) {
      Alert.alert('Authentication failed', e?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, leave the login screen immediately
  useEffect(() => {
    if (!authLoading && session) {
      router.replace('/');
    }
  }, [authLoading, session]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: colors.surface }}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{
            backgroundColor: colors.surfaceSecondary,
            borderRadius: 20,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <IconSymbol name="dumbbell" size={28} color={colors.accent} />
          </View>
        </View>

        <ThemedText style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 8 }}>
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </ThemedText>
        <ThemedText style={{ color: colors.textSecondary, marginBottom: 20 }}>
          {mode === 'signin' ? 'Sign in to continue' : 'Sign up to get started'}
        </ThemedText>

        <View style={{ gap: 12, backgroundColor: colors.surfaceSecondary, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
          <TextInput
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            style={{
              backgroundColor: 'transparent',
              color: colors.text,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 14,
            }}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{
              backgroundColor: 'transparent',
              color: colors.text,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 14,
            }}
          />
        </View>

        <TouchableOpacity
          onPress={handleAuth}
          disabled={!canSubmit}
          style={{
            marginTop: 20,
            backgroundColor: canSubmit ? colors.accent : colors.border,
            opacity: loading ? 0.7 : 1,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            shadowColor: '#000000',
            shadowOpacity: 0.08,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
          <Text style={{ color: colors.textSecondary }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          </Text>
          <TouchableOpacity onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
            <Text style={{ color: colors.accent, fontWeight: '700' }}>
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;