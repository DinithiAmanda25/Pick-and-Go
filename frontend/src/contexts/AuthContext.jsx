import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../Services/Auth-service';
import customerService from '../Services/customer-service';
import vehicleOwnerService from '../Services/VehicleOwner-service';
import driverService from '../Services/Driver-service';

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
    const currentUser = authService.getCurrentUser();
    const authStatus = authService.isAuthenticated();

    if (currentUser && authStatus) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);

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
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const registerClient = async (userData) => {
    try {
      return await customerService.registerCustomer(userData);
    } catch (error) {
      throw error;
    }
  };

  const registerVehicleOwner = async (userData) => {
    try {
      return await vehicleOwnerService.registerVehicleOwner(userData);
    } catch (error) {
      throw error;
    }
  };

  const registerDriver = async (userData) => {
    try {
      return await driverService.registerDriver(userData);
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = () => {
    // Refresh user data from localStorage
    const currentUser = authService.getCurrentUser();
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
    getCurrentUserId: () => authService.getCurrentUserId(),
    getSessionData: () => authService.getSessionData(),
    getSessionId: () => authService.getSessionId(),

    // Navigation and role functions
    getDashboardRoute: authService.getDashboardRoute,
    hasRole: authService.hasRole,
    isAdminOrBusinessOwner: authService.isAdminOrBusinessOwner,

    // Utility functions
    clearCorruptedData: () => authService.clearCorruptedData()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
