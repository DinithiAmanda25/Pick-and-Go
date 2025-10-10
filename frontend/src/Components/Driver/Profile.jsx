import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { baseURL } from '../../Config/Settings.js'

function DriverProfile({ driver }) {
    const [editMode, setEditMode] = useState(false)
    const [formData, setFormData] = useState({})
    const [errors, setErrors] = useState({})
    const [localDriver, setLocalDriver] = useState(driver || {})
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    // Initialize formData and localDriver when driver or user data changes
    useEffect(() => {
        if (driver || user) {
            setLocalDriver(driver || {})
            setFormData({
                name: user?.fullName || driver?.name || driver?.fullName || '',
                email: driver?.email || user?.email || '',
                phone: driver?.phone || '',
                licenseNumber: driver?.licenseNumber || ''
            })
        }
    }, [driver, user])

    const validateField = (name, value) => {
        const newErrors = { ...errors }

        switch (name) {
            case 'phone':
                if (!value.trim()) {
                    newErrors.phone = 'Phone number is required'
                } else {
                    // Remove all non-digit characters for validation
                    const cleanPhone = value.replace(/[^0-9]/g, '')
                    
                    // Check for exactly 10 digits
                    if (cleanPhone.length === 10) {
                        // Valid 10-digit phone number
                        if (!/^[0-9]{10}$/.test(cleanPhone)) {
                            newErrors.phone = 'Phone number must contain only digits'
                        } else {
                            delete newErrors.phone
                        }
                    } else {
                        newErrors.phone = 'Phone number must be exactly 10 digits'
                    }
                }
                break

            case 'licenseNumber':
                if (!value.trim()) {
                    newErrors.licenseNumber = 'License number is required'
                } else {
                    // Sri Lankan license number format: Letter followed by 7 digits (e.g., B1234567)
                    const licensePattern = /^[A-Z][0-9]{7}$/
                    const cleanLicense = value.trim().toUpperCase()
                    
                    if (!licensePattern.test(cleanLicense)) {
                        newErrors.licenseNumber = 'License number must be in format: 1 letter followed by 7 digits (e.g., B1234567)'
                    } else {
                        delete newErrors.licenseNumber
                    }
                }
                break

            case 'name':
                if (!value.trim()) {
                    newErrors.name = 'Full name is required'
                } else if (value.trim().length < 2) {
                    newErrors.name = 'Name must be at least 2 characters long'
                } else {
                    delete newErrors.name
                }
                break

            case 'email':
                if (!value.trim()) {
                    newErrors.email = 'Email is required'
                } else if (!/\S+@\S+\.\S+/.test(value)) {
                    newErrors.email = 'Email format is invalid'
                } else {
                    delete newErrors.email
                }
                break

            default:
                break
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
        
        // Real-time validation
        validateField(name, value)
    }

    const handleBlur = (e) => {
        const { name, value } = e.target
        validateField(name, value)
    }

    const handleSave = async () => {
        // Validate all fields before saving
        const fieldsToValidate = ['name', 'email', 'phone']
        let hasErrors = false

        fieldsToValidate.forEach(field => {
            const isValid = validateField(field, formData[field] || '')
            if (!isValid) {
                hasErrors = true
            }
        })

        if (hasErrors) {
            alert('Please fix all validation errors before saving.')
            return
        }

        try {
            // Map frontend field names to backend expected field names
            // Only send fields that exist in the Driver model
            const updateData = {
                fullName: formData.name || formData.fullName,
                phone: formData.phone,
                email: formData.email
                // Note: licenseNumber is stored as documents.license, not as a separate field
            }

            console.log('Updating profile with data:', updateData)
            console.log('User ID:', user.id)
            console.log('API URL:', `${baseURL}/drivers/${user.id}`)

            const response = await fetch(`${baseURL}/drivers/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            })

            if (response.ok) {
                const result = await response.json()
                console.log('Profile update response:', result)
                // Update local driver state with the new data
                setLocalDriver({ ...localDriver, ...formData })
                setEditMode(false)
                setErrors({}) // Clear any errors after successful save
                alert('Profile updated successfully!')
            } else {
                const errorData = await response.json()
                console.error('Profile update failed:', errorData)
                alert(`Failed to update profile: ${errorData.message || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            alert('An error occurred while updating profile. Please check your connection and try again.')
        }
    }

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout()
            navigate('/login')
        }
    }

    // Generate initials from full name
    const getInitials = (name) => {
        if (!name) return 'D'
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    }

    const renderStars = (rating) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 !== 0
        
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            )
        }
        
        if (hasHalfStar) {
            stars.push(
                <svg key="half" className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            )
        }
        
        // Fill remaining with empty stars
        for (let i = stars.length; i < 5; i++) {
            stars.push(
                <svg key={i} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            )
        }
        
        return stars
    }

    return (
        <div className="space-y-8">
            {/* Profile Header Card */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-8 py-6">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-6">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                                {getInitials(user?.fullName || localDriver?.name || localDriver?.fullName || formData?.name)}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    {user?.fullName || localDriver?.name || localDriver?.fullName || formData?.name || 'Driver Name'}
                                </h1>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-1">
                                        {renderStars(driver?.rating || 4.8)}
                                        <span className="text-white/90 ml-2 font-medium">
                                            {driver?.rating || '4.8'} Rating
                                        </span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        driver?.isOnline 
                                            ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
                                            : 'bg-gray-500/20 text-gray-100 border border-gray-400/30'
                                    }`}>
                                        {driver?.isOnline ? '🟢 Online' : '⚫ Offline'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setEditMode(!editMode)}
                                className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center gap-2 border border-white/20"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                {editMode ? 'Cancel' : 'Edit Profile'}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500/20 backdrop-blur-sm text-white px-6 py-2 rounded-lg hover:bg-red-500/30 transition-all duration-200 flex items-center gap-2 border border-red-400/30"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Stats Bar */}
                <div className="bg-white/60 backdrop-blur-sm px-8 py-4">
                    <div className="flex justify-around text-center">
                        <div>
                            <div className="text-2xl font-bold text-orange-700">
                                {driver?.totalTrips?.toLocaleString() || '1,256'}
                            </div>
                            <div className="text-sm text-orange-600 font-medium">Total Trips</div>
                        </div>
                        <div className="border-l border-orange-200 pl-8">
                            <div className="text-2xl font-bold text-orange-700">
                                {new Date(driver?.joinDate || '2023-01-15').getFullYear()}
                            </div>
                            <div className="text-sm text-orange-600 font-medium">Member Since</div>
                        </div>
                        <div className="border-l border-orange-200 pl-8">
                            <div className="text-2xl font-bold text-orange-700">Pro</div>
                            <div className="text-sm text-orange-600 font-medium">Driver Level</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Details Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Personal Information
                    </h2>
                </div>
                
                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Personal Details */}
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                                <label className="block text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Full Name</label>
                                {editMode ? (
                                    <div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData?.name || ''}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent text-lg font-medium transition-all duration-300 ${
                                                errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                                            }`}
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-sm mt-2 flex items-center">
                                                <span className="mr-1">⚠️</span>
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-lg font-medium text-gray-900">
                                        {user?.fullName || localDriver?.name || localDriver?.fullName || formData?.name || 'Not provided'}
                                    </p>
                                )}
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                                <label className="block text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Email Address</label>
                                {editMode ? (
                                    <div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData?.email || ''}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent text-lg font-medium transition-all duration-300 ${
                                                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                                            }`}
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-2 flex items-center">
                                                <span className="mr-1">⚠️</span>
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {localDriver?.email || formData?.email || 'Not provided'}
                                    </p>
                                )}
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                                <label className="block text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Phone Number</label>
                                {editMode ? (
                                    <div>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData?.phone || ''}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent text-lg font-medium transition-all duration-300 ${
                                                errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                                            }`}
                                            placeholder="1234567890 (10 digits only)"
                                        />
                                        {errors.phone && (
                                            <p className="text-red-500 text-sm mt-2 flex items-center">
                                                <span className="mr-1">⚠️</span>
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {localDriver?.phone || formData?.phone || 'Not provided'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Professional Details */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                                <label className="block text-sm font-semibold text-orange-700 mb-3 uppercase tracking-wide">License Document</label>
                                <p className="text-lg font-bold text-orange-800 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {driver?.documents?.license?.url ? 'Uploaded' : 'Not uploaded'}
                                </p>
                                {editMode && (
                                    <p className="text-sm text-orange-600 mt-2">
                                        ℹ️ License documents can only be updated through the onboarding process
                                    </p>
                                )}
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                                <label className="block text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Driver Rating</label>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center space-x-1">
                                        {renderStars(driver?.rating || 4.8)}
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">
                                        {driver?.rating || '4.8'}
                                    </span>
                                    <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                        based on {driver?.totalTrips || '1,256'} trips
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                                <label className="block text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Member Since</label>
                                <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {new Date(driver?.joinDate || '2023-01-15').toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {editMode && (
                        <div className="mt-8 pt-8 border-t border-gray-200 flex gap-4">
                            <button
                                onClick={handleSave}
                                className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-3 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Save Changes
                            </button>
                            <button
                                onClick={() => setEditMode(false)}
                                className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DriverProfile
