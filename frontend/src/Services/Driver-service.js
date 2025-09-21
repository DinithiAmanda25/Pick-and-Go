import axios from 'axios';
import { baseURL } from '../Config/Settings';

class DriverService {

    // Create axios instance with interceptors
    constructor() {
        this.api = axios.create({
            baseURL: baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor to include user data if available
        this.api.interceptors.request.use(
            (config) => {
                const userData = localStorage.getItem('user');
                const userId = localStorage.getItem('userId');

                if (userData) {
                    try {
                        const user = JSON.parse(userData);
                        config.headers['X-User-ID'] = user._id || user.id || userId;
                        config.headers['X-User-Role'] = user.role;
                    } catch (error) {
                        console.warn('Failed to parse user data from localStorage:', error.message);
                    }
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Add response interceptor for error handling
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('userId');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // Register Driver (through onboarding with file uploads)
    async registerDriver(userData) {
        try {
            const response = await this.api.post('/auth/register-driver', userData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Driver registered successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to register driver',
                error: error.response?.data || error.message
            };
        }
    }

    // Get Driver Profile
    async getProfile(userId) {
        try {
            const response = await Promise.race([
                this.api.get(`/auth/profile/driver/${userId}`),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timeout')), 5000)
                )
            ]);

            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            console.warn('Backend fetch failed:', error.message);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Failed to fetch driver profile',
                error: error.response?.data || error.message
            };
        }
    }

    // Update Driver Profile
    async updateProfile(userId, profileData) {
        try {
            const response = await this.api.put(`/auth/profile/driver/${userId}`, profileData);

            if (response.data.success || response.data.data) {
                // Update localStorage with new profile data
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                if (currentUser && (response.data.user || response.data.data)) {
                    const updatedUser = response.data.user || response.data.data;
                    Object.assign(currentUser, updatedUser);
                    localStorage.setItem('user', JSON.stringify(currentUser));
                }
            }

            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Profile updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update profile',
                error: error.response?.data || error.message
            };
        }
    }

    // Change Driver Password
    async changePassword(userId, passwordData) {
        try {
            const response = await this.api.put(`/auth/profile/driver/${userId}/change-password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Password changed successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to change password',
                error: error.response?.data || error.message
            };
        }
    }

    // Upload Driver Document
    async uploadDocument(userId, documentType, formData) {
        try {
            // Add document type to formData
            formData.append('documentType', documentType);

            const response = await this.api.post(`/auth/profile/driver/${userId}/upload-document`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Document uploaded successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to upload document',
                error: error.response?.data || error.message
            };
        }
    }

    // Get Driver Status (approval status)
    async getDriverStatus(userId) {
        try {
            const response = await this.api.get(`/auth/profile/driver/${userId}/status`);

            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch driver status',
                error: error.response?.data || error.message
            };
        }
    }

    // Get all drivers (admin functionality)
    async getAllDrivers(params = {}) {
        try {
            const response = await this.api.get('/auth/drivers', { params });
            return {
                success: true,
                data: response.data.data,
                pagination: response.data.pagination
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch drivers',
                error: error.response?.data || error.message
            };
        }
    }

    // Approve/Reject driver (admin functionality)
    async updateDriverStatus(userId, status, remarks = '') {
        try {
            const response = await this.api.put(`/auth/profile/driver/${userId}/approve-status`, {
                status,
                remarks
            });

            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || `Driver ${status} successfully`
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || `Failed to ${status} driver`,
                error: error.response?.data || error.message
            };
        }
    }

    // Search drivers
    async searchDrivers(searchTerm, filters = {}) {
        try {
            const params = {
                search: searchTerm,
                ...filters
            };

            const response = await this.api.get('/auth/drivers', { params });
            return {
                success: true,
                data: response.data.data,
                pagination: response.data.pagination
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to search drivers',
                error: error.response?.data || error.message
            };
        }
    }

    // Delete driver account (admin functionality)
    async deleteDriver(userId) {
        try {
            await this.api.delete(`/auth/profile/driver/${userId}`);
            return {
                success: true,
                message: 'Driver account deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete driver account',
                error: error.response?.data || error.message
            };
        }
    }

    // Get driver statistics (for reports)
    async getDriverStats(params = {}) {
        try {
            const response = await this.api.get('/auth/drivers/stats', { params });
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch driver statistics',
                error: response?.data || error.message
            };
        }
    }
}

export default new DriverService();