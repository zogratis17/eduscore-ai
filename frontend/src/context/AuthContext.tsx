import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for simulation
const mockUsers: Record<string, User> = {
  'student@eduscore.ai': {
    id: '1',
    name: 'Alex Johnson',
    email: 'student@eduscore.ai',
    role: 'student',
  },
  'teacher@eduscore.ai': {
    id: '2',
    name: 'Dr. Sarah Williams',
    email: 'teacher@eduscore.ai',
    role: 'teacher',
  },
  'admin@eduscore.ai': {
    id: '3',
    name: 'Admin User',
    email: 'admin@eduscore.ai',
    role: 'admin',
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem('eduscore_user');
    const token = localStorage.getItem('eduscore_token');
    const expiry = localStorage.getItem('eduscore_token_expiry');

    if (storedUser && token && expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() < expiryTime) {
        setUser(JSON.parse(storedUser));
      } else {
        // Token expired, clear storage
        localStorage.removeItem('eduscore_user');
        localStorage.removeItem('eduscore_token');
        localStorage.removeItem('eduscore_token_expiry');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - in real app, this would be an API call
    const mockUser = mockUsers[email] || {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email,
      role,
    };

    // Set user with requested role
    const authenticatedUser = { ...mockUser, role };
    
    // Store in localStorage (simulating JWT)
    const mockToken = `mock_jwt_${Date.now()}`;
    const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    localStorage.setItem('eduscore_user', JSON.stringify(authenticatedUser));
    localStorage.setItem('eduscore_token', mockToken);
    localStorage.setItem('eduscore_token_expiry', expiryTime.toString());
    
    setUser(authenticatedUser);
    setIsLoading(false);
    return true;
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
    };
    
    // Store in localStorage
    const mockToken = `mock_jwt_${Date.now()}`;
    const expiryTime = Date.now() + 24 * 60 * 60 * 1000;
    
    localStorage.setItem('eduscore_user', JSON.stringify(newUser));
    localStorage.setItem('eduscore_token', mockToken);
    localStorage.setItem('eduscore_token_expiry', expiryTime.toString());
    
    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('eduscore_user');
    localStorage.removeItem('eduscore_token');
    localStorage.removeItem('eduscore_token_expiry');
    setUser(null);
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
