import { HTTP } from './httpCommon-service';

class UploadService {
  // Upload single file
  uploadSingleFile = async (file, category = 'general', folder = 'pick-and-go') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('folder', folder);

    try {
      const response = await HTTP.post('/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Upload failed');
    }
  };

  // Upload multiple files
  uploadMultipleFiles = async (files, category = 'general', folder = 'pick-and-go') => {
    const formData = new FormData();
    
    // Append each file
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });
    
    formData.append('category', category);
    formData.append('folder', folder);

    try {
      const response = await HTTP.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Upload failed');
    }
  };

  // Upload profile image
  uploadProfileImage = async (imageFile, userId, userType) => {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    formData.append('userId', userId);
    formData.append('userType', userType);

    try {
      const response = await HTTP.post('/upload/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Profile image upload failed');
    }
  };

  // Upload document (license, registration, etc.)
  uploadDocument = async (documentFile, userId, userType, documentType) => {
    const formData = new FormData();
    formData.append('document', documentFile);
    formData.append('userId', userId);
    formData.append('userType', userType);
    formData.append('documentType', documentType);

    try {
      const response = await HTTP.post('/upload/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Document upload failed');
    }
  };

  // Delete file
  deleteFile = async (publicId) => {
    try {
      const response = await HTTP.delete(`/upload/${encodeURIComponent(publicId)}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'File deletion failed');
    }
  };

  // Validate file type
  validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']) => {
    return allowedTypes.includes(file.type);
  };

  // Validate file size (default 10MB)
  validateFileSize = (file, maxSize = 10 * 1024 * 1024) => {
    return file.size <= maxSize;
  };

  // Format file size for display
  formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file extension
  getFileExtension = (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  };

  // Create preview URL for images
  createPreviewURL = (file) => {
    if (file && file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  // Cleanup preview URL
  cleanupPreviewURL = (url) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  };
}

export default new UploadService();
