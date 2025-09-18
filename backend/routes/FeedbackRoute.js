const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
//const { protect, authorize } = require('../middleware/auth');
const { uploadFeedbackAttachments, handleUploadError } = require('../middleware/fileUpload');
const {
  getFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  addAdminResponse,
  resolveFeedback
} = require('../controllers/FeedbackController');

const protect = () => {}; // Placeholder for protect middleware
const authorize = (role) => (req, res, next) => next(); // Placeholder for authorize middleware

const router = express.Router();

// Validation rules
const createFeedbackValidation = [
  body('booking')
    .isMongoId()
    .withMessage('Valid booking ID is required'),
  body('category')
    .isIn(['payment', 'booking', 'login', 'vehicle_condition', 'driver_service', 'general'])
    .withMessage('Invalid feedback category'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Subject must be between 5 and 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

const updateFeedbackValidation = [
  body('category')
    .optional()
    .isIn(['payment', 'booking', 'login', 'vehicle_condition', 'driver_service', 'general'])
    .withMessage('Invalid feedback category'),
  body('subject')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Subject must be between 5 and 100 characters'),
  body('message')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level')
];

const adminResponseValidation = [
  body('message')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Response message must be between 10 and 500 characters')
];

// Routes
router.route('/')
  .get(protect, getFeedback)
  .post(protect, uploadFeedbackAttachments, handleUploadError, createFeedbackValidation, validateRequest, createFeedback);

router.route('/:id')
  .get(protect, getFeedbackById)
  .put(protect, uploadFeedbackAttachments, handleUploadError, updateFeedbackValidation, validateRequest, updateFeedback)
  .delete(protect, authorize('admin'), deleteFeedback);

router.put('/:id/response',
  protect,
  authorize('admin'),
  adminResponseValidation,
  validateRequest,
  addAdminResponse
);  

router.put('/:id/resolve',  
  protect,
  authorize('admin'),
  resolveFeedback
);

module.exports = router;