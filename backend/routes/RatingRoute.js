const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
//const { protect, authorize } = require('../middleware/auth');
const {
  getRatings,
  getRatingById,
  createRating,
  updateRating,
  deleteRating,
  markHelpful,
  reportRating,
  getVehicleRatings
} = require('../controllers/ratingController');

const protect = () => {}; // Placeholder for protect middleware
const authorize = (role) => (req, res, next) => next(); // Placeholder for authorize middleware

const router = express.Router();

// Validation rules
const createRatingValidation = [
  body('booking')
    .isMongoId()
    .withMessage('Valid booking ID is required'),
  body('score')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Score must be between 1 and 5'),
  body('categories.vehicleCondition')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Vehicle condition rating must be between 1 and 5'),
  body('categories.driverService')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Driver service rating must be between 1 and 5'),
  body('categories.bookingProcess')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Booking process rating must be between 1 and 5'),
  body('categories.valueForMoney')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Value for money rating must be between 1 and 5'),
  body('categories.overallExperience')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Overall experience rating must be between 1 and 5'),
  body('review')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review cannot exceed 500 characters'),
  body('pros')
    .optional()
    .isArray()
    .withMessage('Pros must be an array'),
  body('cons')
    .optional()
    .isArray()
    .withMessage('Cons must be an array'),
  body('wouldRecommend')
    .optional()
    .isBoolean()
    .withMessage('Would recommend must be a boolean'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Is public must be a boolean')
];

const updateRatingValidation = [
  body('score')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Score must be between 1 and 5'),
  body('categories.vehicleCondition')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Vehicle condition rating must be between 1 and 5'),
  body('categories.driverService')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Driver service rating must be between 1 and 5'),
  body('categories.bookingProcess')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Booking process rating must be between 1 and 5'),
  body('categories.valueForMoney')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Value for money rating must be between 1 and 5'),
  body('categories.overallExperience')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Overall experience rating must be between 1 and 5'),
  body('review')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review cannot exceed 500 characters'),
  body('pros')
    .optional()
    .isArray()
    .withMessage('Pros must be an array'),
  body('cons')
    .optional()
    .isArray()
    .withMessage('Cons must be an array'),
  body('wouldRecommend')
    .optional()
    .isBoolean()
    .withMessage('Would recommend must be a boolean'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Is public must be a boolean')
];

// Routes
router.route('/')
  .get(protect, getRatings)
  .post(protect, createRatingValidation, validateRequest, createRating);

router.route('/:id')
  .get(protect, getRatingById)
  .put(protect, updateRatingValidation, validateRequest, updateRating)
  .delete(protect, authorize('admin'), deleteRating);

router.put('/:id/helpful', protect, markHelpful);
router.put('/:id/report', protect, reportRating);

// Public route for vehicle ratings
router.get('/vehicle/:vehicleId', getVehicleRatings);

module.exports = router;