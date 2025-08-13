import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useFood } from '@/context/FoodContext';
import { Camera, CameraView } from 'expo-camera';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  AppState,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function BarcodeScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const { searchByBarcode } = useFood();
  const appState = useRef(AppState.currentState);
  
  // Animation values
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const cornerAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  // Animate scan line
  useEffect(() => {
    if (hasPermission && !loading) {
      const scanAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      scanAnimation.start();
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      return () => scanAnimation.stop();
    }
  }, [hasPermission, loading]);

  // Corner pulse animation
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cornerAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(cornerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  // Handle app state changes to reset scanner when returning from background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        scanned
      ) {
        setScanned(false);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, [scanned]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    
    setScanned(true);
    setLoading(true);

    try {
      const product = await searchByBarcode(data);
      if (product && product.product_name) { // Check if product exists and has a product_name
        router.replace({
          pathname: '/add-food',
          params: { barcode: data },
        });
      } else {
        Alert.alert(
          'Product Not Found',
          'No product found for this barcode. Would you like to enter it manually?',
          [
            { 
              text: 'Scan Again', 
              onPress: () => {
                setScanned(false);
                setLoading(false);
              }, 
              style: 'cancel' 
            },
            { 
              text: 'Enter Manually', 
              onPress: () => router.push('/manual-food-entry') 
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error searching by barcode:', error);
      Alert.alert(
        'Error', 
        'An unexpected error occurred while searching for the barcode.',
        [
          { 
            text: 'Try Again', 
            onPress: () => {
              setScanned(false);
              setLoading(false);
            }
          }
        ]
      );
    } finally {
      if (!scanned) {
        setLoading(false);
      }
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleManualEntry = () => {
    router.push('/manual-food-entry');
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.permissionTitle}>Setting up camera</ThemedText>
          <ThemedText style={styles.permissionSubtitle}>Please wait a moment...</ThemedText>
        </View>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <View style={styles.iconContainer}>
            <IconSymbol name="camera.fill" size={80} color="#FF3B30" />
          </View>
          <ThemedText style={styles.permissionTitle}>Camera Access Required</ThemedText>
          <ThemedText style={styles.permissionSubtitle}>
            We need camera access to scan barcodes and help you track your nutrition
          </ThemedText>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleManualEntry} style={[styles.actionButton, styles.primaryButton]}>
              <IconSymbol name="text.cursor" size={20} color="white" />
              <ThemedText style={styles.primaryButtonText}>Enter Manually</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGoBack} style={[styles.actionButton, styles.secondaryButton]}>
              <ThemedText style={styles.secondaryButtonText}>Go Back</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
        }}
      />
      
      {/* Modern Overlay */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleGoBack}>
            <IconSymbol name="xmark" size={24} color="white" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Scan Barcode</ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        {/* Scanning Area */}
        <View style={styles.scanningArea}>
          <View style={styles.viewfinderContainer}>
            {/* Animated Corners */}
            <Animated.View style={[styles.corner, styles.topLeft, { opacity: cornerAnim }]} />
            <Animated.View style={[styles.corner, styles.topRight, { opacity: cornerAnim }]} />
            <Animated.View style={[styles.corner, styles.bottomLeft, { opacity: cornerAnim }]} />
            <Animated.View style={[styles.corner, styles.bottomRight, { opacity: cornerAnim }]} />
            
            {/* Animated Scan Line */}
            {!loading && (
              <Animated.View 
                style={[
                  styles.scanLine, 
                  { 
                    transform: [{ translateY: scanLineTranslateY }] 
                  }
                ]} 
              />
            )}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsArea}>
          <View style={styles.instructionCard}>
            <ThemedText style={styles.instructionTitle}>
              {loading ? 'Searching...' : 'Position barcode in frame'}
            </ThemedText>
            <ThemedText style={styles.instructionSubtitle}>
              {loading ? 'Please wait while we find your product' : 'Make sure the barcode is clearly visible and well-lit'}
            </ThemedText>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={[styles.bottomButton, styles.manualEntryButton]} 
            onPress={handleManualEntry}
            disabled={loading}
          >
            <IconSymbol name="keyboard" size={20} color="white" />
            <ThemedText style={styles.bottomButtonText}>Manual Entry</ThemedText>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#007AFF" />
            <ThemedText style={styles.loadingTitle}>Searching Product</ThemedText>
            <ThemedText style={styles.loadingSubtitle}>This may take a few seconds...</ThemedText>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  
  // Permission States
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  permissionCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  iconContainer: {
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  permissionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },

  // Camera Overlay
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(10px)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  headerSpacer: {
    width: 44,
  },

  // Scanning Area
  scanningArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  viewfinderContainer: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.6,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  
  // Modern Corners
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#00FF87',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 4,
  },
  
  // Scan Line
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00FF87',
    top: '50%',
    shadowColor: '#00FF87',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },

  // Instructions
  instructionsArea: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  instructionCard: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(20px)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  instructionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Bottom Actions
  bottomActions: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  bottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  manualEntryButton: {
    backgroundColor: 'rgba(0,122,255,0.9)',
    backdropFilter: 'blur(20px)',
  },
  bottomButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
  },
  loadingTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
});
