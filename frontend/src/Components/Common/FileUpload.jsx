import React, { useState, useRef } from 'react';
import uploadService from '../../Services/upload-service';

const FileUpload = ({
  onUploadSuccess,
  onUploadError,
  acceptedTypes = 'image/*,application/pdf',
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  uploadType = 'single', // 'single', 'profile', 'document'
  userId,
  userType,
  documentType,
  category = 'general',
  className = '',
  children
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Validate files
    for (const file of fileArray) {
      if (!uploadService.validateFileSize(file, maxSize)) {
        onUploadError && onUploadError(`File ${file.name} is too large. Max size: ${uploadService.formatFileSize(maxSize)}`);
        return;
      }
    }

    setUploading(true);

    try {
      let result;

      switch (uploadType) {
        case 'profile':
          if (fileArray.length > 1) {
            throw new Error('Only one profile image can be uploaded at a time');
          }
          result = await uploadService.uploadProfileImage(fileArray[0], userId, userType);
          break;

        case 'document':
          if (fileArray.length > 1) {
            throw new Error('Only one document can be uploaded at a time');
          }
          result = await uploadService.uploadDocument(fileArray[0], userId, userType, documentType);
          break;

        case 'multiple':
          result = await uploadService.uploadMultipleFiles(fileArray, category);
          break;

        default: // single
          if (fileArray.length > 1) {
            throw new Error('Only one file can be uploaded at a time');
          }
          result = await uploadService.uploadSingleFile(fileArray[0], category);
          break;
      }

      // Create preview for images
      if (fileArray[0] && fileArray[0].type.startsWith('image/')) {
        const previewUrl = uploadService.createPreviewURL(fileArray[0]);
        setPreview(previewUrl);
      }

      onUploadSuccess && onUploadSuccess(result);
    } catch (error) {
      onUploadError && onUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Open file dialog
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Clean up preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (preview) {
        uploadService.cleanupPreviewURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className={`relative ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        multiple={multiple}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={uploading}
      />

      {/* Drop zone */}
      <div
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : children ? (
          children
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-600">
              {dragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-400">
              Max size: {uploadService.formatFileSize(maxSize)}
            </p>
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="mt-4">
          <img
            src={preview}
            alt="Preview"
            className="max-w-full h-32 object-cover rounded-lg border"
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
