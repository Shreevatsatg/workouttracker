import { Colors } from '@/constants/Colors';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface FoodEntryModalProps {
  visible: boolean;
  onClose: () => void;
  entry: any;
  onSave: (quantity: number, unit: string) => void;
}

const FoodEntryModal: React.FC<FoodEntryModalProps> = ({ visible, onClose, entry, onSave }) => {
  const [quantity, setQuantity] = useState(entry?.quantity.toString() ?? '0');
  const [unit, setUnit] = useState(entry?.unit ?? 'g');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSave = () => {
    onSave(parseFloat(quantity), unit);
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <ThemedView style={[styles.modalView, { backgroundColor: colors.surface }]}>
          <ThemedText style={styles.modalTitle}>{entry?.product_name}</ThemedText>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Quantity</ThemedText>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.tint }]}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Unit</ThemedText>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.tint }]}
              value={unit}
              onChangeText={setUnit}
            />
          </View>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.accent }]} onPress={handleSave}>
            <ThemedText style={styles.saveButtonText}>Save</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <IconSymbol name="xmark.circle.fill" size={30} color={colors.tint} />
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  saveButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default FoodEntryModal;
