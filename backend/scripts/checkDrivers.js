const mongoose = require('mongoose');
require('dotenv').config();
const { Driver } = require('../models/UserModel');

async function checkDrivers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to database');

        const drivers = await Driver.find({}).select('email fullName driverId status createdAt documents');
        console.log('📊 Found', drivers.length, 'drivers:');
        drivers.forEach(driver => {
            console.log('📧 Email:', driver.email);
            console.log('👤 Name:', driver.fullName);
            console.log('🆔 ID:', driver.driverId || 'N/A');
            console.log('📁 Documents:', (driver.documents && driver.documents.length) || 0, 'files');
            console.log('📅 Created:', driver.createdAt);
            console.log('---');
        });

        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkDrivers();
