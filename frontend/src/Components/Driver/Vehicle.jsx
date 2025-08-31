import React from 'react'

function DriverVehicle({ vehicle }) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-orange-900 mb-6">Vehicle Status</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Vehicle Info */}
                    <div className="space-y-4">
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Make & Model</span>
                                    <span className="font-medium">{vehicle.make} {vehicle.model} {vehicle.year}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">License Plate</span>
                                    <span className="font-medium">{vehicle.licensePlate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status</span>
                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                        {vehicle.status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Last Maintenance</span>
                                    <span className="font-medium">{vehicle.lastMaintenance}</span>
                                </div>
                            </div>
                        </div>

                        {/* Maintenance Schedule */}
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Schedule</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Oil Change</span>
                                    <span className="text-green-600 font-medium">✓ Up to date</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Tire Check</span>
                                    <span className="text-yellow-600 font-medium">⚠ Due soon</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Brake Inspection</span>
                                    <span className="text-green-600 font-medium">✓ Up to date</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Registration</span>
                                    <span className="text-green-600 font-medium">✓ Valid</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Actions */}
                    <div className="space-y-4">
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                                    Report Issue
                                </button>
                                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                    Schedule Maintenance
                                </button>
                                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                                    Upload Documents
                                </button>
                            </div>
                        </div>

                        {/* Fuel Status */}
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuel Status</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Current Level</span>
                                    <span className="font-medium">75%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div className="bg-green-600 h-3 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                                <p className="text-sm text-gray-600">Estimated range: 180 miles</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DriverVehicle
