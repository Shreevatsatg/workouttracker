import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@/utils/supabase';

export interface Set {
  weight: string;
  reps: string;
  loggedWeight?: string;
  loggedReps?: string;
  completed: boolean;
  id?: string; // Add id property for consistency
}

export interface Exercise {
  name: string;
  sets: Set[];
  loggedSets: Set[];
  restTime?: number; // in seconds, 0 means "off"
  images?: string[];
  id?: string; // Add id property for consistency
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
  startWorkout: (options: { routine?: Routine, exercises?: Exercise[] }) => void;
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
        setWorkoutTime((prevTime) => {
          const newTime = prevTime + 1;
          return newTime;
        });
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
      setLoggedExercises(routine.exercises.map((ex, exIndex) => ({
        ...ex,
        loggedSets: ex.sets.map((set, index) => ({ 
          ...set, 
          loggedWeight: '', 
          loggedReps: '', 
          completed: false,
          id: set.id || `${Date.now()}-${ex.id || exIndex}-${index}-${Math.random()}`
        })),
        images: ex.images || [],
      })));
    } else if (exercises) {
      setActiveRoutine({ name: 'Custom Workout', exercises: [] }); // Create a dummy routine
      setLoggedExercises(exercises.map(ex => ({
        ...ex,
        loggedSets: ex.loggedSets || [{ weight: '', reps: '', loggedWeight: '', loggedReps: '', completed: false, id: `${Date.now()}-${Math.random()}` }],
        images: ex.images || [],
      })));
    } else {
      // Handle error or default to empty workout
      return;
    }

    setWorkoutTime(0);
    setIsWorkoutActivelyLogging(true);
    setIsWorkoutPaused(false);
    setLastCompletedWorkout(null);
  };

  const pauseWorkout = () => {
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

  const saveWorkout = async () => {
    if (!activeRoutine || loggedExercises.length === 0) {
      console.warn("No active workout or exercises to save.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not authenticated. Cannot save workout.");
      return;
    }

    try {
      // 1. Insert into workout_sessions
      const { data: workoutSessionData, error: workoutSessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          routine_id: (typeof activeRoutine.id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(activeRoutine.id)) ? activeRoutine.id : null, // Ensure routine_id is a valid UUID or null
          routine_name: activeRoutine.name,
          started_at: new Date(), // Or use a stored start time if available
          ended_at: new Date(), // Or use a stored end time if available
          duration: workoutTime,
          completed_at: new Date(),
          notes: '', // Add notes if you have them
        })
        .select();

      if (workoutSessionError) throw workoutSessionError;
      const workoutSessionId = workoutSessionData[0].id;

      // 2. Insert into session_exercises
      for (const exercise of loggedExercises) {
        const { data: sessionExerciseData, error: sessionExerciseError } = await supabase
          .from('session_exercises')
          .insert({
            session_id: workoutSessionId,
            exercise_name: exercise.name,
            order: loggedExercises.indexOf(exercise), // Simple order
          })
          .select();

        if (sessionExerciseError) throw sessionExerciseError;
        const sessionExerciseId = sessionExerciseData[0].id;

        // 3. Insert into session_sets
        for (const set of exercise.loggedSets) {
          if (set.completed) { // Only save completed sets
            const { error: sessionSetError } = await supabase
              .from('session_sets')
              .insert({
                session_id: workoutSessionId, // Link to workout session
                session_exercise_id: sessionExerciseId,
                weight: set.loggedWeight || set.weight,
                reps: set.loggedReps || set.reps,
                order: exercise.loggedSets.indexOf(set),
                completed_at: new Date(),
              });

            if (sessionSetError) throw sessionSetError;
          }
        }
      }

      console.log("Workout saved successfully!");
      // After successful save, discard the active workout state
      discardWorkout();
    } catch (error) {
      console.error("Error saving workout:", error);
      // Optionally, set an error state or show a toast message
    }
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
