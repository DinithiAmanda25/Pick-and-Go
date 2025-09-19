import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit3, Calendar, User, Car, MapPin, Clock, Phone, Mail, X, AlertCircle, CheckCircle, UserPlus, UserMinus, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';

// Driver Schedule Service
class DriverScheduleService {
  constructor() {
    this.API_BASE_URL = 'http://localhost:9000/api';
  }

  // Get all drivers with their assignments
  async getAllDriversWithSchedule(filters = {}) {
    try {
      // Fetch all drivers
      const driversResponse = await this.getAvailableDrivers();
      
      // Fetch all bookings that require drivers
      const bookingsResponse = await this.getDriverSchedule(filters);
      
      // Combine drivers with their assignments
      const driversWithSchedule = driversResponse.map(driver => {
        const assignments = bookingsResponse.bookings.filter(booking => 
          booking.driver?.driverId?._id === driver._id || 
          booking.driver?.driverId === driver._id
        );
        
        return {
          ...driver,
          assignments: assignments,
          totalAssignments: assignments.length,
          activeAssignments: assignments.filter(a => ['confirmed', 'paid', 'active'].includes(a.status)).length,
          completedAssignments: assignments.filter(a => a.status === 'completed').length,
          upcomingAssignments: assignments.filter(a => {
            const startDate = new Date(a.rentalPeriod?.startDate);
            const now = new Date();
            return startDate > now && ['confirmed', 'paid'].includes(a.status);
          }).length
        };
      });

      return {
        success: true,
        drivers: driversWithSchedule,
        totalDrivers: driversWithSchedule.length,
        totalAssignments: bookingsResponse.bookings.length
      };
    } catch (error) {
      console.error('Error fetching drivers with schedule:', error);
      throw error;
    }
  }

  // Get all bookings with driver assignments
  async getDriverSchedule(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.driverId) params.append('driverId', filters.driverId);
      
      const response = await fetch(`${this.API_BASE_URL}/bookings/admin/driver-schedule?${params.toString()}`);
      
      if (!response.ok) {
        // Fallback to regular bookings endpoint and filter client-side
        const fallbackResponse = await fetch(`${this.API_BASE_URL}/bookings/admin/all?${params.toString()}`);
        if (!fallbackResponse.ok) {
          throw new Error(`HTTP error! status: ${fallbackResponse.status}`);
        }
        const fallbackData = await fallbackResponse.json();
        
        // Filter bookings that require drivers
        const driverBookings = fallbackData.bookings.filter(booking => 
          booking.driver?.required === true
        );

        return {
          success: true,
          bookings: driverBookings,
          total: driverBookings.length
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching driver schedule:', error);
      throw error;
    }
  }

  // Get all available drivers
  async getAvailableDrivers() {
    try {
      let response = await fetch(`${this.API_BASE_URL}/auth/drivers/all`);
      
      if (!response.ok) {
        const alternativeEndpoints = [
          `${this.API_BASE_URL}/auth/drivers`,
          `${this.API_BASE_URL}/drivers/all`,
          `${this.API_BASE_URL}/drivers`
        ];
        
        let successfulResponse = null;
        for (const endpoint of alternativeEndpoints) {
          try {
            const altResponse = await fetch(endpoint);
            if (altResponse.ok) {
              successfulResponse = altResponse;
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        if (!successfulResponse) {
          throw new Error('No available driver endpoint found');
        }
        
        response = successfulResponse;
      }
      
      const data = await response.json();
      const driversArray = data.drivers || data.data || data;
      
      if (!Array.isArray(driversArray)) {
        throw new Error('Invalid drivers data format received');
      }

      return driversArray;
    } catch (error) {
      console.error('Error fetching drivers:', error);
      return [];
    }
  }

  // Assign driver to booking
  async assignDriver(bookingId, driverId) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/bookings/${bookingId}/assign-driver`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to assign driver');
      }

      return data;
    } catch (error) {
      console.error('Error assigning driver:', error);
      throw error;
    }
  }

  // Unassign driver from booking
  async unassignDriver(bookingId) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/bookings/${bookingId}/unassign-driver`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to unassign driver');
      }

      return data;
    } catch (error) {
      console.error('Error unassigning driver:', error);
      throw error;
    }
  }
}

