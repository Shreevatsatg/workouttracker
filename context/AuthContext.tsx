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
    try {
      
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout after 10 seconds')), 10000);
      });
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Profile fetch error: ${error.message} (Code: ${error.code})`);
      }
      
      if (error && error.code === 'PGRST116') {
        console.log('📋 No profile found for user - this might be expected for new users');
      } else {
        console.log(`✅ Profile fetched successfully for user`);
      }
      
      setProfile(data);
      
      if (data?.onboarding_complete) {
        await AsyncStorage.setItem('onboardingComplete', 'true');
        console.log('✅ Onboarding complete flag saved to storage');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error fetching profile';
      console.error('❌ Error in fetchProfile:', errorMessage);
      console.error('Full error object:', e);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('🚀 Starting auth initialization...');
        setLoading(true);
        
        // Check if Supabase is properly configured
        if (!supabase) {
          throw new Error('Supabase client is not initialized');
        }
        
        console.log('📡 Attempting to get session from Supabase...');
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth initialization timeout after 15 seconds - possible network issue')), 15000);
        });
        
        const authPromise = supabase.auth.getSession();
        
        const result = await Promise.race([authPromise, timeoutPromise]) as any;
        
        if (!mounted) {
          console.log('⚠️ Component unmounted during auth initialization');
          return;
        }
        
        if (!result || !result.data) {
          throw new Error('Invalid response from Supabase getSession');
        }
        
        const { data: { session }, error } = result;
        
        if (error) {
          throw new Error(`Supabase session error: ${error.message}`);
        }
        
        console.log(`✅ Session retrieved successfully: ${session ? 'Found active session' : 'No active session'}`);
        
        if (session) {
          console.log(`👤 User ID: ${session.user?.id}`);
          console.log(`📧 User Email: ${session.user?.email}`);
          console.log(`⏰ Session expires: ${new Date(session.expires_at * 1000).toLocaleString()}`);
        }
        
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          console.log('👤 User found, fetching profile...');
          await fetchProfile(currentUser);
        } else {
          console.log('🔓 No user found - user needs to login');
        }
        
        console.log('✨ Auth initialization completed successfully');
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error during auth initialization';
        console.error("❌ ERROR initializing auth:", errorMessage);
        console.error("Full error object:", e);
        
        // On error, still set loading to false to prevent infinite loading
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          console.log('🏁 Setting loading to false');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log(`🔄 Auth state change detected: ${event}`);
        console.log(`📱 Session present: ${!!session}`);
        
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          console.log('🔄 Auth state change - fetching profile for user');
          await fetchProfile(currentUser);
        } else {
          console.log('🔄 Auth state change - no user, clearing profile');
          setProfile(null);
        }
        
        // Ensure loading is set to false on auth state changes
        console.log('🔄 Auth state change complete - setting loading to false');
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = async () => {
    console.log('Signing out...');
    try {
      await supabase.auth.signOut();
      // Clear AsyncStorage on sign out
      await AsyncStorage.removeItem('onboardingComplete');
      console.log('Sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
      } as Profile));
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