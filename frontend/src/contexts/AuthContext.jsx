import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, CustomerService, VehicleOwnerService, DriverService } from '../Services';

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
      return await CustomerService.registerCustomer(userData);
    } catch (error) {
      throw error;
    }
  };

  const registerVehicleOwner = async (userData) => {
    try {
      return await VehicleOwnerService.registerVehicleOwner(userData);
    } catch (error) {
      throw error;
    }
  };

  const registerDriver = async (userData) => {
    try {
      return await DriverService.registerDriver(userData);
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = () => {
    // Refresh user data from localStorage
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      console.log('AuthContext - User data refreshed from localStorage');
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshUser,
    registerClient,
    registerVehicleOwner,
    registerDriver,

    // Session management functions
    getCurrentUserId: () => AuthService.getCurrentUserId(),
    getSessionData: () => AuthService.getSessionData(),
    getSessionId: () => AuthService.getSessionId(),

    // Navigation and role functions
    getDashboardRoute: AuthService.getDashboardRoute,
    hasRole: AuthService.hasRole,
    isAdminOrBusinessOwner: AuthService.isAdminOrBusinessOwner,

    // Utility functions
    clearCorruptedData: () => AuthService.clearCorruptedData()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
