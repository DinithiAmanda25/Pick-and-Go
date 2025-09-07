const axios = require('axios');

async function testRatingAPI() {
    try {
        // Test getting reviews (this will show an empty array initially)
        console.log('Testing get reviews API...');

        // You'll need to replace 'USER_ID' with an actual vehicle owner ID from your database
        const userId = '675be8b2b3c7be83c9ecec56'; // Replace with actual vehicle owner ID

        const getResponse = await axios.get(`http://localhost:9000/api/vehicle-owner/${userId}/reviews`);
        console.log('Current reviews:', getResponse.data);

        // Test adding a review
        console.log('Testing add review API...');
        const reviewData = {
            clientName: 'Test Client',
            rating: 5,
            comment: 'Great service! Very professional and reliable.',
            serviceType: 'vehicle_rental'
        };

        const addResponse = await axios.post(`http://localhost:9000/api/vehicle-owner/${userId}/reviews`, reviewData);
        console.log('Review added:', addResponse.data);

        // Get reviews again to see the new review
        const updatedReviews = await axios.get(`http://localhost:9000/api/vehicle-owner/${userId}/reviews`);
        console.log('Updated reviews:', updatedReviews.data);

    } catch (error) {
        console.error('API Test Error:', error.response?.data || error.message);
    }
}

testRatingAPI();
