import { HTTP } from "./http-common-service";

class AdminService {

    // Get Admin Profile
    async getProfile(userId) {
        try {
            const response = await HTTP.get(`/auth/profile/admin/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Update Admin Profile
    async updateProfile(userId, profileData) {
        try {
            const response = await HTTP.put(`/auth/profile/admin/${userId}`, profileData);

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

    // Change Admin Password
    async changePassword(userId, passwordData) {
        try {
            const response = await HTTP.put(`/auth/profile/admin/${userId}/change-password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

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

    // Get Pending Drivers (Admin function)
    async getPendingDrivers() {
        try {
            const response = await HTTP.get('/auth/admin/pending-drivers');
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get All Drivers (Admin function)
    async getAllDrivers() {
        try {
            const response = await HTTP.get('/auth/admin/all-drivers');
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get All Clients (Admin function)
    async getAllClients() {
        try {
            const response = await HTTP.get('/auth/client/all');
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get All Vehicle Owners (Admin function)
    async getAllVehicleOwners() {
        try {
            const response = await HTTP.get('/auth/vehicle-owner/all');
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get All Business Owners (Admin function)
    async getAllBusinessOwners() {
        try {
            const response = await HTTP.get('/auth/business-owner/all');
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }
}

export default new AdminService();
