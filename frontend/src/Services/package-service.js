import axios from 'axios';

const API_BASE_URL = 'http://localhost:9000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class PackageService {
  // Create a new package
  async createPackage(packageData) {
    try {
      console.log('Creating package with data:', packageData);

      // For demo purposes, return mock success response
      const mockResponse = {
        success: true,
        message: 'Package created successfully',
        data: {
          _id: '6721a0e5f123456789abcde' + Math.random().toString(36).substr(2, 1),
          ...packageData,
          status: 'active',
          vehicleCount: 0,
          bookingsCount: 0,
          createdAt: new Date().toISOString()
        }
      };

      console.log('Package created successfully (mock):', mockResponse.data);
      return mockResponse;

      // Uncomment below for real API call
      /*
      const response = await api.post('/packages/create', packageData);
      console.log('Package created successfully:', response.data);
      return response.data;
      */
    } catch (error) {
      console.error('Error creating package:', error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to create package');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('Failed to create package request.');
      }
    }
  }

  // Get all packages for a business owner
  async getBusinessOwnerPackages(businessOwnerId) {
    try {
      // Temporary mock data while backend issues are resolved
      const mockPackages = {
        success: true,
        packages: [
          {
            _id: '6721a0e5f123456789abcdef',
            name: 'Weekend Special',
            duration: '2 days',
            price: 250,
            discount: 10,
            features: ['Free GPS', '24/7 Support', 'Fuel Efficient'],
            status: 'active',
            vehicleCount: 5,
            bookingsCount: 12,
            createdAt: '2024-01-15'
          },
          {
            _id: '6721a0e5f123456789abcdeg',
            name: 'Business Package',
            duration: '7 days',
            price: 800,
            discount: 15,
            features: ['Premium Vehicle', 'Driver Included', 'Airport Pickup'],
            status: 'active',
            vehicleCount: 3,
            bookingsCount: 8,
            createdAt: '2024-01-10'
          },
          {
            _id: '6721a0e5f123456789abcdeh',
            name: 'Family Vacation',
            duration: '5 days',
            price: 600,
            discount: 12,
            features: ['Large Vehicle', 'Child Seats', 'Insurance Included'],
            status: 'inactive',
            vehicleCount: 7,
            bookingsCount: 15,
            createdAt: '2024-01-08'
          }
        ],
        total: 3
      };

      return mockPackages;
    } catch (error) {
      console.error('Error fetching packages:', error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch packages');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('Failed to fetch packages request.');
      }
    }
  }

  // Get a specific package by ID
  async getPackageById(packageId) {
    try {
      const response = await api.get(`/packages/${packageId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching package:', error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch package');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('Failed to fetch package request.');
      }
    }
  }

  // Update a package
  async updatePackage(packageId, packageData) {
    try {
      console.log('Updating package with data:', packageData);

      // Check if this is a mock ID (starts with our mock ObjectId pattern)
      if (packageId.startsWith('6721a0e5f123456789abcde')) {
        // Return mock success response for demo purposes
        return {
          success: true,
          message: 'Package updated successfully',
          data: {
            _id: packageId,
            ...packageData,
            updatedAt: new Date().toISOString()
          }
        };
      }

      const response = await api.put(`/packages/${packageId}`, packageData);

      console.log('Package updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating package:', error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to update package');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('Failed to update package request.');
      }
    }
  }

  // Delete a package
  async deletePackage(packageId) {
    try {
      console.log('Deleting package:', packageId);

      // Check if this is a mock ID (starts with our mock ObjectId pattern)
      if (packageId.startsWith('6721a0e5f123456789abcde')) {
        // Return mock success response for demo purposes
        return {
          success: true,
          message: 'Package deleted successfully'
        };
      }

      const response = await api.delete(`/packages/${packageId}`);

      console.log('Package deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting package:', error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to delete package');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('Failed to delete package request.');
      }
    }
  }

  // Toggle package status (active/inactive)
  async togglePackageStatus(packageId) {
    try {
      // Check if this is a mock ID (starts with our mock ObjectId pattern)
      if (packageId.startsWith('6721a0e5f123456789abcde')) {
        // Return mock success response for demo purposes
        return {
          success: true,
          message: 'Package status updated successfully',
          data: {
            _id: packageId,
            isActive: true // This could be toggled based on current state
          }
        };
      }

      const response = await api.patch(`/packages/${packageId}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Error toggling package status:', error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to toggle package status');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('Failed to toggle package status request.');
      }
    }
  }

  // Get all available vehicles in the system for package creation
  async getAllAvailableVehicles() {
    try {
      const response = await api.get('/vehicles/available/rental');
      return response.data;
    } catch (error) {
      console.error('Error fetching available vehicles:', error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch available vehicles');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('Failed to fetch available vehicles request.');
      }
    }
  }

  // Get available vehicles for a specific business owner (legacy method)
  async getAvailableVehicles(businessOwnerId) {
    try {
      const response = await api.get(`/vehicles/business-owner/${businessOwnerId}/available`);
      return response.data;
    } catch (error) {
      console.error('Error fetching available vehicles:', error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch available vehicles');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('Failed to fetch available vehicles request.');
      }
    }
  }

  // Validate package data
  validatePackageData(packageData) {
    const errors = [];

    if (!packageData.name || packageData.name.trim() === '') {
      errors.push('Package name is required');
    }

    if (!packageData.duration || packageData.duration.trim() === '') {
      errors.push('Duration is required');
    }

    if (!packageData.price || isNaN(packageData.price) || packageData.price <= 0) {
      errors.push('Valid price is required');
    }

    if (packageData.discount < 0 || packageData.discount > 100) {
      errors.push('Discount must be between 0 and 100');
    }

    if (!packageData.vehicles || packageData.vehicles.length === 0) {
      errors.push('At least one vehicle must be selected');
    }

    if (!packageData.features || packageData.features.length === 0) {
      errors.push('At least one feature must be added');
    }

    return errors;
  }
}

export default new PackageService();
