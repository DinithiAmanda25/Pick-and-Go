import { HTTP } from "./httpCommon-service";

class VehicleService {

    // Add New Vehicle
    async addVehicle(ownerId, vehicleData) {
        try {
            const response = await HTTP.post(`/vehicles/owner/${ownerId}/add`, vehicleData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Upload Vehicle Images
    async uploadVehicleImage(vehicleId, formData) {
        try {
            const response = await HTTP.post(`/vehicles/${vehicleId}/upload-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get Vehicles by Owner
    async getVehiclesByOwner(ownerId, status = null) {
        try {
            const url = `/vehicles/owner/${ownerId}${status ? `?status=${status}` : ''}`;
            const response = await HTTP.get(url);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get Vehicle Details
    async getVehicleDetails(vehicleId) {
        try {
            const response = await HTTP.get(`/vehicles/${vehicleId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Update Vehicle
    async updateVehicle(vehicleId, updateData) {
        try {
            const response = await HTTP.put(`/vehicles/${vehicleId}`, updateData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Delete Vehicle
    async deleteVehicle(vehicleId) {
        try {
            const response = await HTTP.delete(`/vehicles/${vehicleId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Add Maintenance Schedule
    async addMaintenanceSchedule(vehicleId, maintenanceData) {
        try {
            const response = await HTTP.post(`/vehicles/${vehicleId}/maintenance`, maintenanceData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Update Maintenance Schedule
    async updateMaintenanceSchedule(vehicleId, maintenanceId, updateData) {
        try {
            const response = await HTTP.put(`/vehicles/${vehicleId}/maintenance/${maintenanceId}`, updateData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get Maintenance Schedule
    async getMaintenanceSchedule(vehicleId, status = null) {
        try {
            const url = `/vehicles/${vehicleId}/maintenance${status ? `?status=${status}` : ''}`;
            const response = await HTTP.get(url);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Business Owner Functions

    // Get Pending Vehicles
    async getPendingVehicles() {
        try {
            const response = await HTTP.get('/vehicles/pending/approval');
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Approve Vehicle
    async approveVehicle(vehicleId, businessOwnerId, approvalData) {
        try {
            const response = await HTTP.put(`/vehicles/${vehicleId}/approve/${businessOwnerId}`, approvalData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Reject Vehicle
    async rejectVehicle(vehicleId, businessOwnerId, rejectionData) {
        try {
            const response = await HTTP.put(`/vehicles/${vehicleId}/reject/${businessOwnerId}`, rejectionData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get Available Vehicles
    async getAvailableVehicles(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const url = `/vehicles/available/rental${queryParams ? `?${queryParams}` : ''}`;
            const response = await HTTP.get(url);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Utility Functions

    // Validate Vehicle Data
    validateVehicleData(vehicleData) {
        const errors = {};

        if (!vehicleData.vehicleType) errors.vehicleType = 'Vehicle type is required';
        if (!vehicleData.make) errors.make = 'Make is required';
        if (!vehicleData.model) errors.model = 'Model is required';
        if (!vehicleData.year) errors.year = 'Year is required';
        if (!vehicleData.color) errors.color = 'Color is required';
        if (!vehicleData.licensePlate) errors.licensePlate = 'License plate is required';
        if (!vehicleData.seatingCapacity) errors.seatingCapacity = 'Seating capacity is required';
        if (!vehicleData.fuelType) errors.fuelType = 'Fuel type is required';
        if (!vehicleData.transmission) errors.transmission = 'Transmission is required';

        // Location validation
        if (!vehicleData.location?.address) errors.address = 'Address is required';
        if (!vehicleData.location?.city) errors.city = 'City is required';
        if (!vehicleData.location?.state) errors.state = 'State is required';
        if (!vehicleData.location?.zipCode) errors.zipCode = 'ZIP code is required';

        // Insurance validation
        if (!vehicleData.insurance?.provider) errors.insuranceProvider = 'Insurance provider is required';
        if (!vehicleData.insurance?.policyNumber) errors.insurancePolicyNumber = 'Insurance policy number is required';
        if (!vehicleData.insurance?.expiryDate) errors.insuranceExpiryDate = 'Insurance expiry date is required';

        // Registration validation
        if (!vehicleData.registration?.registrationNumber) errors.registrationNumber = 'Registration number is required';
        if (!vehicleData.registration?.expiryDate) errors.registrationExpiryDate = 'Registration expiry date is required';

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Format Vehicle Data for Display
    formatVehicleForDisplay(vehicle) {
        return {
            id: vehicle._id,
            title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            type: vehicle.vehicleType,
            status: vehicle.status,
            licensePlate: vehicle.licensePlate,
            seatingCapacity: vehicle.seatingCapacity,
            fuelType: vehicle.fuelType,
            transmission: vehicle.transmission,
            dailyRate: vehicle.rentalPrice?.dailyRate || 0,
            weeklyRate: vehicle.rentalPrice?.weeklyRate || 0,
            monthlyRate: vehicle.rentalPrice?.monthlyRate || 0,
            primaryImage: vehicle.primaryImage?.url || vehicle.images?.[0]?.url,
            rating: vehicle.rating?.average || 0,
            totalReviews: vehicle.rating?.totalReviews || 0,
            location: `${vehicle.location?.city}, ${vehicle.location?.state}`,
            isAvailable: vehicle.availability?.isAvailable || false,
            createdAt: vehicle.createdAt,
            updatedAt: vehicle.updatedAt
        };
    }

    // Get Vehicle Status Badge Color
    getStatusBadgeColor(status) {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            available: 'bg-blue-100 text-blue-800',
            rented: 'bg-purple-100 text-purple-800',
            maintenance: 'bg-orange-100 text-orange-800',
            unavailable: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    // Get Vehicle Type Icon
    getVehicleTypeIcon(type) {
        const icons = {
            car: '🚗',
            van: '🚐',
            truck: '🚛',
            motorcycle: '🏍️',
            bicycle: '🚲',
            bus: '🚌',
            other: '🚙'
        };
        return icons[type] || '🚙';
    }

    // Business Owner Functions

    // Get Pending Vehicles for Approval
    async getPendingVehicles() {
        try {
            const response = await HTTP.get('/vehicles/business/pending');
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Approve Vehicle with Pricing
    async approveVehicle(vehicleId, pricingData) {
        try {
            const response = await HTTP.post(`/vehicles/business/${vehicleId}/approve`, pricingData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Reject Vehicle
    async rejectVehicle(vehicleId, reason) {
        try {
            const response = await HTTP.post(`/vehicles/business/${vehicleId}/reject`, { reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Upload Vehicle Document
    async uploadVehicleDocument(vehicleId, documentType, formData) {
        try {
            // Add document type to formData
            formData.append('documentType', documentType);

            const response = await HTTP.post(`/vehicles/${vehicleId}/upload-document`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }
}

export default new VehicleService();