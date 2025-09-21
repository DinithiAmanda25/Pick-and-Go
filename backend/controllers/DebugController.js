const mongoose = require('mongoose');
const { Driver } = require('../models/DriverModel');

// Debug endpoint to check database connection and model access
const debugDatabase = async (req, res) => {
    try {
        console.log('Debug endpoint accessed');

        // Check MongoDB connection status
        const connState = mongoose.connection.readyState;
        const connStatus = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
            99: 'uninitialized'
        };

        console.log(`MongoDB connection status: ${connStatus[connState]}`);

        // Test simple query to Driver model
        let driverCount = null;
        let error = null;

        try {
            driverCount = await Driver.countDocuments();
            console.log(`Driver count: ${driverCount}`);
        } catch (err) {
            error = err.message;
            console.error('Error querying Driver model:', err);
        }

        // Return debug info
        res.status(200).json({
            success: true,
            debug: {
                mongoConnection: {
                    readyState: connState,
                    status: connStatus[connState],
                    host: mongoose.connection.host,
                    database: mongoose.connection.name
                },
                driver: {
                    modelExists: !!Driver,
                    count: driverCount,
                    error: error
                },
                environment: {
                    nodeEnv: process.env.NODE_ENV,
                    port: process.env.PORT || 9000
                }
            }
        });
    } catch (error) {
        console.error('Debug endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Debug endpoint error',
            error: error.message
        });
    }
};

// Debug the getAllDrivers function specifically
const debugGetAllDrivers = async (req, res) => {
    try {
        console.log('Debug getAllDrivers accessed');

        // Step 1: Check if the Driver model is accessible
        console.log('Driver model check:', !!Driver);

        // Step 2: Attempt a simple find operation
        console.log('Attempting to find drivers...');
        let drivers = [];
        let findError = null;

        try {
            drivers = await Driver.find().lean().limit(5);
            console.log(`Found ${drivers.length} drivers`);
        } catch (err) {
            findError = err.message;
            console.error('Error finding drivers:', err);
        }

        // Step 3: Return detailed debug info
        res.status(200).json({
            success: true,
            debug: {
                driverModel: {
                    exists: !!Driver,
                    schema: Object.keys(Driver.schema.paths),
                },
                query: {
                    successful: !findError,
                    error: findError,
                    count: drivers.length,
                    sample: drivers.length > 0 ?
                        // Only return safe fields for a sample driver
                        {
                            id: drivers[0]._id,
                            fields: Object.keys(drivers[0])
                        } : null
                }
            }
        });

    } catch (error) {
        console.error('Debug getAllDrivers error:', error);
        res.status(500).json({
            success: false,
            message: 'Debug getAllDrivers error',
            error: error.message
        });
    }
};

module.exports = {
    debugDatabase,
    debugGetAllDrivers
};