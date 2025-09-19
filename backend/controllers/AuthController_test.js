const { Admin } = require('../models/AdminModel');
const { BusinessOwner } = require('../models/BusinessOwnerModel');
const { Driver } = require('../models/DriverModel');
const { Client } = require('../models/ClientModel');
const { VehicleOwner } = require('../models/VehicleOwnerModel');

// Test if the import is working
console.log('✅ Successfully imported models:', {
    Admin: !!Admin,
    BusinessOwner: !!BusinessOwner,
    Driver: !!Driver,
    Client: !!Client,
    VehicleOwner: !!VehicleOwner
});

module.exports = {
    testConnection: (req, res) => {
        res.json({ success: true, message: 'AuthController is working!' });
    }
};
