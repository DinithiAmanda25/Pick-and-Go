import { HTTP } from "./http-common-service";

class CustomerService {

  // Register customer (now using correct auth endpoint)
  async registerCustomer(data) {
    try {
      const response = await HTTP.post("/auth/register/client", data, {
        headers: {
          "Content-Type": "application/json",
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }

  // Login customer (now using correct auth endpoint)
  async login(formData) {
    try {
      const response = await HTTP.post("/auth/login", formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }

  // Get Client Profile
  async getProfile(userId) {
    try {
      const response = await HTTP.get(`/auth/profile/client/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }

  // Update Client Profile
  async updateProfile(userId, profileData) {
    try {
      console.log('Customer service - updating client profile for userId:', userId);
      console.log('Customer service - client profile data:', profileData);

      const response = await HTTP.put(`/auth/profile/client/${userId}`, profileData);
      console.log('Customer service - client response:', response.data);

      if (response.data.success) {
        // Update the stored user data with the fresh data from database
        const updatedProfile = response.data.profile;

        // Update localStorage with the complete updated profile
        localStorage.setItem('user', JSON.stringify(updatedProfile));

        // Also update userId if it exists separately
        if (updatedProfile._id) {
          localStorage.setItem('userId', updatedProfile._id);
        }

        console.log('Customer service - localStorage updated with fresh profile data');
      }

      return response.data;
    } catch (error) {
      console.error('Customer service - error:', error);
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }

  // Upload profile image
  async uploadProfileImage(userId, formData) {
    try {
      const response = await HTTP.post(`/auth/profile/client/${userId}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Update localStorage with new profile image
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser) {
          currentUser.profileImage = response.data.profileImage;
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }

  // Change password
  async changePassword(userId, passwordData) {
    try {
      const response = await HTTP.put(`/auth/profile/client/${userId}/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }

  // Delete profile
  async deleteProfile(userId) {
    try {
      const response = await HTTP.delete(`/auth/profile/client/${userId}`);

      if (response.data.success) {
        // Clear all user data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }
}

export default new CustomerService();
