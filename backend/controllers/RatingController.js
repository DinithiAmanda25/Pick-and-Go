const { Rating, Booking, Vehicle } = require('../models/RatingModel');

// @desc    Get all ratings
// @route   GET /api/ratings
// @access  Private
const getRatings = async (req, res) => {
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
    // Admins can see all ratings

    // Query parameters
    const { vehicle, driver, minScore, maxScore, page = 1, limit = 10 } = req.query;

    if (vehicle) query.vehicle = vehicle;
    if (driver) query.driver = driver;
    if (minScore) query.score = { ...query.score, $gte: parseFloat(minScore) };
    if (maxScore) query.score = { ...query.score, $lte: parseFloat(maxScore) };

    // Only show public ratings unless user is admin or owns the rating
    if (req.user.role !== 'admin') {
      query.$or = [
        { isPublic: true },
        { user: req.user._id }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    const ratings = await Rating.find(query)
      .populate('user', 'name email')
      .populate('booking', 'bookingNumber startDate endDate')
      .populate('vehicle', 'carNumber make model averageRating')
      .populate('driver', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rating.countDocuments(query);

    res.json({
      success: true,
      data: ratings,
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

// @desc    Get single rating
// @route   GET /api/ratings/:id
// @access  Private
const getRatingById = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id)
      .populate('user', 'name email')
      .populate('booking', 'bookingNumber startDate endDate')
      .populate('vehicle', 'carNumber make model averageRating')
      .populate('driver', 'name email');

    if (!rating) {
      return res.status(404).json({
        success: false,
        error: 'Rating not found'
      });
    }

    // Check access permissions
    if (!rating.isPublic && 
        req.user.role !== 'admin' && 
        rating.user._id.toString() !== req.user._id.toString()) {
      
      // Car owners can view ratings for their vehicles
      if (req.user.role === 'car_owner') {
        const vehicle = await Vehicle.findById(rating.vehicle._id);
        if (!vehicle || vehicle.owner.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to access this rating'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this rating'
        });
      }
    }

    res.json({
      success: true,
      data: rating
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create new rating
// @route   POST /api/ratings
// @access  Private
const createRating = async (req, res) => {
  try {
    const { 
      booking: bookingId, 
      score, 
      categories, 
      review, 
      pros, 
      cons, 
      wouldRecommend,
      isPublic 
    } = req.body;

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
        error: 'Not authorized to rate this booking'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Can only rate completed bookings'
      });
    }

    // Check if rating already exists for this booking
    const existingRating = await Rating.findOne({
      user: req.user._id,
      booking: bookingId
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        error: 'Rating already exists for this booking'
      });
    }

    const rating = await Rating.create({
      user: req.user._id,
      booking: bookingId,
      vehicle: booking.vehicle._id,
      driver: booking.vehicle.driver,
      score,
      categories,
      review,
      pros,
      cons,
      wouldRecommend,
      isPublic: isPublic !== undefined ? isPublic : true,
      isVerified: true // Since it's linked to a completed booking
    });

    const populatedRating = await Rating.findById(rating._id)
      .populate('user', 'name email')
      .populate('booking', 'bookingNumber startDate endDate')
      .populate('vehicle', 'carNumber make model averageRating')
      .populate('driver', 'name email');

    res.status(201).json({
      success: true,
      data: populatedRating
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update rating
// @route   PUT /api/ratings/:id
// @access  Private
const updateRating = async (req, res) => {
  try {
    let rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({
        success: false,
        error: 'Rating not found'
      });
    }

    // Check ownership (only user who created rating can update)
    if (rating.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this rating'
      });
    }

    const { 
      score, 
      categories, 
      review, 
      pros, 
      cons, 
      wouldRecommend,
      isPublic 
    } = req.body;

    rating = await Rating.findByIdAndUpdate(
      req.params.id,
      { 
        score, 
        categories, 
        review, 
        pros, 
        cons, 
        wouldRecommend,
        isPublic 
      },
      { new: true, runValidators: true }
    )
    .populate('user', 'name email')
    .populate('booking', 'bookingNumber startDate endDate')
    .populate('vehicle', 'carNumber make model averageRating')
    .populate('driver', 'name email');

    res.json({
      success: true,
      data: rating
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete rating
// @route   DELETE /api/ratings/:id
// @access  Private (Admin only)
const deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({
        success: false,
        error: 'Rating not found'
      });
    }

    await rating.remove();

    res.json({
      success: true,
      message: 'Rating deleted successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Mark rating as helpful
// @route   PUT /api/ratings/:id/helpful
// @access  Private
const markHelpful = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({
        success: false,
        error: 'Rating not found'
      });
    }

    await rating.markHelpful();

    res.json({
      success: true,
      message: 'Rating marked as helpful',
      helpfulVotes: rating.helpfulVotes
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Report rating
// @route   PUT /api/ratings/:id/report
// @access  Private
const reportRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({
        success: false,
        error: 'Rating not found'
      });
    }

    await rating.report();

    res.json({
      success: true,
      message: 'Rating reported successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get ratings for a specific vehicle
// @route   GET /api/ratings/vehicle/:vehicleId
// @access  Public
const getVehicleRatings = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const ratings = await Rating.find({ 
      vehicle: vehicleId, 
      isPublic: true 
    })
    .populate('user', 'name')
    .populate('booking', 'bookingNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Rating.countDocuments({ 
      vehicle: vehicleId, 
      isPublic: true 
    });

    // Get rating statistics
    const stats = await Rating.aggregate([
      { $match: { vehicle: vehicleId, isPublic: true } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          totalRatings: { $sum: 1 },
          fiveStars: { $sum: { $cond: [{ $eq: ['$score', 5] }, 1, 0] } },
          fourStars: { $sum: { $cond: [{ $eq: ['$score', 4] }, 1, 0] } },
          threeStars: { $sum: { $cond: [{ $eq: ['$score', 3] }, 1, 0] } },
          twoStars: { $sum: { $cond: [{ $eq: ['$score', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$score', 1] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: ratings,
      statistics: stats.length > 0 ? stats[0] : null,
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

module.exports = {
  getRatings,
  getRatingById,
  createRating,
  updateRating,
  deleteRating,
  markHelpful,
  reportRating,
  getVehicleRatings
};