const AdminDriverSchedule = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [expandedDrivers, setExpandedDrivers] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [unassignedBookings, setUnassignedBookings] = useState([]);

  const driverScheduleService = new DriverScheduleService();

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const availabilityOptions = [
    { value: 'all', label: 'All Drivers' },
    { value: 'available', label: 'Available' },
    { value: 'busy', label: 'Busy' },
    { value: 'with-assignments', label: 'With Assignments' },
    { value: 'without-assignments', label: 'Without Assignments' }
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    suspended: 'bg-gray-100 text-gray-800'
  };

  const bookingStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    payment_pending: 'bg-orange-100 text-orange-800',
    paid: 'bg-green-100 text-green-800',
    active: 'bg-purple-100 text-purple-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
    rejected: 'bg-gray-100 text-gray-800'
  };

  // Clear messages after timeout
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError('');
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // Fetch drivers with their schedules
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await driverScheduleService.getAllDriversWithSchedule({
        status: statusFilter === 'all' ? null : statusFilter
      });
      
      setDrivers(data.drivers || []);
      
      // Get unassigned bookings (bookings that require drivers but don't have one)
      const scheduleData = await driverScheduleService.getDriverSchedule();
      const unassigned = scheduleData.bookings.filter(booking => 
        booking.driver?.required && !booking.driver?.driverId
      );
      setUnassignedBookings(unassigned);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Failed to load data: ${error.message}`);
      setDrivers([]);
      setUnassignedBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  // Filter drivers based on search term and availability
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = !searchTerm || (
      driver.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.driverId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesAvailability = availabilityFilter === 'all' || (() => {
      switch (availabilityFilter) {
        case 'with-assignments':
          return driver.totalAssignments > 0;
        case 'without-assignments':
          return driver.totalAssignments === 0;
        default:
          return driver.availability === availabilityFilter;
      }
    })();

    return matchesSearch && matchesAvailability;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount || isNaN(amount)) return `${currency} 0`;
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
      }).format(amount);
    } catch {
      return `${currency} ${amount}`;
    }
  };

  const toggleDriverExpansion = (driverId) => {
    setExpandedDrivers(prev => ({
      ...prev,
      [driverId]: !prev[driverId]
    }));
  };

  const handleAssignBooking = (booking) => {
    setSelectedBooking(booking);
    setSelectedDriver('');
    setIsAssignModalOpen(true);
  };

  const handleUnassignDriver = async (booking) => {
    if (!window.confirm('Are you sure you want to unassign this driver?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      
      await driverScheduleService.unassignDriver(booking._id);
      
      setSuccessMessage('Driver unassigned successfully!');
      await fetchData(); // Refresh data
    } catch (error) {
      setError(`Failed to unassign driver: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const submitDriverAssignment = async () => {
    if (!selectedDriver) {
      setError('Please select a driver');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      
      await driverScheduleService.assignDriver(selectedBooking._id, selectedDriver);
      
      setIsAssignModalOpen(false);
      setSelectedBooking(null);
      setSelectedDriver('');
      setSuccessMessage('Driver assigned successfully!');
      await fetchData(); // Refresh data
    } catch (error) {
      setError(`Failed to assign driver: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <span className="ml-3 text-lg">Loading driver schedules...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Driver Schedule Management</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Drivers: {filteredDrivers.length} | Unassigned Bookings: {unassignedBookings.length}
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by driver name, email, phone, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {availabilityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Unassigned Bookings Alert */}
      {unassignedBookings.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
              <span className="font-medium text-orange-800">
                {unassignedBookings.length} booking(s) require driver assignment
              </span>
            </div>
            <button
              onClick={() => {
                const firstUnassigned = unassignedBookings[0];
                if (firstUnassigned) handleAssignBooking(firstUnassigned);
              }}
              className="text-orange-600 hover:text-orange-800 text-sm font-medium"
            >
              Assign Now
            </button>
          </div>
        </div>
      )}

      {/* Drivers List */}
      <div className="space-y-4">
        {filteredDrivers.map((driver) => (
          <div key={driver._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleDriverExpansion(driver._id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedDrivers[driver._id] ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </button>
                  
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {driver.fullName || 'Unknown Driver'}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {driver.email || 'No email'}
                      </span>
                      <span className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {driver.phone || 'No phone'}
                      </span>
                      <span>ID: {driver.driverId || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total Assignments</div>
                    <div className="text-xl font-bold text-gray-900">{driver.totalAssignments}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Active</div>
                    <div className="text-xl font-bold text-blue-600">{driver.activeAssignments}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Upcoming</div>
                    <div className="text-xl font-bold text-orange-600">{driver.upcomingAssignments}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Completed</div>
                    <div className="text-xl font-bold text-green-600">{driver.completedAssignments}</div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[driver.status] || 'bg-gray-100 text-gray-800'}`}>
                    {driver.status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
              </div>
              
              {/* Expanded Driver Details */}
              {expandedDrivers[driver._id] && (
                <div className="mt-6 border-t pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Driver Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-gray-500">Rating:</span> {driver.rating || 0}/5</div>
                        <div><span className="text-gray-500">Total Deliveries:</span> {driver.totalDeliveries || 0}</div>
                        <div><span className="text-gray-500">Availability:</span> {driver.availability || 'offline'}</div>
                        {driver.vehicleInfo && (
                          <div><span className="text-gray-500">Vehicle:</span> {driver.vehicleInfo.type} - {driver.vehicleInfo.model}</div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Booking Assignments ({driver.assignments?.length || 0})</h4>
                      {driver.assignments && driver.assignments.length > 0 ? (
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {driver.assignments
                            .sort((a, b) => new Date(b.rentalPeriod?.startDate) - new Date(a.rentalPeriod?.startDate))
                            .map((assignment) => (
                            <div key={assignment._id} className="border rounded-md p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-medium text-sm text-blue-600">{assignment.bookingReference}</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${bookingStatusColors[assignment.status] || 'bg-gray-100 text-gray-800'}`}>
                                  {assignment.status?.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <User className="h-3 w-3 mr-1 text-gray-400" />
                                    <span className="font-medium">Client:</span>
                                    <span className="ml-1">{assignment.clientId?.firstName} {assignment.clientId?.lastName}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Car className="h-3 w-3 mr-1 text-gray-400" />
                                    <span className="font-medium">Vehicle:</span>
                                    <span className="ml-1">{assignment.vehicleId?.make} {assignment.vehicleId?.model}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                                    <span className="font-medium">Pickup:</span>
                                    <span className="ml-1 truncate">{assignment.pickupLocation?.city}</span>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                                    <span className="font-medium">Start:</span>
                                    <span className="ml-1">{formatDate(assignment.rentalPeriod?.startDate)}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                                    <span className="font-medium">End:</span>
                                    <span className="ml-1">{formatDate(assignment.rentalPeriod?.endDate)}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                    <span className="font-medium">Duration:</span>
                                    <span className="ml-1">{assignment.rentalPeriod?.totalDays || 0} days</span>
                                  </div>
                                </div>
                              </div>

                              {assignment.specialRequirements && (
                                <div className="mt-3 p-2 bg-yellow-50 rounded text-xs">
                                  <span className="font-medium text-yellow-800">Special Requirements:</span>
                                  <p className="text-yellow-700 mt-1">{assignment.specialRequirements}</p>
                                </div>
                              )}

                              <div className="mt-3 flex items-center justify-between">
                                <div className="text-xs text-gray-500">
                                  Driver Fee: {formatCurrency(assignment.driver?.driverFee)} | 
                                  Total: {formatCurrency(assignment.pricing?.totalAmount)}
                                </div>
                                <div className="flex space-x-2">
                                  {assignment.status !== 'completed' && assignment.status !== 'cancelled' && (
                                    <button
                                      onClick={() => handleUnassignDriver(assignment)}
                                      className="text-red-600 hover:text-red-800 text-xs p-1 rounded hover:bg-red-50"
                                      disabled={actionLoading}
                                      title="Unassign driver from this booking"
                                    >
                                      <UserMinus className="h-3 w-3" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => window.open(`/admin/bookings/${assignment._id}`, '_blank')}
                                    className="text-blue-600 hover:text-blue-800 text-xs p-1 rounded hover:bg-blue-50"
                                    title="View booking details"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-md text-center">
                          <User className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          No bookings assigned to this driver yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredDrivers.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500">
            {drivers.length === 0 ? 'No drivers found' : 'No drivers match your search criteria'}
          </div>
        </div>
      )}

      {/* Driver Assignment Modal */}
      {isAssignModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">
                Assign Driver to Booking
              </h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                disabled={actionLoading}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Reference
                </label>
                <p className="text-sm text-gray-600">{selectedBooking.bookingReference || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client
                </label>
                <p className="text-sm text-gray-600">
                  {selectedBooking.clientId?.firstName} {selectedBooking.clientId?.lastName}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle
                </label>
                <p className="text-sm text-gray-600">
                  {selectedBooking.vehicleId?.make} {selectedBooking.vehicleId?.model}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Driver
                </label>
                {drivers.length > 0 ? (
                  <select
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    disabled={actionLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="">Select a driver...</option>
                    {drivers.filter(d => d.status === 'approved').map(driver => (
                      <option key={driver._id} value={driver._id}>
                        {driver.fullName || 'Unknown'} - {driver.phone || 'No phone'} ({driver.totalAssignments} assignments)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
                    No approved drivers available.
                  </div>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitDriverAssignment}
                  disabled={!selectedDriver || actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Driver
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDriverSchedule;