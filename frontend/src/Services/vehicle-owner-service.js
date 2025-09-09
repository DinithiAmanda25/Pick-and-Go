import { HTTP } from "./http-common-service";

class VehicleOwnerService {

    // Register Vehicle Owner
    async registerVehicleOwner(userData) {
        try {
            const response = await HTTP.post('/auth/register/vehicle-owner', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get Vehicle Owner Profile
    async getProfile(userId) {
        try {
            const response = await HTTP.get(`/auth/profile/vehicle-owner/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Update Vehicle Owner Profile
    async updateProfile(userId, profileData) {
        try {
            const response = await HTTP.put(`/auth/profile/vehicle-owner/${userId}`, profileData);

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

    // Upload Profile Image
    async uploadProfileImage(userId, formData) {
        try {
            const response = await HTTP.post(`/auth/profile/vehicle-owner/${userId}/upload-image`, formData, {
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

    // Change Password
    async changePassword(userId, passwordData) {
        try {
            const response = await HTTP.put(`/auth/profile/vehicle-owner/${userId}/change-password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Upload Document
    async uploadDocument(userId, documentType, formData) {
        try {
            // Add document type to formData
            formData.append('documentType', documentType);

            const response = await HTTP.post(`/auth/profile/vehicle-owner/${userId}/upload-document`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get Vehicle Owner Documents
    async getDocuments(userId) {
        try {
            const response = await HTTP.get(`/auth/profile/vehicle-owner/${userId}/documents`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Delete Document
    async deleteDocument(userId, documentType) {
        try {
            const response = await HTTP.delete(`/auth/profile/vehicle-owner/${userId}/documents/${documentType}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get Vehicle Owner Reviews
    async getReviews(userId) {
        try {
            const response = await HTTP.get(`/auth/profile/vehicle-owner/${userId}/reviews`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Add Review for Vehicle Owner
    async addReview(vehicleOwnerId, reviewData) {
        try {
            const response = await HTTP.post(`/auth/profile/vehicle-owner/${vehicleOwnerId}/reviews`, reviewData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Delete Profile
    async deleteProfile(userId) {
        try {
            const response = await HTTP.delete(`/auth/profile/vehicle-owner/${userId}`);

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

    // Get Vehicle Owner Reviews
    async getReviews(userId, page = 1, limit = 10) {
        try {
            const response = await HTTP.get(`/vehicle-owner/${userId}/reviews?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Add Review for Vehicle Owner
    async addReview(userId, reviewData) {
        try {
            const response = await HTTP.post(`/vehicle-owner/${userId}/reviews`, reviewData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }
}

export default new VehicleOwnerService();
