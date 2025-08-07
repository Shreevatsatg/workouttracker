
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/supabase';
import { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  forceSignOutAndClearStorage: () => Promise<void>; // Re-added for robustness
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Redirect based on auth state
      if (event === 'SIGNED_IN') {
        router.replace('/(tabs)/workout');
      } else if (event === 'SIGNED_OUT') {
        router.replace('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during sign out:', error);
      // If session is missing, force clear local storage and redirect
      if (error.message === 'Auth session missing!') {
        await AsyncStorage.clear();
        setUser(null);
        setSession(null);
        router.replace('/login');
      }
    }
  };

  // Function to force sign out and clear local storage
  const forceSignOutAndClearStorage = async () => {
    try {
      await AsyncStorage.clear(); // Clear all AsyncStorage data
      setUser(null);
      setSession(null);
      router.replace('/login');
    } catch (e) {
      console.error('Error clearing AsyncStorage:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, forceSignOutAndClearStorage }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
