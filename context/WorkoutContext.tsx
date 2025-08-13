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

export interface WorkoutSession {
  routine: Routine | null;
  time: number;
  exercises: Exercise[];
}

interface WorkoutContextType {
  activeRoutine: Routine | null;
  workoutTime: number;
  isWorkoutActivelyLogging: boolean;
  isWorkoutPaused: boolean;
  loggedExercises: Exercise[];
  lastCompletedWorkout: WorkoutSession | null; // New state for completed workout
  startWorkout: (routine: Routine) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  discardWorkout: () => void;
  saveWorkout: () => void;
  updateLoggedExercises: (exercises: Exercise[]) => void;
  updateWorkoutTime: (time: number) => void;
  clearLastCompletedWorkout: () => void; // New function to clear it
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [isWorkoutActivelyLogging, setIsWorkoutActivelyLogging] = useState(false);
  const [isWorkoutPaused, setIsWorkoutPaused] = useState(false);
  const [loggedExercises, setLoggedExercises] = useState<Exercise[]>([]);
  const [lastCompletedWorkout, setLastCompletedWorkout] = useState<WorkoutSession | null>(null); // Initialize new state

  const intervalRef = useRef<NodeJS.Timeout | number | null>(null); // Updated type

  useEffect(() => {
    if (isWorkoutActivelyLogging) {
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
  }, [isWorkoutActivelyLogging]);

  const startWorkout = (options: { routine?: Routine, exercises?: Exercise[] }) => {
    const { routine, exercises } = options;

    if (routine) {
      setActiveRoutine(routine);
      setLoggedExercises(routine.exercises.map(ex => ({
        ...ex,
        loggedSets: ex.sets.map(set => ({ ...set, loggedWeight: '', loggedReps: '', completed: false })),
        images: ex.images || [],
      })));
    } else if (exercises) {
      setActiveRoutine({ name: 'Custom Workout', exercises: [] }); // Create a dummy routine
      setLoggedExercises(exercises.map(ex => ({
        ...ex,
        loggedSets: [{ weight: '', reps: '', loggedWeight: '', loggedReps: '', completed: false, id: `${Date.now()}-${Math.random()}` }],
        images: ex.images || [],
      })));
    } else {
      // Handle error or default to empty workout
      console.error("startWorkout called without routine or exercises.");
      return;
    }

    setWorkoutTime(0);
    setIsWorkoutActivelyLogging(true);
    setIsWorkoutPaused(false);
    setLastCompletedWorkout(null);
  };

  const pauseWorkout = () => {
    setIsWorkoutActivelyLogging(false);
    setIsWorkoutPaused(true);
  };

  const resumeWorkout = () => {
    setIsWorkoutActivelyLogging(true);
    setIsWorkoutPaused(false);
  };

  const discardWorkout = () => {
    setActiveRoutine(null);
    setWorkoutTime(0);
    setIsWorkoutActivelyLogging(false);
    setIsWorkoutPaused(false);
    setLoggedExercises([]);
    setLastCompletedWorkout(null); // Also clear last completed workout on discard
  };

  const saveWorkout = () => {
    // Save the current workout state to lastCompletedWorkout instead of discarding
    setLastCompletedWorkout({
      routine: activeRoutine,
      time: workoutTime,
      exercises: loggedExercises,
    });
    // Optionally, you might still want to clear the active workout state here
    // if the user is truly "done" with it and won't be editing it further
    // For now, we'll leave the active state as is, so log-workout can pick it up
    // discardWorkout(); // Removed this line
  };

  const updateLoggedExercises = (exercises: Exercise[]) => {
    setLoggedExercises(exercises);
  };

  const updateWorkoutTime = (time: number) => {
    setWorkoutTime(time);
  };

  const clearLastCompletedWorkout = () => {
    setLastCompletedWorkout(null);
  };

  const loadWorkout = (workoutSession: WorkoutSession) => {
    setActiveRoutine(workoutSession.routine);
    setWorkoutTime(workoutSession.time);
    setIsWorkoutActivelyLogging(true);
    setIsWorkoutPaused(false);
    setLoggedExercises(workoutSession.exercises);
  };

  return (
    <WorkoutContext.Provider
      value={{
        activeRoutine,
        workoutTime,
        isWorkoutActivelyLogging,
        isWorkoutPaused,
        loggedExercises,
        lastCompletedWorkout,
        startWorkout,
        pauseWorkout,
        resumeWorkout,
        discardWorkout,
        saveWorkout,
        updateLoggedExercises,
        updateWorkoutTime,
        clearLastCompletedWorkout,
        loadWorkout,
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
