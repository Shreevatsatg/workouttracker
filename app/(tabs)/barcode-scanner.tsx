import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useFood } from '@/context/FoodContext';
import { Camera, CameraView } from 'expo-camera';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function BarcodeScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const { searchByBarcode } = useFood();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  // Handle app state changes to reset scanner when returning from background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        scanned
      ) {
        // Reset scanner when app becomes active again
        setScanned(false);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, [scanned]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return; // Prevent multiple scans
    
    setScanned(true);
    setLoading(true);

    try {
      const product = await searchByBarcode(data);
      if (product) {
        router.replace({
          pathname: '/(tabs)/add-food',
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
              onPress: () => router.push('/(tabs)/manual-food-entry') 
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
      // Only set loading to false if we're not navigating away
      if (!scanned) {
        setLoading(false);
      }
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleManualEntry = () => {
    router.push('/(tabs)/manual-food-entry');
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.permissionText}>Requesting camera permission...</ThemedText>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <IconSymbol name="camera.fill" size={64} color="gray" />
        <ThemedText style={styles.permissionText}>Camera access is required to scan barcodes</ThemedText>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleManualEntry} style={[styles.backButton, styles.manualButton]}>
          <ThemedText style={styles.backButtonText}>Enter Manually</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'], // Added code128 for more coverage
        }}
      />
      
      {/* Overlay with viewfinder */}
      <View style={styles.overlay}>
        <View style={styles.unfocusedContainer} />
        <View style={styles.middleContainer}>
          <View style={styles.unfocusedContainer} />
          <View style={styles.viewfinder}>
            <View style={styles.viewfinderCorner} />
            <View style={[styles.viewfinderCorner, styles.topRight]} />
            <View style={[styles.viewfinderCorner, styles.bottomLeft]} />
            <View style={[styles.viewfinderCorner, styles.bottomRight]} />
          </View>
          <View style={styles.unfocusedContainer} />
        </View>
        <View style={styles.unfocusedContainer} />
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <ThemedText style={styles.instructions}>
          {loading ? 'Searching...' : 'Align barcode within the frame to scan'}
        </ThemedText>
      </View>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <ThemedText style={styles.loadingText}>Searching for product...</ThemedText>
        </View>
      )}

      {/* Navigation buttons */}
      <TouchableOpacity style={styles.closeButton} onPress={handleGoBack}>
        <IconSymbol name="arrow.left" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.manualEntryButton} onPress={handleManualEntry}>
        <ThemedText style={styles.manualEntryText}>Manual Entry</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  middleContainer: {
    flexDirection: 'row',
    height: '40%',
  },
  viewfinder: {
    width: '80%',
    height: '100%',
    position: 'relative',
  },
  viewfinderCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: 'white',
    borderWidth: 3,
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    right: -2,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: -2,
    top: 'auto',
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    top: 'auto',
    left: 'auto',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructions: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 15,
    fontSize: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  manualEntryButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
  },
  manualEntryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 25,
  },
  manualButton: {
    backgroundColor: '#34C759',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});