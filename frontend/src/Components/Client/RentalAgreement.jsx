import React, { useState, useEffect } from 'react';
import businessAgreementService from '../../Services/BusinessAgreement-service';

function RentalAgreement({ onAccept, isRequired = true }) {
    const [agreement, setAgreement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accepted, setAccepted] = useState(false);
    const [showFullAgreement, setShowFullAgreement] = useState(false);

    useEffect(() => {
        loadRentalAgreement();
    }, []);

    const loadRentalAgreement = async () => {
        try {
            setLoading(true);
            console.log('Loading client rental agreement...');
            const response = await businessAgreementService.previewAgreement('client-rental');
            console.log('Client rental agreement response:', response);

            if (response.success) {
                setAgreement(response.agreement);
            } else {
                console.warn('Agreement response not successful:', response);
                // Use default client rental agreement if failed to load
                setAgreement(businessAgreementService.getDefaultAgreementTemplate('client-rental'));
            }
        } catch (error) {
            console.error('Error loading rental agreement:', error);
            // Use default client rental agreement as fallback
            setAgreement(businessAgreementService.getDefaultAgreementTemplate('client-rental'));
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptanceChange = (e) => {
        const isAccepted = e.target.checked;
        setAccepted(isAccepted);
        onAccept(isAccepted);
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!agreement) {
        return (
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-800 font-medium">Failed to load rental agreement</p>
                </div>
                <p className="text-red-600 text-sm mt-1">Please refresh the page or contact support if this issue persists.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-xl">
                <h3 className="text-xl font-bold text-white">{agreement.title}</h3>
                <p className="text-blue-100 text-sm mt-1">Please review and accept the rental terms before proceeding</p>
            </div>

            {/* Agreement Content */}
            <div className="p-6">
                {/* Summary/Preview */}
                {!showFullAgreement ? (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">📋 Agreement Summary</h4>
                            <p className="text-blue-800 text-sm">
                                This rental agreement outlines the terms and conditions for your vehicle rental.
                                Key points include vehicle use policies, insurance coverage, return requirements,
                                and our cancellation policy.
                            </p>
                        </div>

                        {/* Key Terms Preview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {agreement.terms?.slice(0, 4).map((term, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                    <h5 className="font-medium text-gray-900 mb-2">{term.sectionTitle}</h5>
                                    <p className="text-gray-700 text-sm line-clamp-3">
                                        {term.content.substring(0, 120)}
                                        {term.content.length > 120 ? '...' : ''}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* View Full Agreement Button */}
                        <div className="text-center pt-4">
                            <button
                                onClick={() => setShowFullAgreement(true)}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm underline"
                            >
                                View Complete Agreement Terms →
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Full Agreement */
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-gray-900">Complete Agreement Terms</h4>
                            <button
                                onClick={() => setShowFullAgreement(false)}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                                ← Back to Summary
                            </button>
                        </div>

                        <div className="space-y-6 max-h-96 overflow-y-auto bg-gray-50 p-6 rounded-lg">
                            {agreement.terms?.map((term, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                                    <h5 className="font-semibold text-gray-900 mb-3">{term.sectionTitle}</h5>
                                    <p className="text-gray-700 leading-relaxed">{term.content}</p>
                                </div>
                            ))}
                        </div>

                        {/* Agreement Metadata */}
                        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="font-medium">Agreement Version:</span> {agreement.version}
                                </div>
                                <div>
                                    <span className="font-medium">Last Updated:</span>{' '}
                                    {agreement.lastModified ? new Date(agreement.lastModified).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Acceptance Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="rental-agreement-acceptance"
                                    type="checkbox"
                                    checked={accepted}
                                    onChange={handleAcceptanceChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    required={isRequired}
                                />
                            </div>
                            <div className="ml-3">
                                <label
                                    htmlFor="rental-agreement-acceptance"
                                    className="text-sm font-medium text-gray-900 cursor-pointer"
                                >
                                    I have read, understood, and agree to the rental terms and conditions
                                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                <p className="text-xs text-gray-600 mt-1">
                                    By checking this box, you acknowledge that you accept all terms outlined in this agreement.
                                </p>
                            </div>
                        </div>
                    </div>

                    {!accepted && isRequired && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Please accept the rental agreement to proceed with your booking.
                        </p>
                    )}
                </div>

                {/* Support Information */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h6 className="font-medium text-blue-900 mb-2">Need Help?</h6>
                    <p className="text-blue-800 text-sm">
                        If you have questions about these terms, please contact our support team at{' '}
                        <span className="font-medium">support@pickandgo.com</span> or call{' '}
                        <span className="font-medium">+94-11-234-5678</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RentalAgreement;
