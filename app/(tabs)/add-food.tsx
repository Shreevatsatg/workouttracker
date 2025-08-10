import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useFood } from '@/context/FoodContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface Product {
  id: string;
  product_name: string;
  brands: string;
  image_small_url: string;
}

interface RecentFood {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit: string;
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
        backgroundColor: isSelected ? `${colors.accent}15` : colors.surface,
        borderColor: isSelected ? colors.accent : colors.border,
        borderWidth: isSelected ? 2 : 1,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isSelected ? 0.15 : 0.08,
        shadowRadius: 8,
        elevation: isSelected ? 4 : 2,
      },
    ]}
    onPress={() => onSelect(product)}
    activeOpacity={0.7}
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
      {isSelected ? (
        <View style={[styles.checkmarkContainer, { backgroundColor: colors.accent }]}>
          <IconSymbol name="checkmark" size={16} color="white" />
        </View>
      ) : (
        <View style={[styles.selectIndicator, { borderColor: colors.border }]} />
      )}
    </View>
  </TouchableOpacity>
);

const RecentFoodItem: React.FC<{
  item: RecentFood;
  onSelect: (item: RecentFood) => void;
  colors: any;
}> = ({ item, onSelect, colors }) => (
  <TouchableOpacity
    style={[
      styles.recentItem, 
      { 
        backgroundColor: colors.surface, 
        borderColor: colors.border,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      }
    ]}
    onPress={() => onSelect(item)}
    activeOpacity={0.7}
  >
    <View style={styles.recentItemIcon}>
      <IconSymbol name="clock" size={18} color={colors.accent} />
    </View>
    <View style={styles.recentItemContent}>
      <ThemedText style={[styles.recentItemName, { color: colors.text }]}>{item.product_name}</ThemedText>
      <ThemedText style={[styles.recentItemDetails, { color: colors.textSecondary }]}>
        {item.quantity} {item.unit}
      </ThemedText>
    </View>
    <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
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
                backgroundColor: selectedUnit === unit ? colors.accent : colors.background,
                borderColor: selectedUnit === unit ? colors.accent : colors.border,
                shadowColor: selectedUnit === unit ? colors.accent : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: selectedUnit === unit ? 0.2 : 0,
                shadowRadius: 4,
                elevation: selectedUnit === unit ? 2 : 0,
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

const QuickActionButton: React.FC<{
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  colors: any;
  variant?: 'primary' | 'secondary';
}> = ({ icon, title, subtitle, onPress, colors, variant = 'secondary' }) => (
  <TouchableOpacity
    style={[
      styles.quickActionButton,
      {
        backgroundColor: variant === 'primary' ? colors.accent : colors.surface,
        borderColor: variant === 'primary' ? colors.accent : colors.border,
        shadowColor: variant === 'primary' ? colors.accent : colors.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: variant === 'primary' ? 0.25 : 0.08,
        shadowRadius: 8,
        elevation: variant === 'primary' ? 4 : 2,
      }
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[
      styles.quickActionIcon,
      { backgroundColor: variant === 'primary' ? 'rgba(255,255,255,0.2)' : `${colors.accent}15` }
    ]}>
      <IconSymbol 
        name={icon} 
        size={24} 
        color={variant === 'primary' ? 'white' : colors.accent} 
      />
    </View>
    <View style={styles.quickActionText}>
      <ThemedText style={[
        styles.quickActionTitle,
        { color: variant === 'primary' ? 'white' : colors.text }
      ]}>
        {title}
      </ThemedText>
      <ThemedText style={[
        styles.quickActionSubtitle,
        { color: variant === 'primary' ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
      ]}>
        {subtitle}
      </ThemedText>
    </View>
    <IconSymbol 
      name="chevron.right" 
      size={16} 
      color={variant === 'primary' ? 'rgba(255,255,255,0.8)' : colors.textSecondary} 
    />
  </TouchableOpacity>
);

export default function AddFoodScreen() {
  const { searchFood, addFoodEntry, fetchRecentFoods, getFoodDetails } = useFood();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [recentFoods, setRecentFoods] = useState<RecentFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('g');
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Use refs to store the latest values without causing re-renders
  const getFoodDetailsRef = useRef(getFoodDetails);
  const fetchRecentFoodsRef = useRef(fetchRecentFoods);
  
  // Update refs when dependencies change
  useEffect(() => {
    getFoodDetailsRef.current = getFoodDetails;
  }, [getFoodDetails]);

  useEffect(() => {
    fetchRecentFoodsRef.current = fetchRecentFoods;
  }, [fetchRecentFoods]);

  // Stable version of handleScannedBarcode
  const handleScannedBarcode = useCallback(async (barcode: string) => {
    setLoading(true);
    const productDetails = await getFoodDetailsRef.current(barcode);
    if (productDetails) {
      setSelectedProduct({
        id: barcode,
        product_name: productDetails.product_name,
        brands: productDetails.brands,
        image_small_url: productDetails.image_small_url,
      });
      setQuantity(productDetails.serving_size?.match(/\d+/)?.[0] || '100');
    } else {
      Alert.alert('Not Found', 'Product not found for this barcode.');
    }
    setLoading(false);
  }, []); // No dependencies needed since we use refs

  // Stable version of loadRecentFoods
  const loadRecentFoods = useCallback(async () => {
    const recents = await fetchRecentFoodsRef.current();
    setRecentFoods(recents);
  }, []); // No dependencies needed since we use refs

  useFocusEffect(
    useCallback(() => {
      // Reset state when the component is focused
      setSelectedProduct(null);
      setQuantity('100');
      setUnit('g');
      setSearchQuery('');
      setSearchResults([]);

      if (params.barcode) {
        handleScannedBarcode(params.barcode as string);
      }
      loadRecentFoods();

      return () => {
        // Cleanup function if needed when the screen loses focus
        // For now, no specific cleanup is required for these states
      };
    }, [params.barcode, handleScannedBarcode, loadRecentFoods]) // Only params.barcode changes, functions are stable
  );

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
  }, [searchQuery, searchFood]);

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
        unit,
        params.mealType as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'
      );
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        router.push('/(tabs)/food-log');
      }, 1500); // Show success message for 1.5 seconds
    } catch (error) {
      console.error('Failed to add food:', error);
      Alert.alert('Error', 'Failed to add food entry. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleSelectRecent = (item: RecentFood) => {
    setSelectedProduct({
      id: item.product_id,
      product_name: item.product_name,
      brands: '',
      image_small_url: '',
    });
    setQuantity(String(item.quantity));
    setUnit(item.unit);
  };

  const renderEmptySearch = () => {
    if (searchQuery.length > 0) {
      return (
        <View style={styles.emptyState}>
          <View style={[styles.emptyStateIcon, { backgroundColor: `${colors.accent}10` }]}>
            <IconSymbol name="magnifyingglass" size={32} color={colors.accent} />
          </View>
          <ThemedText style={[styles.emptyStateTitle, { color: colors.text }]}>No results found</ThemedText>
          <ThemedText style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            Try searching with different keywords or scan a barcode
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.homeContent}>
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Quick Add</ThemedText>
          <View style={styles.quickActions}>
            <QuickActionButton
              icon="camera"
              title="Scan Barcode"
              subtitle="Quick product lookup"
              onPress={() => router.push('/(tabs)/barcode-scanner')}
              colors={colors}
              variant="primary"
            />
            <QuickActionButton
              icon="pencil"
              title="Add Manually"
              subtitle="Enter nutrition info"
              onPress={() => router.push('/manual-food-entry')}
              colors={colors}
            />
          </View>
        </View>

        {/* Recent Foods */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Recently Added</ThemedText>
            {recentFoods.length > 0 && (
              <TouchableOpacity activeOpacity={0.7}>
                <ThemedText style={[styles.sectionAction, { color: colors.accent }]}>See all</ThemedText>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={recentFoods}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RecentFoodItem item={item} onSelect={handleSelectRecent} colors={colors} />
            )}
            scrollEnabled={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyRecentState}>
                <View style={[styles.emptyStateIcon, { backgroundColor: `${colors.accent}10` }]}>
                  <IconSymbol name="clock" size={32} color={colors.accent} />
                </View>
                <ThemedText style={[styles.emptyStateTitle, { color: colors.text }]}>No Recent Foods</ThemedText>
                <ThemedText style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  Your recently added foods will appear here
                </ThemedText>
              </View>
            )}
          />
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: 'transparent' }]}>
        <View style={styles.headerTop}>
          
          <View style={styles.headerCenter}>
            <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
              Add Food
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
              {params.mealType || 'Search and log your food'}
            </ThemedText>
          </View>
          <View style={{ width: 44 }} />
        </View>
      </View>

      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: 'transparent' }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
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
              activeOpacity={0.7}
            >
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
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
            searchResults.length === 0 && styles.resultsListEmpty,
          ]}
          ListEmptyComponent={!loading ? renderEmptySearch : null}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Selected Product Panel */}
      {selectedProduct && (
        <View style={[styles.selectedProductContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.selectedProductHeader}>
            <View style={styles.selectedProductInfo}>
              <ThemedText style={[styles.selectedProductName, { color: colors.text }]}>
                {selectedProduct.product_name}
              </ThemedText>
              {selectedProduct.brands && (
                <ThemedText style={[styles.selectedProductBrand, { color: colors.textSecondary }]}>
                  {selectedProduct.brands}
                </ThemedText>
              )}
            </View>
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: `${colors.text}10` }]} 
              onPress={() => setSelectedProduct(null)}
              activeOpacity={0.7}
            >
              <IconSymbol name="xmark" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
          
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
              <ActivityIndicator color="white" size="small" />
            ) : showSuccessMessage ? (
              <>
                <IconSymbol name="checkmark" size={20} color="white" />
                <ThemedText style={styles.addButtonText}>Food Added!</ThemedText>
              </>
            ) : (
              <>
                <IconSymbol name="plus" size={20} color="white" />
                <ThemedText style={styles.addButtonText}>Log Food</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  resultsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsListContent: {
    paddingBottom: 100,
  },
  resultsListEmpty: {
    flexGrow: 1,
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
    padding: 20,
  },
  productInfo: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 24,
  },
  productBrand: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  checkmarkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  homeContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quickActionsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  quickActions: {
    gap: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  recentSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionAction: {
    fontSize: 15,
    fontWeight: '600',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  recentItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  recentItemDetails: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyRecentState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  selectedProductContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    margin: 20,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  selectedProductHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  selectedProductInfo: {
    flex: 1,
    marginRight: 16,
  },
  selectedProductName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 24,
  },
  selectedProductBrand: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputSection: {
    marginBottom: 24,
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
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
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
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
  },
});