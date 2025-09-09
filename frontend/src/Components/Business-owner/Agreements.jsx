import React, { useState, useEffect } from 'react';
import BusinessAgreementService from '../../Services/BusinessAgreement-service.js';

function BusinessOwnerAgreements({ agreements }) {
    const [agreementData, setAgreementData] = useState(agreements)
    const [filter, setFilter] = useState('all')
    // Removed activeTab state since we only have templates now

    // Template management states
    const [vehicleOwnerAgreement, setVehicleOwnerAgreement] = useState(null)
    const [clientRentalAgreement, setClientRentalAgreement] = useState(null)
    const [editingAgreement, setEditingAgreement] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Load agreement templates on component mount
    useEffect(() => {
        loadAgreementTemplates()
    }, [])

    const loadAgreementTemplates = async () => {
        setLoading(true)
        try {
            // Load both agreement types
            const vehicleOwnerResponse = await BusinessAgreementService.previewAgreement('vehicle-owner')
            const clientRentalResponse = await BusinessAgreementService.previewAgreement('client-rental')

            setVehicleOwnerAgreement(vehicleOwnerResponse.agreement)
            setClientRentalAgreement(clientRentalResponse.agreement)
        } catch (err) {
            setError('Failed to load agreement templates')
            console.error('Error loading agreements:', err)
        } finally {
            setLoading(false)
        }
    }

    // Template management functions
    const handleEditAgreement = (agreementType) => {
        const agreement = agreementType === 'vehicle-owner' ? vehicleOwnerAgreement : clientRentalAgreement
        setEditingAgreement({
            ...agreement,
            agreementType
        })
        setIsEditing(true)
    }

    const handleSaveAgreement = async () => {
        if (!editingAgreement) return

        setLoading(true)
        try {
            const response = await BusinessAgreementService.updateAgreement({
                title: editingAgreement.title,
                terms: editingAgreement.terms,
                commissionRate: editingAgreement.commissionRate,
                paymentTerms: editingAgreement.paymentTerms,
                minimumAvailability: editingAgreement.minimumAvailability,
                agreementType: editingAgreement.agreementType
            })

            // Update local state
            if (editingAgreement.agreementType === 'vehicle-owner') {
                setVehicleOwnerAgreement(response.agreement)
            } else {
                setClientRentalAgreement(response.agreement)
            }

            setIsEditing(false)
            setEditingAgreement(null)
            alert('Agreement updated successfully!')
        } catch (err) {
            setError('Failed to update agreement')
            console.error('Error updating agreement:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleResetToDefault = async (agreementType) => {
        if (!window.confirm('Are you sure you want to reset this agreement to default? This action cannot be undone.')) {
            return
        }

        setLoading(true)
        try {
            await BusinessAgreementService.resetToDefault(agreementType)
            await loadAgreementTemplates() // Reload templates
            alert('Agreement reset to default successfully!')
        } catch (err) {
            setError('Failed to reset agreement')
            console.error('Error resetting agreement:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field, value) => {
        setEditingAgreement(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleTermChange = (index, field, value) => {
        setEditingAgreement(prev => ({
            ...prev,
            terms: prev.terms.map((term, i) =>
                i === index
                    ? { ...term, [field]: value }
                    : term
            )
        }))
    }

    const addNewTerm = () => {
        setEditingAgreement(prev => ({
            ...prev,
            terms: [...prev.terms, { sectionTitle: '', content: '' }]
        }))
    }

    const removeTerm = (index) => {
        setEditingAgreement(prev => ({
            ...prev,
            terms: prev.terms.filter((_, i) => i !== index)
        }))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header with enhanced design */}
                <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-200 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 opacity-50"></div>
                    <div className="relative px-6 py-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                                        Agreement Templates
                                    </h1>
                                    <p className="text-sm lg:text-base text-gray-600 font-medium">
                                        Create and customize professional agreements for your business
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                    System Active
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 shadow-sm">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <h3 className="text-sm font-semibold text-red-800">Error</h3>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                            </div>
                            <button
                                onClick={() => setError('')}
                                className="flex-shrink-0 text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Template Management */}
                <div className="space-y-8">
                    {/* Enhanced Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="relative mx-auto mb-4">
                                    <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">Loading Templates</h3>
                                <p className="text-sm text-gray-600">Please wait while we fetch your agreement templates...</p>
                            </div>
                        </div>
                    )}

                    {!loading && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* Enhanced Vehicle Owner Agreement Template */}
                                <div className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 border-b border-blue-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md transform group-hover:scale-105 transition-transform duration-200">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Vehicle Owner Agreement</h3>
                                                    <p className="text-sm text-gray-600 font-medium">Professional partnership templates</p>
                                                    <div className="flex items-center mt-1">
                                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                                                        <span className="text-xs text-green-600 font-semibold">Active Template</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <button
                                                    onClick={() => handleEditAgreement('vehicle-owner')}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-sm hover:shadow-md flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleResetToDefault('vehicle-owner')}
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 border border-gray-200 flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Reset
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Client Rental Agreement Template */}
                                <div className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 border-b border-green-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md transform group-hover:scale-105 transition-transform duration-200">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Client Rental Agreement</h3>
                                                    <p className="text-sm text-gray-600 font-medium">Customer booking templates</p>
                                                    <div className="flex items-center mt-1">
                                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                                                        <span className="text-xs text-green-600 font-semibold">Active Template</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <button
                                                    onClick={() => handleEditAgreement('client-rental')}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-sm hover:shadow-md flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleResetToDefault('client-rental')}
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 border border-gray-200 flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Reset
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Enhanced Agreement Editor Modal */}
                {isEditing && editingAgreement && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-300 relative">
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-green-200 to-blue-200 rounded-full opacity-20 translate-y-20 -translate-x-20"></div>

                            {/* Modal Header */}
                            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-8">
                                <div className="relative flex items-center justify-between text-white">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-30">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">
                                                Edit {editingAgreement.agreementType === 'vehicle-owner' ? 'Vehicle Owner' : 'Client Rental'} Agreement
                                            </h3>
                                            <p className="text-blue-100 mt-1 text-sm">Customize your agreement template with professional settings</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="relative p-8 max-h-[calc(90vh-180px)] overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-50">
                                <div className="space-y-8">
                                    {/* Title */}
                                    <div className="relative">
                                        <label className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                                </svg>
                                            </div>
                                            Agreement Title
                                        </label>
                                        <input
                                            type="text"
                                            value={editingAgreement.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-transparent bg-white shadow-inner text-gray-800 font-medium transition-all duration-200"
                                            placeholder="Enter agreement title..."
                                        />
                                    </div>

                                    {/* Commission Rate (Vehicle Owner Only) */}
                                    {editingAgreement.agreementType === 'vehicle-owner' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="relative">
                                                <label className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                                                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-2">
                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                        </svg>
                                                    </div>
                                                    Commission Rate (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={editingAgreement.commissionRate}
                                                    onChange={(e) => handleInputChange('commissionRate', parseFloat(e.target.value))}
                                                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-green-500 focus:border-transparent bg-white shadow-inner text-gray-800 font-medium transition-all duration-200"
                                                    placeholder="Enter commission rate..."
                                                />
                                            </div>
                                            <div className="relative">
                                                <label className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                                                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-2">
                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    Minimum Availability (days)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={editingAgreement.minimumAvailability}
                                                    onChange={(e) => handleInputChange('minimumAvailability', parseInt(e.target.value))}
                                                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-purple-500 focus:border-transparent bg-white shadow-inner text-gray-800 font-medium transition-all duration-200"
                                                    placeholder="Enter minimum days..."
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Terms */}
                                    <div className="relative">
                                        <label className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                                            <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-2">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            Payment Terms
                                        </label>
                                        <textarea
                                            value={editingAgreement.paymentTerms}
                                            onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                                            rows={4}
                                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-orange-500 focus:border-transparent bg-white shadow-inner text-gray-800 font-medium transition-all duration-200 resize-none"
                                            placeholder="Enter payment terms and conditions..."
                                        />
                                    </div>

                                    {/* Terms */}
                                    <div className="relative">
                                        <label className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                                            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            </div>
                                            Agreement Terms & Conditions
                                        </label>
                                        <div className="space-y-4">
                                            {editingAgreement.terms?.map((term, index) => (
                                                <div key={index} className="border-2 border-gray-200 rounded-2xl p-6 space-y-4 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-shadow duration-200">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-bold text-gray-900 text-base flex items-center">
                                                            <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center text-sm font-bold mr-3 shadow-md">
                                                                {index + 1}
                                                            </span>
                                                            Term {index + 1}
                                                        </h4>
                                                        <button
                                                            onClick={() => removeTerm(index)}
                                                            className="bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-700 px-3 py-2 rounded-xl transition-all duration-200 text-xs font-semibold flex items-center shadow-sm hover:shadow-md"
                                                        >
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Remove
                                                        </button>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-700 mb-2">Section Title</label>
                                                        <input
                                                            type="text"
                                                            value={term.sectionTitle || ''}
                                                            onChange={(e) => handleTermChange(index, 'sectionTitle', e.target.value)}
                                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white shadow-inner font-medium"
                                                            placeholder="e.g., Vehicle Use Policy"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-700 mb-2">Content</label>
                                                        <textarea
                                                            value={term.content || ''}
                                                            onChange={(e) => handleTermChange(index, 'content', e.target.value)}
                                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white shadow-inner font-medium resize-none"
                                                            rows={4}
                                                            placeholder="Enter the detailed content for this term..."
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={addNewTerm}
                                                className="w-full border-3 border-dashed border-gray-300 rounded-2xl py-6 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 text-sm font-bold flex items-center justify-center bg-gradient-to-br from-gray-50 to-white"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Add New Term
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="relative p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 bg-gradient-to-r from-gray-50 via-white to-gray-50">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 text-sm font-bold shadow-sm hover:shadow-md"
                                >
                                    Cancel Changes
                                </button>
                                <button
                                    onClick={handleSaveAgreement}
                                    disabled={loading}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 text-sm font-bold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Saving Agreement...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Save Agreement
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BusinessOwnerAgreements
