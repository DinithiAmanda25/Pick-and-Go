import React, { useState } from 'react'

function BusinessOwnerSettings() {
    const [notifications, setNotifications] = useState({
        emailBookings: true,
        emailDriverUpdates: true,
        pushNotifications: false,
        smsAlerts: true
    })

    const [preferences, setPreferences] = useState({
        autoAcceptBookings: false,
        requireDriverApproval: true,
        maintenanceReminders: true
    })

    const handleNotificationChange = (key) => {
        setNotifications({
            ...notifications,
            [key]: !notifications[key]
        })
    }

    const handlePreferenceChange = (key) => {
        setPreferences({
            ...preferences,
            [key]: !preferences[key]
        })
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-purple-900 mb-6">Business Settings</h2>

                <div className="space-y-8">
                    {/* Notification Settings */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Email Booking Notifications</p>
                                    <p className="text-sm text-gray-600">Receive emails for new bookings</p>
                                </div>
                                <button
                                    onClick={() => handleNotificationChange('emailBookings')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.emailBookings ? 'bg-purple-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.emailBookings ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Driver Update Notifications</p>
                                    <p className="text-sm text-gray-600">Get notified about driver status changes</p>
                                </div>
                                <button
                                    onClick={() => handleNotificationChange('emailDriverUpdates')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.emailDriverUpdates ? 'bg-purple-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.emailDriverUpdates ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Push Notifications</p>
                                    <p className="text-sm text-gray-600">Receive browser push notifications</p>
                                </div>
                                <button
                                    onClick={() => handleNotificationChange('pushNotifications')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.pushNotifications ? 'bg-purple-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Business Preferences */}
                    <div className="border-t border-gray-200 pt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Preferences</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Auto-Accept Bookings</p>
                                    <p className="text-sm text-gray-600">Automatically accept booking requests</p>
                                </div>
                                <button
                                    onClick={() => handlePreferenceChange('autoAcceptBookings')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.autoAcceptBookings ? 'bg-purple-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.autoAcceptBookings ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Require Driver Approval</p>
                                    <p className="text-sm text-gray-600">Manually approve new driver applications</p>
                                </div>
                                <button
                                    onClick={() => handlePreferenceChange('requireDriverApproval')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.requireDriverApproval ? 'bg-purple-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.requireDriverApproval ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Maintenance Reminders</p>
                                    <p className="text-sm text-gray-600">Get reminders for vehicle maintenance</p>
                                </div>
                                <button
                                    onClick={() => handlePreferenceChange('maintenanceReminders')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.maintenanceReminders ? 'bg-purple-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.maintenanceReminders ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="border-t border-gray-200 pt-6">
                        <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BusinessOwnerSettings
