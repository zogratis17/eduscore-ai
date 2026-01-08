import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token/user on mount
    const storedUser = localStorage.getItem('eduscore_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // TODO: Replace with actual API call
    console.log("Logging in with", email, password);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (email) { // Accept any email for now
      const mockUser = {
        id: '1',
        name: 'Prof. Rajesh',
        email: email,
        role: 'educator',
        avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=0D8ABC&color=fff'
      };
      setUser(mockUser);
      localStorage.setItem('eduscore_user', JSON.stringify(mockUser));
      return mockUser;
    }
    throw new Error('Invalid credentials');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eduscore_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
