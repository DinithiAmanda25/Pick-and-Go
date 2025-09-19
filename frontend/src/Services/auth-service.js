import { HTTP } from './httpCommon-service';

// Universal Authentication Service
// This service handles only universal authentication functions (login, logout, session management)
// Actor-specific functions should be in their respective service files
class AuthService {

  // Universal Login function - works for all actors
  async login(credentials) {
    try {
      // Send only identifier and password - backend will auto-detect role
      const loginData = {
        identifier: credentials.identifier,
        password: credentials.password
      };

      const response = await HTTP.post('/auth/login', loginData);

      if (response.data.success) {
        const userData = response.data.user;

        // Store user data in both localStorage (persistent) and sessionStorage (session-only)
        const sessionData = {
          userId: userData.id, // MongoDB Object ID
          email: userData.email,
          role: userData.role,
          createdAt: userData.createdAt,
          loginTime: new Date().toISOString(),
          dashboardRoute: response.data.dashboardRoute,
          ...userData // Include all role-specific data
        };

        // localStorage for persistent login across browser sessions
        localStorage.setItem('user', JSON.stringify(sessionData));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userId', userData.id);

        // sessionStorage for additional session-specific data
        sessionStorage.setItem('userSession', JSON.stringify({
          userId: userData.id,
          role: userData.role,
          loginTime: sessionData.loginTime,
          sessionId: Date.now().toString(36) + Math.random().toString(36).substr(2),
          dashboardRoute: response.data.dashboardRoute
        }));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }

  // Universal Logout function
  logout() {
    // Clear all stored authentication data
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    sessionStorage.removeItem('userSession');

    console.log('User logged out successfully');
  }

  // Get current authenticated user data
  getCurrentUser() {
    const userData = localStorage.getItem('user');
    if (!userData || userData === 'undefined' || userData === 'null') {
      return null;
    }
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.warn('Invalid user data in localStorage, clearing it:', error);
      localStorage.removeItem('user');
      return null;
    }
  }

  // Get current user ID
  getCurrentUserId() {
    const userData = this.getCurrentUser();
    return userData?.userId || userData?.id || localStorage.getItem('userId');
  }

  // Get session data
  getSessionData() {
    const sessionData = sessionStorage.getItem('userSession');
    if (!sessionData || sessionData === 'undefined' || sessionData === 'null') {
      return null;
    }
    try {
      return JSON.parse(sessionData);
    } catch (error) {
      console.warn('Invalid session data in sessionStorage, clearing it:', error);
      sessionStorage.removeItem('userSession');
      return null;
    }
  }

  // Get session ID
  getSessionId() {
    const sessionData = this.getSessionData();
    return sessionData?.sessionId;
  }

  // Check if user is authenticated
  isAuthenticated() {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    const userData = this.getCurrentUser();
    return isAuth && userData;
  }

  // Get current user role
  getUserRole() {
    const userData = this.getCurrentUser();
    return userData?.role || localStorage.getItem('userRole');
  }

  // Get dashboard route for current user
  getDashboardRoute() {
    const sessionData = this.getSessionData();
    const userData = this.getCurrentUser();
    return sessionData?.dashboardRoute || userData?.dashboardRoute;
  }

  // Check if user has specific role
  hasRole(role) {
    return this.getUserRole() === role;
  }

  // Check if user is admin or business owner
  isAdminOrBusinessOwner() {
    const role = this.getUserRole();
    return role === 'admin' || role === 'business-owner';
  }

  // Update stored user data (useful when profile is updated)
  updateStoredUser(updatedUserData) {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updatedUserData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  }

  // Clear corrupted data (utility function)
  clearCorruptedData() {
    console.log('Clearing potentially corrupted auth data...');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('userSession');
  }
}

export default new AuthService();
