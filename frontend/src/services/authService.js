import { auth, signInWithEmailAndPassword, signOut } from './firebase';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

class AuthService {
  async login(email, password) {
    if (USE_MOCK_AUTH) {
      console.log("MOCK AUTH: Logging in as mock user...");
      const mockToken = "mock-token";
      
      // Register/sync user with backend using the mock token
      try {
        const response = await axios.post(
          `${API_URL}/auth/register`,
          {},
          {
            headers: {
              Authorization: `Bearer ${mockToken}`
            }
          }
        );
        
        return {
          user: response.data,
          token: mockToken
        };
      } catch (e) {
        console.error("Mock registration failed", e);
        throw e;
      }
    }

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get Firebase ID token
      const idToken = await user.getIdToken();
      
      // Register/sync user with backend
      const response = await axios.post(
        `${API_URL}/auth/register`,
        {},
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      );
      
      return {
        user: response.data,
        token: idToken
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
  
  async logout() {
    if (USE_MOCK_AUTH) {
        localStorage.removeItem('token');
        return;
    }
    try {
      await signOut(auth);
      localStorage.removeItem('token');
    } catch (error) {
      throw new Error(error.message);
    }
  }
  
  async getCurrentUser() {
    if (USE_MOCK_AUTH) {
       // If we have a token in storage, assume logged in
       // In a real app we'd verify it, but for mock we just hit /me
       const token = localStorage.getItem('authToken'); // Note: app needs to store this
       if(!token) return null;
       
       try {
         const response = await axios.get(
            `${API_URL}/auth/me`,
            {
                headers: {
                Authorization: `Bearer ${token}`
                }
            }
         );
         return response.data;
       } catch (e) {
         return null; 
       }
    }

    const user = auth.currentUser;
    if (!user) return null;
    
    const idToken = await user.getIdToken();
    const response = await axios.get(
      `${API_URL}/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      }
    );
    
    return response.data;
  }
  
  async refreshToken() {
    if (USE_MOCK_AUTH) return "mock-token";
    
    const user = auth.currentUser;
    if (!user) return null;
    
    return await user.getIdToken(true); // Force refresh
  }
}

export default new AuthService();