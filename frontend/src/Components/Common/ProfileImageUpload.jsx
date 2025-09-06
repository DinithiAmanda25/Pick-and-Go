import React, { useState } from 'react';
import FileUpload from '../Common/FileUpload';

const ProfileImageUpload = ({ userId, userType, currentImage, onImageUpdate }) => {
  const [uploadedImage, setUploadedImage] = useState(currentImage);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUploadSuccess = (result) => {
    const imageData = result.profileImage || result.file;
    setUploadedImage(imageData);
    setError('');
    onImageUpdate && onImageUpdate(imageData);
  };

  const handleUploadError = (errorMessage) => {
    setError(errorMessage);
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Picture</h3>
        
        {/* Current/Uploaded Image Display */}
        {uploadedImage && (
          <div className="mb-4">
            <img
              src={uploadedImage.url}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
            />
            <p className="text-sm text-gray-500 mt-2">
              Uploaded: {new Date(uploadedImage.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Upload Component */}
        <FileUpload
          uploadType="profile"
          userId={userId}
          userType={userType}
          acceptedTypes="image/*"
          maxSize={5 * 1024 * 1024} // 5MB for profile images
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          className="max-w-md mx-auto"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Upload Profile Picture</p>
            <p className="text-xs text-gray-400">JPG, PNG, GIF up to 5MB</p>
          </div>
        </FileUpload>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileImageUpload;
