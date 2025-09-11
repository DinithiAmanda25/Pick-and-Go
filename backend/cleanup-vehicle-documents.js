// Script to clean up vehicle documents with invalid uploadedAt timestamps
// This will remove uploadedAt from documents that don't have actual file URLs

const { MongoClient } = require('mongodb');

async function cleanupVehicleDocuments() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pickandgo';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db();
        const vehiclesCollection = db.collection('vehicles');

        // Find all vehicles
        const vehicles = await vehiclesCollection.find({}).toArray();
        console.log(`Found ${vehicles.length} vehicles`);

        let updateCount = 0;

        for (const vehicle of vehicles) {
            let needsUpdate = false;
            const updates = {};

            if (vehicle.documents) {
                // Check each document type
                ['insurance', 'registration', 'emissionTest'].forEach(docType => {
                    if (vehicle.documents[docType]) {
                        const doc = vehicle.documents[docType];
                        
                        // If document has uploadedAt but no URL, remove uploadedAt
                        if (doc.uploadedAt && !doc.url) {
                            console.log(`Vehicle ${vehicle._id}: Removing invalid ${docType} uploadedAt`);
                            updates[`documents.${docType}.uploadedAt`] = '';
                            needsUpdate = true;
                        }
                    }
                });
            }

            // Apply updates if needed
            if (needsUpdate) {
                await vehiclesCollection.updateOne(
                    { _id: vehicle._id },
                    { $unset: updates }
                );
                updateCount++;
            }
        }

        console.log(`Updated ${updateCount} vehicles`);
        console.log('Cleanup completed successfully');

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await client.close();
    }
}

// Run the cleanup
cleanupVehicleDocuments();
