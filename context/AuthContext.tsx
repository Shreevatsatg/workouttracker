

import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  gender: 'Male' | 'Female' | 'Other' | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  activity_level: string | null;
  calorie_goal: number | null;
  onboarding_complete: boolean | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (newProfile: Partial<Profile>) => Promise<void>;
  deleteUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (user: User) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error.message);
    } else {
      setProfile(data);
      if (data?.onboarding_complete) {
        await AsyncStorage.setItem('onboardingComplete', 'true');
      }
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser);
        }
      } catch (e) {
        console.error("Error initializing auth:", e);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user);
    }
  }, [user, fetchProfile]);

  const updateProfile = useCallback(async (newProfile: Partial<Profile>) => {
    if (!user) {
      throw new Error('User not authenticated.');
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update(newProfile)
        .eq('id', user.id);

      if (error) {
        throw error;
      }
      setProfile(prevProfile => ({
        ...prevProfile,
        ...newProfile,
      } as Profile)); // Type assertion to ensure it matches Profile
    } catch (error: any) {
      console.error('Error updating profile in context:', error.message);
      throw error;
    }
  }, [user]);

  const deleteUser = async () => {
    if (!session) {
      throw new Error('User not authenticated.');
    }

    const { error } = await supabase.functions.invoke('delete-user', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile, updateProfile, deleteUser }}>
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

