const mongoose = require('mongoose');

// Business Agreement Schema
const businessAgreementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: 'Business Partnership Agreement'
    },

    // Agreement type: 'vehicle-owner' or 'client-rental'
    agreementType: {
        type: String,
        required: true,
        enum: ['vehicle-owner', 'client-rental'],
        default: 'vehicle-owner'
    },

    terms: [{
        sectionTitle: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        }
    }],

    commissionRate: {
        type: Number,
        required: true,
        default: 15,
        min: 0,
        max: 50
    },

    paymentTerms: {
        type: String,
        required: true,
        default: 'Weekly payments processed within 3-5 business days'
    },

    minimumAvailability: {
        type: Number,
        default: function () {
            return this.agreementType === 'vehicle-owner' ? 15 : undefined;
        },
        validate: {
            validator: function (value) {
                // If it's a client-rental agreement, this field can be null/undefined
                if (this.agreementType === 'client-rental') {
                    return value === undefined || value === null || (value >= 0 && value <= 30);
                }
                // For vehicle-owner agreements, it must be between 1-30
                return value >= 1 && value <= 30;
            },
            message: 'Minimum availability must be between 1-30 days for vehicle owners'
        }
    },

    version: {
        type: Number,
        default: 1
    },

    isActive: {
        type: Boolean,
        default: true
    },

    lastModified: {
        type: Date,
        default: Date.now
    },

    modifiedBy: {
        type: String,
        required: true,
        default: 'Business Admin'
    }
}, {
    timestamps: true
});

// Pre-save hook to handle minimumAvailability for client-rental agreements
businessAgreementSchema.pre('save', function (next) {
    if (this.agreementType === 'client-rental') {
        // Remove or set to undefined for client-rental agreements
        this.minimumAvailability = undefined;
    }
    next();
});

// Create default agreement if none exists
businessAgreementSchema.statics.getActiveAgreement = async function (agreementType = 'vehicle-owner') {
    let agreement = await this.findOne({ isActive: true, agreementType });

    if (!agreement) {
        // Create default agreement based on type
        if (agreementType === 'vehicle-owner') {
            agreement = new this({
                title: 'Pick-and-Go Business Partnership Agreement',
                agreementType: 'vehicle-owner',
                terms: [
                    {
                        sectionTitle: 'Vehicle Listing Agreement',
                        content: 'By submitting your vehicle, you agree to list it on the Pick-and-Go platform for rental purposes under the terms specified in this agreement.'
                    },
                    {
                        sectionTitle: 'Pricing Structure',
                        content: 'Our business team will evaluate your vehicle and may adjust rental rates based on market analysis, vehicle condition, and demand to ensure competitive pricing.'
                    },
                    {
                        sectionTitle: 'Commission Structure',
                        content: 'Pick-and-Go retains a 15% commission from each rental transaction. Vehicle owners receive 85% of the rental fee after commission deduction.'
                    },
                    {
                        sectionTitle: 'Vehicle Standards',
                        content: 'Your vehicle must meet our safety and quality standards. We reserve the right to reject vehicles that don\'t meet these requirements or suspend listings for non-compliance.'
                    },
                    {
                        sectionTitle: 'Insurance & Liability',
                        content: 'Comprehensive insurance coverage is mandatory. Pick-and-Go provides additional coverage during rental periods. Vehicle owners are responsible for maintaining valid insurance.'
                    },
                    {
                        sectionTitle: 'Maintenance Requirements',
                        content: 'Regular maintenance and cleanliness are required. Rental income may be suspended for vehicles that don\'t meet maintenance standards.'
                    },
                    {
                        sectionTitle: 'Availability Requirements',
                        content: 'Minimum 15 days availability per month is recommended for optimal earnings. Consistent unavailability may affect vehicle ranking in search results.'
                    },
                    {
                        sectionTitle: 'Payment Terms',
                        content: 'Rental payments are processed weekly and transferred to your registered bank account within 3-5 business days of processing.'
                    },
                    {
                        sectionTitle: 'Termination',
                        content: 'Either party may terminate this agreement with 30 days written notice. All pending payments will be processed according to standard terms.'
                    }
                ],
                commissionRate: 15,
                paymentTerms: 'Weekly payments processed within 3-5 business days',
                minimumAvailability: 15
            });
        } else if (agreementType === 'client-rental') {
            agreement = new this({
                title: 'Pick-and-Go Vehicle Rental Agreement',
                agreementType: 'client-rental',
                terms: [
                    {
                        sectionTitle: 'Rental Terms & Conditions',
                        content: 'By proceeding with this rental, you agree to all terms and conditions set forth in this agreement. You must be 21 years or older with a valid driver\'s license.'
                    },
                    {
                        sectionTitle: 'Vehicle Use Policy',
                        content: 'The rented vehicle must be used responsibly and in accordance with local traffic laws. Smoking, pets, and illegal activities are strictly prohibited in the vehicle.'
                    },
                    {
                        sectionTitle: 'Insurance & Damage Policy',
                        content: 'Basic insurance coverage is included. You are responsible for any damage exceeding the insurance coverage. A security deposit will be held during the rental period.'
                    },
                    {
                        sectionTitle: 'Fuel & Mileage Policy',
                        content: 'Vehicle must be returned with the same fuel level as provided. Additional charges apply for excessive mileage beyond the agreed limit.'
                    },
                    {
                        sectionTitle: 'Late Return Policy',
                        content: 'Late returns will incur additional charges. Please contact us immediately if you need to extend your rental period.'
                    },
                    {
                        sectionTitle: 'Cancellation Policy',
                        content: 'Cancellations made 24 hours before pickup are eligible for full refund. Cancellations within 24 hours may incur charges.'
                    },
                    {
                        sectionTitle: 'Emergency Contact',
                        content: 'In case of emergency, accident, or breakdown, contact our 24/7 support line immediately. Do not attempt unauthorized repairs.'
                    }
                ],
                commissionRate: 0, // Not applicable for client rentals
                paymentTerms: 'Payment processed at booking confirmation'
                // minimumAvailability not set for client rentals (will be undefined)
            });
        }

        await agreement.save();
    }

    return agreement;
};

// Update agreement and increment version
businessAgreementSchema.statics.updateAgreement = async function (updateData, modifiedBy, agreementType = 'vehicle-owner') {
    // Set current agreement as inactive for the specific type
    await this.updateMany({ isActive: true, agreementType }, { isActive: false });

    // Create new version
    const currentAgreement = await this.findOne({ agreementType }).sort({ version: -1 });
    const newVersion = currentAgreement ? currentAgreement.version + 1 : 1;

    const newAgreement = new this({
        ...updateData,
        agreementType,
        version: newVersion,
        isActive: true,
        modifiedBy: modifiedBy,
        lastModified: new Date()
    });

    await newAgreement.save();
    return newAgreement;
};

module.exports = mongoose.model('BusinessAgreement', businessAgreementSchema);
