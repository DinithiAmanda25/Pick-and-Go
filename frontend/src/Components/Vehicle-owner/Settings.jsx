import React from 'react'

function VehicleOwnerSettings() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <p className="text-gray-600">Configure your account preferences</p>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                    <div className="space-y-4">
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" defaultChecked />
                            <span className="ml-3 text-gray-700">Email notifications for new bookings</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" defaultChecked />
                            <span className="ml-3 text-gray-700">SMS alerts for urgent matters</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                            <span className="ml-3 text-gray-700">Marketing communications</span>
                        </label>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                    <div className="space-y-4">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Change Password
                        </button>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors ml-4">
                            Enable Two-Factor Authentication
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
                    <div className="space-y-4">
                        <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                            Export Data
                        </button>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors ml-4">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VehicleOwnerSettings
