import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function ProfileEnhanced() {
    const [activeTab, setActiveTab] = useState('personal')
    const [isEditing, setIsEditing] = useState(false)
    const [profileData, setProfileData] = useState({
        // Personal Information
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 234 567 8900',
        dateOfBirth: '1990-01-15',
        gender: 'male',

        // Address Information
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',

        // License Information
        licenseNumber: 'DL123456789',
        licenseState: 'NY',
        licenseExpiry: '2026-01-15',

        // Emergency Contact
        emergencyName: 'Jane Doe',
        emergencyPhone: '+1 234 567 8901',
        emergencyRelation: 'Spouse',

        // Preferences
        preferredLanguage: 'English',
        currency: 'USD',
        communicationPreference: 'email',
        newsletterSubscription: true,
        smsNotifications: false,

        // Account Settings
        accountCreated: '2023-06-15',
        lastLogin: '2024-01-25',
        emailVerified: true,
        phoneVerified: true
    })

    const [securitySettings, setSecuritySettings] = useState({
        twoFactorEnabled: false,
        loginNotifications: true,
        passwordLastChanged: '2023-12-01'
    })

    const [bookingStats, setBookingStats] = useState({
        totalBookings: 15,
        completedBookings: 12,
        cancelledBookings: 3,
        totalSpent: 2850,
        favoriteVehicleType: 'SUV',
        averageRating: 4.7
    })

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSecurityChange = (field, value) => {
        setSecuritySettings(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSaveProfile = () => {
        // In a real app, this would make an API call
        console.log('Saving profile:', profileData)
        setIsEditing(false)
        alert('Profile updated successfully!')
    }

    const handleChangePassword = () => {
        alert('Password change functionality would be implemented here')
    }

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            alert('Account deletion would be processed here')
        }
    }

    const handleExportData = () => {
        // In a real app, this would generate and download user data
        const dataStr = JSON.stringify({ profileData, securitySettings, bookingStats }, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'my-account-data.json'
        link.click()
        URL.revokeObjectURL(url)
    }

    const getVerificationBadge = (isVerified) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
            {isVerified ? (
                <>
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified
                </>
            ) : (
                <>
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Not Verified
                </>
            )}
        </span>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">My Profile</h2>
                        <p className="text-indigo-100">Manage your account information and preferences</p>
                    </div>
                    <div className="text-center">
                        <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2">
                            <span className="text-2xl font-bold">
                                {profileData.firstName[0]}{profileData.lastName[0]}
                            </span>
                        </div>
                        <p className="text-sm text-indigo-100">Member since {new Date(profileData.accountCreated).getFullYear()}</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{bookingStats.totalBookings}</div>
                        <div className="text-sm text-gray-600">Total Bookings</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">${bookingStats.totalSpent}</div>
                        <div className="text-sm text-gray-600">Total Spent</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{bookingStats.averageRating}</div>
                        <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{bookingStats.favoriteVehicleType}</div>
                        <div className="text-sm text-gray-600">Favorite Type</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    {[
                        { id: 'personal', label: 'Personal Info' },
                        { id: 'security', label: 'Security' },
                        { id: 'preferences', label: 'Preferences' },
                        { id: 'documents', label: 'Documents' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 py-3 px-6 text-center font-medium ${activeTab === tab.id
                                    ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                                    : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* Personal Information Tab */}
                    {activeTab === 'personal' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`px-4 py-2 rounded-md ${isEditing
                                            ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}
                                >
                                    {isEditing ? 'Cancel' : 'Edit Profile'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={profileData.firstName}
                                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={profileData.lastName}
                                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address {getVerificationBadge(profileData.emailVerified)}
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number {getVerificationBadge(profileData.phoneVerified)}
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={profileData.dateOfBirth}
                                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select
                                        value={profileData.gender}
                                        onChange={(e) => handleInputChange('gender', e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer-not-to-say">Prefer not to say</option>
                                    </select>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="border-t pt-6">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Address Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                        <input
                                            type="text"
                                            value={profileData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <input
                                            type="text"
                                            value={profileData.city}
                                            onChange={(e) => handleInputChange('city', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                        <input
                                            type="text"
                                            value={profileData.state}
                                            onChange={(e) => handleInputChange('state', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                                        <input
                                            type="text"
                                            value={profileData.zipCode}
                                            onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                        <input
                                            type="text"
                                            value={profileData.country}
                                            onChange={(e) => handleInputChange('country', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className="border-t pt-6">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Emergency Contact</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                                        <input
                                            type="text"
                                            value={profileData.emergencyName}
                                            onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                                        <input
                                            type="tel"
                                            value={profileData.emergencyPhone}
                                            onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                                        <input
                                            type="text"
                                            value={profileData.emergencyRelation}
                                            onChange={(e) => handleInputChange('emergencyRelation', e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="border-t pt-6 flex gap-3">
                                    <button
                                        onClick={handleSaveProfile}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                                    </div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={securitySettings.twoFactorEnabled}
                                            onChange={(e) => handleSecurityChange('twoFactorEnabled', e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securitySettings.twoFactorEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                                            }`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                        </div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Login Notifications</h4>
                                        <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
                                    </div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={securitySettings.loginNotifications}
                                            onChange={(e) => handleSecurityChange('loginNotifications', e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securitySettings.loginNotifications ? 'bg-indigo-600' : 'bg-gray-200'
                                            }`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                        </div>
                                    </label>
                                </div>

                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900">Password</h4>
                                        <button
                                            onClick={handleChangePassword}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
                                        >
                                            Change Password
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Last changed: {new Date(securitySettings.passwordLastChanged).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                                    <select
                                        value={profileData.preferredLanguage}
                                        onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="English">English</option>
                                        <option value="Spanish">Spanish</option>
                                        <option value="French">French</option>
                                        <option value="German">German</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                    <select
                                        value={profileData.currency}
                                        onChange={(e) => handleInputChange('currency', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="CAD">CAD ($)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Communication Preference</label>
                                    <select
                                        value={profileData.communicationPreference}
                                        onChange={(e) => handleInputChange('communicationPreference', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="email">Email</option>
                                        <option value="sms">SMS</option>
                                        <option value="both">Both</option>
                                        <option value="none">None</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="newsletter"
                                        checked={profileData.newsletterSubscription}
                                        onChange={(e) => handleInputChange('newsletterSubscription', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-900">
                                        Subscribe to newsletter and promotional emails
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="sms"
                                        checked={profileData.smsNotifications}
                                        onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="sms" className="ml-2 block text-sm text-gray-900">
                                        Receive SMS notifications for bookings
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Driver's License Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                                    <input
                                        type="text"
                                        value={profileData.licenseNumber}
                                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Issuing State</label>
                                    <input
                                        type="text"
                                        value={profileData.licenseState}
                                        onChange={(e) => handleInputChange('licenseState', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input
                                        type="date"
                                        value={profileData.licenseExpiry}
                                        onChange={(e) => handleInputChange('licenseExpiry', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Account Actions</h4>
                                <div className="space-y-4">
                                    <button
                                        onClick={handleExportData}
                                        className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                                    >
                                        Export My Data
                                    </button>

                                    <button
                                        onClick={handleDeleteAccount}
                                        className="w-full md:w-auto bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 ml-0 md:ml-3"
                                    >
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
