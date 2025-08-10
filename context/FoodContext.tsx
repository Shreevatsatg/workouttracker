import { supabase } from '@/utils/supabase';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface FoodEntry {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  logged_at: string;
  created_at: string;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
}

interface ProductDetails {
  product_name: string;
  brands: string;
  image_small_url: string;
  nutriments: {
    proteins_100g: number;
    carbohydrates_100g: number;
    fat_100g: number;
  };
  serving_size: string;
}

interface FoodContextType {
  foodEntries: FoodEntry[];
  addFoodEntry: (
    product_id: string,
    product_name: string,
    quantity: number,
    unit: string,
    meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'
  ) => Promise<void>;
  fetchFoodEntries: () => Promise<void>;
  searchFood: (query: string) => Promise<any[]>;
  getFoodDetails: (productId: string) => Promise<ProductDetails | null>;
  calculateDailyMacros: () => Promise<{ proteins: number; carbohydrates: number; fats: number; }>;
  fetchRecentFoods: () => Promise<FoodEntry[]>;
  searchByBarcode: (barcode: string) => Promise<ProductDetails | null>;
  addManualFood: (foodData: Omit<ProductDetails, 'image_small_url'>) => Promise<void>;
  updateFoodEntryMealType: (entryId: string, meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks') => Promise<void>;
  deleteFoodEntry: (entryId: string) => Promise<void>;
  updateFoodEntry: (entryId: string, updates: Partial<FoodEntry>) => Promise<void>;
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

export const FoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [productDetailsCache, setProductDetailsCache] = useState<Record<string, ProductDetails>>({});

  const fetchFoodEntries = async () => {
    const { data, error } = await supabase
      .from('food_entries')
      .select('*')
      .order('logged_at', { ascending: false });

    if (error) {
      console.error('Error fetching food entries:', error);
      Alert.alert('Error', 'Could not fetch food entries.');
    } else {
      setFoodEntries(data || []);
    }
  };

  const addFoodEntry = async (
    product_id: string,
    product_name: string,
    quantity: number,
    unit: string,
    meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    const { error } = await supabase
      .from('food_entries')
      .insert({
        user_id: user.id,
        product_id,
        product_name,
        quantity,
        unit,
        logged_at: new Date().toISOString(),
        meal_type,
      });

    if (error) {
      console.error('Error adding food entry:', error);
      Alert.alert('Error', 'Could not add food entry.');
    } else {
      fetchFoodEntries(); // Refresh list after adding
      // Removed Alert.alert('Success', 'Food entry added!'); as per user request
    }
  };

  const searchFood = async (query: string) => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1`);
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Error searching food:', error);
      Alert.alert('Error', 'Could not search for food.');
      return [];
    }
  };

  const fetchRecentFoods = async () => {
    const { data, error } = await supabase
      .from('food_entries')
      .select('*')
      .order('logged_at', { ascending: false })
      .limit(100); // Fetch more entries to ensure enough unique items

    if (error) {
      console.error('Error fetching recent foods:', error);
      Alert.alert('Error', 'Could not fetch recent foods.');
      return [];
    }

    if (!data) {
      return [];
    }

    // Deduplicate by product_id, keeping the most recent entry
    const uniqueFoodsMap = new Map<string, FoodEntry>();
    for (const entry of data) {
      if (!uniqueFoodsMap.has(entry.product_id) || new Date(entry.logged_at) > new Date(uniqueFoodsMap.get(entry.product_id)!.logged_at)) {
        uniqueFoodsMap.set(entry.product_id, entry);
      }
    }

    // Convert map values back to an array and sort by logged_at
    const uniqueFoods = Array.from(uniqueFoodsMap.values()).sort((a, b) =>
      new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
    );

    return uniqueFoods.slice(0, 10); // Return top 10 unique recent foods
  };

  const searchByBarcode = async (barcode: string) => {
    if (productDetailsCache[barcode]) {
      return productDetailsCache[barcode];
    }
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      if (data.status === 1 && data.product) {
        const product = data.product;
        const nutrients = product.nutriments || {};

        const details: ProductDetails = {
          product_name: product.product_name || product.generic_name || 'Unknown Product',
          brands: product.brands || '',
          image_small_url: product.image_small_url || '',
          nutriments: {
            proteins_100g: nutrients.proteins_100g ? parseFloat(nutrients.proteins_100g) : 0,
            carbohydrates_100g: nutrients.carbohydrates_100g ? parseFloat(nutrients.carbohydrates_100g) : 0,
            fat_100g: nutrients.fat_100g ? parseFloat(nutrients.fat_100g) : 0,
          },
          serving_size: product.serving_size || '100g',
        };
        setProductDetailsCache(prev => ({ ...prev, [barcode]: details }));
        return details;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error searching by barcode:', error);
      Alert.alert('Error', 'Could not search by barcode.');
      return null;
    }
  };

  const updateFoodEntryMealType = async (
    entryId: string,
    meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'
  ) => {
    const { error } = await supabase.from('food_entries').update({ meal_type }).eq('id', entryId);
    if (error) {
      console.error('Error updating meal type:', error);
      Alert.alert('Error', 'Could not update meal type.');
    } else {
      fetchFoodEntries();
    }
  };

  const deleteFoodEntry = async (entryId: string) => {
    const { error } = await supabase.from('food_entries').delete().eq('id', entryId);
    if (error) {
      console.error('Error deleting food entry:', error);
      Alert.alert('Error', 'Could not delete food entry.');
    } else {
      fetchFoodEntries();
    }
  };

  const updateFoodEntry = async (entryId: string, updates: Partial<FoodEntry>) => {
    const { error } = await supabase.from('food_entries').update(updates).eq('id', entryId);
    if (error) {
      console.error('Error updating food entry:', error);
      Alert.alert('Error', 'Could not update food entry.');
    } else {
      fetchFoodEntries();
    }
  };

  const addManualFood = async (foodData: Omit<ProductDetails, 'image_small_url'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    const { error } = await supabase.from('manual_food_entries').insert({
      user_id: user.id,
      ...foodData,
    });

    if (error) {
      console.error('Error adding manual food entry:', JSON.stringify(error, null, 2));
      Alert.alert('Error', 'Could not add manual food entry.');
    } else {
      Alert.alert('Success', 'Food item submitted for review!');
    }
  };

  const getFoodDetails = useCallback(async (productId: string): Promise<ProductDetails | null> => {
    if (productDetailsCache[productId]) {
      return productDetailsCache[productId];
    }
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${productId}.json`);
      const data = await response.json();
      if (data.status === 1 && data.product) {
        const product = data.product;
        const nutrients = product.nutriments || {};

        const details: ProductDetails = {
          product_name: product.product_name || product.generic_name || 'Unknown Product',
          brands: product.brands || '',
          image_small_url: product.image_small_url || '',
          nutriments: {
            proteins_100g: nutrients.proteins_100g ? parseFloat(nutrients.proteins_100g) : 0,
            carbohydrates_100g: nutrients.carbohydrates_100g ? parseFloat(nutrients.carbohydrates_100g) : 0,
            fat_100g: nutrients.fat_100g ? parseFloat(nutrients.fat_100g) : 0,
          },
          serving_size: product.serving_size || '100g',
        };
        setProductDetailsCache(prev => ({ ...prev, [productId]: details }));
        return details;
      } else {
        console.warn('Product not found or data incomplete:', productId);
        return null;
      }
    } catch (error) {
      console.error('Error fetching food details:', error);
      Alert.alert('Error', 'Could not fetch food details.');
      return null;
    }
  }, [productDetailsCache]);

  const calculateDailyMacros = async () => {
    let totalProteins = 0;
    let totalCarbohydrates = 0;
    let totalFats = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysEntries = foodEntries.filter(entry => {
      const entryDate = new Date(entry.logged_at);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    for (const entry of todaysEntries) {
      const productDetails = await getFoodDetails(entry.product_id);
      if (productDetails && productDetails.nutriments) {
        const {
          proteins_100g = 0,
          carbohydrates_100g = 0,
          fat_100g = 0,
        } = productDetails.nutriments;

        const scaleFactor = entry.quantity / 100;
        totalProteins += proteins_100g * scaleFactor;
        totalCarbohydrates += carbohydrates_100g * scaleFactor;
        totalFats += fat_100g * scaleFactor;
      }
    }
    return { proteins: totalProteins, carbohydrates: totalCarbohydrates, fats: totalFats };
  };

  useEffect(() => {
    fetchFoodEntries();
  }, []);

  return (
    <FoodContext.Provider value={{
      foodEntries,
      addFoodEntry,
      fetchFoodEntries,
      searchFood,
      getFoodDetails,
      calculateDailyMacros,
      fetchRecentFoods,
      searchByBarcode,
      addManualFood,
      updateFoodEntryMealType,
      deleteFoodEntry,
      updateFoodEntry,
    }}>
      {children}
    </FoodContext.Provider>
  );
};

export const useFood = () => {
  const context = useContext(FoodContext);
  if (context === undefined) {
    throw new Error('useFood must be used within a FoodProvider');
  }
  return context;
};
