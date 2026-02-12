import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { auth } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in.
          // Get the backend user profile using the token
          // We can call authService.getCurrentUser() or hit the API directly
          // But authService.getCurrentUser relies on auth.currentUser which is now set.
          
          // However, to be safe and ensure backend sync:
          const idToken = await firebaseUser.getIdToken();
          
          // We assume api.js interceptor will pick up the token now that auth.currentUser is set
          // But strictly speaking, we might want to pass the token explicitly if api.js is race-condition prone.
          // Let's rely on authService which uses api.js
          
          const backendUser = await authService.getCurrentUser();
          setUser(backendUser);
        } else {
          // User is signed out.
          setUser(null);
        }
      } catch (error) {
        console.error("Session restore failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const { user } = await authService.login(email, password);
      setUser(user);
      return user;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
