
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/utils/supabase';
import React, { useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface AddMeasurementModalProps {
  isVisible: boolean;
  onClose: () => void;
  onMeasurementAdded: () => void;
}

const { height } = Dimensions.get('window');

const AddMeasurementModal: React.FC<AddMeasurementModalProps> = ({ isVisible, onClose, onMeasurementAdded }) => {
  const { user } = useAuth();
  const [type, setType] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (!isVisible) {
    return null;
  }

  const handleAddMeasurement = async () => {
    if (!type || !value || !unit) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (user) {
      const { error } = await supabase.from('measurements').insert([
        { user_id: user.id, type, value: parseFloat(value), unit },
      ]);

      if (error) {
        Alert.alert('Error', `Failed to add measurement: ${error.message}`);
        console.error('Error adding measurement:', error);
      } else {
        onMeasurementAdded();
        onClose();
        setType('');
        setValue('');
        setUnit('');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.modalOverlay}
    >
      <ThemedView style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.tabIconDefault }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <IconSymbol name="xmark.circle.fill" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <ThemedText type="title" style={{ color: colors.tint, marginBottom: 24 }}>Add Measurement</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.tabIconDefault }]}
          placeholder="Measurement Type (e.g., Weight, Body Fat)"
          placeholderTextColor={colors.secondary}
          value={type}
          onChangeText={setType}
        />
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.tabIconDefault }]}
          placeholder="Value"
          placeholderTextColor={colors.secondary}
          value={value}
          onChangeText={setValue}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.tabIconDefault }]}
          placeholder="Unit (e.g., kg, %)"
          placeholderTextColor={colors.secondary}
          value={unit}
          onChangeText={setUnit}
        />
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.tint }]} onPress={handleAddMeasurement}>
          <ThemedText style={[styles.addButtonText, { color: colors.background }]}>Add Measurement</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.secondary }]} onPress={onClose}>
          <ThemedText style={[styles.cancelButtonText, { color: colors.secondary }]}>Cancel</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    maxHeight: height * 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    zIndex: 1,
  },
  addButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddMeasurementModal;
