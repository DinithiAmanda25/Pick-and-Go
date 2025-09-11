import { HTTP } from "./http-common-service";

class BusinessOwnerService {

    // Register Business Owner
    async registerBusinessOwner(userData) {
        try {
            const response = await HTTP.post('/auth/register/business-owner', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get Business Owner Profile
    async getProfile(userId) {
        try {
            const response = await HTTP.get(`/auth/profile/business-owner/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Update Business Owner Profile
    async updateProfile(userId, profileData) {
        try {
            console.log('BusinessOwner service - updating profile for userId:', userId);
            console.log('BusinessOwner service - profile data:', profileData);

            const response = await HTTP.put(`/auth/profile/business-owner/${userId}`, profileData);
            console.log('BusinessOwner service - response:', response.data);

            if (response.data.success) {
                // Update the stored user data with the fresh data from database
                const updatedProfile = response.data.businessOwner;

                if (updatedProfile) {
                    // Update localStorage with the complete updated profile
                    localStorage.setItem('user', JSON.stringify(updatedProfile));

                    // Also update userId if it exists separately - check both _id and id fields
                    const userId = updatedProfile._id || updatedProfile.id;
                    if (userId) {
                        localStorage.setItem('userId', userId);
                    }

                    console.log('BusinessOwner service - localStorage updated with fresh profile data');
                }
            }

            return response.data;
        } catch (error) {
            console.error('BusinessOwner service - error:', error);
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Upload Business Owner Profile Image
    async uploadProfileImage(userId, formData) {
        try {
            const response = await HTTP.post(`/auth/profile/business-owner/${userId}/upload-image`, formData, {
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

    // Change Business Owner Password
    async changePassword(userId, passwordData) {
        try {
            const response = await HTTP.put(`/auth/profile/business-owner/${userId}/change-password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Delete Business Owner Profile
    async deleteProfile(userId) {
        try {
            const response = await HTTP.delete(`/auth/profile/business-owner/${userId}`);

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

    // Driver Application Management Methods

    // Get Pending Driver Applications
    async getPendingDriverApplications() {
        try {
            // Get current user ID from localStorage
            const userId = localStorage.getItem('userId');
            if (!userId) {
                throw { success: false, message: 'User not authenticated' };
            }
            
            const response = await HTTP.get(`/business-owner/${userId}/pending-drivers`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get Pending Vehicle Applications
    async getPendingVehicleApplications() {
        try {
            // Get current user ID from localStorage
            const userId = localStorage.getItem('userId');
            if (!userId) {
                throw { success: false, message: 'User not authenticated' };
            }
            
            const response = await HTTP.get(`/business-owner/${userId}/pending-vehicles`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get All Pending Applications (both drivers and vehicles)
    async getAllPendingApplications() {
        try {
            // Get current user ID from localStorage
            const userId = localStorage.getItem('userId');
            if (!userId) {
                throw { success: false, message: 'User not authenticated' };
            }
            
            const response = await HTTP.get(`/business-owner/${userId}/pending-applications`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get Approval Statistics for Dashboard
    async getApprovalStatistics() {
        try {
            // Get current user ID from localStorage
            const userId = localStorage.getItem('userId');
            if (!userId) {
                throw { success: false, message: 'User not authenticated' };
            }
            
            const response = await HTTP.get(`/business-owner/${userId}/approval-statistics`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get All Driver Applications (with status filter)
    async getAllDriverApplications(status = null) {
        try {
            const url = status ? `/drivers?status=${status}` : '/drivers';
            const response = await HTTP.get(url);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Approve or Reject Driver Application
    async reviewDriverApplication(driverId, status, newPassword = null, approvalNotes = '') {
        try {
            // Get current user ID from localStorage
            const userId = localStorage.getItem('userId');
            if (!userId) {
                throw { success: false, message: 'User not authenticated' };
            }

            const payload = { status, approvalNotes };
            if (newPassword) {
                payload.newPassword = newPassword;
            }

            console.log('🚀 BusinessOwnerService - Making request to:', `/business-owner/${userId}/approve-driver/${driverId}`)
            console.log('📦 BusinessOwnerService - Payload:', payload)

            const response = await HTTP.put(`/business-owner/${userId}/approve-driver/${driverId}`, payload);

            console.log('📥 BusinessOwnerService - Response:', response.data)
            return response.data;
        } catch (error) {
            console.error('💥 BusinessOwnerService - Error:', error)
            console.error('💥 BusinessOwnerService - Error response:', error.response?.data)
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Approve or Reject Vehicle Application
    async reviewVehicleApplication(vehicleId, status, vehicleData = {}) {
        try {
            // Get current user ID from localStorage
            const userId = localStorage.getItem('userId');
            if (!userId) {
                throw { success: false, message: 'User not authenticated' };
            }

            const payload = { 
                status,
                ...vehicleData // This can include dailyRate, weeklyRate, monthlyRate, approvalNotes, rejectionReason
            };

            console.log('🚀 BusinessOwnerService - Making request to:', `/business-owner/${userId}/approve-vehicle/${vehicleId}`)
            console.log('📦 BusinessOwnerService - Payload:', payload)

            const response = await HTTP.put(`/business-owner/${userId}/approve-vehicle/${vehicleId}`, payload);

            console.log('📥 BusinessOwnerService - Response:', response.data)
            return response.data;
        } catch (error) {
            console.error('💥 BusinessOwnerService - Error:', error)
            console.error('💥 BusinessOwnerService - Error response:', error.response?.data)
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get Driver Details
    async getDriverDetails(driverId) {
        try {
            const response = await HTTP.get(`/drivers/${driverId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get Pending Applications Count
    async getPendingApplicationsCount() {
        try {
            const response = await HTTP.get('/drivers/pending/count');
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }
}

export default new BusinessOwnerService();
