import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import businessOwnerService from '../../Services/BusinessOwner-service'

function BusinessOwnerProfile({ profile }) {
    const [editMode, setEditMode] = useState(false)
    const [formData, setFormData] = useState(profile)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const { logout, getCurrentUserId, getSessionData, refreshUser } = useAuth()
    const navigate = useNavigate()

    const userId = getCurrentUserId()
    const sessionData = getSessionData()

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSave = async () => {
        setLoading(true)
        setMessage('')

        try {
            console.log('Saving profile with userId:', userId)
            console.log('Form data:', formData)

            const response = await businessOwnerService.updateProfile(userId, formData)
            console.log('Update response:', response)

            if (response.success) {
                setMessage('Profile updated successfully!')
                setEditMode(false)
                // Refresh user data in context to reflect changes immediately
                setTimeout(() => {
                    setMessage('')
                    refreshUser() // This will update the user data from localStorage
                }, 1500)
            } else {
                setMessage('Failed to update profile: ' + response.message)
            }
        } catch (error) {
            console.error('Profile update error:', error)
            setMessage('Failed to update profile: ' + (error.message || 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout()
            navigate('/login')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h5m5 0v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5m5 0H7" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">{profile.businessName || 'Business Profile'}</h1>
                                <p className="text-purple-100">{profile.ownerName || 'Business Owner'}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setEditMode(!editMode)}
                                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center gap-2 font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                {editMode ? 'Cancel' : 'Edit Profile'}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-red-500/30 transition-all duration-200 flex items-center gap-2 font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Business Information Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h5m5 0v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5m5 0H7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Business Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Business Name */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                            </svg>
                            Business Name
                        </label>
                        {editMode ? (
                            <input
                                type="text"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-200"
                                placeholder="Enter business name"
                            />
                        ) : (
                            <div className="bg-gray-50 px-4 py-3 rounded-xl">
                                <p className="text-gray-900 font-medium">{profile.businessName || 'Not provided'}</p>
                            </div>
                        )}
                    </div>

                    {/* Owner Name */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Owner Name
                        </label>
                        {editMode ? (
                            <input
                                type="text"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-200"
                                placeholder="Enter owner name"
                            />
                        ) : (
                            <div className="bg-gray-50 px-4 py-3 rounded-xl">
                                <p className="text-gray-900 font-medium">{profile.ownerName || 'Not provided'}</p>
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email Address
                        </label>
                        {editMode ? (
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-200"
                                placeholder="Enter email address"
                            />
                        ) : (
                            <div className="bg-gray-50 px-4 py-3 rounded-xl">
                                <p className="text-gray-900 font-medium">{profile.email}</p>
                            </div>
                        )}
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Username
                        </label>
                        <div className="bg-purple-50 px-4 py-3 rounded-xl border-2 border-purple-100">
                            <p className="text-gray-900 font-medium">{profile.username}</p>
                            <p className="text-xs text-purple-600 mt-1">Username cannot be changed</p>
                        </div>
                    </div>

                    {/* Contact Number */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Contact Number
                        </label>
                        {editMode ? (
                            <input
                                type="text"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-200"
                                placeholder="Enter contact number"
                            />
                        ) : (
                            <div className="bg-gray-50 px-4 py-3 rounded-xl">
                                <p className="text-gray-900 font-medium">{profile.contactNumber}</p>
                            </div>
                        )}
                    </div>

                    {/* Business Type */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h5m5 0v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5m5 0H7" />
                            </svg>
                            Business Type
                        </label>
                        {editMode ? (
                            <input
                                type="text"
                                name="businessType"
                                value={formData.businessType}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-200"
                                placeholder="e.g., Transportation, Rental Services"
                            />
                        ) : (
                            <div className="bg-gray-50 px-4 py-3 rounded-xl">
                                <p className="text-gray-900 font-medium">{profile.businessType || 'Not provided'}</p>
                            </div>
                        )}
                    </div>

                    {/* Business License */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Business License
                        </label>
                        {editMode ? (
                            <input
                                type="text"
                                name="businessLicense"
                                value={formData.businessLicense}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-200"
                                placeholder="Enter business license number"
                            />
                        ) : (
                            <div className="bg-gray-50 px-4 py-3 rounded-xl">
                                <p className="text-gray-900 font-medium">{profile.businessLicense || 'Not provided'}</p>
                            </div>
                        )}
                    </div>

                    {/* Tax ID */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Tax ID
                        </label>
                        {editMode ? (
                            <input
                                type="text"
                                name="taxId"
                                value={formData.taxId}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-200"
                                placeholder="Enter tax identification number"
                            />
                        ) : (
                            <div className="bg-gray-50 px-4 py-3 rounded-xl">
                                <p className="text-gray-900 font-medium">{profile.taxId || 'Not provided'}</p>
                            </div>
                        )}
                    </div>

                    {/* Website */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            Website
                        </label>
                        {editMode ? (
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-200"
                                placeholder="https://www.yourbusiness.com"
                            />
                        ) : (
                            <div className="bg-gray-50 px-4 py-3 rounded-xl">
                                <p className="text-gray-900 font-medium">{profile.website || 'Not provided'}</p>
                            </div>
                        )}
                    </div>

                    {/* Business Description */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                            Business Description
                        </label>
                        {editMode ? (
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-200 resize-none"
                                placeholder="Describe your business, services, and what makes you unique..."
                            />
                        ) : (
                            <div className="bg-gray-50 px-4 py-3 rounded-xl min-h-[100px]">
                                <p className="text-gray-900 font-medium">{profile.description || 'Not provided'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Business Address Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Business Address</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Street Address */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h5m5 0v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5m5 0H7" />
                            </svg>
                            Street Address
                        </label>
                        {editMode ? (
                            <input
                                type="text"
                                name="businessAddress.street"
                                value={formData.businessAddress?.street || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    businessAddress: {
                                        ...formData.businessAddress,
                                        street: e.target.value
                                    }
                                })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                                placeholder="Enter street address"
                            />
                        ) : (
                            <div className="bg-gray-50 px-4 py-3 rounded-xl">
                                <p className="text-gray-900 font-medium">{profile.businessAddress?.street || 'Not provided'}</p>
                            </div>
                        )}
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3-2 3 2 3-2 3 2z" />
                            </svg>
                            City
                        </label>
                        {editMode ? (
                            <input
                                type="text"
                                name="businessAddress.city"
                                value={formData.businessAddress?.city || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    businessAddress: {
                                        ...formData.businessAddress,
                                        city: e.target.value
                                    }
                                })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                                placeholder="Enter city"
                            />
                        ) : (
                            <div className="bg-gray-50 px-4 py-3 rounded-xl">
                                <p className="text-gray-900 font-medium">{profile.businessAddress?.city || 'Not provided'}</p>
                            </div>
                        )}
                    </div>

                    {/* State */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            State/Province
                        </label>
                        {editMode ? (
                            <input
                                type="text"
                                name="businessAddress.state"
                                value={formData.businessAddress?.state || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    businessAddress: {
                                        ...formData.businessAddress,
                                        state: e.target.value
                                    }
                                })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                                placeholder="Enter state/province"
                            />
                        ) : (
                            <div className="bg-gray-50 px-4 py-3 rounded-xl">
                                <p className="text-gray-900 font-medium">{profile.businessAddress?.state || 'Not provided'}</p>
                            </div>
                        )}
                    </div>

                    {/* ZIP Code */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                            ZIP Code
                        </label>
                        {editMode ? (
                            <input
                                type="text"
                                name="businessAddress.zipCode"
                                value={formData.businessAddress?.zipCode || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    businessAddress: {
                                        ...formData.businessAddress,
                                        zipCode: e.target.value
                                    }
                                })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                                placeholder="Enter ZIP code"
                            />
                        ) : (
                            <div className="bg-gray-50 px-4 py-3 rounded-xl">
                                <p className="text-gray-900 font-medium">{profile.businessAddress?.zipCode || 'Not provided'}</p>
                            </div>
                        )}
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Country
                        </label>
                        {editMode ? (
                            <input
                                type="text"
                                name="businessAddress.country"
                                value={formData.businessAddress?.country || 'Sri Lanka'}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    businessAddress: {
                                        ...formData.businessAddress,
                                        country: e.target.value
                                    }
                                })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                                placeholder="Enter country"
                            />
                        ) : (
                            <div className="bg-gray-50 px-4 py-3 rounded-xl">
                                <p className="text-gray-900 font-medium">{profile.businessAddress?.country || 'Sri Lanka'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Account Information Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Account Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Registration Date */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Registration Date
                        </label>
                        <div className="bg-green-50 px-4 py-3 rounded-xl border-2 border-green-100">
                            <p className="text-gray-900 font-medium">{profile.registrationDate}</p>
                        </div>
                    </div>

                    {/* User ID */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                            User ID
                        </label>
                        <div className="bg-green-50 px-4 py-3 rounded-xl border-2 border-green-100">
                            <p className="text-gray-900 text-sm font-mono break-all">{userId}</p>
                        </div>
                    </div>

                    {/* Last Login */}
                    {sessionData && (
                        <div className="md:col-span-2 space-y-2">
                            <label className="flex items-center text-sm font-semibold text-gray-700">
                                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Last Login
                            </label>
                            <div className="bg-green-50 px-4 py-3 rounded-xl border-2 border-green-100">
                                <p className="text-gray-900 font-medium">{profile.loginTime}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Message Display */}
            {message && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg transition-all duration-300 ${message.includes('successfully')
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                    }`}>
                    <div className="flex items-center gap-3">
                        {message.includes('successfully') ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        <span className="font-medium">{message}</span>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {editMode && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-lg"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save Changes
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setEditMode(false)
                                setFormData(profile)
                                setMessage('')
                            }}
                            disabled={loading}
                            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 font-medium flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BusinessOwnerProfile
