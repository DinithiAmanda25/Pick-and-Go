// Test script to add sample reviews for testing
const mongoose = require('mongoose');
const { Review } = require('./models/ReviewModel');
const { VehicleOwner } = require('./models/VehicleOwnerModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pickandgo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function addSampleReviews() {
    try {
        // Find a vehicle owner to add reviews for
        const vehicleOwner = await VehicleOwner.findOne();

        if (!vehicleOwner) {
            console.log('No vehicle owner found. Please register a vehicle owner first.');
            return;
        }

        console.log('Adding sample reviews for vehicle owner:', vehicleOwner.firstName, vehicleOwner.lastName);

        // Sample reviews data
        const sampleReviews = [
            {
                vehicleOwnerId: vehicleOwner._id,
                clientId: new mongoose.Types.ObjectId(),
                clientName: 'John Smith',
                rating: 5,
                comment: 'Excellent service! The vehicle was clean and well-maintained. Highly recommend!',
                serviceType: 'vehicle_rental',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
            },
            {
                vehicleOwnerId: vehicleOwner._id,
                clientId: new mongoose.Types.ObjectId(),
                clientName: 'Sarah Johnson',
                rating: 4,
                comment: 'Good experience overall. Vehicle was as described and pickup was smooth.',
                serviceType: 'vehicle_rental',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
            },
            {
                vehicleOwnerId: vehicleOwner._id,
                clientId: new mongoose.Types.ObjectId(),
                clientName: 'Mike Wilson',
                rating: 5,
                comment: 'Amazing service! Very professional and responsive. Will definitely use again.',
                serviceType: 'transport',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
            },
            {
                vehicleOwnerId: vehicleOwner._id,
                clientId: new mongoose.Types.ObjectId(),
                clientName: 'Emily Davis',
                rating: 4,
                comment: 'Reliable service. Vehicle was comfortable and the owner was helpful.',
                serviceType: 'vehicle_rental',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            },
            {
                vehicleOwnerId: vehicleOwner._id,
                clientId: new mongoose.Types.ObjectId(),
                clientName: 'David Brown',
                rating: 3,
                comment: 'Decent service but could be improved. Vehicle was okay.',
                serviceType: 'delivery',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
            }
        ];

        // Insert sample reviews
        await Review.insertMany(sampleReviews);
        console.log('Sample reviews added successfully!');

        // Check the updated vehicle owner rating
        const updatedVehicleOwner = await VehicleOwner.findById(vehicleOwner._id);
        console.log('Updated vehicle owner rating:', {
            rating: updatedVehicleOwner.rating,
            ratingCount: updatedVehicleOwner.ratingCount,
            totalRatings: updatedVehicleOwner.totalRatings
        });

    } catch (error) {
        console.error('Error adding sample reviews:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the script
addSampleReviews();
