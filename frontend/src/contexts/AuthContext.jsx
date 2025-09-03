import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../Services/auth-service';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = AuthService.getCurrentUser();
    const authStatus = AuthService.isAuthenticated();
    
    if (currentUser && authStatus) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await AuthService.login(credentials);
      
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const registerClient = async (userData) => {
    try {
      return await AuthService.registerClient(userData);
    } catch (error) {
      throw error;
    }
  };

  const registerVehicleOwner = async (userData) => {
    try {
      return await AuthService.registerVehicleOwner(userData);
    } catch (error) {
      throw error;
    }
  };

  const registerDriver = async (userData) => {
    try {
      return await AuthService.registerDriver(userData);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    registerClient,
    registerVehicleOwner,
    registerDriver,
    getDashboardRoute: AuthService.getDashboardRoute,
    hasRole: AuthService.hasRole,
    isAdminOrBusinessOwner: AuthService.isAdminOrBusinessOwner
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
