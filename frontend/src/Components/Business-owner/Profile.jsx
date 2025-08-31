import React, { useState } from 'react'

function BusinessOwnerProfile({ profile }) {
    const [editMode, setEditMode] = useState(false)
    const [formData, setFormData] = useState(profile)

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSave = () => {
        // Handle save logic here
        setEditMode(false)
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-purple-900">Business Profile</h2>
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        {editMode ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                        {editMode ? (
                            <input
                                type="text"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                            />
                        ) : (
                            <p className="text-gray-900">{profile.businessName}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name</label>
                        {editMode ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                            />
                        ) : (
                            <p className="text-gray-900">{profile.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        {editMode ? (
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                            />
                        ) : (
                            <p className="text-gray-900">{profile.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Vehicles</label>
                        <p className="text-gray-900">{profile.totalVehicles}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Active Drivers</label>
                        <p className="text-gray-900">{profile.activeDrivers}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Revenue</label>
                        <p className="text-gray-900">${profile.monthlyRevenue.toLocaleString()}</p>
                    </div>
                </div>

                {editMode && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <button
                            onClick={handleSave}
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors mr-4"
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={() => setEditMode(false)}
                            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BusinessOwnerProfile
