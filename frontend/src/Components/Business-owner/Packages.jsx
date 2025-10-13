import React, { useState, useEffect } from 'react'
import PackageService from '../../Services/package-service'
import { useAuth } from '../../contexts/AuthContext'

function BusinessOwnerPackages({ packages: initialPackages }) {
    const { user } = useAuth()
    const [packageData, setPackageData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingPackage, setEditingPackage] = useState(null)
    const [availableVehicles, setAvailableVehicles] = useState([])
    const [newPackage, setNewPackage] = useState({
        name: '',
        duration: '',
        price: '',
        discount: 0,
        vehicles: [],
        features: [],
        isActive: true
    })
    const [newFeature, setNewFeature] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(null)

    // Load packages and available vehicles on component mount
    useEffect(() => {
        loadPackages()
        loadAvailableVehicles()
    }, [])

    // Load packages from API
    const loadPackages = async () => {
        if (!user?.id) return
        
        setLoading(true)
        setError(null)
        try {
            const packages = await PackageService.getBusinessOwnerPackages(user.id)
            setPackageData(packages.data || packages)
        } catch (err) {
            setError(err.message)
            console.error('Error loading packages:', err)
        } finally {
            setLoading(false)
        }
    }

    // Load available vehicles for package creation
    const loadAvailableVehicles = async () => {
        try {
            const vehicles = await PackageService.getAllAvailableVehicles()
            setAvailableVehicles(vehicles.vehicles || vehicles.data || vehicles)
        } catch (err) {
            console.error('Error loading available vehicles:', err)
        }
    }

    const handleCreatePackage = async () => {
        if (!user?.id) return
        
        // Validate package data
        const validationErrors = PackageService.validatePackageData({
            ...newPackage,
            businessOwner: user.id
        })
        
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '))
            return
        }

        setLoading(true)
        setError(null)
        
        try {
            const packageData = {
                ...newPackage,
                businessOwner: user.id,
                price: parseFloat(newPackage.price),
                discount: parseFloat(newPackage.discount)
            }
            
            const createdPackage = await PackageService.createPackage(packageData)
            setPackageData(prev => [createdPackage.data, ...prev])
            
            // Reset form
            setNewPackage({
                name: '',
                duration: '',
                price: '',
                discount: 0,
                vehicles: [],
                features: [],
                isActive: true
            })
            setShowCreateModal(false)
        } catch (err) {
            setError(err.message)
            console.error('Error creating package:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePackage = async () => {
        if (!editingPackage) return
        
        setLoading(true)
        setError(null)
        
        try {
            const updatedPackage = await PackageService.updatePackage(editingPackage._id, editingPackage)
            setPackageData(prev => prev.map(pkg => 
                pkg._id === editingPackage._id ? updatedPackage.data : pkg
            ))
            setEditingPackage(null)
        } catch (err) {
            setError(err.message)
            console.error('Error updating package:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleStatus = async (packageId) => {
        setLoading(true)
        setError(null)
        
        try {
            const updatedPackage = await PackageService.togglePackageStatus(packageId)
            setPackageData(prev => prev.map(pkg => 
                pkg._id === packageId ? updatedPackage.data : pkg
            ))
        } catch (err) {
            setError(err.message)
            console.error('Error toggling package status:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDeletePackage = async (packageId) => {
        setLoading(true)
        setError(null)
        
        try {
            await PackageService.deletePackage(packageId)
            setPackageData(prev => prev.filter(pkg => pkg._id !== packageId))
            setShowDeleteModal(null)
        } catch (err) {
            setError(err.message)
            console.error('Error deleting package:', err)
        } finally {
            setLoading(false)
        }
    }

    const calculateDiscountedPrice = (price, discount) => {
        return price - (price * discount / 100)
    }

    // Helper functions for managing vehicles and features
    const addFeature = () => {
        if (newFeature.trim() && !newPackage.features.includes(newFeature.trim())) {
            setNewPackage(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()]
            }))
            setNewFeature('')
        }
    }

    const removeFeature = (featureToRemove) => {
        setNewPackage(prev => ({
            ...prev,
            features: prev.features.filter(feature => feature !== featureToRemove)
        }))
    }

    const toggleVehicle = (vehicleId) => {
        setNewPackage(prev => ({
            ...prev,
            vehicles: prev.vehicles.includes(vehicleId)
                ? prev.vehicles.filter(id => id !== vehicleId)
                : [...prev.vehicles, vehicleId]
        }))
    }

    const addFeatureToEdit = () => {
        if (newFeature.trim() && !editingPackage.features.includes(newFeature.trim())) {
            setEditingPackage(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()]
            }))
            setNewFeature('')
        }
    }

    const removeFeatureFromEdit = (featureToRemove) => {
        setEditingPackage(prev => ({
            ...prev,
            features: prev.features.filter(feature => feature !== featureToRemove)
        }))
    }

    const toggleVehicleInEdit = (vehicleId) => {
        setEditingPackage(prev => ({
            ...prev,
            vehicles: prev.vehicles.includes(vehicleId)
                ? prev.vehicles.filter(id => id !== vehicleId)
                : [...prev.vehicles, vehicleId]
        }))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Rental Packages</h2>
                    <p className="text-gray-600">Create and manage rental packages for your vehicles</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Loading...' : 'Create New Package'}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    onClick={() => setError(null)}
                                    className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packageData.map((pkg) => (
                    <div key={pkg._id || pkg.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                                    <p className="text-gray-600">{pkg.duration}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setEditingPackage(pkg)}
                                        disabled={loading}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(pkg._id || pkg.id)}
                                        disabled={loading}
                                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${pkg.isActive
                                                ? 'text-green-600 hover:bg-green-50'
                                                : 'text-red-600 hover:bg-red-50'
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={pkg.isActive ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteModal(pkg._id || pkg.id)}
                                        disabled={loading}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Price Display */}
                            <div className="mb-4">
                                {pkg.discount > 0 ? (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-2xl font-bold text-green-600">
                                            LKR {calculateDiscountedPrice(pkg.price, pkg.discount).toFixed(2)}
                                        </span>
                                        <span className="text-lg text-gray-500 line-through">
                                            LKR {pkg.price}
                                        </span>
                                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                                            {pkg.discount}% OFF
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-2xl font-bold text-gray-900">LKR {pkg.price}</span>
                                )}
                            </div>

                            {/* Status Badge */}
                            <div className="mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${pkg.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {pkg.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* Vehicles */}
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Included Vehicles:</h4>
                                <div className="flex flex-wrap gap-1">
                                    {pkg.vehicles && pkg.vehicles.length > 0 ? (
                                        pkg.vehicles.map((vehicle, index) => (
                                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                {typeof vehicle === 'object' ? `${vehicle.make} ${vehicle.model}` : vehicle}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 text-xs">No vehicles assigned</span>
                                    )}
                                </div>
                            </div>

                            {/* Features */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Package Features:</h4>
                                <ul className="space-y-1">
                                    {pkg.features.map((feature, index) => (
                                        <li key={index} className="flex items-center text-sm text-gray-600">
                                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Package Modal */}
            {(showCreateModal || editingPackage) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {editingPackage ? 'Edit Package' : 'Create New Package'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Package Name</label>
                                <input
                                    type="text"
                                    value={editingPackage ? editingPackage.name : newPackage.name}
                                    onChange={(e) => editingPackage
                                        ? setEditingPackage({ ...editingPackage, name: e.target.value })
                                        : setNewPackage({ ...newPackage, name: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Enter package name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                                <select
                                    value={editingPackage ? editingPackage.duration : newPackage.duration}
                                    onChange={(e) => editingPackage
                                        ? setEditingPackage({ ...editingPackage, duration: e.target.value })
                                        : setNewPackage({ ...newPackage, duration: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="">Select duration</option>
                                    <option value="1 Day">1 Day</option>
                                    <option value="2 Days">2 Days</option>
                                    <option value="3 Days">3 Days</option>
                                    <option value="1 Week">1 Week</option>
                                    <option value="2 Weeks">2 Weeks</option>
                                    <option value="1 Month">1 Month</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (LKR)</label>
                                    <input
                                        type="number"
                                        value={editingPackage ? editingPackage.price : newPackage.price}
                                        onChange={(e) => editingPackage
                                            ? setEditingPackage({ ...editingPackage, price: e.target.value })
                                            : setNewPackage({ ...newPackage, price: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                                    <input
                                        type="number"
                                        value={editingPackage ? editingPackage.discount : newPackage.discount}
                                        onChange={(e) => editingPackage
                                            ? setEditingPackage({ ...editingPackage, discount: e.target.value })
                                            : setNewPackage({ ...newPackage, discount: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </div>

                            {/* Vehicles Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Vehicles (All Available Vehicles)</label>
                                <p className="text-xs text-gray-500 mb-2">You can select vehicles from any vehicle owner in the system</p>
                                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                                    {availableVehicles.length > 0 ? (
                                        availableVehicles.map((vehicle) => (
                                            <label key={vehicle._id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={(editingPackage ? editingPackage.vehicles : newPackage.vehicles).includes(vehicle._id)}
                                                    onChange={() => editingPackage 
                                                        ? toggleVehicleInEdit(vehicle._id)
                                                        : toggleVehicle(vehicle._id)
                                                    }
                                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-700 font-medium">
                                                        {vehicle.make} {vehicle.model} ({vehicle.year})
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        LKR {vehicle.pricePerDay || vehicle.rentalPrice?.dailyRate}/day • {vehicle.type || vehicle.vehicleType}
                                                        {vehicle.ownerId && (
                                                            <span> • Owner: {vehicle.ownerId.firstName} {vehicle.ownerId.lastName}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm">No available vehicles found</p>
                                    )}
                                </div>
                            </div>

                            {/* Features Management */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Package Features</label>
                                <div className="flex space-x-2 mb-2">
                                    <input
                                        type="text"
                                        value={newFeature}
                                        onChange={(e) => setNewFeature(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Add a feature"
                                        onKeyPress={(e) => e.key === 'Enter' && (editingPackage ? addFeatureToEdit() : addFeature())}
                                    />
                                    <button
                                        type="button"
                                        onClick={editingPackage ? addFeatureToEdit : addFeature}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(editingPackage ? editingPackage.features : newPackage.features).map((feature, index) => (
                                        <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                                            <span>{feature}</span>
                                            <button
                                                type="button"
                                                onClick={() => editingPackage 
                                                    ? removeFeatureFromEdit(feature)
                                                    : removeFeature(feature)
                                                }
                                                className="text-purple-600 hover:text-purple-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false)
                                    setEditingPackage(null)
                                    setNewFeature('')
                                }}
                                disabled={loading}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (editingPackage) {
                                        handleUpdatePackage()
                                    } else {
                                        handleCreatePackage()
                                    }
                                }}
                                disabled={loading}
                                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : (editingPackage ? 'Update Package' : 'Create Package')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Package</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this package? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                disabled={loading}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeletePackage(showDeleteModal)}
                                disabled={loading}
                                className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Deleting...' : 'Delete Package'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BusinessOwnerPackages
