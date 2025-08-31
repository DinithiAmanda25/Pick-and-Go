import React, { useState } from 'react'

function DriverSettings() {
    const [notifications, setNotifications] = useState({
        tripRequests: true,
        earnings: true,
        maintenance: true,
        promotional: false
    })

    const [preferences, setPreferences] = useState({
        autoAcceptTrips: false,
        preferredRadius: 10,
        workOnWeekends: true
    })

    const handleNotificationChange = (key) => {
        setNotifications({
            ...notifications,
            [key]: !notifications[key]
        })
    }

    const handlePreferenceChange = (key, value) => {
        setPreferences({
            ...preferences,
            [key]: value
        })
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-orange-900 mb-6">Driver Settings</h2>

                <div className="space-y-8">
                    {/* Notification Settings */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Trip Request Notifications</p>
                                    <p className="text-sm text-gray-600">Get notified about new trip requests</p>
                                </div>
                                <button
                                    onClick={() => handleNotificationChange('tripRequests')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.tripRequests ? 'bg-orange-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.tripRequests ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Earnings Updates</p>
                                    <p className="text-sm text-gray-600">Receive earnings summaries and reports</p>
                                </div>
                                <button
                                    onClick={() => handleNotificationChange('earnings')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.earnings ? 'bg-orange-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.earnings ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Maintenance Reminders</p>
                                    <p className="text-sm text-gray-600">Get reminders about vehicle maintenance</p>
                                </div>
                                <button
                                    onClick={() => handleNotificationChange('maintenance')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.maintenance ? 'bg-orange-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.maintenance ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Driver Preferences */}
                    <div className="border-t border-gray-200 pt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Preferences</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Auto-Accept Trips</p>
                                    <p className="text-sm text-gray-600">Automatically accept trip requests within radius</p>
                                </div>
                                <button
                                    onClick={() => handlePreferenceChange('autoAcceptTrips', !preferences.autoAcceptTrips)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.autoAcceptTrips ? 'bg-orange-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.autoAcceptTrips ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Working Radius (miles)</label>
                                <select
                                    value={preferences.preferredRadius}
                                    onChange={(e) => handlePreferenceChange('preferredRadius', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value={5}>5 miles</option>
                                    <option value={10}>10 miles</option>
                                    <option value={15}>15 miles</option>
                                    <option value={20}>20 miles</option>
                                    <option value={25}>25 miles</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Work on Weekends</p>
                                    <p className="text-sm text-gray-600">Receive trip requests on weekends</p>
                                </div>
                                <button
                                    onClick={() => handlePreferenceChange('workOnWeekends', !preferences.workOnWeekends)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.workOnWeekends ? 'bg-orange-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.workOnWeekends ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="border-t border-gray-200 pt-6">
                        <button className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DriverSettings
