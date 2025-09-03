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
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', response.data.user.role);
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
      const response = await HTTP.post('/auth/register/driver', userData);
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

  // Logout function
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
  }

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
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
      business_owner: '/business-owner-dashboard',
      driver: '/driver-dashboard',
      client: '/client-dashboard',
      vehicle_owner: '/vehicle-owner-dashboard'
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
