import { HTTP } from "./http-common-service";

class BusinessAgreementService {

    // Get active agreement (for vehicle owners and clients)
    async getActiveAgreement(agreementType = 'vehicle-owner') {
        try {
            const response = await HTTP.get(`/business-agreement/active?type=${agreementType}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Preview agreement (formatted for display)
    async previewAgreement(agreementType = 'vehicle-owner') {
        try {
            const response = await HTTP.get(`/business-agreement/preview?type=${agreementType}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Get agreement history (business owner only)
    async getAgreementHistory() {
        try {
            const response = await HTTP.get('/business-agreement/history');
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Update agreement (business owner only)
    async updateAgreement(agreementData) {
        try {
            const response = await HTTP.put('/business-agreement/update', agreementData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Reset to default agreement (business owner only)
    async resetToDefault(agreementType = 'vehicle-owner') {
        try {
            const response = await HTTP.post(`/business-agreement/reset?type=${agreementType}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Network error' };
        }
    }

    // Validate agreement data
    validateAgreementData(agreementData) {
        const errors = {};

        if (!agreementData.title) {
            errors.title = 'Agreement title is required';
        }

        if (!agreementData.terms || !Array.isArray(agreementData.terms) || agreementData.terms.length === 0) {
            errors.terms = 'At least one term section is required';
        } else {
            agreementData.terms.forEach((term, index) => {
                if (!term.sectionTitle) {
                    errors[`term_${index}_title`] = `Section ${index + 1} title is required`;
                }
                if (!term.content) {
                    errors[`term_${index}_content`] = `Section ${index + 1} content is required`;
                }
            });
        }

        if (agreementData.commissionRate && (agreementData.commissionRate < 0 || agreementData.commissionRate > 50)) {
            errors.commissionRate = 'Commission rate must be between 0 and 50 percent';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Format agreement for display
    formatAgreementForDisplay(agreement) {
        if (!agreement) return null;

        return {
            title: agreement.title,
            terms: agreement.terms || [],
            commissionRate: agreement.commissionRate || 15,
            paymentTerms: agreement.paymentTerms || 'Weekly payments processed within 3-5 business days',
            minimumAvailability: agreement.minimumAvailability || 15,
            version: agreement.version || 1,
            lastModified: agreement.lastModified ? new Date(agreement.lastModified).toLocaleDateString() : 'Unknown'
        };
    }

    // Create default agreement template
    getDefaultAgreementTemplate(agreementType = 'vehicle-owner') {
        if (agreementType === 'vehicle-owner') {
            return {
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
                        content: 'Pick-and-Go retains a commission from each rental transaction. Vehicle owners receive the remaining percentage of the rental fee after commission deduction.'
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
                        content: 'Consistent availability is recommended for optimal earnings. Extended unavailability may affect vehicle ranking in search results.'
                    },
                    {
                        sectionTitle: 'Payment Terms',
                        content: 'Rental payments are processed and transferred to your registered bank account according to the payment schedule specified in this agreement.'
                    },
                    {
                        sectionTitle: 'Termination',
                        content: 'Either party may terminate this agreement with proper notice. All pending payments will be processed according to standard terms.'
                    }
                ],
                commissionRate: 15,
                paymentTerms: 'Weekly payments processed within 3-5 business days',
                minimumAvailability: 15
            };
        } else if (agreementType === 'client-rental') {
            return {
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
                commissionRate: 0,
                paymentTerms: 'Payment processed at booking confirmation',
                minimumAvailability: 0
            };
        }
    }
}

export default new BusinessAgreementService();
