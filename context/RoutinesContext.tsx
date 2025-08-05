import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Set {
  weight: string;
  reps: string;
}

interface Exercise {
  name: string;
  sets: Set[];
}

export interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
  type: 'routine';
  folderId?: string; // Optional folder ID
}

export interface Folder {
  id: string;
  name: string;
  routines: Routine[];
  type: 'folder';
}

export type Item = Routine | Folder;

interface RoutinesContextType {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  createFolder: (name: string) => void;
  deleteItem: (id: string) => void;
  moveRoutineToFolder: (routineId: string, folderId: string) => void;
}

const RoutinesContext = createContext<RoutinesContextType | undefined>(undefined);

export const RoutinesProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Item[]>([]);

  const saveItems = async (newItems: Item[]) => {
    try {
      const jsonValue = JSON.stringify(newItems);
      await AsyncStorage.setItem('@workout_items', jsonValue);
    } catch (e) {
      console.error("Failed to save items to storage", e);
    }
  };

  const loadItems = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@workout_items');
      if (jsonValue != null) {
        setItems(JSON.parse(jsonValue));
      }
    } catch(e) {
      console.error("Failed to load items from storage", e);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (items.length > 0) { 
        saveItems(items);
    }
  }, [items]);

  const createFolder = (name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      routines: [],
      type: 'folder',
    };
    setItems(prevItems => [newFolder, ...prevItems]);
  };

  const deleteItem = (id: string) => {
    setItems(prevItems => {
      const itemToDelete = prevItems.find(item => item.id === id);
      if (itemToDelete && itemToDelete.type === 'folder') {
        const folder = itemToDelete as Folder;
        const routinesToMove = folder.routines.map(routine => ({ ...routine, folderId: undefined }));
        const newItems = prevItems.filter(item => item.id !== id);
        return [...newItems, ...routinesToMove];
      } else {
        return prevItems.filter(item => item.id !== id);
      }
    });
  };

  const moveRoutineToFolder = (routineId: string, targetFolderId: string) => {
    setItems(prevItems => {
      const routineToMove = prevItems.find(item => item.id === routineId && item.type === 'routine') as Routine;
      if (!routineToMove) return prevItems; // Routine not found

      // Remove routine from its current location (either root or another folder)
      let updatedItems = prevItems.filter(item => item.id !== routineId); // Remove from root

      updatedItems = updatedItems.map(item => {
        if (item.type === 'folder') {
          // Remove from old folder if it was in one
          if (routineToMove.folderId && item.id === routineToMove.folderId) {
            return { ...item, routines: item.routines.filter(r => r.id !== routineId) };
          }
          // Add to new folder
          if (item.id === targetFolderId) {
            return { ...item, routines: [...item.routines, { ...routineToMove, folderId: targetFolderId }] };
          }
        }
        return item;
      });

      // If moving to root, add it back to the main array with folderId undefined
      if (targetFolderId === 'root') {
        return [...updatedItems, { ...routineToMove, folderId: undefined }];
      }

      return updatedItems;
    });
  };

  return (
    <RoutinesContext.Provider value={{ items, setItems, createFolder, deleteItem, moveRoutineToFolder }}>
      {children}
    </RoutinesContext.Provider>
  );
};

export const useRoutines = () => {
  const context = useContext(RoutinesContext);
  if (context === undefined) {
    throw new Error('useRoutines must be used within a RoutinesProvider');
  }
  return context;
};
