const { User, Admin, BusinessOwner, Driver, Client, VehicleOwner } = require('../models/UserModel');

// Test if the import is working
console.log('✅ Successfully imported models:', {
    User: !!User,
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
