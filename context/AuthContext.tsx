

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/supabase';
import { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetProfile = useCallback(async (user: User) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignore no rows found error
      console.error('Error fetching profile:', error);
      setProfile(null);
    } else {
      setProfile(data);
    }
    return data;
  }, []);

  useEffect(() => {
    const processSession = async (session: Session | null) => {
      if (session?.user) {
        const currentProfile = await fetchAndSetProfile(session.user);
        if (currentProfile?.full_name) {
          router.replace('/(tabs)/workout');
        } else {
          router.replace('/welcome');
        }
      } else {
        setProfile(null);
        router.replace('/login');
      }
    };

    // Handle initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setSession(session);
      processSession(session).finally(() => setLoading(false));
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setSession(session);
        // Only redirect on explicit sign-in or sign-out
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          await processSession(session);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchAndSetProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    // The onAuthStateChange listener will handle the redirect
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      const updatedProfile = await fetchAndSetProfile(user);
      // Re-evaluate navigation after profile refresh
      if (updatedProfile?.full_name) {
        router.replace('/(tabs)/workout');
      } else {
        router.replace('/welcome');
      }
    }
  }, [user, fetchAndSetProfile]);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

