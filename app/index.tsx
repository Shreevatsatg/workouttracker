import { modernColors } from '@/constants/ModernColors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'warning' | 'success';
}

const StartPage = () => {
  const { loading, session, profile } = useAuth();
  const colorScheme = useColorScheme();
  const colors = modernColors[colorScheme ?? 'light'];
  const [showFallback, setShowFallback] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [networkStatus, setNetworkStatus] = useState<string>('Testing...');
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Testing...');
  const [configStatus, setConfigStatus] = useState<string>('Checking...');
  const [storageStatus, setStorageStatus] = useState<string>('Testing...');

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  // Override console methods to capture logs
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog(...args);
      addLog(args.join(' '), 'info');
    };

    console.error = (...args) => {
      originalError(...args);
      addLog(args.join(' '), 'error');
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog(args.join(' '), 'warning');
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Test network connectivity
  useEffect(() => {
    const testNetwork = async () => {
      addLog('🌐 Testing network connectivity...', 'info');
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('https://yaupadcxrzfdktuouilv.supabase.co/rest/v1/', {
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        setNetworkStatus('✅ Connected');
        addLog('✅ Network connectivity test passed', 'success');
      } catch (error) {
        setNetworkStatus('❌ Failed');
        addLog(`❌ Network test failed: ${error}`, 'error');
      }
    };

    testNetwork();
  }, []);

  // Test Supabase configuration
  useEffect(() => {
    const testSupabase = async () => {
      addLog('🔧 Testing Supabase configuration...', 'info');
      
      const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
      const supabaseKey = Constants.expoConfig?.extra?.supabaseKey;
      
      if (!supabaseUrl || !supabaseKey) {
        setSupabaseStatus('❌ Missing config');
        addLog('❌ Missing Supabase configuration', 'error');
        addLog(`URL: ${supabaseUrl || 'MISSING'}`, 'error');
        addLog(`Key: ${supabaseKey ? 'Present' : 'MISSING'}`, 'error');
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setSupabaseStatus('❌ Auth error');
          addLog(`❌ Supabase auth error: ${error.message}`, 'error');
        } else {
          setSupabaseStatus('✅ Connected');
          addLog('✅ Supabase connection successful', 'success');
          addLog(`Session: ${data.session ? 'Found' : 'None'}`, 'info');
        }
      } catch (error) {
        setSupabaseStatus('❌ Connection failed');
        addLog(`❌ Supabase connection failed: ${error}`, 'error');
      }
    };

    testSupabase();
  }, []);

  // Test AsyncStorage
  useEffect(() => {
    const testStorage = async () => {
      addLog('💾 Testing AsyncStorage...', 'info');
      try {
        // Test write
        await AsyncStorage.setItem('test_key', 'test_value');
        addLog('✅ AsyncStorage write test passed', 'success');
        
        // Test read
        const value = await AsyncStorage.getItem('test_key');
        if (value === 'test_value') {
          setStorageStatus('✅ Working');
          addLog('✅ AsyncStorage read test passed', 'success');
        } else {
          setStorageStatus('❌ Read failed');
          addLog('❌ AsyncStorage read test failed', 'error');
        }
        
        // Clean up
        await AsyncStorage.removeItem('test_key');
      } catch (error) {
        setStorageStatus('❌ Failed');
        addLog(`❌ AsyncStorage test failed: ${error}`, 'error');
      }
    };

    testStorage();
  }, []);

  // Check app configuration
  useEffect(() => {
    addLog('📱 Checking app configuration...', 'info');
    
    const config = Constants.expoConfig;
    addLog(`App version: ${config?.version || 'Unknown'}`, 'info');
    addLog(`Build type: ${__DEV__ ? 'Development' : 'Production'}`, 'info');
    addLog(`Platform: ${Constants.platform?.ios ? 'iOS' : 'Android'}`, 'info');
    
    if (config?.extra) {
      addLog('✅ App config loaded', 'success');
      setConfigStatus('✅ Loaded');
    } else {
      addLog('❌ App config missing', 'error');
      setConfigStatus('❌ Missing');
    }
  }, []);

  // Monitor auth state
  useEffect(() => {
    addLog(`🔐 Auth state: ${loading ? 'Loading' : session ? 'Logged In' : 'Not Logged In'}`, 'info');
    if (profile) {
      addLog(`👤 Profile loaded: ${profile.full_name || 'No name'}`, 'success');
    }
  }, [loading, session, profile]);

  // Fallback timeout
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      addLog('⚠️ Loading timeout reached', 'warning');
      setShowFallback(true);
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const retryTests = () => {
    setLogs([]);
    setNetworkStatus('Testing...');
    setSupabaseStatus('Testing...');
    setConfigStatus('Checking...');
    setStorageStatus('Testing...');
    // Re-run tests by updating state
    setShowFallback(false);
  };

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.surface,
      padding: 16
    }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Status Header */}
        <View style={{ 
          backgroundColor: colors.surfaceSecondary, 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 16 
        }}>
          <Text style={{ 
            color: colors.text, 
            fontSize: 18, 
            fontWeight: 'bold',
            marginBottom: 12
          }}>
            App Status
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: colors.textSecondary }}>Network:</Text>
            <Text style={{ color: networkStatus.includes('✅') ? '#4CAF50' : '#F44336' }}>
              {networkStatus}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: colors.textSecondary }}>Supabase:</Text>
            <Text style={{ color: supabaseStatus.includes('✅') ? '#4CAF50' : '#F44336' }}>
              {supabaseStatus}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: colors.textSecondary }}>Config:</Text>
            <Text style={{ color: configStatus.includes('✅') ? '#4CAF50' : '#F44336' }}>
              {configStatus}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: colors.textSecondary }}>Storage:</Text>
            <Text style={{ color: storageStatus.includes('✅') ? '#4CAF50' : '#F44336' }}>
              {storageStatus}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textSecondary }}>Auth:</Text>
            <Text style={{ color: loading ? '#FF9800' : session ? '#4CAF50' : '#F44336' }}>
              {loading ? 'Loading' : session ? 'Logged In' : 'Not Logged In'}
            </Text>
          </View>
        </View>

        {/* Loading Indicator */}
        <View style={{ 
          alignItems: 'center', 
          padding: 20,
          backgroundColor: colors.surfaceSecondary,
          borderRadius: 12,
          marginBottom: 16
        }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ 
            marginTop: 16, 
            color: colors.text,
            fontSize: 16,
            textAlign: 'center'
          }}>
            {showFallback ? 'Loading...' : 'Initializing app...'}
          </Text>
          {showFallback && (
            <Text style={{ 
              marginTop: 8, 
              color: colors.textSecondary,
              fontSize: 14,
              textAlign: 'center'
            }}>
              If this takes too long, please restart the app
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <TouchableOpacity 
            onPress={retryTests}
            style={{
              flex: 1,
              backgroundColor: colors.accent,
              padding: 12,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Retry Tests</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={clearLogs}
            style={{
              flex: 1,
              backgroundColor: colors.border,
              padding: 12,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '600' }}>Clear Logs</Text>
          </TouchableOpacity>
        </View>

        {/* Logs */}
        <View style={{ 
          backgroundColor: colors.surfaceSecondary, 
          padding: 16, 
          borderRadius: 12,
          minHeight: 200
        }}>
          <Text style={{ 
            color: colors.text, 
            fontSize: 16, 
            fontWeight: 'bold',
            marginBottom: 12
          }}>
            Debug Logs ({logs.length})
          </Text>
          
          {logs.length === 0 ? (
            <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>
              No logs yet...
            </Text>
          ) : (
            logs.map((log, index) => (
              <View key={index} style={{ marginBottom: 4 }}>
                <Text style={{ 
                  color: colors.textSecondary, 
                  fontSize: 10,
                  fontFamily: 'monospace'
                }}>
                  [{log.timestamp}]
                </Text>
                <Text style={{ 
                  color: log.type === 'error' ? '#F44336' : 
                         log.type === 'warning' ? '#FF9800' : 
                         log.type === 'success' ? '#4CAF50' : colors.text,
                  fontSize: 12,
                  fontFamily: 'monospace'
                }}>
                  {log.message}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default StartPage;