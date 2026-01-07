import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Ensure this path is correct

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export type UserRole = 'student' | 'teacher' | 'admin';

// Updated User interface to better match Firebase and backend data
export interface User {
  uid: string;
  name: string | null;
  email: string | null;
  role: UserRole; // Role can be managed in your backend and added to the token or fetched separately
  avatar?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Here you could fetch role from your backend if not in token
        // For simplicity, we'll assign a default role or retrieve it
        const userRole: UserRole = (await firebaseUser.getIdTokenResult())?.claims?.role || 'student';

        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          role: userRole,
          avatar: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. Update Firebase profile with the name
      await updateProfile(firebaseUser, { displayName: name });

      // 3. Get Firebase ID token
      const token = await firebaseUser.getIdToken();

      // 4. Send token to your backend to create user in MongoDB
      const response = await fetch(`${API_URL}/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        // Backend's verify_firebase_token will extract all necessary user info from the token.
        // You can pass additional info like 'role' if needed, but the backend should control this.
        body: JSON.stringify({ role: role }) 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Backend registration failed');
      }

      // onAuthStateChanged will handle setting the local user state
      console.log('User registered successfully and data stored in backend.');
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      setIsLoading(false);
      // TODO: Maybe delete the Firebase user if backend registration fails
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged will set user to null
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
