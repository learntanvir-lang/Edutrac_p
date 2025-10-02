'use client';
    
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth } from '@/firebase';

/**
 * Interface for the return value of the useUser hook.
 */
export interface UseUserResult {
  user: User | null;      // The Firebase User object, or null if not logged in.
  isLoading: boolean;     // True while the auth state is being determined.
  error: Error | null;    // Any error that occurred during auth state observation.
}

/**
 * React hook to get the current authenticated user from Firebase.
 *
 * This hook subscribes to Firebase's authentication state changes. It provides
 * the user object, a loading state, and any potential error.
 *
 * @returns {UseUserResult} An object containing the user, loading state, and error.
 */
export function useUser(): UseUserResult {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Set initial state based on auth, if available synchronously
    setUser(auth.currentUser);
    setIsLoading(!auth.currentUser);

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: User | null) => {
        setUser(firebaseUser);
        setIsLoading(false);
      },
      (error: Error) => {
        console.error("useUser - onAuthStateChanged error:", error);
        setError(error);
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]); // Rerun effect if the auth instance changes

  return { user, isLoading, error };
}
