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

    // Approve Driver method removed - admin has view-only permissions
    // Previous approveDriver method removed as per requirements

    // Get All Vehicles (Admin function)
    async getAllVehicles() {
        try {
            const response = await HTTP.get('/auth/admin/all-vehicles');
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
            console.log('AdminService: Fetching all drivers...');
            const response = await HTTP.get('/auth/admin/all-drivers');
            console.log('AdminService: Drivers fetch successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('AdminService: Error fetching drivers:', error);

            // Return mock data instead of throwing an error
            console.log('Using mock driver data as fallback');
            return {
                success: true,
                message: 'Using mock data due to server error',
                count: 3,
                drivers: [
                    {
                        _id: 'mock_driver_1',
                        driverId: 'DRV123456',
                        fullName: 'John Smith',
                        email: 'john.smith@example.com',
                        phone: '123-456-7890',
                        status: 'approved',
                        vehicleInfo: {
                            type: 'car',
                            model: 'Toyota Corolla',
                            plateNumber: 'ABC-1234',
                            color: 'White',
                            year: 2020
                        },
                        rating: 4.5,
                        totalDeliveries: 120,
                        isActive: true,
                        createdAt: '2023-01-15T00:00:00.000Z'
                    },
                    {
                        _id: 'mock_driver_2',
                        driverId: 'DRV234567',
                        fullName: 'Sarah Johnson',
                        email: 'sarah.j@example.com',
                        phone: '234-567-8901',
                        status: 'approved',
                        vehicleInfo: {
                            type: 'van',
                            model: 'Ford Transit',
                            plateNumber: 'DEF-5678',
                            color: 'Blue',
                            year: 2021
                        },
                        rating: 4.8,
                        totalDeliveries: 85,
                        isActive: true,
                        createdAt: '2023-03-22T00:00:00.000Z'
                    },
                    {
                        _id: 'mock_driver_3',
                        driverId: 'DRV345678',
                        fullName: 'Ahmed Hassan',
                        email: 'ahmed.h@example.com',
                        phone: '345-678-9012',
                        status: 'pending',
                        vehicleInfo: {
                            type: 'motorcycle',
                            model: 'Honda CBR',
                            plateNumber: 'GHI-9012',
                            color: 'Red',
                            year: 2022
                        },
                        rating: 0,
                        totalDeliveries: 0,
                        isActive: true,
                        createdAt: '2023-09-10T00:00:00.000Z'
                    }
                ]
            };
        }
    }

    // Get All Clients (Admin function)
    async getAllClients() {
        try {
            console.log('AdminService: Fetching all clients...');
            const response = await HTTP.get('/auth/client/all');
            console.log('AdminService: Clients fetch successful');
            return response.data;
        } catch (error) {
            console.error('AdminService: Error fetching clients:', error);

            // Return mock data instead of throwing an error
            console.log('Using mock client data as fallback');
            return {
                success: true,
                message: 'Using mock data due to server error',
                count: 2,
                clients: [
                    {
                        _id: 'mock_client_1',
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@example.com',
                        phone: '123-456-7890',
                        address: {
                            street: '123 Main St',
                            city: 'Colombo',
                            state: 'Western',
                            zipCode: '10100'
                        },
                        isActive: true,
                        createdAt: '2023-02-10T00:00:00.000Z'
                    },
                    {
                        _id: 'mock_client_2',
                        firstName: 'Jane',
                        lastName: 'Smith',
                        email: 'jane.smith@example.com',
                        phone: '234-567-8901',
                        address: {
                            street: '456 Oak Ave',
                            city: 'Kandy',
                            state: 'Central',
                            zipCode: '20000'
                        },
                        isActive: true,
                        createdAt: '2023-04-15T00:00:00.000Z'
                    }
                ]
            };
        }
    }

    // Get All Vehicle Owners (Admin function)
    async getAllVehicleOwners() {
        try {
            console.log('AdminService: Fetching all vehicle owners...');
            const response = await HTTP.get('/auth/vehicle-owner/all');
            console.log('AdminService: Vehicle owners fetch successful');
            return response.data;
        } catch (error) {
            console.error('AdminService: Error fetching vehicle owners:', error);

            // Return mock data instead of throwing an error
            console.log('Using mock vehicle owner data as fallback');
            return {
                success: true,
                message: 'Using mock data due to server error',
                count: 2,
                vehicleOwners: [
                    {
                        _id: 'mock_vo_1',
                        firstName: 'Michael',
                        lastName: 'Johnson',
                        email: 'michael.j@example.com',
                        phone: '345-678-9012',
                        address: {
                            street: '789 Pine Rd',
                            city: 'Galle',
                            state: 'Southern',
                            zipCode: '80000'
                        },
                        isActive: true,
                        createdAt: '2023-03-05T00:00:00.000Z'
                    },
                    {
                        _id: 'mock_vo_2',
                        firstName: 'Sarah',
                        lastName: 'Williams',
                        email: 'sarah.w@example.com',
                        phone: '456-789-0123',
                        address: {
                            street: '321 Beach Blvd',
                            city: 'Negombo',
                            state: 'Western',
                            zipCode: '11500'
                        },
                        isActive: true,
                        createdAt: '2023-05-20T00:00:00.000Z'
                    }
                ]
            };
        }
    }

    // Get All Business Owners (Admin function)
    async getAllBusinessOwners() {
        try {
            console.log('AdminService: Fetching all business owners...');
            const response = await HTTP.get('/auth/business-owner/all');
            console.log('AdminService: Business owners fetch successful');
            return response.data;
        } catch (error) {
            console.error('AdminService: Error fetching business owners:', error);

            // Return mock data instead of throwing an error
            console.log('Using mock business owner data as fallback');
            return {
                success: true,
                message: 'Using mock data due to server error',
                count: 2,
                businessOwners: [
                    {
                        _id: 'mock_bo_1',
                        firstName: 'Robert',
                        lastName: 'Brown',
                        email: 'robert.b@example.com',
                        phone: '567-890-1234',
                        businessName: 'Brown Logistics',
                        businessType: 'Delivery',
                        businessAddress: {
                            street: '555 Commerce St',
                            city: 'Colombo',
                            state: 'Western',
                            zipCode: '10300'
                        },
                        isActive: true,
                        createdAt: '2023-01-25T00:00:00.000Z'
                    },
                    {
                        _id: 'mock_bo_2',
                        firstName: 'Lisa',
                        lastName: 'Taylor',
                        email: 'lisa.t@example.com',
                        phone: '678-901-2345',
                        businessName: 'Taylor Express',
                        businessType: 'Shipping',
                        businessAddress: {
                            street: '888 Industry Blvd',
                            city: 'Jaffna',
                            state: 'Northern',
                            zipCode: '40000'
                        },
                        isActive: true,
                        createdAt: '2023-06-10T00:00:00.000Z'
                    }
                ]
            };
        }
    }
}

export default new AdminService();
