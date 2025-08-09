import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useFood } from '@/context/FoodContext';
import { Camera, CameraView } from 'expo-camera';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function BarcodeScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const { searchByBarcode } = useFood();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
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
            { text: 'Scan Again', onPress: () => setScanned(false), style: 'cancel' },
            { text: 'Enter Manually', onPress: () => router.push('/(tabs)/manual-food-entry') },
          ]
        );
      }
    } catch (error) {
      console.error('Error searching by barcode:', error);
      Alert.alert('Error', 'An unexpected error occurred while searching for the barcode.');
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ThemedText>Requesting for camera permission...</ThemedText>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <ThemedText>No access to camera.</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
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
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
      />
      <View style={styles.overlay}>
        <View style={styles.unfocusedContainer} />
        <View style={styles.middleContainer}>
          <View style={styles.unfocusedContainer} />
          <View style={styles.viewfinder} />
          <View style={styles.unfocusedContainer} />
        </View>
        <View style={styles.unfocusedContainer} />
      </View>
      <View style={styles.instructionsContainer}>
        <ThemedText style={styles.instructions}>Align barcode within the frame to scan</ThemedText>
      </View>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <ThemedText style={styles.loadingText}>Searching for product...</ThemedText>
        </View>
      )}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.push('/(tabs)/add-food')}>
        <IconSymbol name="arrow.left" size={24} color="white" />
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
    borderColor: 'white',
    borderWidth: 2,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructions: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
  },
  closeButton: {
    position: 'absolute',
    color: 'white',
    top: 50,
    left: 20,
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  backButtonText: {
    color: 'white',
  },
});
