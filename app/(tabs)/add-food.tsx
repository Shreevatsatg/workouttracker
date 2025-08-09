import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useFood } from '@/context/FoodContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface Product {
  id: string;
  product_name: string;
  brands: string;
  image_small_url: string;
}

const ProductItem: React.FC<{ 
  product: Product; 
  onSelect: (product: Product) => void;
  isSelected: boolean;
  colors: any;
}> = ({ product, onSelect, isSelected, colors }) => (
  <TouchableOpacity 
    style={[
      styles.resultItem, 
      { 
        backgroundColor: isSelected ? `${colors.accent}20` : colors.surfaceSecondary, 
        borderColor: isSelected ? colors.accent : colors.border,
        borderWidth: isSelected ? 2 : 1,
      }
    ]}
    onPress={() => onSelect(product)}
    activeOpacity={0.8}
  >
    <View style={styles.productHeader}>
      <View style={styles.productInfo}>
        <ThemedText style={[styles.productName, { color: colors.text }]}>
          {product.product_name}
        </ThemedText>
        {product.brands && (
          <ThemedText style={[styles.productBrand, { color: colors.textSecondary }]}>
            {product.brands}
          </ThemedText>
        )}
      </View>
      {isSelected && (
        <IconSymbol name="check-circle" size={24} color={colors.accent} />
      )}
    </View>
  </TouchableOpacity>
);

const UnitSelector: React.FC<{
  selectedUnit: string;
  onSelectUnit: (unit: string) => void;
  colors: any;
}> = ({ selectedUnit, onSelectUnit, colors }) => {
  const units = ['g', 'ml', 'oz', 'cup', 'tbsp', 'tsp', 'piece'];
  
  return (
    <View style={styles.unitContainer}>
      <ThemedText style={[styles.unitLabel, { color: colors.text }]}>Unit</ThemedText>
      <View style={styles.unitButtons}>
        {units.map((unit) => (
          <TouchableOpacity
            key={unit}
            style={[
              styles.unitButton,
              {
                backgroundColor: selectedUnit === unit ? colors.accent : colors.surface,
                borderColor: selectedUnit === unit ? colors.accent : colors.border,
              }
            ]}
            onPress={() => onSelectUnit(unit)}
            activeOpacity={0.7}
          >
            <ThemedText style={[
              styles.unitButtonText,
              { color: selectedUnit === unit ? 'white' : colors.text }
            ]}>
              {unit}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function AddFoodScreen() {
  const { searchFood, addFoodEntry } = useFood();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('g');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setLoading(true);
        try {
          const results = await searchFood(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Search failed:', error);
          Alert.alert('Error', 'Failed to search for food items');
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleAddFood = async () => {
    if (!selectedProduct || !quantity || !unit) {
      Alert.alert('Error', 'Please select a food item and enter quantity/unit.');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity.');
      return;
    }

    setIsAdding(true);
    try {
      await addFoodEntry(
        selectedProduct.id,
        selectedProduct.product_name,
        quantityNum,
        unit
      );
      router.back();
    } catch (error) {
      console.error('Failed to add food:', error);
      Alert.alert('Error', 'Failed to add food entry. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const renderEmptySearch = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="search" size={64} color={colors.textSecondary} />
      <ThemedText style={[styles.emptyStateTitle, { color: colors.text }]}>
        {searchQuery.length <= 2 ? 'Start typing to search' : 'No results found'}
      </ThemedText>
      <ThemedText style={[styles.emptyStateText, { color: colors.textSecondary }]}>
        {searchQuery.length <= 2 
          ? 'Enter at least 3 characters to search for food items'
          : 'Try searching with different keywords'
        }
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <IconSymbol name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
            Add Food
          </ThemedText>
          <View style={{ width: 40 }} />
        </View>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          Search and log your food intake
        </ThemedText>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <IconSymbol name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: colors.surface, 
            color: colors.text, 
            borderColor: colors.border 
          }]}
          placeholder="Search for food items..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <IconSymbol name="x" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
            Searching for food items...
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductItem
              product={item}
              onSelect={setSelectedProduct}
              isSelected={selectedProduct?.id === item.id}
              colors={colors}
            />
          )}
          style={styles.resultsList}
          contentContainerStyle={[
            styles.resultsListContent,
            searchResults.length === 0 && styles.resultsListEmpty
          ]}
          ListEmptyComponent={!loading ? renderEmptySearch : null}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Selected Product Panel */}
      {selectedProduct && (
        <ThemedView style={[styles.selectedProductContainer, { backgroundColor: colors.surface, borderColor: colors.border } ]}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedProduct(null)}>
            <ThemedText style={styles.closeButtonText}>X</ThemedText>
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.selectedProductTitle}>Selected: {selectedProduct.product_name}</ThemedText>
          <ThemedText style={styles.selectedProductBrand}>{selectedProduct.brands}</ThemedText>
          
          <View style={styles.inputSection}>
            <View style={styles.quantitySection}>
              <ThemedText style={[styles.inputLabel, { color: colors.text }]}>
                Quantity
              </ThemedText>
              <TextInput
                style={[styles.quantityInput, { 
                  backgroundColor: colors.background, 
                  color: colors.text, 
                  borderColor: colors.border 
                }]}
                placeholder="100"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
                selectTextOnFocus
              />
            </View>

            <UnitSelector
              selectedUnit={unit}
              onSelectUnit={setUnit}
              colors={colors}
            />
          </View>

          <TouchableOpacity 
            style={[styles.addButton, { 
              backgroundColor: colors.accent,
              shadowColor: colors.accent,
              opacity: isAdding ? 0.7 : 1,
            }]}
            onPress={handleAddFood}
            disabled={isAdding}
            activeOpacity={0.8}
          >
            {isAdding ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <IconSymbol name="plus" size={20} color="white" />
                <ThemedText style={styles.addButtonText}>Log Food</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    paddingHorizontal: 48,
    fontSize: 16,
    borderWidth: 1,
  },
  clearButton: {
    position: 'absolute',
    right: 16,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  resultsList: {
    flex: 1,
  },
  resultsListContent: {
    paddingBottom: 20,
  },
  resultsListEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  resultItem: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    opacity: 0.8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  selectedProductContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  selectedProductInfo: {
    marginBottom: 20,
  },
  selectedProductName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectedProductBrand: {
    fontSize: 14,
    opacity: 0.7,
  },
  inputSection: {
    marginBottom: 20,
  },
  quantitySection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  quantityInput: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  unitContainer: {
    marginBottom: 8,
  },
  unitLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  unitButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
});