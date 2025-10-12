import React, { useState, useEffect } from 'react';
import vehicleService from '../../Services/Vehicle-service';

function PendingVehicleApprovals() {
    const [pendingVehicles, setPendingVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [viewDetailsVehicle, setViewDetailsVehicle] = useState(null);
    const [pricing, setPricing] = useState({
        dailyRate: '',
        weeklyRate: '',
        monthlyRate: '',
        securityDeposit: '',
        processingFee: ''
    });

    useEffect(() => {
        loadPendingVehicles();
    }, []);

    const loadPendingVehicles = async () => {
        try {
            setLoading(true);
            const response = await vehicleService.getPendingVehicles();
            if (response.success) {
                setPendingVehicles(response.vehicles);
            }
        } catch (error) {
            console.error('Error loading pending vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (vehicleId) => {
        setSelectedVehicle(vehicleId);
        setShowPricingModal(true);
    };

    const handleReject = async (vehicleId, reason) => {
        const rejectionReason = reason || prompt('Please provide a reason for rejection:');
        if (!rejectionReason) return;

        try {
            const response = await vehicleService.rejectVehicle(vehicleId, rejectionReason);
            if (response.success) {
                alert('Vehicle rejected successfully');
                loadPendingVehicles();
            } else {
                alert(response.message || 'Failed to reject vehicle');
            }
        } catch (error) {
            console.error('Error rejecting vehicle:', error);
            alert('Error rejecting vehicle');
        }
    };

    const handleSubmitPricing = async () => {
        if (!pricing.dailyRate) {
            alert('Daily rate is required');
            return;
        }

        try {
            const response = await vehicleService.approveVehicle(selectedVehicle, pricing);
            if (response.success) {
                alert('Vehicle approved with pricing successfully');
                setShowPricingModal(false);
                setPricing({
                    dailyRate: '',
                    weeklyRate: '',
                    monthlyRate: '',
                    securityDeposit: '',
                    processingFee: ''
                });
                setSelectedVehicle(null);
                loadPendingVehicles();
            } else {
                alert(response.message || 'Failed to approve vehicle');
            }
        } catch (error) {
            console.error('Error approving vehicle:', error);
            alert('Error approving vehicle');
        }
    };

    const PricingModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
                    <h2 className="text-xl font-bold">Set Vehicle Pricing</h2>
                    <p className="text-green-100 mt-1">Set competitive rates for this vehicle</p>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Daily Rate (LKR) *</label>
                        <input
                            type="number"
                            value={pricing.dailyRate}
                            onChange={(e) => setPricing(prev => ({ ...prev, dailyRate: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="5000"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Rate (LKR)</label>
                        <input
                            type="number"
                            value={pricing.weeklyRate}
                            onChange={(e) => setPricing(prev => ({ ...prev, weeklyRate: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="30000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rate (LKR)</label>
                        <input
                            type="number"
                            value={pricing.monthlyRate}
                            onChange={(e) => setPricing(prev => ({ ...prev, monthlyRate: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="120000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit (LKR)</label>
                        <input
                            type="number"
                            value={pricing.securityDeposit}
                            onChange={(e) => setPricing(prev => ({ ...prev, securityDeposit: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="25000"
                        />
                    </div>
                </div>

                <div className="bg-gray-50 p-6 border-t rounded-b-2xl">
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowPricingModal(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmitPricing}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Approve & Set Pricing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-gray-500">Loading pending vehicles...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Pending Vehicle Approvals</h1>
                <p className="text-gray-600 mt-2">Review and approve new vehicle listings</p>
            </div>

            {pendingVehicles.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                    <p className="text-gray-600">No pending vehicles to review at this time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pendingVehicles.map((vehicle) => (
                        <div key={vehicle._id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="relative">
                                <div className="h-48 bg-gray-200 flex items-center justify-center">
                                    {vehicle.images && vehicle.images.length > 0 ? (
                                        <img
                                            src={vehicle.images[0]}
                                            alt={`${vehicle.make} ${vehicle.model}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <div className="text-4xl mb-2">🚗</div>
                                            <p className="text-sm">No Image</p>
                                        </div>
                                    )}
                                </div>

                                <div className="absolute top-3 right-3">
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                        Pending Review
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {vehicle.make} {vehicle.model} ({vehicle.year})
                                </h3>

                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    <div className="flex justify-between">
                                        <span>License Plate:</span>
                                        <span className="font-medium">{vehicle.licensePlate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Type:</span>
                                        <span className="capitalize">{vehicle.vehicleType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Seating:</span>
                                        <span>{vehicle.seatingCapacity} passengers</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Fuel:</span>
                                        <span className="capitalize">{vehicle.fuelType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Location:</span>
                                        <span>{vehicle.location?.city || 'Not specified'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Owner:</span>
                                        <span className="font-medium">{vehicle.ownerId?.firstName} {vehicle.ownerId?.lastName}</span>
                                    </div>
                                </div>

                                {vehicle.description && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                            {vehicle.description}
                                        </p>
                                    </div>
                                )}

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setViewDetailsVehicle(vehicle)}
                                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => handleApprove(vehicle._id)}
                                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Approve
                                    </button>

                                    <button
                                        onClick={() => handleReject(vehicle._id)}
                                        className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showPricingModal && <PricingModal />}

            {/* Vehicle Details Modal */}
            {viewDetailsVehicle && (
                <div className="fixed inset-0 bg-gradient-to-br from-gray-900/60 via-slate-900/60 to-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-100">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-bold">{viewDetailsVehicle.make} {viewDetailsVehicle.model}</h2>
                                    <p className="text-green-100 mt-1">{viewDetailsVehicle.year} • {viewDetailsVehicle.licensePlate}</p>
                                    <div className="mt-2">
                                        <span className="bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                                            Pending Review
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setViewDetailsVehicle(null)}
                                    className="text-white hover:text-green-200 transition-colors"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto max-h-[75vh]">
                            {/* Owner Information */}
                            <div className="p-6 border-b border-gray-200 bg-blue-50">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Owner Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                                        <div className="flex items-center mb-3">
                                            <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <h4 className="font-semibold text-gray-900">Owner Details</h4>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Name:</span>
                                                <span className="font-medium">{viewDetailsVehicle.ownerId?.firstName} {viewDetailsVehicle.ownerId?.lastName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Email:</span>
                                                <span className="font-medium">{viewDetailsVehicle.ownerId?.email}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Phone:</span>
                                                <span className="font-medium">{viewDetailsVehicle.ownerId?.phone || 'Not provided'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Registration Date:</span>
                                                <span className="font-medium">
                                                    {viewDetailsVehicle.ownerId?.createdAt ? new Date(viewDetailsVehicle.ownerId.createdAt).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                                        <div className="flex items-center mb-3">
                                            <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                            <h4 className="font-semibold text-gray-900">Submission Details</h4>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Submitted:</span>
                                                <span className="font-medium">
                                                    {new Date(viewDetailsVehicle.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Last Updated:</span>
                                                <span className="font-medium">
                                                    {new Date(viewDetailsVehicle.updatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className="font-medium text-yellow-600">Pending Review</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Vehicle ID:</span>
                                                <span className="font-medium text-xs">{viewDetailsVehicle._id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Images */}
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Documentation & Photos</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {viewDetailsVehicle.photos && viewDetailsVehicle.photos.length > 0 ? (
                                        viewDetailsVehicle.photos.map((photo, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={photo.url || photo}
                                                    alt={`${viewDetailsVehicle.make} ${viewDetailsVehicle.model} - ${photo.type || 'Photo'}`}
                                                    className="w-full h-48 object-cover rounded-lg shadow-md border border-gray-200"
                                                />
                                                {photo.type && (
                                                    <div className="absolute bottom-2 left-2">
                                                        <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs capitalize">
                                                            {photo.type.replace('-', ' ')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-3 h-48 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                            <div className="text-center text-gray-500">
                                                <div className="text-6xl mb-4">📷</div>
                                                <p className="text-lg">No Photos Submitted</p>
                                                <p className="text-sm">Owner needs to upload vehicle photos</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Vehicle Specifications */}
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Vehicle Specifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                        <div className="flex items-center mb-3">
                                            <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2-2h5.586a1 1 0 00.707-.293l5.414-5.414a1 1 0 01.707-.293H19M9 7h6m-6 4h6m-6 4h4" />
                                            </svg>
                                            <h4 className="font-semibold text-gray-900">Basic Information</h4>
                                        </div>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Make:</span>
                                                <span className="font-medium">{viewDetailsVehicle.make}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Model:</span>
                                                <span className="font-medium">{viewDetailsVehicle.model}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Year:</span>
                                                <span className="font-medium">{viewDetailsVehicle.year}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Type:</span>
                                                <span className="font-medium capitalize">{viewDetailsVehicle.vehicleType}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">License Plate:</span>
                                                <span className="font-medium">{viewDetailsVehicle.licensePlate}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                        <div className="flex items-center mb-3">
                                            <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <h4 className="font-semibold text-gray-900">Performance & Tech</h4>
                                        </div>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Engine:</span>
                                                <span className="font-medium">{viewDetailsVehicle.engineSize || 'Not specified'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Fuel Type:</span>
                                                <span className="font-medium capitalize">{viewDetailsVehicle.fuelType}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Transmission:</span>
                                                <span className="font-medium capitalize">{viewDetailsVehicle.transmission}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Mileage:</span>
                                                <span className="font-medium">{viewDetailsVehicle.mileage || 'Not specified'} km</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Air Conditioning:</span>
                                                <span className="font-medium">{viewDetailsVehicle.hasAirConditioning ? 'Yes' : 'No'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                        <div className="flex items-center mb-3">
                                            <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <h4 className="font-semibold text-gray-900">Capacity & Design</h4>
                                        </div>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Seating:</span>
                                                <span className="font-medium">{viewDetailsVehicle.seatingCapacity} passengers</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Doors:</span>
                                                <span className="font-medium">{viewDetailsVehicle.numberOfDoors || 'Not specified'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Color:</span>
                                                <span className="font-medium capitalize">{viewDetailsVehicle.color || 'Not specified'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Condition:</span>
                                                <span className="font-medium capitalize">{viewDetailsVehicle.condition || 'Not specified'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location & Description */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Location */}
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Location Information</h3>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div className="flex items-start">
                                                <svg className="w-5 h-5 text-red-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {viewDetailsVehicle.location?.city || 'Not specified'}, {viewDetailsVehicle.location?.district || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {viewDetailsVehicle.location?.address || 'Full address not provided'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            {viewDetailsVehicle.description ? (
                                                <p className="text-gray-700 text-sm leading-relaxed">{viewDetailsVehicle.description}</p>
                                            ) : (
                                                <p className="text-gray-500 text-sm italic">No description provided by the owner</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Features & Equipment */}
                            {viewDetailsVehicle.features && viewDetailsVehicle.features.length > 0 && (
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Features & Equipment</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {viewDetailsVehicle.features.map((feature, index) => (
                                            <div key={index} className="flex items-center bg-green-50 p-3 rounded-lg border border-green-200">
                                                <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span className="text-sm font-medium text-gray-900 capitalize">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Documentation Status */}
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Documentation Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                        <h4 className="font-medium text-red-900 mb-3">Required Documentation</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-red-700">Registration Papers</span>
                                                <span className="text-red-600 font-medium">⚠️ Verify Required</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-red-700">Insurance Certificate</span>
                                                <span className="text-red-600 font-medium">⚠️ Verify Required</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-red-700">Owner's License</span>
                                                <span className="text-red-600 font-medium">⚠️ Verify Required</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-red-700">Vehicle Inspection</span>
                                                <span className="text-red-600 font-medium">⚠️ Verify Required</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                        <h4 className="font-medium text-yellow-900 mb-3">Review Checklist</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center">
                                                <input type="checkbox" className="mr-2 text-yellow-600" />
                                                <span className="text-yellow-700">Verify vehicle photos quality</span>
                                            </div>
                                            <div className="flex items-center">
                                                <input type="checkbox" className="mr-2 text-yellow-600" />
                                                <span className="text-yellow-700">Check documentation completeness</span>
                                            </div>
                                            <div className="flex items-center">
                                                <input type="checkbox" className="mr-2 text-yellow-600" />
                                                <span className="text-yellow-700">Validate owner information</span>
                                            </div>
                                            <div className="flex items-center">
                                                <input type="checkbox" className="mr-2 text-yellow-600" />
                                                <span className="text-yellow-700">Review vehicle specifications</span>
                                            </div>
                                            <div className="flex items-center">
                                                <input type="checkbox" className="mr-2 text-yellow-600" />
                                                <span className="text-yellow-700">Set appropriate pricing</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-gray-50 p-6 border-t flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                <p><strong>Submitted:</strong> {new Date(viewDetailsVehicle.createdAt).toLocaleDateString()}</p>
                                <p><strong>Owner:</strong> {viewDetailsVehicle.ownerId?.firstName} {viewDetailsVehicle.ownerId?.lastName}</p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setViewDetailsVehicle(null)}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        handleReject(viewDetailsVehicle._id);
                                        setViewDetailsVehicle(null);
                                    }}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Reject Vehicle
                                </button>
                                <button
                                    onClick={() => {
                                        handleApprove(viewDetailsVehicle._id);
                                        setViewDetailsVehicle(null);
                                    }}
                                    className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    Approve & Set Pricing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PendingVehicleApprovals;
