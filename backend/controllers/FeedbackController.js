const { Feedback } = require('../models/FeedbackModel');
const mongoose = require('mongoose');

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
    const { booking: bookingId, category, subject, message, severity, tags } = req.body;

    // Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId).populate('vehicle');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    if (booking.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create feedback for this booking'
      });
    }

    // Check if feedback already exists for this booking
    const existingFeedback = await Feedback.findOne({
      user: req.user._id,
      booking: bookingId
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        error: 'Feedback already exists for this booking'
      });
    }

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

    const feedback = await Feedback.create({
      user: req.user._id,
      booking: bookingId,
      vehicle: booking.vehicle._id,
      category,
      subject,
      message,
      severity,
      tags,
      attachments
    });

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('user', 'name email')
      .populate('booking', 'bookingNumber startDate endDate')
      .populate('vehicle', 'carNumber make model');

    res.status(201).json({
      success: true,
      data: populatedFeedback
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
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
  resolveFeedback
};