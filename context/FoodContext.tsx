import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
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
}

interface FoodContextType {
  foodEntries: FoodEntry[];
  addFoodEntry: (product_id: string, product_name: string, quantity: number, unit: string) => Promise<void>;
  fetchFoodEntries: () => Promise<void>;
  // Placeholder for Open Food Facts API interaction
  searchFood: (query: string) => Promise<any[]>;
  getFoodDetails: (productId: string) => Promise<any>;
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

export const FoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);

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

  const addFoodEntry = async (product_id: string, product_name: string, quantity: number, unit: string) => {
    const { data: { user } } = await supabase.auth.getUser();

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
      });

    if (error) {
      console.error('Error adding food entry:', error);
      Alert.alert('Error', 'Could not add food entry.');
    } else {
      fetchFoodEntries(); // Refresh list after adding
      Alert.alert('Success', 'Food entry added!');
    }
  };

  // Placeholder for Open Food Facts API search
  const searchFood = async (query: string) => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1`);
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Error searching food:', error);
      Alert.alert('Error', 'Could not search food.');
      return [];
    }
  };

  // Placeholder for Open Food Facts API details
  const getFoodDetails = async (productId: string) => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${productId}.json`);
      const data = await response.json();
      if (data.status === 1 && data.product) {
        const product = data.product;
        const nutrients = product.nutriments || {};

        // Extract macros per 100g/ml
        const protein_100g = parseFloat(nutrients.proteins_100g || '0');
        const carbohydrates_100g = parseFloat(nutrients.carbohydrates_100g || '0');
        const fat_100g = parseFloat(nutrients.fat_100g || '0');

        return {
          product_name: product.product_name || product.generic_name || 'Unknown Product',
          brands: product.brands || '',
          image_small_url: product.image_small_url || '',
          nutriments: {
            proteins_100g,
            carbohydrates_100g,
            fat_100g,
          },
          serving_size: product.serving_size || '100g', // Default or actual serving size
        };
      } else {
        console.warn('Product not found or data incomplete:', productId);
        return null;
      }
    } catch (error) {
      console.error('Error fetching food details:', error);
      Alert.alert('Error', 'Could not fetch food details.');
      return null;
    }
  };

  const calculateDailyMacros = async () => {
    let totalProteins = 0;
    let totalCarbohydrates = 0;
    let totalFats = 0;

    // Filter entries for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const entry of foodEntries) {
      const entryDate = new Date(entry.logged_at);
      entryDate.setHours(0, 0, 0, 0);

      if (entryDate.getTime() === today.getTime()) {
        const productDetails = await getFoodDetails(entry.product_id);
        if (productDetails && productDetails.nutriments) {
          const { proteins_100g, carbohydrates_100g, fat_100g } = productDetails.nutriments;

          // Assuming quantity is in grams for simplicity for now, need to handle units properly
          // For now, let's assume 'g' or 'ml' and scale based on 100g/ml data
          const scaleFactor = entry.quantity / 100; 

          totalProteins += proteins_100g * scaleFactor;
          totalCarbohydrates += carbohydrates_100g * scaleFactor;
          totalFats += fat_100g * scaleFactor;
        }
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
