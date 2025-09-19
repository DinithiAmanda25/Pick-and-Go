const { Booking } = require('../models/BookingModel');
const { Vehicle } = require('../models/VehicleModel');
const { Client } = require('../models/ClientModel');
const { VehicleOwner } = require('../models/VehicleOwnerModel');
const { Driver } = require('../models/DriverModel');

// Create New Booking
const createBooking = async (req, res) => {
    try {
        const {
            clientId,
            vehicleId,
            startDate,
            endDate,
            startTime,
            endTime,
            pickupLocation,
            dropoffLocation,
            driverRequired,
            driverId, // Add driverId to the destructuring
            additionalServices,
            specialRequirements
        } = req.body;

        console.log('Creating booking with data:', req.body);

        // Validate required fields
        if (!clientId || !vehicleId || !startDate || !endDate || !pickupLocation || !dropoffLocation) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: clientId, vehicleId, startDate, endDate, pickupLocation, dropoffLocation'
            });
        }

        // Validate date formats
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        
        if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Please provide valid dates.'
            });
        }

        if (startDateObj >= endDateObj) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        // Check if client exists
        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        // Check if vehicle exists and is available
        const vehicle = await Vehicle.findById(vehicleId).populate('ownerId');
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        if (vehicle.status !== 'available') {
            return res.status(400).json({
                success: false,
                message: 'Vehicle is not available for booking'
            });
        }

        // Validate location data
        if (!pickupLocation.address || !pickupLocation.city) {
            return res.status(400).json({
                success: false,
                message: 'Pickup location must include address and city'
            });
        }

        if (!dropoffLocation.address || !dropoffLocation.city) {
            return res.status(400).json({
                success: false,
                message: 'Dropoff location must include address and city'
            });
        }

        // Check vehicle availability for the requested dates
        const conflictingBookings = await Booking.checkVehicleAvailability(
            vehicleId,
            startDateObj,
            endDateObj
        );

        if (conflictingBookings.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle is already booked for the selected dates',
                conflictingBookings: conflictingBookings.length
            });
        }

        // Calculate total days
        const totalDays = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) || 1;

        // Calculate pricing
        const dailyRate = vehicle.rentalPrice?.dailyRate || vehicle.pricePerDay || 0;
        
        if (dailyRate <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle pricing not set. Please contact support.'
            });
        }

        const subtotal = dailyRate * totalDays;
        const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
        const taxes = Math.round(subtotal * 0.08); // 8% tax
        const securityDeposit = vehicle.rentalPrice?.securityDeposit || 0;
        
        // Driver fee calculation
        let driverFee = 0;
        if (driverRequired) {
            driverFee = 2000 * totalDays; // 2000 per day for driver
        }

        const totalAmount = subtotal + serviceFee + taxes + securityDeposit + driverFee;

        // Create new booking
        const booking = new Booking({
            clientId,
            vehicleId,
            vehicleOwnerId: vehicle.ownerId._id,
            rentalPeriod: {
                startDate: startDateObj,
                endDate: endDateObj,
                startTime: startTime || '09:00',
                endTime: endTime || '17:00',
                totalDays
            },
            pickupLocation: {
                address: pickupLocation.address.trim(),
                city: pickupLocation.city.trim(),
                coordinates: pickupLocation.coordinates || { latitude: 0, longitude: 0 },
                instructions: pickupLocation.instructions || ''
            },
            dropoffLocation: {
                address: dropoffLocation.address.trim(),
                city: dropoffLocation.city.trim(),
                coordinates: dropoffLocation.coordinates || { latitude: 0, longitude: 0 },
                instructions: dropoffLocation.instructions || ''
            },
            pricing: {
                dailyRate,
                totalDays,
                subtotal,
                securityDeposit,
                serviceFee,
                taxes,
                totalAmount,
                currency: 'USD'
            },
            driver: {
                required: driverRequired || false,
                driverId: driverRequired && driverId ? driverId : null, // Only set driverId if driver is required and provided
                driverFee: driverFee
            },
            additionalServices: additionalServices || [],
            specialRequirements: specialRequirements || '',
            status: 'pending'
        });

        // Save the booking
        const savedBooking = await booking.save();

        // Populate the booking with related data
        const populatedBooking = await Booking.findById(savedBooking._id)
            .populate('vehicleId', 'make model year licensePlate images location features')
            .populate('vehicleOwnerId', 'firstName lastName phone email')
            .populate('clientId', 'firstName lastName phone email');

        console.log('Booking created successfully:', populatedBooking);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: populatedBooking
        });

    } catch (error) {
        console.error('Create booking error:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error: ' + validationErrors.join(', ')
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Booking reference already exists. Please try again.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get Bookings by Client
const getClientBookings = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { status } = req.query;

        console.log('Getting bookings for client:', clientId, 'with status:', status);

        if (!clientId) {
            return res.status(400).json({
                success: false,
                message: 'Client ID is required'
            });
        }

        const bookings = await Booking.getByClient(clientId, status);

        console.log(`Found ${bookings.length} bookings for client`);

        res.status(200).json({
            success: true,
            bookings,
            count: bookings.length
        });

    } catch (error) {
        console.error('Get client bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get Bookings by Vehicle Owner
const getVehicleOwnerBookings = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const { status } = req.query;

        if (!ownerId) {
            return res.status(400).json({
                success: false,
                message: 'Owner ID is required'
            });
        }

        const bookings = await Booking.getByVehicleOwner(ownerId, status);

        res.status(200).json({
            success: true,
            bookings,
            count: bookings.length
        });

    } catch (error) {
        console.error('Get vehicle owner bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get Single Booking Details
const getBookingDetails = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID is required'
            });
        }

        const booking = await Booking.findById(bookingId)
            .populate('clientId', 'firstName lastName phone email')
            .populate('vehicleId', 'make model year licensePlate images location features')
            .populate('vehicleOwnerId', 'firstName lastName phone email')
            .populate('driver.driverId', 'fullName phone rating email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            booking
        });

    } catch (error) {
        console.error('Get booking details error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Update Booking Status
const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status, reason, notes, approvedBy, cancelledBy } = req.body;

        console.log('Updating booking status:', { bookingId, status, reason, notes });

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID is required'
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Validate status values
        const validStatuses = ['pending', 'confirmed', 'payment_pending', 'paid', 'active', 'completed', 'cancelled', 'rejected', 'refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Validate status transition
        const validTransitions = {
            pending: ['confirmed', 'rejected', 'cancelled'],
            confirmed: ['payment_pending', 'paid', 'cancelled'],
            payment_pending: ['paid', 'cancelled'],
            paid: ['active', 'cancelled'],
            active: ['completed', 'cancelled'],
            completed: ['refunded'],
            cancelled: ['refunded'],
            rejected: [],
            refunded: []
        };

        if (!validTransitions[booking.status]?.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${booking.status} to ${status}`,
                currentStatus: booking.status,
                validTransitions: validTransitions[booking.status] || []
            });
        }

        // Validate required fields for specific statuses
        if ((status === 'rejected' || status === 'cancelled') && !reason?.trim()) {
            return res.status(400).json({
                success: false,
                message: `Reason is required when changing status to ${status}`
            });
        }

        // Update booking status
        booking.status = status;

        // Handle specific status updates
        if (status === 'confirmed') {
            booking.approval = {
                ...booking.approval,
                approvedBy: approvedBy || 'VehicleOwner',
                approvedAt: new Date(),
                approvalNotes: notes || '',
            };
        } else if (status === 'rejected') {
            booking.approval = {
                ...booking.approval,
                rejectionReason: reason || 'No reason provided',
                approvedBy: null,
                approvedAt: null
            };
        } else if (status === 'cancelled') {
            const cancellationFee = booking.calculateCancellationFee();
            const refundAmount = Math.max(0, booking.pricing.totalAmount - cancellationFee);
            
            booking.cancellation = {
                cancelledBy: cancelledBy || 'admin',
                cancelledAt: new Date(),
                reason: reason || 'No reason provided',
                cancellationFee,
                refundAmount
            };
        } else if (status === 'paid') {
            booking.payment.status = 'completed';
            booking.payment.paymentDate = new Date();
            booking.payment.paidAmount = booking.pricing.totalAmount;
        } else if (status === 'refunded') {
            booking.payment.status = 'refunded';
            booking.payment.refundDate = new Date();
            booking.payment.refundAmount = booking.cancellation?.refundAmount || booking.pricing.totalAmount;
        }

        await booking.save();

        // Return updated booking with populated data
        const updatedBooking = await Booking.findById(bookingId)
            .populate('vehicleId', 'make model year licensePlate')
            .populate('vehicleOwnerId', 'firstName lastName phone email')
            .populate('clientId', 'firstName lastName phone email')
            .populate('driver.driverId', 'fullName phone rating email');

        console.log('Booking status updated successfully:', {
            bookingId,
            newStatus: status
        });

        res.status(200).json({
            success: true,
            message: `Booking ${status} successfully`,
            booking: updatedBooking
        });

    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Assign Driver to Booking
const assignDriver = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { driverId } = req.body;

        console.log('Assigning driver:', { bookingId, driverId });

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID is required'
            });
        }

        if (!driverId) {
            return res.status(400).json({
                success: false,
                message: 'Driver ID is required'
            });
        }

        // Check if booking exists and requires driver
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (!booking.driver?.required) {
            return res.status(400).json({
                success: false,
                message: 'This booking does not require a driver'
            });
        }

        // Check if driver exists and is available
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        if (driver.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Driver is not approved'
            });
        }

        // Check if driver is available for the booking period
        const conflictingAssignments = await Booking.find({
            'driver.driverId': driverId,
            status: { $nin: ['cancelled', 'rejected', 'completed'] },
            _id: { $ne: bookingId }, // Exclude current booking
            $or: [
                {
                    'rentalPeriod.startDate': { $lte: booking.rentalPeriod.endDate },
                    'rentalPeriod.endDate': { $gte: booking.rentalPeriod.startDate }
                }
            ]
        });

        if (conflictingAssignments.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Driver is not available for the selected dates',
                conflictingAssignments: conflictingAssignments.length,
                conflicts: conflictingAssignments.map(c => ({
                    bookingReference: c.bookingReference,
                    startDate: c.rentalPeriod.startDate,
                    endDate: c.rentalPeriod.endDate
                }))
            });
        }

        // Assign driver to booking
        booking.driver.driverId = driverId;
        await booking.save();

        // Return updated booking with populated driver data
        const updatedBooking = await Booking.findById(bookingId)
            .populate('clientId', 'firstName lastName phone email')
            .populate('vehicleId', 'make model year licensePlate')
            .populate('vehicleOwnerId', 'firstName lastName phone email')
            .populate('driver.driverId', 'fullName phone rating email');

        console.log('Driver assigned successfully:', {
            bookingId,
            driverId,
            driverName: driver.fullName
        });

        res.status(200).json({
            success: true,
            message: 'Driver assigned successfully',
            booking: updatedBooking
        });

    } catch (error) {
        console.error('Assign driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Unassign Driver from Booking
const unassignDriver = async (req, res) => {
    try {
        const { bookingId } = req.params;

        console.log('Unassigning driver from booking:', bookingId);

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID is required'
            });
        }

        // Check if booking exists
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (!booking.driver?.driverId) {
            return res.status(400).json({
                success: false,
                message: 'No driver assigned to this booking'
            });
        }

        // Store driver info for logging
        const driverInfo = await Driver.findById(booking.driver.driverId);

        // Unassign driver
        booking.driver.driverId = null;
        await booking.save();

        // Return updated booking
        const updatedBooking = await Booking.findById(bookingId)
            .populate('clientId', 'firstName lastName phone email')
            .populate('vehicleId', 'make model year licensePlate')
            .populate('vehicleOwnerId', 'firstName lastName phone email');

        console.log('Driver unassigned successfully from booking:', {
            bookingId,
            previousDriver: driverInfo?.fullName || 'Unknown'
        });

        res.status(200).json({
            success: true,
            message: 'Driver unassigned successfully',
            booking: updatedBooking
        });

    } catch (error) {
        console.error('Unassign driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Cancel Booking
const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { reason, cancelledBy } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID is required'
            });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if booking can be cancelled
        if (!booking.canCancel()) {
            return res.status(400).json({
                success: false,
                message: 'This booking cannot be cancelled'
            });
        }

        // Calculate cancellation fee
        const cancellationFee = booking.calculateCancellationFee();
        const refundAmount = Math.max(0, booking.pricing.totalAmount - cancellationFee);

        booking.status = 'cancelled';
        booking.cancellation = {
            cancelledBy: cancelledBy || 'client',
            cancelledAt: new Date(),
            reason: reason || 'No reason provided',
            cancellationFee,
            refundAmount
        };

        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            cancellationFee,
            refundAmount,
            booking
        });

    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Add Booking Message
const addBookingMessage = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { from, fromId, message } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID is required'
            });
        }

        if (!from || !fromId || !message) {
            return res.status(400).json({
                success: false,
                message: 'from, fromId, and message are required'
            });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.messages.push({
            from,
            fromId,
            message,
            timestamp: new Date(),
            read: false
        });

        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Message added successfully'
        });

    } catch (error) {
        console.error('Add booking message error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Add Booking Review
const addBookingReview = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { reviewType, rating, comment } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID is required'
            });
        }

        if (!reviewType || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Review type and rating are required'
            });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only review completed bookings'
            });
        }

        if (reviewType === 'client') {
            booking.review.clientReview = {
                rating,
                comment,
                reviewDate: new Date()
            };
        } else if (reviewType === 'owner') {
            booking.review.ownerReview = {
                rating,
                comment,
                reviewDate: new Date()
            };
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid review type. Must be "client" or "owner"'
            });
        }

        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Review added successfully',
            booking
        });

    } catch (error) {
        console.error('Add booking review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Check Vehicle Availability
const checkVehicleAvailability = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { startDate, endDate } = req.query;

        if (!vehicleId) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle ID is required'
            });
        }

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide start and end dates'
            });
        }

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }

        const conflictingBookings = await Booking.checkVehicleAvailability(
            vehicleId,
            startDateObj,
            endDateObj
        );

        const isAvailable = conflictingBookings.length === 0;

        res.status(200).json({
            success: true,
            available: isAvailable,
            conflictingBookings: conflictingBookings.length,
            message: isAvailable ? 'Vehicle is available' : 'Vehicle is not available for selected dates'
        });

    } catch (error) {
        console.error('Check vehicle availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get All Bookings for Admin
const getAllBookingsAdmin = async (req, res) => {
    try {
        const { status, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        console.log('Admin fetching all bookings with filters:', { status, page, limit });

        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const bookings = await Booking.find(query)
            .populate('clientId', 'firstName lastName phone email')
            .populate('vehicleId', 'make model year licensePlate images location')
            .populate('vehicleOwnerId', 'firstName lastName phone email')
            .populate('driver.driverId', 'fullName phone rating email')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Booking.countDocuments(query);

        console.log(`Found ${bookings.length} bookings out of ${total} total`);

        res.status(200).json({
            success: true,
            bookings,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalBookings: total,
                hasNextPage: skip + bookings.length < total,
                hasPrevPage: parseInt(page) > 1
            },
            total
        });

    } catch (error) {
        console.error('Get all bookings admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get Booking Statistics for Admin Dashboard
const getBookingStats = async (req, res) => {
    try {
        const stats = await Booking.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$pricing.totalAmount' }
                }
            }
        ]);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentBookings = await Booking.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        const activeBookings = await Booking.countDocuments({
            status: 'active'
        });

        const totalRevenueResult = await Booking.aggregate([
            { $match: { status: { $in: ['completed', 'active', 'paid'] } } },
            { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
        ]);

        const totalRevenue = totalRevenueResult[0]?.total || 0;

        const formattedStats = {
            totalBookings: stats.reduce((acc, stat) => acc + stat.count, 0),
            activeBookings,
            recentBookings,
            totalRevenue,
            statusBreakdown: stats.reduce((acc, stat) => {
                acc[stat._id] = {
                    count: stat.count,
                    revenue: stat.totalRevenue
                };
                return acc;
            }, {})
        };

        res.status(200).json({
            success: true,
            stats: formattedStats
        });

    } catch (error) {
        console.error('Get booking stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Search Bookings for Admin
const searchBookings = async (req, res) => {
    try {
        const { q, status, startDate, endDate, limit = 20 } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        console.log('Admin searching bookings:', { q, status, startDate, endDate });

        const searchQuery = {
            $or: [
                { bookingReference: { $regex: q, $options: 'i' } }
            ]
        };

        if (status && status !== 'all') {
            searchQuery.status = status;
        }

        if (startDate && endDate) {
            searchQuery.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const bookings = await Booking.find(searchQuery)
            .populate('clientId', 'firstName lastName phone email')
            .populate('vehicleId', 'make model year licensePlate')
            .populate('vehicleOwnerId', 'firstName lastName phone email')
            .populate('driver.driverId', 'fullName phone rating email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        const clientSearchResults = await Booking.aggregate([
            {
                $lookup: {
                    from: 'clients',
                    localField: 'clientId',
                    foreignField: '_id',
                    as: 'client'
                }
            },
            {
                $unwind: '$client'
            },
            {
                $match: {
                    $or: [
                        { 'client.firstName': { $regex: q, $options: 'i' } },
                        { 'client.lastName': { $regex: q, $options: 'i' } },
                        { 'client.email': { $regex: q, $options: 'i' } },
                        { 'client.phone': { $regex: q, $options: 'i' } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'vehicles',
                    localField: 'vehicleId',
                    foreignField: '_id',
                    as: 'vehicle'
                }
            },
            {
                $lookup: {
                    from: 'vehicleowners',
                    localField: 'vehicleOwnerId',
                    foreignField: '_id',
                    as: 'vehicleOwner'
                }
            },
            {
                $lookup: {
                    from: 'drivers',
                    localField: 'driver.driverId',
                    foreignField: '_id',
                    as: 'driverInfo'
                }
            },
            { $sort: { createdAt: -1 } },
            { $limit: parseInt(limit) }
        ]);

        const allResults = [...bookings, ...clientSearchResults];
        const uniqueResults = allResults.filter((booking, index, self) =>
            index === self.findIndex(b => b._id.toString() === booking._id.toString())
        );

        res.status(200).json({
            success: true,
            bookings: uniqueResults,
            count: uniqueResults.length
        });

    } catch (error) {
        console.error('Search bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Generate Report
const generateReport = async (req, res) => {
    try {
        const { status, startDate, endDate, format = 'json' } = req.query;

        console.log('Generating report with filters:', { status, startDate, endDate, format });

        // Build query
        const query = {};
        
        if (status && status !== 'all') {
            query.status = status;
        }
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }

        // Get bookings with populated data
        const bookings = await Booking.find(query)
            .populate('clientId', 'firstName lastName email phone')
            .populate('vehicleId', 'make model year licensePlate rentalPrice')
            .populate('vehicleOwnerId', 'firstName lastName email phone')
            .populate('driver.driverId', 'fullName phone email')
            .sort({ createdAt: -1 });

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No bookings found for the selected filters'
            });
        }

        // Format data for report
        const reportData = bookings.map(booking => ({
            bookingReference: booking.bookingReference,
            clientName: `${booking.clientId?.firstName || ''} ${booking.clientId?.lastName || ''}`.trim(),
            clientEmail: booking.clientId?.email || '',
            clientPhone: booking.clientId?.phone || '',
            vehicle: `${booking.vehicleId?.make || ''} ${booking.vehicleId?.model || ''}`.trim(),
            licensePlate: booking.vehicleId?.licensePlate || '',
            year: booking.vehicleId?.year || '',
            startDate: booking.rentalPeriod?.startDate ? booking.rentalPeriod.startDate.toISOString().split('T')[0] : '',
            endDate: booking.rentalPeriod?.endDate ? booking.rentalPeriod.endDate.toISOString().split('T')[0] : '',
            totalDays: booking.rentalPeriod?.totalDays || 0,
            dailyRate: booking.pricing?.dailyRate || 0,
            subtotal: booking.pricing?.subtotal || 0,
            serviceFee: booking.pricing?.serviceFee || 0,
            taxes: booking.pricing?.taxes || 0,
            securityDeposit: booking.pricing?.securityDeposit || 0,
            totalAmount: booking.pricing?.totalAmount || 0,
            status: booking.status || '',
            createdAt: booking.createdAt ? booking.createdAt.toISOString().split('T')[0] : '',
            pickupLocation: booking.pickupLocation?.address ? 
                `${booking.pickupLocation.address}, ${booking.pickupLocation.city}` : '',
            dropoffLocation: booking.dropoffLocation?.address ? 
                `${booking.dropoffLocation.address}, ${booking.dropoffLocation.city}` : '',
            specialRequirements: booking.specialRequirements || '',
            driverRequired: booking.driver?.required || false,
            driverAssigned: booking.driver?.driverId?.fullName || 'Not Assigned',
            driverFee: booking.driver?.driverFee || 0
        }));

        // Return based on requested format
        if (format === 'csv') {
            // Convert to CSV
            const csvData = convertToCSV(reportData);
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=bookings-report-${new Date().toISOString().split('T')[0]}.csv`);
            
            return res.status(200).send(csvData);
            
        } else if (format === 'excel') {
            // Convert to Excel (requires xlsx package: npm install xlsx)
            const excelBuffer = convertToExcel(reportData);
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=bookings-report-${new Date().toISOString().split('T')[0]}.xlsx`);
            
            return res.status(200).send(excelBuffer);
            
        } else {
            // Default to JSON
            return res.status(200).json({
                success: true,
                message: 'Report generated successfully',
                report: {
                    filters: { status, startDate, endDate },
                    totalBookings: bookings.length,
                    totalRevenue: reportData.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
                    totalDriverBookings: reportData.filter(item => item.driverRequired).length,
                    totalDriverFees: reportData.reduce((sum, item) => sum + (item.driverFee || 0), 0),
                    data: reportData
                }
            });
        }

    } catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getDriverSchedule = async (req, res) => {
    try {
        const { status, startDate, endDate, driverId, page = 1, limit = 50 } = req.query;

        console.log('Getting driver schedule with filters:', { status, startDate, endDate, driverId });

        // Build query for bookings that require drivers
        const query = {
            'driver.required': true
        };

        if (status && status !== 'all') {
            query.status = status;
        }

        if (driverId) {
            query['driver.driverId'] = driverId;
        }

        if (startDate || endDate) {
            query['rentalPeriod.startDate'] = {};
            if (startDate) {
                query['rentalPeriod.startDate'].$gte = new Date(startDate);
            }
            if (endDate) {
                query['rentalPeriod.startDate'].$lte = new Date(endDate);
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const bookings = await Booking.find(query)
            .populate('clientId', 'firstName lastName phone email')
            .populate('vehicleId', 'make model year licensePlate')
            .populate('vehicleOwnerId', 'firstName lastName phone email')
            .populate('driver.driverId', 'fullName phone rating email')
            .sort({ 'rentalPeriod.startDate': 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Booking.countDocuments(query);

        // Get driver statistics
        const driverStats = await Booking.aggregate([
            { $match: { 'driver.required': true } },
            {
                $group: {
                    _id: '$driver.driverId',
                    totalAssignments: { $sum: 1 },
                    totalEarnings: { $sum: '$driver.driverFee' },
                    statuses: { $push: '$status' }
                }
            },
            {
                $lookup: {
                    from: 'drivers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'driverInfo'
                }
            }
        ]);

        res.status(200).json({
            success: true,
            bookings,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalBookings: total,
                hasNextPage: skip + bookings.length < total,
                hasPrevPage: parseInt(page) > 1
            },
            driverStats,
            summary: {
                totalDriverBookings: total,
                assignedBookings: bookings.filter(b => b.driver.driverId).length,
                unassignedBookings: bookings.filter(b => !b.driver.driverId).length,
                totalDriverFees: bookings.reduce((sum, b) => sum + (b.driver.driverFee || 0), 0)
            },
            total
        });

    } catch (error) {
        console.error('Get driver schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Check Driver Availability
const checkDriverAvailability = async (req, res) => {
    try {
        const { driverId } = req.params;
        const { startDate, endDate } = req.query;

        if (!driverId) {
            return res.status(400).json({
                success: false,
                message: 'Driver ID is required'
            });
        }

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide start and end dates'
            });
        }

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }

        // Check if driver exists
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        if (driver.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Driver is not approved',
                available: false
            });
        }

        // Check for conflicting bookings
        const conflictingBookings = await Booking.find({
            'driver.driverId': driverId,
            status: { $nin: ['cancelled', 'rejected', 'completed'] },
            $or: [
                {
                    'rentalPeriod.startDate': { $lte: endDateObj },
                    'rentalPeriod.endDate': { $gte: startDateObj }
                }
            ]
        }).populate('vehicleId', 'make model licensePlate')
        .populate('clientId', 'firstName lastName');

        const isAvailable = conflictingBookings.length === 0;

        res.status(200).json({
            success: true,
            available: isAvailable,
            driver: {
                id: driver._id,
                fullName: driver.fullName,
                phone: driver.phone,
                rating: driver.rating
            },
            conflictingBookings: conflictingBookings.map(booking => ({
                bookingReference: booking.bookingReference,
                clientName: `${booking.clientId.firstName} ${booking.clientId.lastName}`,
                vehicle: `${booking.vehicleId.make} ${booking.vehicleId.model}`,
                startDate: booking.rentalPeriod.startDate,
                endDate: booking.rentalPeriod.endDate,
                status: booking.status
            })),
            message: isAvailable ? 'Driver is available' : `Driver has ${conflictingBookings.length} conflicting assignments`
        });

    } catch (error) {
        console.error('Check driver availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Helper function to convert data to CSV
const convertToCSV = (data) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
        Object.values(item).map(value => 
            typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
    );
    
    return [headers, ...rows].join('\n');
};

// Helper function to convert data to Excel (requires xlsx package)
const convertToExcel = (data) => {
    try {
        const XLSX = require('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    } catch (error) {
        throw new Error('Excel conversion requires xlsx package. Run: npm install xlsx');
    }
};

module.exports = {
    createBooking,
    getClientBookings,
    getVehicleOwnerBookings,
    getBookingDetails,
    updateBookingStatus,
    assignDriver,
    unassignDriver,
    cancelBooking,
    addBookingMessage,
    addBookingReview,
    checkVehicleAvailability,
    getAllBookingsAdmin,
    getBookingStats,
    searchBookings,
    generateReport,
    getDriverSchedule,
    checkDriverAvailability
};