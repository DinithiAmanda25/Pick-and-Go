import React, { useState, useEffect } from 'react'
import businessOwnerService from '../../Services/business-owner-service'

function PendingDriverApplications() {
    const [pendingDrivers, setPendingDrivers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedDriver, setSelectedDriver] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        fetchPendingDrivers()
    }, [])

    const fetchPendingDrivers = async () => {
        try {
            setLoading(true)
            const response = await businessOwnerService.getPendingDriverApplications()
            if (response.success) {
                setPendingDrivers(response.drivers || [])
            } else {
                setError(response.message || 'Failed to fetch pending applications')
            }
        } catch (error) {
            console.error('Error fetching pending drivers:', error)
            setError('Failed to load pending applications')
        } finally {
            setLoading(false)
        }
    }

    const handleViewApplication = (driver) => {
        console.log('🔍 Viewing driver application:', driver)
        console.log('📄 Documents structure:', driver.documents)
        setSelectedDriver(driver)
        setShowModal(true)
    }

    const handleApproveReject = async (driverId, status) => {
        console.log('🔄 handleApproveReject called with:', { driverId, status })

        if (!window.confirm(`Are you sure you want to ${status} this driver application?`)) {
            console.log('❌ User cancelled confirmation dialog')
            return
        }

        try {
            setProcessing(true)
            console.log('⏳ Processing started')

            // Generate a new password for approved drivers
            let newPassword = null
            if (status === 'approved') {
                newPassword = `PnG${Math.random().toString(36).slice(-8).toUpperCase()}`
                console.log('🔑 Generated password for approved driver:', newPassword)
            }

            console.log('📡 Calling reviewDriverApplication with:', { driverId, status, newPassword })
            const response = await businessOwnerService.reviewDriverApplication(driverId, status, newPassword)
            console.log('📥 Response received:', response)

            if (response.success) {
                console.log('✅ Operation successful, refreshing list')
                // Refresh the list
                await fetchPendingDrivers()
                setShowModal(false)
                setSelectedDriver(null)

                if (status === 'approved') {
                    alert(`Driver approved successfully! Login credentials have been sent to the driver's email.`)
                } else {
                    alert('Driver application rejected successfully.')
                }
            } else {
                console.error('❌ Operation failed:', response.message)
                alert(response.message || `Failed to ${status} driver`)
            }
        } catch (error) {
            console.error(`💥 Error ${status} driver:`, error)
            alert(`Failed to ${status} driver. Please try again.`)
        } finally {
            setProcessing(false)
            console.log('✅ Processing finished')
        }
    }

    // Format date helper function
    const formatDate = (dateString) => {
        if (!dateString) return 'Date not available';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    }
    
    // Helper function to format document URLs
    const formatDocumentUrl = (document) => {
        if (!document || !document.url) return null;
        
        // If the URL already contains http or https, return as is
        if (document.url.startsWith('http://') || document.url.startsWith('https://')) {
            return document.url;
        }
        
        // For relative paths, prepend the API base URL
        // Assuming you use HTTP_API_URL from your config or env settings
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        if (document.url.startsWith('/')) {
            return `${baseUrl}${document.url}`;
        } else {
            return `${baseUrl}/${document.url}`;
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-600">Loading pending applications...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={fetchPendingDrivers}
                    className="mt-2 text-red-800 hover:text-red-900 font-medium"
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-purple-900">Pending Driver Applications</h2>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={fetchPendingDrivers}
                            className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50"
                            title="Refresh"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <span className="text-sm text-gray-600">{pendingDrivers.length} pending</span>
                    </div>
                </div>

                {pendingDrivers.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No pending applications</h3>
                        <p className="mt-1 text-sm text-gray-500">All driver applications have been processed.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver Information</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pendingDrivers.map((driver) => (
                                    <tr key={driver._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <span className="text-purple-600 font-medium">
                                                        {driver.fullName?.charAt(0) || 'D'}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900">{driver.fullName}</div>
                                                    <div className="text-sm text-gray-500">ID: {driver.driverId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{driver.email}</div>
                                            <div className="text-sm text-gray-500">{driver.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center mb-1">
                                                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    !driver.documents ? 'bg-red-100 text-red-800' :
                                                    Object.keys(driver.documents).length >= 3 ? 'bg-green-100 text-green-800' : 
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {driver.documents && Object.keys(driver.documents).filter(key => driver.documents[key]).length > 0 ? (
                                                        <span className="flex items-center">
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {Object.keys(driver.documents).filter(key => driver.documents[key]).length} document(s)
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center">
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                            No documents
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {driver.vehicleInfo?.type ? driver.vehicleInfo.type : 'Not specified'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(driver.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleViewApplication(driver)}
                                                className="text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded transition-colors"
                                            >
                                                Review
                                            </button>
                                            <button
                                                onClick={() => handleApproveReject(driver._id, 'approved')}
                                                className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition-colors"
                                                disabled={processing}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleApproveReject(driver._id, 'rejected')}
                                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                                                disabled={processing}
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modern Driver Review Modal */}
            {showModal && selectedDriver && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 w-full max-w-2xl transform transition-all duration-300 scale-100">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">
                                        {selectedDriver.fullName?.charAt(0) || 'D'}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedDriver.fullName}</h3>
                                    <p className="text-sm text-gray-500">Driver ID: {selectedDriver.driverId}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                            >
                                <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content - Only relevant information */}
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Personal Information */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center border-b pb-2">
                                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Contact Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                                            <p className="font-medium text-gray-900">{selectedDriver.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                                            <p className="font-medium text-gray-900">{selectedDriver.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address Information - If available */}
                            {selectedDriver.address && (
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center border-b pb-2">
                                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Address
                                    </h4>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-gray-900">
                                            {selectedDriver.address.street && `${selectedDriver.address.street}, `}
                                            {selectedDriver.address.city && `${selectedDriver.address.city}, `}
                                            {selectedDriver.address.state && `${selectedDriver.address.state}, `}
                                            {selectedDriver.address.zipCode && `${selectedDriver.address.zipCode}, `}
                                            {selectedDriver.address.country && selectedDriver.address.country}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Vehicle Information */}
                            {selectedDriver.vehicleInfo && (
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center border-b pb-2">
                                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0" />
                                        </svg>
                                        Vehicle Information
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Vehicle Type</p>
                                            <p className="font-medium text-gray-900 capitalize">{selectedDriver.vehicleInfo.type}</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Model</p>
                                            <p className="font-medium text-gray-900">{selectedDriver.vehicleInfo.model}</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Plate Number</p>
                                            <p className="font-medium text-gray-900">{selectedDriver.vehicleInfo.plateNumber}</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Color</p>
                                            <p className="font-medium text-gray-900">{selectedDriver.vehicleInfo.color}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Documents */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center border-b pb-2">
                                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Required Documents
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* License Document */}
                                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <h5 className="font-semibold text-purple-900 flex items-center">
                                                <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                                                </svg>
                                                Driver's License
                                            </h5>
                                            <span className={`px-2 py-1 text-xs rounded-full ${selectedDriver.documents?.license ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {selectedDriver.documents?.license ? 'Uploaded' : 'Missing'}
                                            </span>
                                        </div>
                                        {selectedDriver.documents?.license ? (
                                            <>
                                                <div className="bg-gray-50 rounded-lg p-2 mb-2 flex justify-center">
                                                    {formatDocumentUrl(selectedDriver.documents.license) ? (
                                                        <img 
                                                            src={formatDocumentUrl(selectedDriver.documents.license)} 
                                                            alt="Driver's License" 
                                                            className="max-h-32 object-contain rounded"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "https://via.placeholder.com/200x150?text=Image+Not+Available";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="h-32 w-full flex items-center justify-center bg-gray-100 rounded">
                                                            <p className="text-gray-400">Image not available</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs text-gray-500">
                                                        {selectedDriver.documents.license.uploadedAt ? 
                                                            `Uploaded: ${new Date(selectedDriver.documents.license.uploadedAt).toLocaleDateString()}` : 
                                                            'Recently uploaded'}
                                                    </p>
                                                    {formatDocumentUrl(selectedDriver.documents.license) && (
                                                        <a href={formatDocumentUrl(selectedDriver.documents.license)} target="_blank" rel="noopener noreferrer" 
                                                            className="text-xs text-blue-600 hover:text-blue-800">
                                                            View Full Image
                                                        </a>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="bg-red-50 rounded-lg p-4 text-center">
                                                <p className="text-sm text-red-700">Document not uploaded</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Identity Card Document */}
                                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <h5 className="font-semibold text-purple-900 flex items-center">
                                                <svg className="w-4 h-4 mr-1 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                                                </svg>
                                                Identity Card
                                            </h5>
                                            <span className={`px-2 py-1 text-xs rounded-full ${selectedDriver.documents?.identityCard ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {selectedDriver.documents?.identityCard ? 'Uploaded' : 'Missing'}
                                            </span>
                                        </div>
                                        {selectedDriver.documents?.identityCard ? (
                                            <>
                                                <div className="bg-gray-50 rounded-lg p-2 mb-2 flex justify-center">
                                                    {formatDocumentUrl(selectedDriver.documents.identityCard) ? (
                                                        <img 
                                                            src={formatDocumentUrl(selectedDriver.documents.identityCard)} 
                                                            alt="Identity Card" 
                                                            className="max-h-32 object-contain rounded"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "https://via.placeholder.com/200x150?text=Image+Not+Available";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="h-32 w-full flex items-center justify-center bg-gray-100 rounded">
                                                            <p className="text-gray-400">Image not available</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs text-gray-500">
                                                        {selectedDriver.documents.identityCard.uploadedAt ? 
                                                            `Uploaded: ${new Date(selectedDriver.documents.identityCard.uploadedAt).toLocaleDateString()}` : 
                                                            'Recently uploaded'}
                                                    </p>
                                                    {formatDocumentUrl(selectedDriver.documents.identityCard) && (
                                                        <a href={formatDocumentUrl(selectedDriver.documents.identityCard)} target="_blank" rel="noopener noreferrer" 
                                                            className="text-xs text-blue-600 hover:text-blue-800">
                                                            View Full Image
                                                        </a>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="bg-red-50 rounded-lg p-4 text-center">
                                                <p className="text-sm text-red-700">Document not uploaded</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Insurance Document */}
                                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <h5 className="font-semibold text-purple-900 flex items-center">
                                                <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                                Insurance Document
                                            </h5>
                                            <span className={`px-2 py-1 text-xs rounded-full ${selectedDriver.documents?.insurance ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {selectedDriver.documents?.insurance ? 'Uploaded' : 'Missing'}
                                            </span>
                                        </div>
                                        {selectedDriver.documents?.insurance ? (
                                            <>
                                                <div className="bg-gray-50 rounded-lg p-2 mb-2 flex justify-center">
                                                    {formatDocumentUrl(selectedDriver.documents.insurance) ? (
                                                        <img 
                                                            src={formatDocumentUrl(selectedDriver.documents.insurance)} 
                                                            alt="Insurance Document" 
                                                            className="max-h-32 object-contain rounded"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "https://via.placeholder.com/200x150?text=Image+Not+Available";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="h-32 w-full flex items-center justify-center bg-gray-100 rounded">
                                                            <p className="text-gray-400">Image not available</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs text-gray-500">
                                                        {selectedDriver.documents.insurance.uploadedAt ? 
                                                            `Uploaded: ${new Date(selectedDriver.documents.insurance.uploadedAt).toLocaleDateString()}` : 
                                                            'Recently uploaded'}
                                                    </p>
                                                    {formatDocumentUrl(selectedDriver.documents.insurance) && (
                                                        <a href={formatDocumentUrl(selectedDriver.documents.insurance)} target="_blank" rel="noopener noreferrer" 
                                                            className="text-xs text-blue-600 hover:text-blue-800">
                                                            View Full Image
                                                        </a>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="bg-red-50 rounded-lg p-4 text-center">
                                                <p className="text-sm text-red-700">Document not uploaded</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Medical Certificate Document */}
                                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <h5 className="font-semibold text-purple-900 flex items-center">
                                                <svg className="w-4 h-4 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                Medical Certificate
                                            </h5>
                                            <span className={`px-2 py-1 text-xs rounded-full ${selectedDriver.documents?.medicalCertificate ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {selectedDriver.documents?.medicalCertificate ? 'Uploaded' : 'Missing'}
                                            </span>
                                        </div>
                                        {selectedDriver.documents?.medicalCertificate ? (
                                            <>
                                                <div className="bg-gray-50 rounded-lg p-2 mb-2 flex justify-center">
                                                    {formatDocumentUrl(selectedDriver.documents.medicalCertificate) ? (
                                                        <img 
                                                            src={formatDocumentUrl(selectedDriver.documents.medicalCertificate)} 
                                                            alt="Medical Certificate" 
                                                            className="max-h-32 object-contain rounded"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "https://via.placeholder.com/200x150?text=Image+Not+Available";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="h-32 w-full flex items-center justify-center bg-gray-100 rounded">
                                                            <p className="text-gray-400">Image not available</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs text-gray-500">
                                                        {selectedDriver.documents.medicalCertificate.uploadedAt ? 
                                                            `Uploaded: ${new Date(selectedDriver.documents.medicalCertificate.uploadedAt).toLocaleDateString()}` : 
                                                            'Recently uploaded'}
                                                    </p>
                                                    {formatDocumentUrl(selectedDriver.documents.medicalCertificate) && (
                                                        <a href={formatDocumentUrl(selectedDriver.documents.medicalCertificate)} target="_blank" rel="noopener noreferrer" 
                                                            className="text-xs text-blue-600 hover:text-blue-800">
                                                            View Full Image
                                                        </a>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="bg-red-50 rounded-lg p-4 text-center">
                                                <p className="text-sm text-red-700">Document not uploaded</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Application Date */}
                            <div className="text-center p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Applied On</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(selectedDriver.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 p-6 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-white rounded-xl transition-all duration-200 font-medium"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleApproveReject(selectedDriver._id, 'rejected')}
                                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-red-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                disabled={processing}
                            >
                                {processing ? '⏳ Processing...' : '❌ Reject'}
                            </button>
                            <button
                                onClick={() => handleApproveReject(selectedDriver._id, 'approved')}
                                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-green-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                disabled={processing}
                            >
                                {processing ? '⏳ Processing...' : '✅ Approve & Send Credentials'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PendingDriverApplications
