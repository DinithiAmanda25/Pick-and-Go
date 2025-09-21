const { Feedback } = require('../models/FeedbackModel');
const mongoose = require('mongoose');

// Import Booking model for booking validation (if needed)
// const Booking = require('../models/BookingModel'); // Uncomment if Booking model exists

// @desc    Get all feedback for simple display (no auth required)
// @route   GET /api/feedback/display
// @access  Public
const getSimpleFeedbackDisplay = async (req, res) => {
  try {
    const feedback = await Feedback.find({ status: { $ne: 'closed' } })
      .select('category subject message rating severity status createdAt adminResponse.message adminResponse.respondedAt')
      .sort({ createdAt: -1 })
      .limit(20); // Limit to recent 20 feedback items

    // Format data for simple display
    const displayData = feedback.map(item => ({
      id: item._id,
      category: item.category,
      subject: item.subject,
      message: item.message,
      rating: item.rating,
      severity: item.severity,
      status: item.status,
      submittedAt: item.createdAt,
      adminResponse: item.adminResponse.message || null,
      responseDate: item.adminResponse.respondedAt || null
    }));

    res.json({
      success: true,
      data: displayData,
      count: displayData.length
    });

  } catch (error) {
    console.error('Error in getSimpleFeedbackDisplay:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private
const getFeedback = async (req, res) => {
  try {
    let query = {};

    // Role-based filtering
    if (req.user.role === 'client') {
      query.user = req.user._id;
    } else if (req.user.role === 'car_owner') {
      // Get vehicles owned by the user
      const vehicles = await Vehicle.find({ owner: req.user._id });
      const vehicleIds = vehicles.map(vehicle => vehicle._id);
      query.vehicle = { $in: vehicleIds };
    }
    // Admins can see all feedback

    // Query parameters
    const { category, status, severity, page = 1, limit = 10 } = req.query;

    if (category) query.category = category;
    if (status) query.status = status;
    if (severity) query.severity = severity;

    // Pagination
    const skip = (page - 1) * limit;

    const feedback = await Feedback.find(query)
      .populate('user', 'name email')
      .populate('booking', 'bookingNumber startDate endDate')
      .populate('vehicle', 'carNumber make model')
      .populate('adminResponse.respondedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);

    res.json({
      success: true,
      data: feedback,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single feedback
// @route   GET /api/feedback/:id
// @access  Private
const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('user', 'name email')
      .populate('booking', 'bookingNumber startDate endDate')
      .populate('vehicle', 'carNumber make model')
      .populate('adminResponse.respondedBy', 'name email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' &&
      feedback.user._id.toString() !== req.user._id.toString()) {

      // Car owners can view feedback for their vehicles
      if (req.user.role === 'car_owner') {
        const vehicle = await Vehicle.findById(feedback.vehicle._id);
        if (!vehicle || vehicle.owner.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to access this feedback'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this feedback'
        });
      }
    }

    res.json({
      success: true,
      data: feedback
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Private
const createFeedback = async (req, res) => {
  try {
    // Check if req.body exists
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required'
      });
    }

    // Extract data from both FormData and regular JSON
    let { booking: bookingId, category, subject, message, severity, tags, rating } = req.body;

    console.log('📥 Received feedback data:', req.body);
    console.log('📥 Received files:', req.files);

    // Handle tags array from FormData - check if it's sent as 'tags[]' 
    if (!tags && req.body['tags[]']) {
      tags = Array.isArray(req.body['tags[]']) ? req.body['tags[]'] : [req.body['tags[]']];
    }

    // If tags is a string (single value), convert to array
    if (typeof tags === 'string') {
      tags = [tags];
    }

    // Ensure tags is an array
    if (!Array.isArray(tags)) {
      tags = [];
    }

    // Basic validation for required fields
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create feedback',
        error: 'Category is required'
      });
    }

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create feedback',
        error: 'Subject is required'
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create feedback',
        error: 'Message is required'
      });
    }

    // Convert rating to number
    const ratingNum = parseInt(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create feedback',
        error: 'Rating must be between 1 and 5'
      });
    }

    // For now, skip booking validation since Booking model might not exist
    // This allows general feedback to be submitted without requiring authentication

    // Process file attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      }));
    }

    // Create feedback object
    const feedbackObj = {
      category,
      subject,
      message,
      severity: severity || 'medium',
      tags: tags,
      rating: ratingNum,
      attachments,
      status: 'open'
    };

    // Add user and booking info if available
    if (req.user) {
      feedbackObj.user = req.user._id;
    }
    if (bookingId) {
      feedbackObj.booking = bookingId;
    }

    console.log('💾 Creating feedback with data:', feedbackObj);

    const feedback = await Feedback.create(feedbackObj);

    console.log('✅ Feedback created successfully:', feedback._id);

    // Populate the response if needed
    let populatedFeedback = feedback;
    if (req.user) {
      try {
        populatedFeedback = await Feedback.findById(feedback._id)
          .populate('user', 'name email');
      } catch (populateError) {
        console.log('Warning: Could not populate user data:', populateError.message);
      }
    }

    res.status(201).json({
      success: true,
      data: populatedFeedback,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('❌ Error in createFeedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create feedback',
      error: 'Server error'
    });
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private
const updateFeedback = async (req, res) => {
  try {
    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    // Check ownership (only user who created feedback can update)
    if (feedback.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this feedback'
      });
    }

    // Don't allow updating if admin has responded
    if (feedback.adminResponse.message) {
      return res.status(400).json({
        success: false,
        error: 'Cannot update feedback after admin response'
      });
    }

    const { category, subject, message, severity, tags } = req.body;

    // Process new file attachments
    let newAttachments = [];
    if (req.files && req.files.length > 0) {
      newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      }));
    }

    // Combine existing attachments with new ones
    const attachments = [...feedback.attachments, ...newAttachments];

    feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { category, subject, message, severity, tags, attachments },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('booking', 'bookingNumber startDate endDate')
      .populate('vehicle', 'carNumber make model');

    res.json({
      success: true,
      data: feedback
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (Admin only)
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    await feedback.remove();

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Add admin response to feedback
// @route   PUT /api/feedback/:id/response
// @access  Private (Admin only)
const addAdminResponse = async (req, res) => {
  try {
    const { message } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    await feedback.addAdminResponse(message, req.user._id);

    const updatedFeedback = await Feedback.findById(feedback._id)
      .populate('user', 'name email')
      .populate('booking', 'bookingNumber startDate endDate')
      .populate('vehicle', 'carNumber make model')
      .populate('adminResponse.respondedBy', 'name email');

    res.json({
      success: true,
      data: updatedFeedback
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Mark feedback as resolved
// @route   PUT /api/feedback/:id/resolve
// @access  Private (Admin only)
const resolveFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    await feedback.markResolved();

    const updatedFeedback = await Feedback.findById(feedback._id)
      .populate('user', 'name email')
      .populate('booking', 'bookingNumber startDate endDate')
      .populate('vehicle', 'carNumber make model')
      .populate('adminResponse.respondedBy', 'name email');

    res.json({
      success: true,
      data: updatedFeedback
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  getFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  addAdminResponse,
  resolveFeedback,
  getSimpleFeedbackDisplay
};