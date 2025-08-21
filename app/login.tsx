import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const StartPage = () => {
  const { loading, user, session, profile } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [errorLogs, setErrorLogs] = useState<string[]>([]);
  const [navigationAttempted, setNavigationAttempted] = useState(false);

  // Auto-navigate when auth is complete
  useEffect(() => {
    if (!loading && !navigationAttempted) {
      setNavigationAttempted(true);
      
      if (user && session) {
        console.log('🚀 Auth complete - attempting navigation...');
        
        // Check if user has completed onboarding
        if (profile?.onboarding_complete) {
          console.log('✅ Onboarding complete - navigating to main app');
          // Replace with your main app route
          router.replace('/(tabs)' as any); // or whatever your main route is
        } else {
          console.log('📝 Onboarding incomplete - navigating to onboarding');
          // Replace with your onboarding route
          router.replace('/onboarding' as any);
        }
      } else {
        console.log('🔓 No authenticated user - navigating to auth');
        // Replace with your auth/login route
        router.replace('/login' as any); // or '/auth' or whatever your login route is
      }
    }
  }, [loading, user, session, profile, navigationAttempted]);

  // Capture any errors from the auth context (keep this for debugging)
  useEffect(() => {
    const originalConsoleError = console.error;
    const originalConsoleLog = console.log;
    
    console.error = (...args) => {
      const errorMessage = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setErrorLogs(prev => [...prev, `ERROR: ${errorMessage}`]);
      originalConsoleError(...args);
    };

    console.log = (...args) => {
      const logMessage = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setErrorLogs(prev => [...prev, `LOG: ${logMessage}`]);
      originalConsoleLog(...args);
    };

    return () => {
      console.error = originalConsoleError;
      console.log = originalConsoleLog;
    };
  }, []);

  useEffect(() => {
    // Set a timeout to show debug info if loading takes too long
    const timer = setTimeout(() => {
      setTimeoutReached(true);
      
      const sessionInfo = session ? {
        hasSession: true,
        userId: session.user?.id,
        email: session.user?.email,
        expiresAt: session.expires_at,
        accessToken: session.access_token ? 'Present' : 'Missing'
      } : { hasSession: false };

      const userInfo = user ? {
        hasUser: true,
        id: user.id,
        email: user.email,
        createdAt: user.created_at
      } : { hasUser: false };

      const info = `
=== AUTH DEBUG INFO ===
Time: ${new Date().toLocaleString()}
Loading: ${loading}
Navigation Attempted: ${navigationAttempted}
User: ${JSON.stringify(userInfo, null, 2)}
Session: ${JSON.stringify(sessionInfo, null, 2)}
Profile: ${profile ? JSON.stringify(profile, null, 2) : 'null'}
======================
      `;
      setDebugInfo(info);
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, [loading, user, session, profile, navigationAttempted]);

  // Manual navigation buttons for debugging
  const handleManualNavigation = (route: string) => {
    console.log(`🔧 Manual navigation to: ${route}`);
    router.replace(route as any);
  };

  // Show debug info immediately if auth is complete but navigation hasn't worked
  if ((!loading && user && session) || timeoutReached || errorLogs.length > 0) {
    return (
      <ScrollView style={{ flex: 1, padding: 20 }} contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 20, textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>
            {loading ? 'Still Loading...' : '🎉 Auth Complete - Navigation Issue'}
          </Text>
        </View>

        {!loading && user && (
          <View style={{ marginBottom: 20, padding: 15, backgroundColor: '#e8f5e8', borderRadius: 8, borderWidth: 1, borderColor: '#4caf50' }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#2e7d32' }}>
              🎯 MANUAL NAVIGATION (Tap to test):
            </Text>
            <TouchableOpacity 
              style={{ padding: 10, backgroundColor: '#4caf50', borderRadius: 5, marginBottom: 10 }}
              onPress={() => handleManualNavigation('/(tabs)')}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                Go to Main App (/(tabs))
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ padding: 10, backgroundColor: '#2196F3', borderRadius: 5, marginBottom: 10 }}
              onPress={() => handleManualNavigation('/onboarding')}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                Go to Onboarding (/onboarding)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ padding: 10, backgroundColor: '#ff9800', borderRadius: 5 }}
              onPress={() => handleManualNavigation('/login')}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                Go to Login (/login)
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {debugInfo && (
          <View style={{ marginBottom: 20, padding: 15, backgroundColor: '#e8f4f8', borderRadius: 8, borderWidth: 1, borderColor: '#2196F3' }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10, color: '#2196F3' }}>
              AUTH STATE:
            </Text>
            <Text style={{ fontSize: 10, fontFamily: 'monospace', color: '#333' }}>
              {debugInfo}
            </Text>
          </View>
        )}

        {errorLogs.length > 0 && (
          <View style={{ padding: 15, backgroundColor: '#ffebee', borderRadius: 8, borderWidth: 1, borderColor: '#f44336' }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10, color: '#f44336' }}>
              LOGS & ERRORS ({errorLogs.length}):
            </Text>
            {errorLogs.slice(-10).map((log, index) => (
              <Text key={index} style={{ 
                fontSize: 9, 
                fontFamily: 'monospace', 
                color: log.startsWith('ERROR:') ? '#d32f2f' : '#666',
                marginBottom: 5,
                paddingLeft: 5,
                borderLeftWidth: 2,
                borderLeftColor: log.startsWith('ERROR:') ? '#f44336' : '#2196F3'
              }}>
                {log}
              </Text>
            ))}
            {errorLogs.length > 10 && (
              <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#999', marginTop: 5 }}>
                ... and {errorLogs.length - 10} more entries
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10, color: 'gray' }}>
        Initializing app...
      </Text>
      <Text style={{ marginTop: 5, fontSize: 12, color: '#999' }}>
        Debug info will appear if this takes too long
      </Text>
    </View>
  );
};

export default StartPage;