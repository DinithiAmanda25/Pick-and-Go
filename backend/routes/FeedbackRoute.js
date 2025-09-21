const express = require('express');
const {
  getFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  addAdminResponse,
  resolveFeedback,
  getSimpleFeedbackDisplay
} = require('../controllers/FeedbackController');

const { uploadFeedbackAttachments, handleUploadError } = require('../middleware/fileUpload');

const router = express.Router();

// Simple middleware to add mock user for testing
const addMockUser = (req, res, next) => {
  req.user = {
    _id: req.headers['x-user-id'] || '60d0fe4f5311236168a109ca',
    role: req.headers['x-user-role'] || 'client'
  };
  next();
};

// Simple Routes without complex validation
router.get('/', addMockUser, getFeedback);
router.get('/display', getSimpleFeedbackDisplay); // Simple display route without auth
router.post('/', addMockUser, uploadFeedbackAttachments, handleUploadError, createFeedback);
router.get('/:id', addMockUser, getFeedbackById);
router.put('/:id', addMockUser, uploadFeedbackAttachments, handleUploadError, updateFeedback);
router.delete('/:id', addMockUser, deleteFeedback);
router.put('/:id/response', addMockUser, addAdminResponse);
router.put('/:id/resolve', addMockUser, resolveFeedback);

module.exports = router;
