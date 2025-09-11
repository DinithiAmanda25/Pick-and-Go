const Vehicle = require('../models/VehicleModel');

// Cleanup vehicle documents with invalid uploadedAt timestamps
const cleanupVehicleDocuments = async (req, res) => {
    try {
        console.log('🧹 Starting vehicle documents cleanup...');

        // Find all vehicles
        const vehicles = await Vehicle.find({});
        console.log(`📊 Found ${vehicles.length} vehicles to check`);

        let updateCount = 0;
        const cleanupReport = [];

        for (const vehicle of vehicles) {
            let hasChanges = false;
            const vehicleReport = {
                vehicleId: vehicle._id,
                licensePlate: vehicle.licensePlate,
                changes: []
            };

            if (vehicle.documents) {
                // Check each document type
                const docTypes = ['insurance', 'registration', 'emissionTest'];
                
                for (const docType of docTypes) {
                    if (vehicle.documents[docType]) {
                        const doc = vehicle.documents[docType];
                        
                        // If document has uploadedAt but no URL, it's invalid
                        if (doc.uploadedAt && !doc.url) {
                            console.log(`🔧 Vehicle ${vehicle.licensePlate}: Removing invalid ${docType} uploadedAt`);
                            
                            // Remove the uploadedAt field
                            vehicle.documents[docType].uploadedAt = undefined;
                            hasChanges = true;
                            
                            vehicleReport.changes.push(`Removed invalid ${docType} uploadedAt timestamp`);
                        }
                    }
                }
            }

            // Save changes if any
            if (hasChanges) {
                await vehicle.save();
                updateCount++;
                cleanupReport.push(vehicleReport);
            }
        }

        console.log(`✅ Cleanup completed. Updated ${updateCount} vehicles`);

        res.status(200).json({
            success: true,
            message: `Cleanup completed successfully`,
            stats: {
                totalVehicles: vehicles.length,
                updatedVehicles: updateCount
            },
            cleanupReport
        });

    } catch (error) {
        console.error('💥 Cleanup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during cleanup',
            error: error.message
        });
    }
};

module.exports = {
    cleanupVehicleDocuments
};
