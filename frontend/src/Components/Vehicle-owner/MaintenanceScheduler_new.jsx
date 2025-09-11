import React, { useState, useEffect } from 'react';
import vehicleService from '../../Services/vehicle-service.js';

function MaintenanceScheduler({ vehicleId, onClose }) {
    const [maintenanceData, setMaintenanceData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        type: 'scheduled_maintenance',
        priority: 'medium',
        estimatedCost: '',
        serviceProvider: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);

    // Get minimum date (today) for date inputs
    const minDate = new Date().toISOString().slice(0, 16);

    const maintenanceTypes = [
        { value: 'scheduled_maintenance', label: 'Scheduled Maintenance', icon: '🔧', color: 'blue' },
        { value: 'repair', label: 'Repair', icon: '🛠️', color: 'red' },
        { value: 'inspection', label: 'Inspection', icon: '🔍', color: 'green' },
        { value: 'oil_change', label: 'Oil Change', icon: '🛢️', color: 'amber' },
        { value: 'tire_service', label: 'Tire Service', icon: '⚫', color: 'gray' },
        { value: 'brake_service', label: 'Brake Service', icon: '🛑', color: 'red' },
        { value: 'engine_service', label: 'Engine Service', icon: '⚙️', color: 'blue' },
        { value: 'other', label: 'Other', icon: '📋', color: 'purple' }
    ];

    const priorityLevels = [
        { value: 'low', label: 'Low Priority', color: 'green', description: 'Can be scheduled flexibly' },
        { value: 'medium', label: 'Medium Priority', color: 'yellow', description: 'Should be done soon' },
        { value: 'high', label: 'High Priority', color: 'orange', description: 'Needs attention' },
        { value: 'urgent', label: 'Urgent', color: 'red', description: 'Immediate attention required' }
    ];

    const validateForm = () => {
        const newErrors = {};

        if (!maintenanceData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!maintenanceData.startDate) {
            newErrors.startDate = 'Start date is required';
        }

        if (!maintenanceData.endDate) {
            newErrors.endDate = 'End date is required';
        }

        if (maintenanceData.startDate && maintenanceData.endDate) {
            const startDate = new Date(maintenanceData.startDate);
            const endDate = new Date(maintenanceData.endDate);

            if (startDate >= endDate) {
                newErrors.endDate = 'End date must be after start date';
            }

            if (startDate < new Date()) {
                newErrors.startDate = 'Start date cannot be in the past';
            }
        }

        if (maintenanceData.estimatedCost && isNaN(maintenanceData.estimatedCost)) {
            newErrors.estimatedCost = 'Please enter a valid number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const response = await vehicleService.addMaintenanceSchedule(vehicleId, maintenanceData);

            if (response.success) {
                setShowSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 2000); // Auto-close after 2 seconds
            } else {
                setErrors({ general: response.message || 'Failed to schedule maintenance' });
            }
        } catch (error) {
            console.error('Error scheduling maintenance:', error);
            setErrors({ general: error.message || 'Failed to schedule maintenance' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setMaintenanceData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    // Auto-calculate end date if start date is set and end date is empty
    useEffect(() => {
        if (maintenanceData.startDate && !maintenanceData.endDate) {
            const startDate = new Date(maintenanceData.startDate);
            const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // Add 2 hours
            setMaintenanceData(prev => ({
                ...prev,
                endDate: endDate.toISOString().slice(0, 16)
            }));
        }
    }, [maintenanceData.startDate]);

    const selectedType = maintenanceTypes.find(type => type.value === maintenanceData.type);
    const selectedPriority = priorityLevels.find(priority => priority.value === maintenanceData.priority);

    if (showSuccess) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-gray-900/60 via-slate-900/60 to-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 text-center">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Success!</h2>
                        <p className="text-green-100">Maintenance scheduled successfully</p>
                    </div>
                    <div className="p-6 text-center">
                        <p className="text-gray-600 mb-4">Your maintenance has been scheduled and added to your vehicle's calendar.</p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900/60 via-slate-900/60 to-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Schedule Maintenance</h2>
                                <p className="text-orange-100 mt-1">Keep your vehicle in top condition</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-orange-200 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                    <div className="p-6 space-y-6">
                        {/* General Error */}
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.76 0L3.054 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <span className="text-red-800 font-medium">{errors.general}</span>
                                </div>
                            </div>
                        )}

                        {/* Maintenance Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-3">Maintenance Type</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {maintenanceTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => handleChange('type', type.value)}
                                        className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                                            maintenanceData.type === type.value
                                                ? 'border-orange-500 bg-orange-50 shadow-md'
                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="text-2xl mb-2">{type.icon}</div>
                                        <div className={`text-sm font-medium ${
                                            maintenanceData.type === type.value ? 'text-orange-700' : 'text-gray-700'
                                        }`}>
                                            {type.label}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title and Priority Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Maintenance Title *
                                </label>
                                <input
                                    type="text"
                                    value={maintenanceData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    className={`w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                                        errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                    }`}
                                    placeholder="e.g., Oil Change, Brake Service"
                                />
                                {errors.title && (
                                    <p className="text-red-600 text-sm mt-1 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.76 0L3.054 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Priority Level</label>
                                <select
                                    value={maintenanceData.priority}
                                    onChange={(e) => handleChange('priority', e.target.value)}
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                >
                                    {priorityLevels.map((priority) => (
                                        <option key={priority.value} value={priority.value}>
                                            {priority.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-sm text-gray-600 mt-1">{selectedPriority?.description}</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                            <textarea
                                value={maintenanceData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                                rows="3"
                                placeholder="Additional details about the maintenance (optional)"
                            />
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Start Date & Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={maintenanceData.startDate}
                                    onChange={(e) => handleChange('startDate', e.target.value)}
                                    min={minDate}
                                    className={`w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                                        errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                    }`}
                                />
                                {errors.startDate && (
                                    <p className="text-red-600 text-sm mt-1 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.76 0L3.054 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        {errors.startDate}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    End Date & Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={maintenanceData.endDate}
                                    onChange={(e) => handleChange('endDate', e.target.value)}
                                    min={maintenanceData.startDate || minDate}
                                    className={`w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                                        errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                    }`}
                                />
                                {errors.endDate && (
                                    <p className="text-red-600 text-sm mt-1 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.76 0L3.054 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        {errors.endDate}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Optional Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Estimated Cost (LKR)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-500">Rs.</span>
                                    <input
                                        type="number"
                                        value={maintenanceData.estimatedCost}
                                        onChange={(e) => handleChange('estimatedCost', e.target.value)}
                                        className={`w-full pl-12 pr-3 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                                            errors.estimatedCost ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                        placeholder="5000"
                                        min="0"
                                    />
                                </div>
                                {errors.estimatedCost && (
                                    <p className="text-red-600 text-sm mt-1 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.76 0L3.054 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        {errors.estimatedCost}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Service Provider
                                </label>
                                <input
                                    type="text"
                                    value={maintenanceData.serviceProvider}
                                    onChange={(e) => handleChange('serviceProvider', e.target.value)}
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                    placeholder="e.g., ABC Auto Service"
                                />
                            </div>
                        </div>

                        {/* Summary Card */}
                        {maintenanceData.title && maintenanceData.startDate && (
                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
                                <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
                                    <span className="text-lg mr-2">{selectedType?.icon}</span>
                                    Maintenance Summary
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-orange-600 font-medium">Title:</span>
                                        <span className="text-orange-800 ml-2">{maintenanceData.title}</span>
                                    </div>
                                    <div>
                                        <span className="text-orange-600 font-medium">Type:</span>
                                        <span className="text-orange-800 ml-2">{selectedType?.label}</span>
                                    </div>
                                    <div>
                                        <span className="text-orange-600 font-medium">Priority:</span>
                                        <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            {selectedPriority?.label}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-orange-600 font-medium">Duration:</span>
                                        <span className="text-orange-800 ml-2">
                                            {maintenanceData.startDate && maintenanceData.endDate ? 
                                                `${Math.ceil((new Date(maintenanceData.endDate) - new Date(maintenanceData.startDate)) / (1000 * 60 * 60))} hours` :
                                                'Not set'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-6 border-t border-gray-200">
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading || !maintenanceData.title || !maintenanceData.startDate || !maintenanceData.endDate}
                            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Scheduling...
                                </div>
                            ) : (
                                'Schedule Maintenance'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MaintenanceScheduler;
