import { HTTP } from "./http-common-service";

class DriverService {

    // Register Driver (through onboarding with file uploads)
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

    // Get Driver Profile
    async getProfile(userId) {
        try {
            const response = await HTTP.get(`/auth/profile/driver/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Update Driver Profile
    async updateProfile(userId, profileData) {
        try {
            const response = await HTTP.put(`/auth/profile/driver/${userId}`, profileData);

            if (response.data.success) {
                // Update localStorage with new profile data
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                if (currentUser) {
                    Object.assign(currentUser, response.data.user);
                    localStorage.setItem('user', JSON.stringify(currentUser));
                }
            }

            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Change Driver Password
    async changePassword(userId, passwordData) {
        try {
            const response = await HTTP.put(`/auth/profile/driver/${userId}/change-password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Upload Driver Document
    async uploadDocument(userId, documentType, formData) {
        try {
            // Add document type to formData
            formData.append('documentType', documentType);

            const response = await HTTP.post(`/auth/profile/driver/${userId}/upload-document`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get Driver Status (approval status)
    async getDriverStatus(userId) {
        try {
            const response = await HTTP.get(`/auth/profile/driver/${userId}/status`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }
}

export default new DriverService();
