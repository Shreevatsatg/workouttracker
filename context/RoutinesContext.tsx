import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface Set {
  weight: string;
  reps: string;
  loggedWeight?: string;
  loggedReps?: string;
  completed: boolean;
}

export interface Exercise {
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
        if (!itemToDelete) return prevItems;

        if (itemToDelete.type === 'folder') {
            const folder = itemToDelete as Folder;
            const routinesToMove = folder.routines.map(r => ({ ...r, folderId: undefined }));
            const newItems = prevItems.filter(item => item.id !== id);
            return [...newItems, ...routinesToMove];
        } else {
            const newItems = prevItems.filter(item => item.id !== id);
            return newItems.map(item => {
                if (item.type === 'folder') {
                    const updatedRoutines = item.routines.filter(r => r.id !== id);
                    return { ...item, routines: updatedRoutines };
                }
                return item;
            });
        }
    });
};

  const moveRoutineToFolder = (routineId: string, folderId: string) => {
    setItems(prevItems => {
      let routineToMove: Routine | undefined;
      const newItems = prevItems.map(item => {
        if (item.id === routineId && item.type === 'routine') {
          routineToMove = item;
          return null; 
        }
        if (item.type === 'folder') {
          const updatedRoutines = item.routines.filter(r => {
            if (r.id === routineId) {
              routineToMove = r;
              return false;
            }
            return true;
          });
          return { ...item, routines: updatedRoutines };
        }
        return item;
      }).filter(Boolean) as Item[];

      if (!routineToMove) return prevItems;

      if (folderId === 'root') {
        delete routineToMove.folderId;
        return [...newItems, routineToMove];
      } else {
        return newItems.map(item => {
          if (item.id === folderId && item.type === 'folder') {
            return { ...item, routines: [...item.routines, { ...routineToMove!, folderId }] };
          }
          return item;
        });
      }
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
