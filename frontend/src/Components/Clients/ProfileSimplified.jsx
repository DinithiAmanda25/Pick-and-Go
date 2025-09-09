import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AuthService } from '../../Services'

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

  const [profileImage, setProfileImage] = useState({
    file: null,
    preview: null,
    uploading: false
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Update profileData when profile prop changes
  useEffect(() => {
    if (profile) {
      console.log('Profile received in ProfileSimplified:', profile);
      console.log('Profile image URL:', profile?.profileImage?.url);

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
        licenseExpiry: profileData.licenseExpiry
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

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage({
          file: file,
          preview: e.target.result,
          uploading: false
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfileImage = async () => {
    if (!profileImage.file) return;

    setProfileImage(prev => ({ ...prev, uploading: true }));

    try {
      const formData = new FormData();
      formData.append('profileImage', profileImage.file);

      const response = await authService.uploadProfileImage(profile.userId, formData);

      if (response.success) {
        alert('Profile image uploaded successfully!');

        // Update the preview with the new Cloudinary URL
        setProfileImage(prev => ({
          ...prev,
          uploading: false,
          file: null,
          preview: response.profileImage.url
        }));

        // Trigger a page refresh to reload user data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert(error.message || 'Error uploading image. Please try again.');
      setProfileImage(prev => ({ ...prev, uploading: false }));
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('New password must be at least 8 characters long');
      return;
    }

    try {
      const response = await authService.changePassword(profile.userId, passwordData);

      if (response.success) {
        alert('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.message || 'Error changing password. Please try again.');
    }
  };

  const handleDeleteProfile = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      const response = await authService.deleteProfile(profile.userId);

      if (response.success) {
        alert('Profile deleted successfully. You will be redirected to the home page.');
        // Redirect to home page after deletion
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert(error.message || 'Error deleting profile. Please try again.');
    }
  };

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
      className="space-y-8"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h3>

      {/* Profile Image Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Profile Picture</h4>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              src={profileImage.preview || profile?.profileImage?.url || "/api/placeholder/120/120"}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
            {profileImage.uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <div className="text-white text-xs">Uploading...</div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              disabled={!isEditing}
              className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
            {profileImage.file && (
              <button
                onClick={uploadProfileImage}
                disabled={!isEditing || profileImage.uploading}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {profileImage.uploading ? 'Uploading...' : 'Upload Image'}
              </button>
            )}
            <p className="text-xs text-gray-500 mt-1">Max file size: 5MB. Supported formats: JPG, PNG, GIF</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">{/* Personal Info Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input
            type="text"
            value={profileData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input
            type="text"
            value={profileData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 text-sm"
          />
        </div>
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <input
            type="date"
            value={profileData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 text-sm"
          />
        </div>
      </div>

      <h4 className="text-lg font-semibold text-gray-800 mt-8 mb-6">Address Information</h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="lg:col-span-2 xl:col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
          <input
            type="text"
            value={profileData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            value={profileData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
          <input
            type="text"
            value={profileData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
          <input
            type="text"
            value={profileData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <input
            type="text"
            value={profileData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 text-sm"
          />
        </div>
      </div>
    </motion.div>
  )

  const renderAccountSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h3>

      {/* Account Info */}
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

      {/* Password Change Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm new password"
            />
          </div>
        </div>
        <button
          onClick={handlePasswordChange}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Change Password
        </button>
      </div>

      {/* Delete Profile Section */}
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <h4 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h4>
        <p className="text-red-600 mb-4">
          Once you delete your profile, there is no going back. Please be certain.
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Profile
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-red-800 font-medium">
              Are you absolutely sure? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteProfile}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Delete My Profile
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )

  return (
    <div className="w-full">
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
      <div className="min-h-[200px]">
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
