import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import vehicleService from '../../Services/vehicle-service.js';
import MaintenanceScheduler from './MaintenanceScheduler';
import AddVehicleModal from './AddVehicleModal';

function MyVehicles() {
    const { user, getCurrentUserId } = useAuth();
    const userId = getCurrentUserId();

    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddVehicle, setShowAddVehicle] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [showMaintenanceScheduler, setShowMaintenanceScheduler] = useState(false);
    const [maintenanceVehicleId, setMaintenanceVehicleId] = useState(null);

    // Load vehicles on component mount
    useEffect(() => {
        loadVehicles();
    }, [userId]);

    const loadVehicles = async () => {
        try {
            setLoading(true);
            const response = await vehicleService.getVehiclesByOwner(userId);
            if (response.success) {
                setVehicles(response.vehicles);
            }
        } catch (error) {
            console.error('Error loading vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredVehicles = vehicles.filter(vehicle => {
        if (activeTab === 'all') return true;
        return vehicle.status === activeTab;
    });

    const getStatusCount = (status) => {
        if (status === 'all') return vehicles.length;
        return vehicles.filter(v => v.status === status).length;
    };

    const renderVehicleCard = (vehicle) => {
        const formattedVehicle = vehicleService.formatVehicleForDisplay(vehicle);

        return (
            <div key={vehicle._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                    {/* Vehicle Image */}
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                        {formattedVehicle.primaryImage ? (
                            <img
                                src={formattedVehicle.primaryImage}
                                alt={formattedVehicle.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-center text-gray-500">
                                <div className="text-4xl mb-2">{vehicleService.getVehicleTypeIcon(vehicle.vehicleType)}</div>
                                <p className="text-sm">No Image</p>
                            </div>
                        )}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${vehicleService.getStatusBadgeColor(vehicle.status)}`}>
                            {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                        </span>
                    </div>
                </div>

                <div className="p-6">
                    {/* Vehicle Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {formattedVehicle.title}
                    </h3>

                    {/* Vehicle Details */}
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex justify-between">
                            <span>License Plate:</span>
                            <span className="font-medium">{vehicle.licensePlate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Seating:</span>
                            <span>{vehicle.seatingCapacity} passengers</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Fuel Type:</span>
                            <span className="capitalize">{vehicle.fuelType}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Transmission:</span>
                            <span className="capitalize">{vehicle.transmission}</span>
                        </div>
                        {vehicle.status === 'available' && (
                            <div className="flex justify-between font-semibold text-green-600">
                                <span>Daily Rate:</span>
                                <span>LKR {formattedVehicle.dailyRate}</span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setSelectedVehicle(vehicle)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            View Details
                        </button>

                        {vehicle.status === 'available' && (
                            <button
                                onClick={() => {
                                    setMaintenanceVehicleId(vehicle._id);
                                    setShowMaintenanceScheduler(true);
                                }}
                                className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                Schedule Maintenance
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Vehicles</h1>
                    <p className="text-gray-600 mt-1">Manage your vehicle fleet and rental listings</p>
                </div>
                <button
                    onClick={() => setShowAddVehicle(true)}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Add New Vehicle
                </button>
            </div>

            {/* Status Tabs */}
            <div className="flex space-x-6 mb-8 border-b border-gray-200">
                {[
                    { key: 'all', label: 'All Vehicles' },
                    { key: 'pending', label: 'Pending Approval' },
                    { key: 'available', label: 'Available' },
                    { key: 'rented', label: 'Currently Rented' },
                    { key: 'maintenance', label: 'Under Maintenance' }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`pb-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.key
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.label} ({getStatusCount(tab.key)})
                    </button>
                ))}
            </div>

            {/* Vehicles Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🚗</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No vehicles found</h3>
                    <p className="text-gray-600 mb-6">
                        {activeTab === 'all'
                            ? "You haven't added any vehicles yet. Add your first vehicle to start earning!"
                            : `No vehicles in ${activeTab} status.`
                        }
                    </p>
                    {activeTab === 'all' && (
                        <button
                            onClick={() => setShowAddVehicle(true)}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add Your First Vehicle
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.map(renderVehicleCard)}
                </div>
            )}

            {/* Add Vehicle Modal */}
            <AddVehicleModal
                isOpen={showAddVehicle}
                onClose={() => setShowAddVehicle(false)}
                onSuccess={loadVehicles}
                userId={userId}
            />

            {/* Vehicle Details Modal */}
            {selectedVehicle && (
                <div className="fixed inset-0 bg-gradient-to-br from-gray-900/60 via-slate-900/60 to-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-100">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-bold">{selectedVehicle.make} {selectedVehicle.model}</h2>
                                    <p className="text-blue-100 mt-1">{selectedVehicle.year} • {selectedVehicle.licensePlate}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedVehicle(null)}
                                    className="text-white hover:text-blue-200 transition-colors"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Status Badge */}
                            <div className="mt-4">
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${vehicleService.getStatusBadgeColor(selectedVehicle.status)}`}>
                                    {selectedVehicle.status.charAt(0).toUpperCase() + selectedVehicle.status.slice(1)}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto max-h-[75vh]">
                            {/* Vehicle Images */}
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Photos</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedVehicle.images && selectedVehicle.images.length > 0 ? (
                                        selectedVehicle.images.map((image, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={image.url}
                                                    alt={`${selectedVehicle.make} ${selectedVehicle.model} - ${image.description || 'Photo'}`}
                                                    className="w-full h-64 object-cover rounded-lg shadow-md"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                                {image.description && (
                                                    <div className="absolute bottom-2 left-2">
                                                        <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs capitalize">
                                                            {image.description}
                                                        </span>
                                                    </div>
                                                )}
                                                {image.isPrimary && (
                                                    <div className="absolute top-2 right-2">
                                                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                                                            Primary
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <div className="text-center text-gray-500">
                                                <div className="text-6xl mb-4">{vehicleService.getVehicleTypeIcon(selectedVehicle.vehicleType)}</div>
                                                <p className="text-lg">No Photos Available</p>
                                                <p className="text-sm">Upload photos to showcase your vehicle</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Vehicle Specifications */}
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center mb-2">
                                            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                            <h4 className="font-semibold text-gray-900">Basic Info</h4>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Make:</span>
                                                <span className="font-medium">{selectedVehicle.make}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Model:</span>
                                                <span className="font-medium">{selectedVehicle.model}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Year:</span>
                                                <span className="font-medium">{selectedVehicle.year}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Type:</span>
                                                <span className="font-medium capitalize">{selectedVehicle.vehicleType}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center mb-2">
                                            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <h4 className="font-semibold text-gray-900">Engine & Transmission</h4>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Fuel Type:</span>
                                                <span className="font-medium capitalize">{selectedVehicle.fuelType}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Transmission:</span>
                                                <span className="font-medium capitalize">{selectedVehicle.transmission}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center mb-2">
                                            <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <h4 className="font-semibold text-gray-900">Capacity</h4>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Seating:</span>
                                                <span className="font-medium">{selectedVehicle.seatingCapacity} passengers</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Information */}
                            {selectedVehicle.rentalPrice && (
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Pricing Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {selectedVehicle.rentalPrice.dailyRate && (
                                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-green-700">LKR {selectedVehicle.rentalPrice.dailyRate}</div>
                                                    <div className="text-sm text-green-600 font-medium">Per Day</div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedVehicle.rentalPrice.weeklyRate && (
                                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-blue-700">LKR {selectedVehicle.rentalPrice.weeklyRate}</div>
                                                    <div className="text-sm text-blue-600 font-medium">Per Week</div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedVehicle.rentalPrice.monthlyRate && (
                                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-purple-700">LKR {selectedVehicle.rentalPrice.monthlyRate}</div>
                                                    <div className="text-sm text-purple-600 font-medium">Per Month</div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedVehicle.rentalPrice.securityDeposit && (
                                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-orange-700">LKR {selectedVehicle.rentalPrice.securityDeposit}</div>
                                                    <div className="text-sm text-orange-600 font-medium">Security Deposit</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Location Information */}
                            {selectedVehicle.location && (
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Location</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-start">
                                            <svg className="w-5 h-5 text-red-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {selectedVehicle.location.city}, {selectedVehicle.location.district}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {selectedVehicle.location.address}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Features & Equipment */}
                            {selectedVehicle.features && selectedVehicle.features.length > 0 && (
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Features & Equipment</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {selectedVehicle.features.map((feature, index) => (
                                            <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg">
                                                <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span className="text-sm font-medium text-gray-900 capitalize">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Additional Information */}
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Registration & Documentation</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">License Plate:</span>
                                                <span className="font-medium">{selectedVehicle.licensePlate}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Registration:</span>
                                                <span className={`font-medium ${selectedVehicle.documents?.registration?.url ? "text-green-600" : "text-red-600"}`}>
                                                    {selectedVehicle.documents?.registration?.url ? "✅ Uploaded" : "❌ Missing"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Insurance:</span>
                                                <span className={`font-medium ${selectedVehicle.documents?.insurance?.url ? "text-green-600" : "text-red-600"}`}>
                                                    {selectedVehicle.documents?.insurance?.url ? "✅ Uploaded" : "❌ Missing"}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Document Links */}
                                        {(selectedVehicle.documents?.registration?.url || 
                                          selectedVehicle.documents?.insurance?.url || 
                                          selectedVehicle.documents?.emissionTest?.url) && (
                                            <div className="mt-3 pt-2 border-t border-gray-200">
                                                <h5 className="text-sm font-medium text-gray-700 mb-2">View Documents:</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedVehicle.documents?.registration?.url && (
                                                        <a 
                                                            href={selectedVehicle.documents.registration.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                                                        >
                                                            📄 Registration
                                                        </a>
                                                    )}
                                                    {selectedVehicle.documents?.insurance?.url && (
                                                        <a 
                                                            href={selectedVehicle.documents.insurance.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                                                        >
                                                            🛡️ Insurance
                                                        </a>
                                                    )}
                                                    {selectedVehicle.documents?.emissionTest?.url && (
                                                        <a 
                                                            href={selectedVehicle.documents.emissionTest.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                                                        >
                                                            🔍 Inspection
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Listing Details</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Created:</span>
                                                <span className="font-medium">
                                                    {new Date(selectedVehicle.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Last Updated:</span>
                                                <span className="font-medium">
                                                    {new Date(selectedVehicle.updatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Vehicle ID:</span>
                                                <span className="font-medium text-xs">{selectedVehicle._id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-gray-50 p-6 border-t flex justify-between items-center">
                            <div className="flex space-x-3">
                                {selectedVehicle.status === 'available' && (
                                    <button
                                        onClick={() => {
                                            setMaintenanceVehicleId(selectedVehicle._id);
                                            setShowMaintenanceScheduler(true);
                                            setSelectedVehicle(null);
                                        }}
                                        className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                                    >
                                        Schedule Maintenance
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Maintenance Scheduler Modal */}
            {showMaintenanceScheduler && (
                <MaintenanceScheduler
                    vehicleId={maintenanceVehicleId}
                    onClose={() => {
                        setShowMaintenanceScheduler(false);
                        setMaintenanceVehicleId(null);
                        loadVehicles(); // Reload vehicles to reflect any status changes
                    }}
                />
            )}
        </div>
    );
}

export default MyVehicles;
