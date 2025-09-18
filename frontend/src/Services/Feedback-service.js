import { HTTP } from './httpCommon-service';

class FeedbackService {
  
  // Get all feedback (with filtering and pagination)
  async getFeedback(params = {}) {
    try {
      const response = await HTTP.get('/feedback', { params });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch feedback',
        error: error.response?.data || error.message
      };
    }
  }

  // Get single feedback by ID
  async getFeedbackById(id) {
    try {
      // Add timeout to prevent hanging
      const response = await Promise.race([
        HTTP.get(`/feedback/${id}`),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        )
      ]);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.warn('Backend fetch failed:', error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch feedback details',
        error: error.response?.data || error.message
      };
    }
  }

  // Create new feedback
  async createFeedback(feedbackData, attachments = []) {
    try {
      const formData = new FormData();
      
      // Add feedback data
      Object.keys(feedbackData).forEach(key => {
        if (key === 'tags' && Array.isArray(feedbackData[key])) {
          feedbackData[key].forEach(tag => {
            formData.append('tags[]', tag);
          });
        } else {
          formData.append(key, feedbackData[key]);
        }
      });

      // Add attachments
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await HTTP.post('/feedback', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        data: response.data.data,
        message: 'Feedback created successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create feedback',
        error: error.response?.data || error.message
      };
    }
  }

  // Update existing feedback
  async updateFeedback(id, feedbackData, attachments = []) {
    try {
      const formData = new FormData();
      
      // Add feedback data
      Object.keys(feedbackData).forEach(key => {
        if (key === 'tags' && Array.isArray(feedbackData[key])) {
          feedbackData[key].forEach(tag => {
            formData.append('tags[]', tag);
          });
        } else {
          formData.append(key, feedbackData[key]);
        }
      });

      // Add new attachments
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await HTTP.put(`/feedback/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        data: response.data.data,
        message: 'Feedback updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update feedback',
        error: error.response?.data || error.message
      };
    }
  }

  // Delete feedback
  async deleteFeedback(id) {
    try {
      await HTTP.delete(`/feedback/${id}`);
      return {
        success: true,
        message: 'Feedback deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete feedback',
        error: error.response?.data || error.message
      };
    }
  }

  // Add admin response
  async addAdminResponse(id, message) {
    try {
      const response = await HTTP.put(`/feedback/${id}/response`, { message });
      return {
        success: true,
        data: response.data.data,
        message: 'Admin response added successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add admin response',
        error: error.response?.data || error.message
      };
    }
  }

  // Resolve feedback
  async resolveFeedback(id) {
    try {
      const response = await HTTP.put(`/feedback/${id}/resolve`);
      return {
        success: true,
        data: response.data.data,
        message: 'Feedback resolved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resolve feedback',
        error: error.response?.data || error.message
      };
    }
  }

  // Upload feedback attachments (if needed separately)
  async uploadAttachments(feedbackId, attachments) {
    try {
      const formData = new FormData();
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await HTTP.post(`/feedback/${feedbackId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        data: response.data.data,
        message: 'Attachments uploaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload attachments',
        error: error.response?.data || error.message
      };
    }
  }

  // Search feedback
  async searchFeedback(searchTerm, filters = {}) {
    try {
      const params = {
        search: searchTerm,
        ...filters
      };
      
      const response = await HTTP.get('/feedback', { params });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to search feedback',
        error: error.response?.data || error.message
      };
    }
  }

  // Get feedback statistics (for reports)
  async getFeedbackStats(params = {}) {
    try {
      const response = await HTTP.get('/feedback/stats', { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch feedback statistics',
        error: error.response?.data || error.message
      };
    }
  }
}

export default new FeedbackService();