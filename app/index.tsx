import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

const StartPage = () => {
  const { loading, user, session, profile } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [errorLogs, setErrorLogs] = useState<string[]>([]);

  // Capture any errors from the auth context
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
User: ${JSON.stringify(userInfo, null, 2)}
Session: ${JSON.stringify(sessionInfo, null, 2)}
Profile: ${profile ? JSON.stringify(profile, null, 2) : 'null'}
======================
      `;
      setDebugInfo(info);
    }, 5000); // Show after 5 seconds

    return () => clearTimeout(timer);
  }, [loading, user, session, profile]);

  // Force stop loading after 20 seconds to prevent infinite loading
  useEffect(() => {
    const forceStopTimer = setTimeout(() => {
      if (loading) {
        setErrorLogs(prev => [...prev, 'CRITICAL: Loading has been stuck for 20 seconds - this indicates a serious issue with auth initialization']);
        setTimeoutReached(true);
      }
    }, 20000);

    return () => clearTimeout(forceStopTimer);
  }, [loading]);

  if (timeoutReached || errorLogs.length > 0) {
    return (
      <ScrollView style={{ flex: 1, padding: 20 }} contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 20, textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>
            {loading ? 'Loading Debug Information' : 'App Initialization Complete'}
          </Text>
        </View>

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

        {errorLogs.length === 0 && !debugInfo && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#666', textAlign: 'center' }}>
              No errors detected. If loading continues, there might be a network issue or Supabase configuration problem.
            </Text>
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