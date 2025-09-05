const mongoose = require('mongoose');
require('dotenv').config();
const { Driver } = require('../models/UserModel');

async function clearDriver() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to database');

        const email = 'Kavigayashan741@gmail.com';
        const result = await Driver.deleteOne({ email });

        if (result.deletedCount > 0) {
            console.log(`✅ Deleted driver with email: ${email}`);
        } else {
            console.log(`⚠️ No driver found with email: ${email}`);
        }

        // List remaining drivers
        const drivers = await Driver.find({}).select('email fullName driverId');
        console.log('📊 Remaining drivers:', drivers.length);
        drivers.forEach(driver => {
            console.log(`- ${driver.email} (${driver.fullName})`);
        });

        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

clearDriver();
