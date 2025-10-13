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
      
      const response = await api.post('/packages/create', packageData);
      
      console.log('Package created successfully:', response.data);
      return response.data;
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
      const response = await api.get(`/packages/business-owner/${businessOwnerId}`);
      return response.data;
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
