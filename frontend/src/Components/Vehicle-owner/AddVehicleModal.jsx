import React, { useState, useEffect, useCallback } from 'react';
import vehicleService from '../../Services/Vehicle-service';
import businessAgreementService from '../../Services/BusinessAgreement-service';

function AddVehicleModal({ isOpen, onClose, onSuccess, userId }) {
    console.log('AddVehicleModal rendered with props:', { isOpen, userId });
    const [currentStep, setCurrentStep] = useState(1);
    const [showAgreement, setShowAgreement] = useState(false);
    const [agreementAccepted, setAgreementAccepted] = useState(false);

    const [vehicleForm, setVehicleForm] = useState({
        vehicleType: '',
        make: '',
        model: '',
        year: '',
        color: '',
        licensePlate: '',
        seatingCapacity: '',
        fuelType: '',
        transmission: '',
        mileage: '',
        engineCapacity: '',
        features: [],
        description: '',
        location: {
            address: '',
            city: '',
            state: '',
            zipCode: ''
        },
        insurance: {
            provider: '',
            policyNumber: '',
            expiryDate: '',
            coverage: ''
        },
        registration: {
            registrationNumber: '',
            expiryDate: ''
        },
        pricing: {
            dailyRate: '',
            weeklyRate: '',
            monthlyRate: '',
            securityDeposit: '',
            currency: 'LKR'
        }
    });

    // Photo upload states
    const [frontPhoto, setFrontPhoto] = useState(null);
    const [backPhoto, setBackPhoto] = useState(null);
    const [frontPhotoPreview, setFrontPhotoPreview] = useState(null);
    const [backPhotoPreview, setBackPhotoPreview] = useState(null);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);

    // Vehicle document upload states
    const [vehicleDocuments, setVehicleDocuments] = useState({
        insurance: { file: null, preview: null, uploading: false },
        registration: { file: null, preview: null, uploading: false },
        emissionTest: { file: null, preview: null, uploading: false }
    });
    const [documentErrors, setDocumentErrors] = useState({});

    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Business Agreement state
    const [businessAgreement, setBusinessAgreement] = useState(null);
    const [loadingAgreement, setLoadingAgreement] = useState(false);

    const loadBusinessAgreement = useCallback(async () => {
        try {
            setLoadingAgreement(true);
            console.log('Loading business agreement...');
            const response = await businessAgreementService.previewAgreement();
            console.log('Agreement response:', response);
            if (response.success) {
                setBusinessAgreement(response.agreement);
            } else {
                console.warn('Agreement response not successful:', response);
                setBusinessAgreement(businessAgreementService.getDefaultAgreementTemplate());
            }
        } catch (error) {
            console.error('Error loading business agreement:', error);
            console.error('Error details:', error.response?.data || error.message);
            // Use default agreement if failed to load
            setBusinessAgreement(businessAgreementService.getDefaultAgreementTemplate());
        } finally {
            setLoadingAgreement(false);
        }
    }, []);

    // Fetch business agreement when modal opens
    useEffect(() => {
        if (isOpen && !businessAgreement) {
            loadBusinessAgreement();
        }
    }, [isOpen, businessAgreement, loadBusinessAgreement]);

    if (!isOpen) return null;

    const resetForm = () => {
        setVehicleForm({
            vehicleType: '',
            make: '',
            model: '',
            year: '',
            color: '',
            licensePlate: '',
            seatingCapacity: '',
            fuelType: '',
            transmission: '',
            mileage: '',
            engineCapacity: '',
            features: [],
            description: '',
            location: {
                address: '',
                city: '',
                state: '',
                zipCode: ''
            },
            insurance: {
                provider: '',
                policyNumber: '',
                expiryDate: '',
                coverage: ''
            },
            registration: {
                registrationNumber: '',
                expiryDate: ''
            },
            pricing: {
                dailyRate: '',
                weeklyRate: '',
                monthlyRate: '',
                securityDeposit: '',
                currency: 'LKR'
            }
        });
        setFormErrors({});
        setCurrentStep(1);
        setShowAgreement(false);
        setAgreementAccepted(false);
        setFrontPhoto(null);
        setBackPhoto(null);
        setFrontPhotoPreview(null);
        setBackPhotoPreview(null);
        setVehicleDocuments({
            insurance: { file: null, preview: null, uploading: false },
            registration: { file: null, preview: null, uploading: false },
            emissionTest: { file: null, preview: null, uploading: false }
        });
        setDocumentErrors({});
    };

    const handlePhotoChange = (photoType, file) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (photoType === 'front') {
                    setFrontPhoto(file);
                    setFrontPhotoPreview(reader.result);
                } else {
                    setBackPhoto(file);
                    setBackPhotoPreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = (photoType) => {
        if (photoType === 'front') {
            setFrontPhoto(null);
            setFrontPhotoPreview(null);
        } else {
            setBackPhoto(null);
            setBackPhotoPreview(null);
        }
    };

    // Vehicle document handling functions
    const validateDocumentFile = (file, documentType) => {
        const errors = [];

        // File type validation
        const allowedTypes = {
            'image/jpeg': 'JPEG',
            'image/jpg': 'JPG',
            'image/png': 'PNG',
            'application/pdf': 'PDF'
        };

        if (!allowedTypes[file.type]) {
            errors.push('Please select an image (JPEG, PNG) or PDF file');
        }

        // File size validation (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            errors.push('File size must be less than 10MB');
        }

        return errors;
    };

    const handleDocumentChange = (documentType, file) => {
        if (!file) return;

        // Clear previous errors
        setDocumentErrors(prev => ({
            ...prev,
            [documentType]: []
        }));

        // Validate file
        const validationErrors = validateDocumentFile(file, documentType);
        if (validationErrors.length > 0) {
            setDocumentErrors(prev => ({
                ...prev,
                [documentType]: validationErrors
            }));
            return;
        }

        // Create preview
        let preview = null;
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setVehicleDocuments(prev => ({
                    ...prev,
                    [documentType]: {
                        ...prev[documentType],
                        file,
                        preview: reader.result
                    }
                }));
            };
            reader.readAsDataURL(file);
        } else {
            // For PDF files, just store the file without preview
            setVehicleDocuments(prev => ({
                ...prev,
                [documentType]: {
                    ...prev[documentType],
                    file,
                    preview: null
                }
            }));
        }
    };

    const removeDocument = (documentType) => {
        setVehicleDocuments(prev => ({
            ...prev,
            [documentType]: {
                file: null,
                preview: null,
                uploading: false
            }
        }));

        // Clear errors
        setDocumentErrors(prev => ({
            ...prev,
            [documentType]: []
        }));
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleFormChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setVehicleForm(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setVehicleForm(prev => ({
                ...prev,
                [field]: value
            }));
        }

        // Clear error for this field
        if (formErrors[field]) {
            setFormErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const validateStep = (step) => {
        const errors = {};

        if (step === 1) {
            if (!vehicleForm.vehicleType) errors.vehicleType = 'Vehicle type is required';
            if (!vehicleForm.make) errors.make = 'Make is required';
            if (!vehicleForm.model) errors.model = 'Model is required';
            if (!vehicleForm.year) {
                errors.year = 'Year is required';
            } else {
                const currentYear = new Date().getFullYear();
                const year = parseInt(vehicleForm.year);
                if (isNaN(year) || year < 1900 || year > currentYear + 1) {
                    errors.year = `Year must be between 1900 and ${currentYear + 1}`;
                }
            }
            if (!vehicleForm.color) errors.color = 'Color is required';
            if (!vehicleForm.licensePlate) errors.licensePlate = 'License plate is required';
        }

        if (step === 2) {
            if (!vehicleForm.seatingCapacity) errors.seatingCapacity = 'Seating capacity is required';
            if (!vehicleForm.fuelType) errors.fuelType = 'Fuel type is required';
            if (!vehicleForm.transmission) errors.transmission = 'Transmission is required';
        }

        if (step === 3) {
            if (!vehicleForm.location.address) errors['location.address'] = 'Address is required';
            if (!vehicleForm.location.city) errors['location.city'] = 'City is required';
        }

        if (step === 4) {
            if (!vehicleForm.pricing.dailyRate) errors['pricing.dailyRate'] = 'Daily rate is required';
            if (vehicleForm.pricing.dailyRate && vehicleForm.pricing.dailyRate <= 0) errors['pricing.dailyRate'] = 'Daily rate must be greater than 0';
            if (!vehicleForm.pricing.securityDeposit) errors['pricing.securityDeposit'] = 'Security deposit is required';
            if (vehicleForm.pricing.securityDeposit && vehicleForm.pricing.securityDeposit <= 0) errors['pricing.securityDeposit'] = 'Security deposit must be greater than 0';
        }

        if (step === 5) {
            // Insurance validation
            if (!vehicleForm.insurance.provider) errors['insurance.provider'] = 'Insurance provider is required';
            if (!vehicleForm.insurance.policyNumber) errors['insurance.policyNumber'] = 'Policy number is required';
            if (!vehicleForm.insurance.expiryDate) errors['insurance.expiryDate'] = 'Insurance expiry date is required';
            if (!vehicleForm.insurance.coverage) errors['insurance.coverage'] = 'Coverage type is required';

            // Registration validation
            if (!vehicleForm.registration.registrationNumber) errors['registration.registrationNumber'] = 'Registration number is required';
            if (!vehicleForm.registration.expiryDate) errors['registration.expiryDate'] = 'Registration expiry date is required';

            // Document upload validation
            if (!vehicleDocuments.insurance.file) errors['documents.insurance'] = 'Insurance document is required';
            if (!vehicleDocuments.registration.file) errors['documents.registration'] = 'Vehicle owner book/registration document is required';
            if (!vehicleDocuments.emissionTest.file) errors['documents.emissionTest'] = 'Emission test certificate is required';
        }

        return errors;
    };

    const handleNext = () => {
        console.log('handleNext called, currentStep:', currentStep);

        const errors = validateStep(currentStep);
        if (Object.keys(errors).length > 0) {
            console.log('Validation errors:', errors);
            setFormErrors(errors);
            return;
        }

        if (currentStep === 6) {
            console.log('Setting showAgreement to true');
            setShowAgreement(true);
        } else {
            console.log('Moving to next step:', currentStep + 1);
            setCurrentStep(currentStep + 1);
        }
    };

    const handleSubmit = async () => {
        if (!agreementAccepted) {
            alert('Please accept the business agreement to continue');
            return;
        }

        try {
            setSubmitting(true);

            // Transform pricing data to match backend schema
            const vehicleDataForBackend = {
                ...vehicleForm,
                rentalPrice: {
                    dailyRate: vehicleForm.pricing.dailyRate,
                    weeklyRate: vehicleForm.pricing.weeklyRate,
                    monthlyRate: vehicleForm.pricing.monthlyRate,
                    securityDeposit: vehicleForm.pricing.securityDeposit,
                    currency: vehicleForm.pricing.currency
                }
            };

            // Remove the pricing object since we've mapped it to rentalPrice
            delete vehicleDataForBackend.pricing;

            // First, add the vehicle
            const response = await vehicleService.addVehicle(userId, vehicleDataForBackend);

            if (response.success) {
                // If photos are selected, upload them
                if (frontPhoto || backPhoto) {
                    setUploadingPhotos(true);

                    if (frontPhoto) {
                        const frontFormData = new FormData();
                        frontFormData.append('vehicleImage', frontPhoto);
                        frontFormData.append('imageType', 'front');

                        try {
                            await vehicleService.uploadVehicleImage(response.vehicle._id, frontFormData);
                        } catch (error) {
                            console.error('Error uploading front photo:', error);
                        }
                    }

                    if (backPhoto) {
                        const backFormData = new FormData();
                        backFormData.append('vehicleImage', backPhoto);
                        backFormData.append('imageType', 'back');

                        try {
                            await vehicleService.uploadVehicleImage(response.vehicle._id, backFormData);
                        } catch (error) {
                            console.error('Error uploading back photo:', error);
                        }
                    }

                    setUploadingPhotos(false);
                }

                // Upload vehicle documents if provided
                const documentTypes = ['insurance', 'registration', 'emissionTest'];
                for (const docType of documentTypes) {
                    if (vehicleDocuments[docType].file) {
                        try {
                            const docFormData = new FormData();
                            docFormData.append('document', vehicleDocuments[docType].file);

                            await vehicleService.uploadVehicleDocument(response.vehicle._id, docType, docFormData);
                            console.log(`${docType} document uploaded successfully`);
                        } catch (error) {
                            console.error(`Error uploading ${docType} document:`, error);
                        }
                    }
                }

                alert('Vehicle submitted successfully! It will be reviewed by our business team for pricing and approval.');
                onSuccess();
                handleClose();
            } else {
                alert(response.message || 'Failed to add vehicle');
            }
        } catch (error) {
            console.error('Error adding vehicle:', error);
            alert(error.message || 'Failed to add vehicle');
        } finally {
            setSubmitting(false);
            setUploadingPhotos(false);
        }
    };

    const BusinessAgreement = () => {
        console.log('BusinessAgreement component rendering, loadingAgreement:', loadingAgreement);

        if (loadingAgreement) {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-2xl p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading Agreement Terms...</p>
                    </div>
                </div>
            );
        }

        const agreement = businessAgreement || businessAgreementService.getDefaultAgreementTemplate();
        console.log('Agreement data:', agreement);

        return (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-900/60 via-purple-900/60 to-indigo-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-gray-100 transform transition-all duration-300 flex flex-col">
                    {/* Beautiful Header */}
                    <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6 flex-shrink-0">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold mb-2">Partnership Agreement</h2>
                                        <p className="text-blue-100 text-lg">Welcome to Pick-and-Go vehicle network</p>
                                    </div>
                                </div>
                                {/* Close Button */}
                                <button
                                    onClick={() => setShowAgreement(false)}
                                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                                >
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                <p className="text-white/90">By joining our platform, you become part of Sri Lanka's premier vehicle rental network. Review our partnership terms below.</p>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Key Benefits */}
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                                    <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Key Benefits
                                    </h4>
                                    <ul className="space-y-2 text-green-700">
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            Earn 85% of rental fees
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            Professional vehicle management
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            Comprehensive insurance coverage
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            Weekly payment processing
                                        </li>
                                    </ul>
                                </div>

                                {/* Your Responsibilities */}
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                                    <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Your Responsibilities
                                    </h4>
                                    <ul className="space-y-2 text-blue-700">
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            Maintain vehicle cleanliness
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            Ensure regular maintenance
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            Provide accurate information
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            Maintain minimum availability
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Detailed Terms */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                <h4 className="text-lg font-bold text-gray-800 mb-4">Detailed Terms & Conditions</h4>
                                <div className="space-y-4 text-gray-700 text-sm">
                                    {agreement?.terms?.map((term, index) => (
                                        <div key={index} className="flex">
                                            <span className="font-semibold text-indigo-600 mr-3 min-w-6">{index + 1}.</span>
                                            <p><strong>{term.title || term.sectionTitle}:</strong> {term.description || term.content}</p>
                                        </div>
                                    )) || (
                                            // Fallback to default terms if no dynamic terms available
                                            <>
                                                <div className="flex">
                                                    <span className="font-semibold text-indigo-600 mr-3 min-w-6">1.</span>
                                                    <p><strong>Commission Structure:</strong> Pick-and-Go retains 15% service fee from each rental transaction to cover platform maintenance, insurance, and customer support.</p>
                                                </div>

                                                <div className="flex">
                                                    <span className="font-semibold text-indigo-600 mr-3 min-w-6">2.</span>
                                                    <p><strong>Pricing Policy:</strong> Our expert team will evaluate your vehicle and set competitive market rates to maximize your earnings while ensuring customer satisfaction.</p>
                                                </div>

                                                <div className="flex">
                                                    <span className="font-semibold text-indigo-600 mr-3 min-w-6">3.</span>
                                                    <p><strong>Quality Standards:</strong> All vehicles must pass our safety and cleanliness inspection. We reserve the right to temporarily suspend listings that don't meet our standards.</p>
                                                </div>

                                                <div className="flex">
                                                    <span className="font-semibold text-indigo-600 mr-3 min-w-6">4.</span>
                                                    <p><strong>Insurance & Protection:</strong> Comprehensive insurance coverage is mandatory. Additional protection is provided during active rental periods at no extra cost.</p>
                                                </div>

                                                <div className="flex">
                                                    <span className="font-semibold text-indigo-600 mr-3 min-w-6">5.</span>
                                                    <p><strong>Payment Terms:</strong> Earnings are calculated weekly and transferred to your registered bank account within 3-5 business days after each rental completion.</p>
                                                </div>

                                                <div className="flex">
                                                    <span className="font-semibold text-indigo-600 mr-3 min-w-6">6.</span>
                                                    <p><strong>Termination:</strong> Either party may terminate this agreement with 30 days written notice. All pending payments will be processed according to schedule.</p>
                                                </div>
                                            </>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fixed Footer with Checkbox and Buttons */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-t border-gray-200 flex-shrink-0">
                        <div className={`bg-white rounded-xl p-6 mb-6 border-2 shadow-sm transition-all duration-300 ${agreementAccepted ? 'border-green-400 bg-green-50' : 'border-blue-200'
                            }`}>
                            <div className="flex items-start space-x-4">
                                <input
                                    type="checkbox"
                                    id="agreement"
                                    checked={agreementAccepted}
                                    onChange={(e) => setAgreementAccepted(e.target.checked)}
                                    className="w-6 h-6 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2 mt-1"
                                />
                                <div className="flex-1">
                                    <label htmlFor="agreement" className={`text-base font-medium leading-relaxed cursor-pointer transition-colors duration-300 ${agreementAccepted ? 'text-green-800' : 'text-gray-800'
                                        }`}>
                                        {agreementAccepted ? '✅ Agreement Accepted!' : '✓ I Accept the Business Partnership Agreement'}
                                    </label>
                                    <p className={`text-sm mt-2 transition-colors duration-300 ${agreementAccepted ? 'text-green-700' : 'text-gray-600'
                                        }`}>
                                        I have carefully read, understood, and agree to all the terms and conditions outlined above. I confirm that the information provided about my vehicle is accurate and complete.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowAgreement(false)}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                            >
                                ← Review Vehicle Details
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!agreementAccepted || submitting || uploadingPhotos}
                                className={`flex-1 px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg ${agreementAccepted
                                    ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700'
                                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                    } ${submitting || uploadingPhotos ? 'opacity-75' : ''}`}
                            >
                                {submitting || uploadingPhotos ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {uploadingPhotos ? 'Uploading Photos...' : 'Submitting...'}
                                    </span>
                                ) : (
                                    agreementAccepted
                                        ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Agree & Submit Vehicle for Review →
                                            </span>
                                        )
                                        : 'Please Accept Agreement First'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Basic Vehicle Information</h3>
                <p className="text-gray-600 mt-1">Tell us about your vehicle</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type *</label>
                    <select
                        value={vehicleForm.vehicleType}
                        onChange={(e) => handleFormChange('vehicleType', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                    >
                        <option value="">Choose vehicle type</option>
                        <option value="car">🚗 Car</option>
                        <option value="van">🚐 Van</option>
                        <option value="truck">🚛 Truck</option>
                        <option value="motorcycle">🏍️ Motorcycle</option>
                        <option value="bicycle">🚲 Bicycle</option>
                        <option value="bus">🚌 Bus</option>
                        <option value="other">🚙 Other</option>
                    </select>
                    {formErrors.vehicleType && <p className="text-red-500 text-sm mt-1">{formErrors.vehicleType}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Make *</label>
                    <input
                        type="text"
                        value={vehicleForm.make}
                        onChange={(e) => handleFormChange('make', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., Toyota, Honda, BMW"
                        required
                    />
                    {formErrors.make && <p className="text-red-500 text-sm mt-1">{formErrors.make}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                    <input
                        type="text"
                        value={vehicleForm.model}
                        onChange={(e) => handleFormChange('model', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., Camry, Civic, X5"
                        required
                    />
                    {formErrors.model && <p className="text-red-500 text-sm mt-1">{formErrors.model}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                    <input
                        type="number"
                        value={vehicleForm.year}
                        onChange={(e) => handleFormChange('year', parseInt(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        min="1990"
                        max={new Date().getFullYear() + 1}
                        placeholder="2020"
                        required
                    />
                    {formErrors.year && <p className="text-red-500 text-sm mt-1">{formErrors.year}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                    <input
                        type="text"
                        value={vehicleForm.color}
                        onChange={(e) => handleFormChange('color', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., White, Black, Red"
                        required
                    />
                    {formErrors.color && <p className="text-red-500 text-sm mt-1">{formErrors.color}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Plate *</label>
                    <input
                        type="text"
                        value={vehicleForm.licensePlate}
                        onChange={(e) => handleFormChange('licensePlate', e.target.value.toUpperCase())}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="ABC-1234"
                        required
                    />
                    {formErrors.licensePlate && <p className="text-red-500 text-sm mt-1">{formErrors.licensePlate}</p>}
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Vehicle Specifications</h3>
                <p className="text-gray-600 mt-1">Technical details about your vehicle</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seating Capacity *</label>
                    <select
                        value={vehicleForm.seatingCapacity}
                        onChange={(e) => handleFormChange('seatingCapacity', parseInt(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                    >
                        <option value="">Select capacity</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30].map(num => (
                            <option key={num} value={num}>{num} passenger{num > 1 ? 's' : ''}</option>
                        ))}
                    </select>
                    {formErrors.seatingCapacity && <p className="text-red-500 text-sm mt-1">{formErrors.seatingCapacity}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type *</label>
                    <select
                        value={vehicleForm.fuelType}
                        onChange={(e) => handleFormChange('fuelType', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                    >
                        <option value="">Select fuel type</option>
                        <option value="petrol">⛽ Petrol</option>
                        <option value="diesel">🛢️ Diesel</option>
                        <option value="electric">🔋 Electric</option>
                        <option value="hybrid">⚡ Hybrid</option>
                        <option value="lpg">🔧 LPG</option>
                    </select>
                    {formErrors.fuelType && <p className="text-red-500 text-sm mt-1">{formErrors.fuelType}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transmission *</label>
                    <select
                        value={vehicleForm.transmission}
                        onChange={(e) => handleFormChange('transmission', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                    >
                        <option value="">Select transmission</option>
                        <option value="manual">🎛️ Manual</option>
                        <option value="automatic">🔄 Automatic</option>
                        <option value="semi-automatic">⚙️ Semi-Automatic</option>
                    </select>
                    {formErrors.transmission && <p className="text-red-500 text-sm mt-1">{formErrors.transmission}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mileage (km)</label>
                    <input
                        type="number"
                        value={vehicleForm.mileage}
                        onChange={(e) => handleFormChange('mileage', parseInt(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="50000"
                        min="0"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Engine Capacity (L)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={vehicleForm.engineCapacity}
                        onChange={(e) => handleFormChange('engineCapacity', parseFloat(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="2.0"
                        min="0"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Location Details</h3>
                <p className="text-gray-600 mt-1">Where is your vehicle located?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <input
                        type="text"
                        value={vehicleForm.location.address}
                        onChange={(e) => handleFormChange('location.address', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="123 Main Street"
                        required
                    />
                    {formErrors['location.address'] && <p className="text-red-500 text-sm mt-1">{formErrors['location.address']}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                        type="text"
                        value={vehicleForm.location.city}
                        onChange={(e) => handleFormChange('location.city', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Colombo"
                        required
                    />
                    {formErrors['location.city'] && <p className="text-red-500 text-sm mt-1">{formErrors['location.city']}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                    <input
                        type="text"
                        value={vehicleForm.location.state}
                        onChange={(e) => handleFormChange('location.state', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Western Province"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                        type="text"
                        value={vehicleForm.location.zipCode}
                        onChange={(e) => handleFormChange('location.zipCode', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="10230"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Pricing & Rates</h3>
                <p className="text-gray-600 mt-1">Set your rental rates and security deposit</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            💰 Daily Rate *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500 font-medium">LKR</span>
                            <input
                                type="number"
                                step="0.01"
                                value={vehicleForm.pricing.dailyRate}
                                onChange={(e) => handleFormChange('pricing.dailyRate', parseFloat(e.target.value))}
                                className="w-full pl-12 pr-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                placeholder="5000.00"
                                min="0"
                                required
                            />
                        </div>
                        {formErrors['pricing.dailyRate'] && <p className="text-red-500 text-sm mt-1">{formErrors['pricing.dailyRate']}</p>}
                        <p className="text-sm text-gray-600 mt-1">Recommended: LKR 3,000 - 8,000 per day</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            🛡️ Security Deposit *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500 font-medium">LKR</span>
                            <input
                                type="number"
                                step="0.01"
                                value={vehicleForm.pricing.securityDeposit}
                                onChange={(e) => handleFormChange('pricing.securityDeposit', parseFloat(e.target.value))}
                                className="w-full pl-12 pr-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                placeholder="15000.00"
                                min="0"
                                required
                            />
                        </div>
                        {formErrors['pricing.securityDeposit'] && <p className="text-red-500 text-sm mt-1">{formErrors['pricing.securityDeposit']}</p>}
                        <p className="text-sm text-gray-600 mt-1">Recommended: 2-3x daily rate</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            📅 Weekly Rate (Optional)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500 font-medium">LKR</span>
                            <input
                                type="number"
                                step="0.01"
                                value={vehicleForm.pricing.weeklyRate}
                                onChange={(e) => handleFormChange('pricing.weeklyRate', parseFloat(e.target.value))}
                                className="w-full pl-12 pr-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                placeholder="30000.00"
                                min="0"
                            />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Usually 15-20% discount from daily rate × 7</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            📆 Monthly Rate (Optional)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500 font-medium">LKR</span>
                            <input
                                type="number"
                                step="0.01"
                                value={vehicleForm.pricing.monthlyRate}
                                onChange={(e) => handleFormChange('pricing.monthlyRate', parseFloat(e.target.value))}
                                className="w-full pl-12 pr-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                placeholder="120000.00"
                                min="0"
                            />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Usually 25-30% discount from daily rate × 30</p>
                    </div>
                </div>

                {/* Auto-calculate suggestions */}
                {vehicleForm.pricing.dailyRate && (
                    <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">💡 Suggested Rates Based on Daily Rate</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-gray-600">Weekly (15% off)</p>
                                <p className="font-bold text-blue-600">LKR {(vehicleForm.pricing.dailyRate * 7 * 0.85).toLocaleString()}</p>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <p className="text-gray-600">Monthly (25% off)</p>
                                <p className="font-bold text-purple-600">LKR {(vehicleForm.pricing.dailyRate * 30 * 0.75).toLocaleString()}</p>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <p className="text-gray-600">Security Deposit (3x)</p>
                                <p className="font-bold text-orange-600">LKR {(vehicleForm.pricing.dailyRate * 3).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pricing tips */}
                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="text-sm font-semibold text-amber-800 mb-2">📋 Pricing Tips</h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                        <li>• Research similar vehicles in your area for competitive pricing</li>
                        <li>• Consider peak seasons and holidays for dynamic pricing</li>
                        <li>• Security deposit protects against damages and theft</li>
                        <li>• Offer weekly/monthly discounts to attract longer rentals</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Insurance & Registration</h3>
                <p className="text-gray-600 mt-1">Vehicle documentation details</p>
            </div>

            <div className="space-y-6">
                {/* Insurance Information */}
                <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="text-lg font-medium text-blue-900 mb-4">Insurance Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-blue-800 mb-2">Insurance Provider</label>
                            <input
                                type="text"
                                value={vehicleForm.insurance.provider}
                                onChange={(e) => handleFormChange('insurance.provider', e.target.value)}
                                className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="AIA, Ceylinco, etc."
                            />
                            {formErrors['insurance.provider'] && <p className="text-red-500 text-sm mt-1">{formErrors['insurance.provider']}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-blue-800 mb-2">Policy Number</label>
                            <input
                                type="text"
                                value={vehicleForm.insurance.policyNumber}
                                onChange={(e) => handleFormChange('insurance.policyNumber', e.target.value)}
                                className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="POL123456789"
                            />
                            {formErrors['insurance.policyNumber'] && <p className="text-red-500 text-sm mt-1">{formErrors['insurance.policyNumber']}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-blue-800 mb-2">Expiry Date</label>
                            <input
                                type="date"
                                value={vehicleForm.insurance.expiryDate}
                                onChange={(e) => handleFormChange('insurance.expiryDate', e.target.value)}
                                className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            {formErrors['insurance.expiryDate'] && <p className="text-red-500 text-sm mt-1">{formErrors['insurance.expiryDate']}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-blue-800 mb-2">Coverage Type</label>
                            <select
                                value={vehicleForm.insurance.coverage}
                                onChange={(e) => handleFormChange('insurance.coverage', e.target.value)}
                                className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="">Select coverage</option>
                                <option value="comprehensive">Comprehensive</option>
                                <option value="third-party">Third Party</option>
                                <option value="collision">Collision</option>
                            </select>
                            {formErrors['insurance.coverage'] && <p className="text-red-500 text-sm mt-1">{formErrors['insurance.coverage']}</p>}
                        </div>
                    </div>
                </div>

                {/* Registration Information */}
                <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="text-lg font-medium text-green-900 mb-4">Registration Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-green-800 mb-2">Registration Number</label>
                            <input
                                type="text"
                                value={vehicleForm.registration.registrationNumber}
                                onChange={(e) => handleFormChange('registration.registrationNumber', e.target.value.toUpperCase())}
                                className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                placeholder="REG123456"
                            />
                            {formErrors['registration.registrationNumber'] && <p className="text-red-500 text-sm mt-1">{formErrors['registration.registrationNumber']}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-green-800 mb-2">Registration Expiry</label>
                            <input
                                type="date"
                                value={vehicleForm.registration.expiryDate}
                                onChange={(e) => handleFormChange('registration.expiryDate', e.target.value)}
                                className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            />
                            {formErrors['registration.expiryDate'] && <p className="text-red-500 text-sm mt-1">{formErrors['registration.expiryDate']}</p>}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Description</label>
                    <textarea
                        value={vehicleForm.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        rows="4"
                        placeholder="Tell us about your vehicle's condition, special features, or anything renters should know..."
                    />
                </div>

                {/* Vehicle Document Uploads */}
                <div className="bg-purple-50 p-6 rounded-lg">
                    <h4 className="text-lg font-medium text-purple-900 mb-4">Vehicle Document Uploads</h4>
                    <p className="text-sm text-purple-700 mb-6">Please upload the required documents for your vehicle</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Insurance Document */}
                        <div className="border-2 border-dashed border-purple-300 rounded-lg p-4">
                            <div className="text-center">
                                <div className="text-2xl mb-2">🛡️</div>
                                <h5 className="font-medium text-purple-900 mb-1">Insurance Document</h5>
                                <p className="text-xs text-purple-600 mb-3">Upload insurance certificate/policy</p>

                                {vehicleDocuments.insurance.file ? (
                                    <div className="space-y-3">
                                        {vehicleDocuments.insurance.preview ? (
                                            <img
                                                src={vehicleDocuments.insurance.preview}
                                                alt="Insurance preview"
                                                className="w-full h-24 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-24 bg-purple-100 rounded">
                                                <span className="text-4xl">📄</span>
                                            </div>
                                        )}
                                        <p className="text-xs text-green-600 font-medium">{vehicleDocuments.insurance.file.name}</p>
                                        <button
                                            type="button"
                                            onClick={() => removeDocument('insurance')}
                                            className="text-xs text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => handleDocumentChange('insurance', e.target.files[0])}
                                            className="hidden"
                                            id="insurance-upload"
                                        />
                                        <label
                                            htmlFor="insurance-upload"
                                            className="cursor-pointer inline-flex items-center px-3 py-2 border border-purple-300 rounded-md text-sm text-purple-700 bg-white hover:bg-purple-50"
                                        >
                                            Choose File
                                        </label>
                                    </div>
                                )}

                                {documentErrors.insurance && documentErrors.insurance.length > 0 && (
                                    <div className="text-xs text-red-600 mt-2">
                                        {documentErrors.insurance.map((error, idx) => (
                                            <p key={idx}>{error}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Registration Document */}
                        <div className="border-2 border-dashed border-purple-300 rounded-lg p-4">
                            <div className="text-center">
                                <div className="text-2xl mb-2">📋</div>
                                <h5 className="font-medium text-purple-900 mb-1">Vehicle Owner Book</h5>
                                <p className="text-xs text-purple-600 mb-3">Upload registration/owner book copy</p>

                                {vehicleDocuments.registration.file ? (
                                    <div className="space-y-3">
                                        {vehicleDocuments.registration.preview ? (
                                            <img
                                                src={vehicleDocuments.registration.preview}
                                                alt="Registration preview"
                                                className="w-full h-24 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-24 bg-purple-100 rounded">
                                                <span className="text-4xl">📄</span>
                                            </div>
                                        )}
                                        <p className="text-xs text-green-600 font-medium">{vehicleDocuments.registration.file.name}</p>
                                        <button
                                            type="button"
                                            onClick={() => removeDocument('registration')}
                                            className="text-xs text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => handleDocumentChange('registration', e.target.files[0])}
                                            className="hidden"
                                            id="registration-upload"
                                        />
                                        <label
                                            htmlFor="registration-upload"
                                            className="cursor-pointer inline-flex items-center px-3 py-2 border border-purple-300 rounded-md text-sm text-purple-700 bg-white hover:bg-purple-50"
                                        >
                                            Choose File
                                        </label>
                                    </div>
                                )}

                                {documentErrors.registration && documentErrors.registration.length > 0 && (
                                    <div className="text-xs text-red-600 mt-2">
                                        {documentErrors.registration.map((error, idx) => (
                                            <p key={idx}>{error}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Emission Test Document */}
                        <div className="border-2 border-dashed border-purple-300 rounded-lg p-4">
                            <div className="text-center">
                                <div className="text-2xl mb-2">🌱</div>
                                <h5 className="font-medium text-purple-900 mb-1">Emission Test</h5>
                                <p className="text-xs text-purple-600 mb-3">Upload emission test certificate</p>

                                {vehicleDocuments.emissionTest.file ? (
                                    <div className="space-y-3">
                                        {vehicleDocuments.emissionTest.preview ? (
                                            <img
                                                src={vehicleDocuments.emissionTest.preview}
                                                alt="Emission test preview"
                                                className="w-full h-24 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-24 bg-purple-100 rounded">
                                                <span className="text-4xl">📄</span>
                                            </div>
                                        )}
                                        <p className="text-xs text-green-600 font-medium">{vehicleDocuments.emissionTest.file.name}</p>
                                        <button
                                            type="button"
                                            onClick={() => removeDocument('emissionTest')}
                                            className="text-xs text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => handleDocumentChange('emissionTest', e.target.files[0])}
                                            className="hidden"
                                            id="emission-upload"
                                        />
                                        <label
                                            htmlFor="emission-upload"
                                            className="cursor-pointer inline-flex items-center px-3 py-2 border border-purple-300 rounded-md text-sm text-purple-700 bg-white hover:bg-purple-50"
                                        >
                                            Choose File
                                        </label>
                                    </div>
                                )}

                                {documentErrors.emissionTest && documentErrors.emissionTest.length > 0 && (
                                    <div className="text-xs text-red-600 mt-2">
                                        {documentErrors.emissionTest.map((error, idx) => (
                                            <p key={idx}>{error}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Upload Guidelines */}
                    <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h6 className="font-medium text-amber-800 mb-2">📋 Document Upload Guidelines</h6>
                        <ul className="text-sm text-amber-700 space-y-1">
                            <li>• Accepted formats: JPEG, PNG, PDF</li>
                            <li>• Maximum file size: 10MB per document</li>
                            <li>• Ensure documents are clear and readable</li>
                            <li>• All information should be visible</li>
                            <li>• Documents must be valid and not expired</li>
                        </ul>
                    </div>

                    {/* Document Upload Validation Errors */}
                    {(formErrors['documents.insurance'] || formErrors['documents.registration'] || formErrors['documents.emissionTest']) && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                            <h6 className="font-medium text-red-800 mb-2">⚠️ Required Documents Missing</h6>
                            <ul className="text-sm text-red-700 space-y-1">
                                {formErrors['documents.insurance'] && <li>• {formErrors['documents.insurance']}</li>}
                                {formErrors['documents.registration'] && <li>• {formErrors['documents.registration']}</li>}
                                {formErrors['documents.emissionTest'] && <li>• {formErrors['documents.emissionTest']}</li>}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderStep6 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Vehicle Photos</h3>
                <p className="text-gray-600 mt-1">Upload photos of your vehicle (optional but recommended)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Front Photo */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Front View Photo
                    </label>

                    {frontPhotoPreview ? (
                        <div className="relative">
                            <img
                                src={frontPhotoPreview}
                                alt="Vehicle front"
                                className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                            />
                            <button
                                onClick={() => removePhoto('front')}
                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                            >
                                ×
                            </button>
                        </div>
                    ) : (
                        <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-400 transition-colors bg-gray-50">
                            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <label className="cursor-pointer">
                                <span className="text-blue-600 hover:text-blue-700 font-medium">
                                    Click to upload front photo
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handlePhotoChange('front', e.target.files[0])}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-gray-500 text-sm mt-2">PNG, JPG up to 10MB</p>
                        </div>
                    )}
                </div>

                {/* Back Photo */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Back View Photo
                    </label>

                    {backPhotoPreview ? (
                        <div className="relative">
                            <img
                                src={backPhotoPreview}
                                alt="Vehicle back"
                                className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                            />
                            <button
                                onClick={() => removePhoto('back')}
                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                            >
                                ×
                            </button>
                        </div>
                    ) : (
                        <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-400 transition-colors bg-gray-50">
                            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <label className="cursor-pointer">
                                <span className="text-blue-600 hover:text-blue-700 font-medium">
                                    Click to upload back photo
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handlePhotoChange('back', e.target.files[0])}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-gray-500 text-sm mt-2">PNG, JPG up to 10MB</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h4 className="font-medium text-blue-900 mb-2">Photo Tips for Better Approval</h4>
                        <ul className="text-blue-700 text-sm space-y-1">
                            <li>• Take photos in good lighting conditions</li>
                            <li>• Ensure the vehicle is clean and well-presented</li>
                            <li>• Show the entire vehicle from front and back angles</li>
                            <li>• Photos help us determine fair rental pricing</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="fixed inset-0 bg-gradient-to-br from-gray-900/40 via-slate-900/40 to-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Add Your Vehicle</h2>
                                <p className="text-blue-100 mt-1">Step {currentStep} of 6</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-white hover:text-blue-200 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-blue-100 mb-2">
                                <span>Basic Info</span>
                                <span>Specifications</span>
                                <span>Location</span>
                                <span>Pricing</span>
                                <span>Documentation</span>
                                <span>Photos</span>
                            </div>
                            <div className="w-full bg-blue-500 rounded-full h-2">
                                <div
                                    className="bg-white rounded-full h-2 transition-all duration-300"
                                    style={{ width: `${(currentStep / 6) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 overflow-y-auto max-h-[60vh]">
                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}
                        {currentStep === 4 && renderStep4()}
                        {currentStep === 5 && renderStep5()}
                        {currentStep === 6 && renderStep6()}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 p-6 border-t flex justify-between">
                        <button
                            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : handleClose()}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {currentStep > 1 ? 'Previous' : 'Cancel'}
                        </button>

                        <button
                            onClick={handleNext}
                            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {currentStep === 6 ? 'Review Agreement' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>

            {showAgreement && (
                <>
                    {console.log('Rendering BusinessAgreement component, showAgreement:', showAgreement)}
                    <BusinessAgreement />
                </>
            )}
        </>
    );
}

export default AddVehicleModal;
