const BusinessAgreement = require('../models/BusinessAgreementModel');

// Get active agreement
const getActiveAgreement = async (req, res) => {
    try {
        const agreementType = req.query.type || 'vehicle-owner';
        const agreement = await BusinessAgreement.getActiveAgreement(agreementType);

        res.status(200).json({
            success: true,
            agreement: agreement
        });
    } catch (error) {
        console.error('Error fetching agreement:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch agreement',
            error: error.message
        });
    }
};

// Get agreement history
const getAgreementHistory = async (req, res) => {
    try {
        const agreements = await BusinessAgreement.find()
            .sort({ version: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            agreements: agreements
        });
    } catch (error) {
        console.error('Error fetching agreement history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch agreement history',
            error: error.message
        });
    }
};

// Update agreement (Business Owner only)
const updateAgreement = async (req, res) => {
    try {
        const { title, terms, commissionRate, paymentTerms, minimumAvailability, agreementType } = req.body;
        const modifiedBy = req.user?.name || 'Business Admin';
        const targetAgreementType = agreementType || 'vehicle-owner';

        // Validate required fields
        if (!title || !terms || !Array.isArray(terms)) {
            return res.status(400).json({
                success: false,
                message: 'Title and terms array are required'
            });
        }

        // Validate agreement type
        if (!['vehicle-owner', 'client-rental'].includes(targetAgreementType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid agreement type. Must be vehicle-owner or client-rental'
            });
        }

        // Validate commission rate (only for vehicle-owner agreements)
        if (targetAgreementType === 'vehicle-owner' && commissionRate && (commissionRate < 0 || commissionRate > 50)) {
            return res.status(400).json({
                success: false,
                message: 'Commission rate must be between 0 and 50 percent'
            });
        }

        // Validate terms structure
        for (let term of terms) {
            if (!term.sectionTitle || !term.content) {
                return res.status(400).json({
                    success: false,
                    message: 'Each term must have sectionTitle and content'
                });
            }
        }

        const updateData = {
            title,
            terms,
            commissionRate: targetAgreementType === 'vehicle-owner' ? (commissionRate || 15) : 0,
            paymentTerms: paymentTerms || (targetAgreementType === 'vehicle-owner' ? 'Weekly payments processed within 3-5 business days' : 'Payment processed at booking confirmation')
        };

        // Only set minimumAvailability for vehicle-owner agreements
        if (targetAgreementType === 'vehicle-owner') {
            updateData.minimumAvailability = minimumAvailability || 15;
        }

        const newAgreement = await BusinessAgreement.updateAgreement(updateData, modifiedBy, targetAgreementType);

        res.status(200).json({
            success: true,
            message: 'Agreement updated successfully',
            agreement: newAgreement
        });
    } catch (error) {
        console.error('Error updating agreement:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update agreement',
            error: error.message
        });
    }
};

// Preview agreement (for vehicle owners and clients)
const previewAgreement = async (req, res) => {
    try {
        const agreementType = req.query.type || 'vehicle-owner';
        const agreement = await BusinessAgreement.getActiveAgreement(agreementType);

        // Return formatted agreement for display
        const formattedAgreement = {
            title: agreement.title,
            agreementType: agreement.agreementType,
            terms: agreement.terms,
            commissionRate: agreement.commissionRate,
            paymentTerms: agreement.paymentTerms,
            minimumAvailability: agreement.minimumAvailability,
            version: agreement.version,
            lastModified: agreement.lastModified
        };

        res.status(200).json({
            success: true,
            agreement: formattedAgreement
        });
    } catch (error) {
        console.error('Error previewing agreement:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to preview agreement',
            error: error.message
        });
    }
};

// Reset to default agreement
const resetToDefault = async (req, res) => {
    try {
        const modifiedBy = req.user?.name || 'Business Admin';
        const agreementType = req.query.type || 'vehicle-owner';

        // Validate agreement type
        if (!['vehicle-owner', 'client-rental'].includes(agreementType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid agreement type. Must be "vehicle-owner" or "client-rental"'
            });
        }

        // Set agreements of this type as inactive
        await BusinessAgreement.updateMany({ agreementType }, { isActive: false });

        // This will create a new default agreement of the specified type
        const defaultAgreement = await BusinessAgreement.getActiveAgreement(agreementType);

        res.status(200).json({
            success: true,
            message: `${agreementType} agreement reset to default successfully`,
            agreement: defaultAgreement
        });
    } catch (error) {
        console.error('Error resetting agreement:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset agreement',
            error: error.message
        });
    }
};

module.exports = {
    getActiveAgreement,
    getAgreementHistory,
    updateAgreement,
    previewAgreement,
    resetToDefault
};
