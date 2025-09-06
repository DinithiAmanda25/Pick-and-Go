import React, { useState } from 'react'

function VehicleOwnerProfile({ profile }) {
    const [activeTab, setActiveTab] = useState('personal')
    const [isEditing, setIsEditing] = useState(false)

    // Debug: Log the profile data to see what we're receiving
    console.log('VehicleOwnerProfile - Received profile data:', profile);

    // Show loading state if no profile data
    if (!profile) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-gray-500">Loading profile data...</div>
            </div>
        );
    }

    const [formData, setFormData] = useState({
        // Personal Information - using real data from MongoDB document
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        email: profile?.email || '',
        phone: profile?.phone || '',

        // Address information from nested address object
        address: profile?.address?.street || '',
        city: profile?.address?.city || '',
        state: profile?.address?.state || '',
        zipCode: profile?.address?.zipCode || '',
        country: 'Sri Lanka', // Default for Sri Lankan app

        // Additional fields
        dateOfBirth: profile?.dateOfBirth || '',
        emergencyContact: profile?.emergencyContact || '',
        emergencyPhone: profile?.emergencyPhone || '',

        // Vehicle Owner Specific Information
        ownerType: 'Individual Owner',
        ownerLicense: profile?.ownerLicense || '',
        registrationDate: profile?.createdAt ? new Date(profile.createdAt).toISOString().split('T')[0] : '',

        // Experience Information (adapted for Vehicle Owner)
        vehicleOwnershipExperience: profile?.vehicleOwnershipExperience || '',
        previousExperience: profile?.previousExperience || '',
        specializations: profile?.specializations || ['Economy Cars', 'Family Vehicles'],

        // Insurance Information
        insuranceProvider: profile?.insuranceProvider || '',
        insurancePolicyNumber: profile?.insurancePolicyNumber || '',
        insuranceExpiry: profile?.insuranceExpiry || '',
        personalInsuranceNumber: profile?.personalInsuranceNumber || '',

        // Document Information - based on documents array from MongoDB
        documentsUploaded: {
            profilePhoto: !!profile?.profilePhoto,
            licensePhoto: !!profile?.licensePhoto,
            ownerLicense: !!profile?.ownerLicense,
            insuranceDocuments: !!profile?.insuranceDocuments,
            taxDocuments: !!profile?.taxDocuments,
            backgroundCheck: !!profile?.backgroundCheck
        }
    })

    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: true,
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: true
    })

    const handleInputChange = (e, dataType = 'personal') => {
        const { name, value, type, checked } = e.target
        const newValue = type === 'checkbox' ? checked : value

        if (dataType === 'personal') {
            setFormData(prev => ({ ...prev, [name]: newValue }))
        } else if (dataType === 'security') {
            setSecurityData(prev => ({ ...prev, [name]: newValue }))
        }
    }

    const handleSave = () => {
        // Simulate save operation
        console.log('Saving profile data:', { formData, securityData })
        setIsEditing(false)
        alert('Profile updated successfully!')
    }

    const renderPersonalInfo = () => (
        <div className="space-y-6">
            <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                    <img
                        src="https://via.placeholder.com/120x120?text=MR"
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-green-200"
                    />
                    <button className="absolute bottom-2 right-2 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{formData.firstName} {formData.lastName}</h2>
                    <p className="text-gray-600">Vehicle Owner since {profile?.joinDate || '2023-03-15'}</p>
                    <div className="flex items-center space-x-4 mt-2">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            ⭐ {profile?.averageRating || '4.6'} Rating
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            🚗 {profile?.totalVehicles || '3'} Vehicles
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
                    <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone</label>
                    <input
                        type="tel"
                        name="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
                    />
                </div>
            </div>

            {/* Vehicle Ownership Experience Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Vehicle Ownership Experience</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Ownership Experience</label>
                        <select
                            name="vehicleOwnershipExperience"
                            value={formData.vehicleOwnershipExperience}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
                        >
                            <option value="Less than 1 year">Less than 1 year</option>
                            <option value="1-2 years">1-2 years</option>
                            <option value="3-5 years">3-5 years</option>
                            <option value="6-10 years">6-10 years</option>
                            <option value="10+ years">10+ years</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Previous Experience</label>
                        <textarea
                            rows="3"
                            name="previousExperience"
                            value={formData.previousExperience}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
                            placeholder="Describe any previous vehicle rental or related experience"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specializations (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {['Economy Cars', 'Luxury Vehicles', 'Family Vehicles', 'Commercial Vehicles', 'Long-term Rentals', 'Short-term Rentals'].map((specialization) => (
                            <label key={specialization} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.specializations.includes(specialization)}
                                    onChange={(e) => {
                                        const specs = formData.specializations
                                        if (e.target.checked) {
                                            setFormData(prev => ({ ...prev, specializations: [...specs, specialization] }))
                                        } else {
                                            setFormData(prev => ({ ...prev, specializations: specs.filter(s => s !== specialization) }))
                                        }
                                    }}
                                    disabled={!isEditing}
                                    className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded disabled:opacity-50"
                                />
                                <span className="text-sm text-gray-700">{specialization}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )

    const renderDocumentsVerification = () => (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-blue-800 font-medium">Document Verification Status</h3>
                </div>
                <p className="text-blue-700 text-sm mt-1">Upload and manage your verification documents.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Required Documents */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Required Documents</h3>

                    {[
                        { key: 'profilePhoto', name: 'Profile Photo', description: 'Clear headshot photo for verification' },
                        { key: 'ownerLicense', name: 'Owner License', description: 'Valid vehicle owner registration document' },
                        { key: 'insuranceDocuments', name: 'Insurance Documents', description: 'Proof of vehicle insurance coverage' }
                    ].map((doc) => (
                        <div key={doc.key} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-800">{doc.name}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${formData.documentsUploaded[doc.key]
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {formData.documentsUploaded[doc.key] ? 'Uploaded' : 'Required'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{doc.description}</p>
                            <div className="flex items-center space-x-3">
                                <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                                    {formData.documentsUploaded[doc.key] ? 'Replace' : 'Upload'}
                                </button>
                                {formData.documentsUploaded[doc.key] && (
                                    <button className="px-4 py-2 text-green-600 text-sm border border-green-600 rounded-lg hover:bg-green-50 transition-colors">
                                        View
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Verification Status */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Verification Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h4 className="font-medium text-gray-800">Identity Verified</h4>
                        <p className="text-sm text-gray-600">Driver's license and photo verified</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h4 className="font-medium text-gray-800">Owner Verified</h4>
                        <p className="text-sm text-gray-600">Owner license confirmed</p>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                        <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h4 className="font-medium text-gray-800">Documents Pending</h4>
                        <p className="text-sm text-gray-600">Document verification in progress</p>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderSecuritySettings = () => (
        <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h3 className="text-amber-800 font-medium">Security Settings</h3>
                </div>
                <p className="text-amber-700 text-sm mt-1">Manage your account security and privacy settings.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={securityData.currentPassword}
                                onChange={(e) => handleInputChange(e, 'security')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Enter current password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={securityData.newPassword}
                                onChange={(e) => handleInputChange(e, 'security')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Enter new password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={securityData.confirmPassword}
                                onChange={(e) => handleInputChange(e, 'security')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Confirm new password"
                            />
                        </div>
                        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                            Update Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="bg-white">
            <div className="border-b border-gray-200 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Profile Management</h1>
                    <div className="flex space-x-3">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('personal')}
                        className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'personal'
                            ? 'border-green-500 text-green-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Personal Information
                    </button>
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'documents'
                            ? 'border-green-500 text-green-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Documents & Verification
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'security'
                            ? 'border-green-500 text-green-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Security & Privacy
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
                {activeTab === 'personal' && renderPersonalInfo()}
                {activeTab === 'documents' && renderDocumentsVerification()}
                {activeTab === 'security' && renderSecuritySettings()}
            </div>
        </div>
    )
}

export default VehicleOwnerProfile
