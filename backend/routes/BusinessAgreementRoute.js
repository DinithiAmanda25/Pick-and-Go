const express = require('express');
const router = express.Router();
const {
    getActiveAgreement,
    getAgreementHistory,
    updateAgreement,
    previewAgreement,
    resetToDefault
} = require('../controllers/BusinessAgreementController');

// Public routes (for vehicle owners to view agreement)
router.get('/preview', previewAgreement);
router.get('/active', getActiveAgreement);

// Business owner routes (protected - would need authentication middleware)
router.get('/history', getAgreementHistory);
router.put('/update', updateAgreement);
router.post('/reset', resetToDefault);

module.exports = router;
