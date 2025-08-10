import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

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
  loggedSets: Set[];
  restTime?: number; // in seconds, 0 means "off"
  images?: string[];
}

export interface Routine {
  name: string;
  exercises: Exercise[];
}

interface WorkoutContextType {
  activeRoutine: Routine | null;
  workoutTime: number;
  isWorkoutRunning: boolean;
  loggedExercises: Exercise[];
  startWorkout: (routine: Routine) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  discardWorkout: () => void;
  saveWorkout: () => void;
  updateLoggedExercises: (exercises: Exercise[]) => void;
  updateWorkoutTime: (time: number) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [isWorkoutRunning, setIsWorkoutRunning] = useState(false);
  const [loggedExercises, setLoggedExercises] = useState<Exercise[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | number | null>(null); // Updated type

  useEffect(() => {
    if (isWorkoutRunning) {
      intervalRef.current = setInterval(() => {
        setWorkoutTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isWorkoutRunning]);

  const startWorkout = (routine: Routine) => {
    setActiveRoutine(routine);
    setWorkoutTime(0);
    setIsWorkoutRunning(true);
    setLoggedExercises(routine.exercises.map(ex => ({
      ...ex,
      loggedSets: ex.sets.map(set => ({ ...set, loggedWeight: '', loggedReps: '', completed: false })),
      images: ex.images || [], // Ensure images are copied
    })));
  };

  const pauseWorkout = () => {
    setIsWorkoutRunning(false);
  };

  const resumeWorkout = () => {
    setIsWorkoutRunning(true);
  };

  const discardWorkout = () => {
    setActiveRoutine(null);
    setWorkoutTime(0);
    setIsWorkoutRunning(false);
    setLoggedExercises([]);
  };

  const saveWorkout = () => {
    // In a real app, you would save activeRoutine, workoutTime, and loggedExercises to persistent storage
    discardWorkout(); // Clear workout state after saving
  };

  const updateLoggedExercises = (exercises: Exercise[]) => {
    setLoggedExercises(exercises);
  };

  const updateWorkoutTime = (time: number) => {
    setWorkoutTime(time);
  };

  return (
    <WorkoutContext.Provider
      value={{
        activeRoutine,
        workoutTime,
        isWorkoutRunning,
        loggedExercises,
        startWorkout,
        pauseWorkout,
        resumeWorkout,
        discardWorkout,
        saveWorkout,
        updateLoggedExercises,
        updateWorkoutTime,
      }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
