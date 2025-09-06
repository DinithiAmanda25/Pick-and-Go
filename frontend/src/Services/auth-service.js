import { HTTP } from './httpCommon-service';

// Authentication Service
class AuthService {

  // Login function
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

  // Register Client
  async registerClient(userData) {
    try {
      const response = await HTTP.post('/auth/register/client', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }

  // Register Vehicle Owner
  async registerVehicleOwner(userData) {
    try {
      const response = await HTTP.post('/auth/register/vehicle-owner', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }

  // Register Driver (through onboarding)
  async registerDriver(userData) {
    try {
      // For FormData uploads, we need to remove the default Content-Type header
      // to let the browser set the correct multipart/form-data boundary
      const response = await HTTP.post('/auth/register-driver', userData, {
        headers: {
          'Content-Type': undefined  // This removes the default application/json header
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }

  // Get User Profile
  async getProfile(role, userId) {
    try {
      const response = await HTTP.get(`/auth/profile/${role}/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }

  // Approve Driver (Admin function)
  async approveDriver(driverId, status) {
    try {
      const response = await HTTP.put(`/auth/admin/approve-driver/${driverId}`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }

  // Update Business Owner Profile
  async updateBusinessOwnerProfile(userId, profileData) {
    try {
      console.log('Auth service - updating profile for userId:', userId)
      console.log('Auth service - profile data:', profileData)

      const response = await HTTP.put(`/auth/profile/business-owner/${userId}`, profileData);
      console.log('Auth service - response:', response.data)

      if (response.data.success) {
        // Update the stored user data with the fresh data from database
        const updatedProfile = response.data.profile;

        // Update localStorage with the complete updated profile
        localStorage.setItem('user', JSON.stringify(updatedProfile));

        // Also update userId if it exists separately
        if (updatedProfile._id) {
          localStorage.setItem('userId', updatedProfile._id);
        }

        console.log('Auth service - localStorage updated with fresh profile data');
      }

      return response.data;
    } catch (error) {
      console.error('Auth service - error:', error)
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }

  // Logout function
  logout() {
    // Clear all localStorage items
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');

    // Clear all sessionStorage items
    sessionStorage.removeItem('userSession');
    sessionStorage.clear();
  }

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Get current user's MongoDB Object ID
  getCurrentUserId() {
    const userId = localStorage.getItem('userId');
    if (userId) return userId;

    // Fallback to getting from user object
    const user = this.getCurrentUser();
    return user ? user.userId : null;
  }

  // Get session data
  getSessionData() {
    const session = sessionStorage.getItem('userSession');
    return session ? JSON.parse(session) : null;
  }

  // Get session ID
  getSessionId() {
    const session = this.getSessionData();
    return session ? session.sessionId : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true';
  }

  // Get user role
  getUserRole() {
    return localStorage.getItem('userRole');
  }

  // Get dashboard route based on role
  getDashboardRoute(role) {
    const routes = {
      admin: '/admin-dashboard',
      business_owner: '/business-owner-dashboard?tab=profile',
      driver: '/driver-dashboard',
      client: '/client-dashboard',
      vehicle_owner: '/vehicle-owner-dashboard?tab=profile'
    };
    return routes[role] || '/';
  }

  // Check if user has specific role
  hasRole(role) {
    return this.getUserRole() === role;
  }

  // Check if user is admin or business owner
  isAdminOrBusinessOwner() {
    const role = this.getUserRole();
    return role === 'admin' || role === 'business_owner';
  }

  // Check if user can register (client or vehicle_owner)
  canRegister() {
    const role = this.getUserRole();
    return !role || role === 'client' || role === 'vehicle_owner';
  }
}

export default new AuthService();
