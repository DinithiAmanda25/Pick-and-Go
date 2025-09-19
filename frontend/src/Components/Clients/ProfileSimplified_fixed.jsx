import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function ProfileEnhanced({ profile, onUpdateProfile, onDeleteProfile }) {
    // All hooks must be declared first, before any conditional logic
    const [activeTab, setActiveTab] = useState('personal')
    const [isEditing, setIsEditing] = useState(false)
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Sri Lanka',
        licenseNumber: '',
        licenseState: '',
        licenseExpiry: '',
        emergencyName: '',
        emergencyPhone: '',
        emergencyRelation: '',
        accountCreated: 'N/A',
        lastLogin: 'N/A'
    })

    const [licenseDocument, setLicenseDocument] = useState({
        frontImage: null,
        backImage: null,
        uploadStatus: 'not_uploaded',
        rejectionReason: '',
        uploadDate: null
    })

    // Update profileData when profile prop changes
    useEffect(() => {
        if (profile) {
            setProfileData({
                firstName: profile?.firstName || '',
                lastName: profile?.lastName || '',
                email: profile?.email || '',
                phone: profile?.phone || '',
                dateOfBirth: profile?.dateOfBirth || '',
                address: profile?.address?.street || '',
                city: profile?.address?.city || '',
                state: profile?.address?.state || '',
                zipCode: profile?.address?.zipCode || '',
                country: 'Sri Lanka',
                licenseNumber: profile?.licenseNumber || '',
                licenseState: profile?.licenseState || '',
                licenseExpiry: profile?.licenseExpiry || '',
                emergencyName: profile?.emergencyName || '',
                emergencyPhone: profile?.emergencyPhone || '',
                emergencyRelation: profile?.emergencyRelation || '',
                accountCreated: profile?.joinDate || 'N/A',
                lastLogin: profile?.lastLogin || 'N/A'
            });
        }
    }, [profile]);

    // Show loading state if no profile data - AFTER all hooks
    if (!profile) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-gray-500">Loading profile data...</div>
            </div>
        );
    }

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSaveProfile = async () => {
        try {
            // Prepare the updated profile data
            const updatedProfile = {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                email: profileData.email,
                phone: profileData.phone,
                dateOfBirth: profileData.dateOfBirth,
                address: {
                    street: profileData.address,
                    city: profileData.city,
                    state: profileData.state,
                    zipCode: profileData.zipCode
                },
                // Optional fields
                licenseNumber: profileData.licenseNumber,
                licenseState: profileData.licenseState,
                licenseExpiry: profileData.licenseExpiry,
                emergencyName: profileData.emergencyName,
                emergencyPhone: profileData.emergencyPhone,
                emergencyRelation: profileData.emergencyRelation
            };

            console.log('Saving client profile:', updatedProfile);

            // Call the parent's update function
            if (onUpdateProfile) {
                await onUpdateProfile(updatedProfile);
            }

            setIsEditing(false);
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Error saving profile. Please try again.');
        }
    }

    const handleLicenseUpload = (side, file) => {
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setLicenseDocument(prev => ({
                    ...prev,
                    [side + 'Image']: e.target.result,
                    uploadStatus: 'uploaded',
                    uploadDate: new Date().toLocaleDateString()
                }))
            }
            reader.readAsDataURL(file)
        }
    }

    const tabVariants = {
        inactive: { backgroundColor: '#f3f4f6', color: '#6b7280' },
        active: { backgroundColor: '#3b82f6', color: '#ffffff' }
    }

    const renderPersonalInfo = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                </div>
            </div>

            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Address Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                        type="text"
                        value={profileData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                        type="text"
                        value={profileData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                        type="text"
                        value={profileData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                </div>
            </div>

            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                    <input
                        type="text"
                        value={profileData.emergencyName}
                        onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                    <input
                        type="tel"
                        value={profileData.emergencyPhone}
                        onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                    <select
                        value={profileData.emergencyRelation}
                        onChange={(e) => handleInputChange('emergencyRelation', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    >
                        <option value="">Select Relationship</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Parent">Parent</option>
                        <option value="Child">Child</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Friend">Friend</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
        </motion.div>
    )

    const renderAccountSettings = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Created</label>
                    <input
                        type="text"
                        value={profileData.accountCreated}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
                    <input
                        type="text"
                        value={profileData.lastLogin}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </div>
            </div>
        </motion.div>
    )

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
            {/* Header */}
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Client Profile</h2>
                <p className="text-gray-600">Manage your personal information and preferences</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
                {[
                    { id: 'personal', label: 'Personal Info', icon: '👤' },
                    { id: 'account', label: 'Account Settings', icon: '⚙️' }
                ].map((tab) => (
                    <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        variants={tabVariants}
                        animate={activeTab === tab.id ? 'active' : 'inactive'}
                        className="flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </motion.button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'personal' && renderPersonalInfo()}
                {activeTab === 'account' && renderAccountSettings()}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 justify-end">
                {isEditing ? (
                    <>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveProfile}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Save Changes
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Edit Profile
                    </button>
                )}
            </div>
        </div>
    )
}
