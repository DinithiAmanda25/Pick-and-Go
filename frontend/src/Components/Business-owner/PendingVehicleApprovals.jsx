import React, { useState, useEffect } from 'react';
import businessOwnerService from '../../Services/business-owner-service.js';

function PendingVehicleApprovals() {
    const [pendingVehicles, setPendingVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewDetailsVehicle, setViewDetailsVehicle] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedVehicleForReject, setSelectedVehicleForReject] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processingAction, setProcessingAction] = useState(null);

    useEffect(() => {
        loadPendingVehicles();
    }, []);

    const loadPendingVehicles = async () => {
        try {
            setLoading(true);
            const response = await businessOwnerService.getPendingVehicleApplications();
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
        if (processingAction) return; // Prevent double clicks
        
        setProcessingAction('approving');
        try {
            const response = await businessOwnerService.reviewVehicleApplication(vehicleId, 'approved', {
                approvalNotes: 'Vehicle approved by business owner'
            });
            if (response.success) {
                // Show success message
                const vehicleName = pendingVehicles.find(v => v._id === vehicleId);
                alert(`✅ ${vehicleName?.make} ${vehicleName?.model} approved successfully!`);
                loadPendingVehicles();
            } else {
                alert(response.message || 'Failed to approve vehicle');
            }
        } catch (error) {
            console.error('Error approving vehicle:', error);
            alert('Error approving vehicle');
        } finally {
            setProcessingAction(null);
        }
    };

    const handleReject = (vehicleId) => {
        setSelectedVehicleForReject(vehicleId);
        setShowRejectModal(true);
        setRejectionReason('');
    };

    const submitRejection = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        if (processingAction) return; // Prevent double clicks
        
        setProcessingAction('rejecting');
        try {
            const response = await businessOwnerService.reviewVehicleApplication(selectedVehicleForReject, 'rejected', {
                rejectionReason: rejectionReason.trim()
            });
            if (response.success) {
                // Show success message
                const vehicleName = pendingVehicles.find(v => v._id === selectedVehicleForReject);
                alert(`❌ ${vehicleName?.make} ${vehicleName?.model} rejected successfully!`);
                setShowRejectModal(false);
                setSelectedVehicleForReject(null);
                setRejectionReason('');
                loadPendingVehicles();
            } else {
                alert(response.message || 'Failed to reject vehicle');
            }
        } catch (error) {
            console.error('Error rejecting vehicle:', error);
            alert('Error rejecting vehicle');
        } finally {
            setProcessingAction(null);
        }
    };

    // Modern Rejection Reason Modal
    const RejectModal = () => (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900/60 via-slate-900/60 to-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100">
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center">
                        <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.76 0L3.054 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                            <h2 className="text-xl font-bold">Reject Vehicle Application</h2>
                            <p className="text-red-100 mt-1">Please provide a reason for rejection</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Rejection *
                        </label>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                            rows="4"
                            placeholder="Please provide a clear reason for rejecting this vehicle application..."
                            maxLength="500"
                        />
                        <div className="text-right text-xs text-gray-500 mt-1">
                            {rejectionReason.length}/500 characters
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-amber-800">
                                <p className="font-medium">Note:</p>
                                <p>The vehicle owner will receive an email with your rejection reason. Please be professional and constructive.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 border-t rounded-b-2xl">
                    <div className="flex space-x-3">
                        <button
                            onClick={() => {
                                setShowRejectModal(false);
                                setSelectedVehicleForReject(null);
                                setRejectionReason('');
                            }}
                            disabled={processingAction === 'rejecting'}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submitRejection}
                            disabled={!rejectionReason.trim() || processingAction === 'rejecting'}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processingAction === 'rejecting' ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Rejecting...
                                </div>
                            ) : (
                                'Reject Vehicle'
                            )}
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
                                            src={vehicle.images[0].url || vehicle.images[0]}
                                            alt={`${vehicle.make} ${vehicle.model}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'block';
                                            }}
                                        />
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <div className="text-4xl mb-2">🚗</div>
                                            <p className="text-sm">No Image</p>
                                        </div>
                                    )}
                                    {/* Fallback for broken images */}
                                    <div className="text-center text-gray-500" style={{display: 'none'}}>
                                        <div className="text-4xl mb-2">🚗</div>
                                        <p className="text-sm">Image Not Available</p>
                                    </div>
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

                                {/* Document Status Summary */}
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-800 mb-2">Documentation Status</h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span>Registration:</span>
                                            <span className={vehicle.documents?.registration?.url ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                                {vehicle.documents?.registration?.url ? "✅" : "❌"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Insurance:</span>
                                            <span className={vehicle.documents?.insurance?.url ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                                {vehicle.documents?.insurance?.url ? "✅" : "❌"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Inspection:</span>
                                            <span className={vehicle.documents?.emissionTest?.url ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                                {vehicle.documents?.emissionTest?.url ? "✅" : "❌"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Photos:</span>
                                            <span className={vehicle.images?.length > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                                {vehicle.images?.length > 0 ? `✅ (${vehicle.images.length})` : "❌"}
                                            </span>
                                        </div>
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
                                        disabled={processingAction === 'approving'}
                                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        {processingAction === 'approving' ? 'Approving...' : 'Approve'}
                                    </button>

                                    <button
                                        onClick={() => handleReject(vehicle._id)}
                                        disabled={processingAction === 'rejecting'}
                                        className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showRejectModal && <RejectModal />}

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
                                    {viewDetailsVehicle.images && viewDetailsVehicle.images.length > 0 ? (
                                        viewDetailsVehicle.images.map((image, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={image.url || image}
                                                    alt={`${viewDetailsVehicle.make} ${viewDetailsVehicle.model} - ${image.description || 'Photo'}`}
                                                    className="w-full h-48 object-cover rounded-lg shadow-md border border-gray-200"
                                                    onError={(e) => {
                                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOUM5Q0E0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
                                                    }}
                                                />
                                                {image.description && (
                                                    <div className="absolute bottom-2 left-2">
                                                        <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs capitalize">
                                                            {image.description}
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
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="font-medium text-gray-900 mb-3">Required Documentation</h4>
                                        <div className="space-y-2 text-sm">
                                            {/* Registration Papers */}
                                            <div className="flex items-center justify-between">
                                                <span className={viewDetailsVehicle.documents?.registration?.url ? "text-green-700" : "text-red-700"}>
                                                    Registration Papers
                                                </span>
                                                <span className={`font-medium ${viewDetailsVehicle.documents?.registration?.url ? "text-green-600" : "text-red-600"}`}>
                                                    {viewDetailsVehicle.documents?.registration?.url ? "✅ Uploaded" : "❌ Missing"}
                                                </span>
                                            </div>
                                            
                                            {/* Insurance Certificate */}
                                            <div className="flex items-center justify-between">
                                                <span className={viewDetailsVehicle.documents?.insurance?.url ? "text-green-700" : "text-red-700"}>
                                                    Insurance Certificate
                                                </span>
                                                <span className={`font-medium ${viewDetailsVehicle.documents?.insurance?.url ? "text-green-600" : "text-red-600"}`}>
                                                    {viewDetailsVehicle.documents?.insurance?.url ? "✅ Uploaded" : "❌ Missing"}
                                                </span>
                                            </div>
                                            
                                            {/* Emission Test / Vehicle Inspection */}
                                            <div className="flex items-center justify-between">
                                                <span className={viewDetailsVehicle.documents?.emissionTest?.url ? "text-green-700" : "text-red-700"}>
                                                    Vehicle Inspection
                                                </span>
                                                <span className={`font-medium ${viewDetailsVehicle.documents?.emissionTest?.url ? "text-green-600" : "text-red-600"}`}>
                                                    {viewDetailsVehicle.documents?.emissionTest?.url ? "✅ Uploaded" : "❌ Missing"}
                                                </span>
                                            </div>
                                            
                                            {/* Owner Information Status */}
                                            <div className="flex items-center justify-between">
                                                <span className={viewDetailsVehicle.ownerId?.firstName ? "text-green-700" : "text-red-700"}>
                                                    Owner Information
                                                </span>
                                                <span className={`font-medium ${viewDetailsVehicle.ownerId?.firstName ? "text-green-600" : "text-red-600"}`}>
                                                    {viewDetailsVehicle.ownerId?.firstName ? "✅ Complete" : "❌ Incomplete"}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Document Links for Review */}
                                        {(viewDetailsVehicle.documents?.registration?.url || 
                                          viewDetailsVehicle.documents?.insurance?.url || 
                                          viewDetailsVehicle.documents?.emissionTest?.url) && (
                                            <div className="mt-4 pt-3 border-t border-gray-200">
                                                <h5 className="text-sm font-medium text-gray-800 mb-2">View Documents:</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {viewDetailsVehicle.documents?.registration?.url && (
                                                        <a 
                                                            href={viewDetailsVehicle.documents.registration.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                                                        >
                                                            📄 Registration
                                                        </a>
                                                    )}
                                                    {viewDetailsVehicle.documents?.insurance?.url && (
                                                        <a 
                                                            href={viewDetailsVehicle.documents.insurance.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                                                        >
                                                            🛡️ Insurance
                                                        </a>
                                                    )}
                                                    {viewDetailsVehicle.documents?.emissionTest?.url && (
                                                        <a 
                                                            href={viewDetailsVehicle.documents.emissionTest.url} 
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
                                    disabled={processingAction === 'approving'}
                                    className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                                >
                                    {processingAction === 'approving' ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Approving...
                                        </div>
                                    ) : (
                                        'Approve Vehicle'
                                    )}
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
