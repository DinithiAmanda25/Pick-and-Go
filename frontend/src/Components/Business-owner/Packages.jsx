import React, { useState } from 'react'

function BusinessOwnerPackages({ packages }) {
    const [packageData, setPackageData] = useState(packages)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingPackage, setEditingPackage] = useState(null)
    const [newPackage, setNewPackage] = useState({
        name: '',
        duration: '',
        price: '',
        discount: 0,
        vehicles: [],
        features: [],
        isActive: true
    })

    const handleCreatePackage = () => {
        const packageObj = {
            id: Date.now(),
            ...newPackage,
            price: parseFloat(newPackage.price),
            discount: parseFloat(newPackage.discount)
        }
        setPackageData([...packageData, packageObj])
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
    }

    const handleUpdatePackage = (id, updates) => {
        setPackageData(packageData.map(pkg =>
            pkg.id === id ? { ...pkg, ...updates } : pkg
        ))
        setEditingPackage(null)
    }

    const handleToggleStatus = (id) => {
        setPackageData(packageData.map(pkg =>
            pkg.id === id ? { ...pkg, isActive: !pkg.isActive } : pkg
        ))
    }

    const calculateDiscountedPrice = (price, discount) => {
        return price - (price * discount / 100)
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
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                    Create New Package
                </button>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packageData.map((pkg) => (
                    <div key={pkg.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                                    <p className="text-gray-600">{pkg.duration}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setEditingPackage(pkg)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(pkg.id)}
                                        className={`p-2 rounded-lg transition-colors ${pkg.isActive
                                                ? 'text-green-600 hover:bg-green-50'
                                                : 'text-red-600 hover:bg-red-50'
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={pkg.isActive ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Price Display */}
                            <div className="mb-4">
                                {pkg.discount > 0 ? (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-2xl font-bold text-green-600">
                                            ${calculateDiscountedPrice(pkg.price, pkg.discount).toFixed(2)}
                                        </span>
                                        <span className="text-lg text-gray-500 line-through">
                                            ${pkg.price}
                                        </span>
                                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                                            {pkg.discount}% OFF
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-2xl font-bold text-gray-900">${pkg.price}</span>
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
                                    {pkg.vehicles.map((vehicle, index) => (
                                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                            {vehicle}
                                        </span>
                                    ))}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
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
                        </div>

                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false)
                                    setEditingPackage(null)
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (editingPackage) {
                                        handleUpdatePackage(editingPackage.id, editingPackage)
                                    } else {
                                        handleCreatePackage()
                                    }
                                }}
                                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300"
                            >
                                {editingPackage ? 'Update Package' : 'Create Package'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BusinessOwnerPackages
