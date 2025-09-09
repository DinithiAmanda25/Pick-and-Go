import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import vehicleOwnerService from '../../Services/vehicle-owner-service.js'

function VehicleOwnerProfile({ profile }) {
    const { user, getCurrentUserId } = useAuth()
    const userId = getCurrentUserId()

    const [activeTab, setActiveTab] = useState('personal')
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)

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
        // Basic Registration Information (from signup)
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        email: profile?.email || '',
        phone: profile?.phone || '',

        // Address information from registration
        address: profile?.address?.street || '',
        city: profile?.address?.city || '',
        state: profile?.address?.state || '',
        zipCode: profile?.address?.zipCode || '',
        country: 'Sri Lanka',

        // Additional Profile Information (can be added/updated later)
        dateOfBirth: profile?.dateOfBirth || '',
        ownerType: profile?.ownerType || 'Individual Owner',
        vehicleOwnershipExperience: profile?.vehicleOwnershipExperience || '',
        previousExperience: profile?.previousExperience || '',
        specializations: profile?.specializations || [],

        // Insurance Information (optional - to be added through profile)
        insuranceProvider: profile?.insuranceProvider || '',
        insurancePolicyNumber: profile?.insurancePolicyNumber || '',
        insuranceExpiry: profile?.insuranceExpiry || '',
        personalInsuranceNumber: profile?.personalInsuranceNumber || '',

        // Registration details (read-only)
        registrationDate: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '',
        lastUpdated: profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : '',
        accountStatus: profile?.isActive ? 'Active' : 'Inactive',

        // Rating information
        rating: profile?.rating || 0,
        totalRatings: profile?.totalRatings || 0,
        ratingCount: profile?.ratingCount || 0,

        // Document status
        documentsUploaded: {
            profilePhoto: !!profile?.profileImage?.url,
            identity: !!profile?.documents?.find(doc => doc.type === 'identity')
        }
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [profileImage, setProfileImage] = useState({
        file: null,
        preview: null,
        uploading: false
    })

    const [documents, setDocuments] = useState({
        identity: { file: null, uploading: false, progress: 0 }
    })

    const [documentPreviews, setDocumentPreviews] = useState({})
    const [uploadedDocuments, setUploadedDocuments] = useState([])
    const [documentErrors, setDocumentErrors] = useState({})

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [reviews, setReviews] = useState([])
    const [reviewsLoading, setReviewsLoading] = useState(false)
    const [ratingBreakdown, setRatingBreakdown] = useState({
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    })

    // Update form data when profile changes
    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                firstName: profile?.firstName || '',
                lastName: profile?.lastName || '',
                email: profile?.email || '',
                phone: profile?.phone || '',
                address: profile?.address?.street || '',
                city: profile?.address?.city || '',
                state: profile?.address?.state || '',
                zipCode: profile?.address?.zipCode || '',
                dateOfBirth: profile?.dateOfBirth || '',
                ownerType: profile?.ownerType || 'Individual Owner',
                vehicleOwnershipExperience: profile?.vehicleOwnershipExperience || '',
                previousExperience: profile?.previousExperience || '',
                specializations: profile?.specializations || [],
                insuranceProvider: profile?.insuranceProvider || '',
                insurancePolicyNumber: profile?.insurancePolicyNumber || '',
                insuranceExpiry: profile?.insuranceExpiry || '',
                personalInsuranceNumber: profile?.personalInsuranceNumber || '',
                registrationDate: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '',
                lastUpdated: profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : '',
                accountStatus: profile?.isActive ? 'Active' : 'Inactive',
                documentsUploaded: {
                    profilePhoto: !!profile?.profileImage?.url,
                    license: !!profile?.documents?.find(doc => doc.type === 'license'),
                    insurance: !!profile?.documents?.find(doc => doc.type === 'insurance'),
                    registration: !!profile?.documents?.find(doc => doc.type === 'registration'),
                    identity: !!profile?.documents?.find(doc => doc.type === 'identity')
                }
            }))
        }
    }, [profile])

    // Fetch reviews when component loads
    useEffect(() => {
        if (userId && activeTab === 'rating') {
            fetchReviews()
        }
    }, [userId, activeTab])

    const fetchReviews = async () => {
        setReviewsLoading(true)
        try {
            const result = await vehicleOwnerService.getReviews(userId)
            if (result.success) {
                setReviews(result.reviews || [])
                setRatingBreakdown(result.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })
            }
        } catch (error) {
            console.error('Error fetching reviews:', error)
        } finally {
            setReviewsLoading(false)
        }
    }

    const handleInputChange = (e, dataType = 'personal') => {
        const { name, value, type, checked } = e.target
        const newValue = type === 'checkbox' ? checked : value

        if (dataType === 'personal') {
            setFormData(prev => ({ ...prev, [name]: newValue }))
        } else if (dataType === 'password') {
            setPasswordData(prev => ({ ...prev, [name]: newValue }))
        }
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const profileUpdateData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: {
                    street: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode
                },
                dateOfBirth: formData.dateOfBirth
            }

            const result = await vehicleOwnerService.updateProfile(userId, profileUpdateData)

            if (result.success) {
                setIsEditing(false)
                alert('Profile updated successfully!')
                // The service will automatically update localStorage
            } else {
                alert(result.message || 'Failed to update profile')
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            alert(error.message || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const handleProfileImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file')
            return
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB')
            return
        }

        setProfileImage(prev => ({
            ...prev,
            file,
            preview: URL.createObjectURL(file),
            uploading: true
        }))

        try {
            const formData = new FormData()
            formData.append('profileImage', file)

            const result = await vehicleOwnerService.uploadProfileImage(userId, formData)

            if (result.success) {
                alert('Profile image uploaded successfully!')
                // Force a page refresh to update the profile image
                window.location.reload()
            } else {
                alert(result.message || 'Failed to upload image')
            }
        } catch (error) {
            console.error('Error uploading profile image:', error)
            alert(error.message || 'Failed to upload image')
        } finally {
            setProfileImage(prev => ({
                ...prev,
                uploading: false
            }))
        }
    }

    const validateFile = (file, documentType) => {
        const errors = []

        // File type validation
        const allowedTypes = {
            'image/jpeg': 'JPEG',
            'image/jpg': 'JPG',
            'image/png': 'PNG',
            'image/gif': 'GIF',
            'application/pdf': 'PDF'
        }

        if (!allowedTypes[file.type]) {
            errors.push('Please select an image (JPEG, PNG, GIF) or PDF file')
        }

        // File size validation (10MB)
        const maxSize = 10 * 1024 * 1024
        if (file.size > maxSize) {
            errors.push('File size must be less than 10MB')
        }

        // File name validation
        if (file.name.length > 100) {
            errors.push('File name must be less than 100 characters')
        }

        return errors
    }

    const createFilePreview = (file) => {
        if (file.type.startsWith('image/')) {
            return URL.createObjectURL(file)
        }
        return null // For PDFs, we'll show a PDF icon
    }

    const handleDocumentUpload = async (documentType, file) => {
        if (!file) return

        // Clear previous errors
        setDocumentErrors(prev => ({
            ...prev,
            [documentType]: []
        }))

        // Validate file
        const validationErrors = validateFile(file, documentType)
        if (validationErrors.length > 0) {
            setDocumentErrors(prev => ({
                ...prev,
                [documentType]: validationErrors
            }))
            return
        }

        // Create preview
        const preview = createFilePreview(file)
        setDocumentPreviews(prev => ({
            ...prev,
            [documentType]: preview
        }))

        // Set uploading state
        setDocuments(prev => ({
            ...prev,
            [documentType]: {
                ...prev[documentType],
                uploading: true,
                progress: 0,
                file: file
            }
        }))

        try {
            const formData = new FormData()
            formData.append('document', file)

            // Simulate progress (in real implementation, you'd use XMLHttpRequest or axios with progress callback)
            const progressInterval = setInterval(() => {
                setDocuments(prev => ({
                    ...prev,
                    [documentType]: {
                        ...prev[documentType],
                        progress: Math.min(prev[documentType].progress + 10, 90)
                    }
                }))
            }, 200)

            const result = await vehicleOwnerService.uploadDocument(userId, documentType, formData)

            clearInterval(progressInterval)

            if (result.success) {
                // Complete progress
                setDocuments(prev => ({
                    ...prev,
                    [documentType]: {
                        ...prev[documentType],
                        progress: 100
                    }
                }))

                // Update uploaded documents
                setUploadedDocuments(prev => {
                    const filtered = prev.filter(doc => doc.type !== documentType)
                    return [...filtered, result.document]
                })

                // Update form data
                setFormData(prev => ({
                    ...prev,
                    documentsUploaded: {
                        ...prev.documentsUploaded,
                        [documentType]: true
                    }
                }))

                // Show success message
                alert(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} uploaded successfully!`)

                // Refresh profile to get updated document status
                setTimeout(() => {
                    window.location.reload() // This could be improved by refetching profile data
                }, 1000)

            } else {
                setDocumentErrors(prev => ({
                    ...prev,
                    [documentType]: [result.message || 'Failed to upload document']
                }))
            }
        } catch (error) {
            console.error('Error uploading document:', error)
            setDocumentErrors(prev => ({
                ...prev,
                [documentType]: [error.message || 'Failed to upload document']
            }))
        } finally {
            setDocuments(prev => ({
                ...prev,
                [documentType]: {
                    ...prev[documentType],
                    uploading: false,
                    progress: 0
                }
            }))
        }
    }

    const handleDocumentDelete = async (documentType) => {
        if (!confirm(`Are you sure you want to delete your ${documentType} document?`)) {
            return
        }

        try {
            const result = await vehicleOwnerService.deleteDocument(userId, documentType)

            if (result.success) {
                // Remove from uploaded documents
                setUploadedDocuments(prev => prev.filter(doc => doc.type !== documentType))

                // Update form data
                setFormData(prev => ({
                    ...prev,
                    documentsUploaded: {
                        ...prev.documentsUploaded,
                        [documentType]: false
                    }
                }))

                // Clear preview
                setDocumentPreviews(prev => ({
                    ...prev,
                    [documentType]: null
                }))

                alert(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} document deleted successfully!`)
            } else {
                alert(result.message || 'Failed to delete document')
            }
        } catch (error) {
            console.error('Error deleting document:', error)
            alert(error.message || 'Failed to delete document')
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New password and confirm password do not match')
            return
        }

        if (passwordData.newPassword.length < 8) {
            alert('New password must be at least 8 characters long')
            return
        }

        setLoading(true)
        try {
            const result = await vehicleOwnerService.changePassword(userId, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })

            if (result.success) {
                alert('Password changed successfully!')
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })
            } else {
                alert(result.message || 'Failed to change password')
            }
        } catch (error) {
            console.error('Error changing password:', error)
            alert(error.message || 'Failed to change password')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteProfile = async () => {
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true)
            return
        }

        setLoading(true)
        try {
            const result = await vehicleOwnerService.deleteProfile(userId)

            if (result.success) {
                alert('Profile deleted successfully!')
                // Redirect to login page
                window.location.href = '/login'
            } else {
                alert(result.message || 'Failed to delete profile')
            }
        } catch (error) {
            console.error('Error deleting profile:', error)
            alert(error.message || 'Failed to delete profile')
        } finally {
            setLoading(false)
            setShowDeleteConfirm(false)
        }
    }

    const renderPersonalInfo = () => (
        <div className="space-y-6">
            <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                    <img
                        src={profileImage.preview || profile?.profileImage?.url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='0.3em' font-family='Arial, sans-serif' font-size='14' fill='%236b7280'%3EVO%3C/text%3E%3C/svg%3E"}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-green-200"
                    />
                    <label className="absolute bottom-2 right-2 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageUpload}
                            className="hidden"
                            disabled={profileImage.uploading}
                        />
                        {profileImage.uploading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                    </label>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{formData.firstName} {formData.lastName}</h2>
                    <p className="text-gray-600">Vehicle Owner since {profile?.joinDate || '2023-03-15'}</p>
                    <div className="flex items-center space-x-4 mt-2">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            ⭐ {profile?.rating?.toFixed(1) || '0.0'} Rating ({profile?.ratingCount || 0} reviews)
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            🚗 {profile?.vehicles?.length || 0} Vehicles
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information Section */}
                <div className="md:col-span-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">Personal Information</h3>
                        <p className="text-blue-700 text-sm">Your personal details and contact information</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
                    />
                </div>

                {/* Address Information */}
                <div className="md:col-span-2">
                    <h4 className="text-md font-semibold text-gray-800 mb-3 mt-4">
                        Address Information
                    </h4>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                    <input
                        type="text"
                        name="state"
                        value={formData.state}
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

                {/* Account Information */}
                <div className="md:col-span-2">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Account Information</h3>
                        <p className="text-gray-700 text-sm">Read-only account details</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Date</label>
                    <input
                        type="text"
                        value={formData.registrationDate}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                </div>
            </div>
        </div>
    )

    const renderRatingSection = () => (
        <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <h3 className="text-yellow-800 font-medium">Rating & Reviews</h3>
                </div>
                <p className="text-yellow-700 text-sm mt-1">Your service rating based on customer feedback</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Overall Rating */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold text-yellow-600 mb-2">
                        {profile?.rating?.toFixed(1) || '0.0'}
                    </div>
                    <div className="flex justify-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                                key={star}
                                className={`w-5 h-5 ${star <= (profile?.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <p className="text-sm text-gray-600">Overall Rating</p>
                </div>

                {/* Total Reviews */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                        {profile?.ratingCount || 0}
                    </div>
                    <p className="text-sm text-gray-600">Total Reviews</p>
                </div>

                {/* Rating Status */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-2xl mb-2">
                        {(profile?.rating || 0) >= 4.5 ? '🌟' :
                            (profile?.rating || 0) >= 4.0 ? '⭐' :
                                (profile?.rating || 0) >= 3.0 ? '👍' : '📈'}
                    </div>
                    <p className="text-sm font-medium text-gray-800">
                        {(profile?.rating || 0) >= 4.5 ? 'Excellent' :
                            (profile?.rating || 0) >= 4.0 ? 'Very Good' :
                                (profile?.rating || 0) >= 3.0 ? 'Good' : 'Needs Improvement'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Service Quality</p>
                </div>
            </div>

            {/* Rating Breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Rating Breakdown</h4>
                <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((stars) => {
                        const count = ratingBreakdown[stars] || 0;
                        const percentage = profile?.ratingCount ? (count / profile.ratingCount) * 100 : 0;
                        return (
                            <div key={stars} className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-700 w-8">{stars}★</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm text-gray-600 w-12">{count}</span>
                            </div>
                        );
                    })}
                </div>
                {profile?.ratingCount === 0 && (
                    <p className="text-center text-gray-500 mt-4">No reviews yet</p>
                )}
            </div>

            {/* Recent Reviews */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">Recent Reviews</h4>
                    <button
                        onClick={fetchReviews}
                        disabled={reviewsLoading}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                    >
                        {reviewsLoading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>

                {reviewsLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {reviews.map((review, index) => (
                            <div key={review._id || index} className="border-b border-gray-100 pb-4 last:border-b-0">
                                <div className="flex items-start space-x-3">
                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-medium">
                                        {review.clientName ? review.clientName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h5 className="font-medium text-gray-800">{review.clientName || 'Anonymous'}</h5>
                                            <span className="text-xs text-gray-500">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <svg
                                                    key={star}
                                                    className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                            <span className="ml-2 text-sm text-gray-600">{review.rating}/5</span>
                                        </div>
                                        {review.comment && (
                                            <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                                        )}
                                        {review.serviceType && (
                                            <div className="mt-2">
                                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                    {review.serviceType}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                        <p className="text-gray-500">You haven't received any reviews from customers yet.</p>
                    </div>
                )}
            </div>

            {/* Rating Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-blue-800 font-medium mb-2">💡 Tips to Improve Your Rating</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Maintain clean and well-maintained vehicles</li>
                    <li>• Respond promptly to booking requests</li>
                    <li>• Provide excellent customer service</li>
                    <li>• Keep vehicles properly insured and documented</li>
                    <li>• Be flexible with pickup and drop-off times</li>
                </ul>
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
                    <h3 className="text-blue-800 font-medium">Document Verification Center</h3>
                </div>
                <p className="text-blue-700 text-sm mt-1">Upload and manage your identity verification document securely.</p>
            </div>

            {/* Document Upload Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                    {
                        key: 'identity',
                        name: 'Identity Verification',
                        description: 'National ID card, passport, or equivalent identity document',
                        icon: '🆔',
                        required: true
                    }
                ].map((doc) => {
                    const isUploaded = formData.documentsUploaded[doc.key]
                    const isUploading = documents[doc.key]?.uploading
                    const progress = documents[doc.key]?.progress || 0
                    const hasError = documentErrors[doc.key]?.length > 0
                    const preview = documentPreviews[doc.key]

                    return (
                        <div key={doc.key} className={`border-2 rounded-xl p-6 transition-all duration-200 ${isUploaded ? 'border-green-200 bg-green-50' :
                            hasError ? 'border-red-200 bg-red-50' :
                                'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                            }`}>
                            <div className="flex items-start space-x-4">
                                <div className="text-3xl">{doc.icon}</div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-800">{doc.name}</h4>
                                        <div className="flex items-center space-x-2">
                                            {doc.required && (
                                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                                    Required
                                                </span>
                                            )}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${isUploaded ? 'bg-green-100 text-green-800' :
                                                hasError ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                {isUploaded ? 'Uploaded' : hasError ? 'Error' : 'Not Uploaded'}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-4">{doc.description}</p>

                                    {/* File Preview */}
                                    {preview && (
                                        <div className="mb-4">
                                            <img
                                                src={preview}
                                                alt={`${doc.name} preview`}
                                                className="w-24 h-24 object-cover rounded-lg border"
                                            />
                                        </div>
                                    )}

                                    {/* Upload Progress */}
                                    {isUploading && (
                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                <span>Uploading...</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Error Messages */}
                                    {hasError && (
                                        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                                            {documentErrors[doc.key].map((error, index) => (
                                                <p key={index} className="text-sm text-red-700">• {error}</p>
                                            ))}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center space-x-3">
                                        <label className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center space-x-2 ${isUploading ? 'bg-gray-400 text-white cursor-not-allowed' :
                                            isUploaded ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                                'bg-green-600 hover:bg-green-700 text-white'
                                            }`}>
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={(e) => {
                                                    const file = e.target.files[0]
                                                    if (file) {
                                                        handleDocumentUpload(doc.key, file)
                                                    }
                                                }}
                                                className="hidden"
                                                disabled={isUploading}
                                            />
                                            {isUploading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    <span>{isUploaded ? 'Replace' : 'Upload'}</span>
                                                </>
                                            )}
                                        </label>

                                        {isUploaded && (
                                            <>
                                                <button
                                                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium flex items-center space-x-2"
                                                    onClick={() => {
                                                        // Open document in new tab
                                                        const uploadedDoc = uploadedDocuments.find(d => d.type === doc.key)
                                                        if (uploadedDoc) {
                                                            window.open(uploadedDoc.url, '_blank')
                                                        }
                                                    }}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    <span>View</span>
                                                </button>
                                                <button
                                                    className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium flex items-center space-x-2"
                                                    onClick={() => handleDocumentDelete(doc.key)}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    <span>Delete</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Upload Guidelines */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 mb-2">📋 Upload Guidelines</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Accepted formats: JPEG, PNG, GIF, PDF</li>
                    <li>• Maximum file size: 10MB per document</li>
                    <li>• Ensure identity document is clear and readable</li>
                    <li>• All personal information should be visible</li>
                    <li>• Identity document must be valid and not expired</li>
                    <li>• Upload National ID, Passport, or equivalent government-issued ID</li>
                </ul>
            </div>

            {/* Overall Verification Status */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Verification Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h4 className="font-medium text-gray-800">Profile Complete</h4>
                        <p className="text-sm text-gray-600">Basic profile information verified</p>
                    </div>
                    <div className={`text-center p-4 rounded-lg ${Object.values(formData.documentsUploaded).filter(Boolean).length >= 1
                        ? 'bg-green-50' : 'bg-amber-50'
                        }`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${Object.values(formData.documentsUploaded).filter(Boolean).length >= 1
                            ? 'bg-green-600' : 'bg-amber-600'
                            }`}>
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {Object.values(formData.documentsUploaded).filter(Boolean).length >= 1 ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                            </svg>
                        </div>
                        <h4 className="font-medium text-gray-800">
                            {Object.values(formData.documentsUploaded).filter(Boolean).length >= 1 ? 'Documents Complete' : 'Documents Pending'}
                        </h4>
                        <p className="text-sm text-gray-600">
                            {Object.values(formData.documentsUploaded).filter(Boolean).length}/1 required document uploaded
                        </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h4 className="font-medium text-gray-800">Ready to Start</h4>
                        <p className="text-sm text-gray-600">Account ready for vehicle operations</p>
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
                {/* Password Change Section */}
                <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={(e) => handleInputChange(e, 'password')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Enter current password"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={(e) => handleInputChange(e, 'password')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Enter new password (min 8 characters)"
                                minLength="8"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={(e) => handleInputChange(e, 'password')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Confirm new password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Changing Password...
                                </span>
                            ) : (
                                'Change Password'
                            )}
                        </button>
                    </form>
                </div>

                {/* Delete Account Section */}
                <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <h3 className="text-lg font-semibold text-red-800 mb-4">Delete Account</h3>
                    <p className="text-red-700 text-sm mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                    </p>

                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Delete Account
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-red-800 font-medium">Are you sure you want to delete your account?</p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleDeleteProfile}
                                    disabled={loading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                                >
                                    {loading ? 'Deleting...' : 'Yes, Delete Account'}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
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
                        onClick={() => setActiveTab('rating')}
                        className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'rating'
                            ? 'border-green-500 text-green-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Rating & Reviews
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
                {activeTab === 'rating' && renderRatingSection()}
                {activeTab === 'documents' && renderDocumentsVerification()}
                {activeTab === 'security' && renderSecuritySettings()}
            </div>
        </div>
    )
}

export default VehicleOwnerProfile
