import React, { useState, useEffect } from 'react';
import vehicleService from '../../Services/Vehicle-service';

function MaintenanceScheduler({ vehicleId, onClose }) {
    const [maintenanceData, setMaintenanceData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        type: 'scheduled_maintenance'
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate dates
        const startDate = new Date(maintenanceData.startDate);
        const endDate = new Date(maintenanceData.endDate);

        if (startDate >= endDate) {
            setErrors({ endDate: 'End date must be after start date' });
            return;
        }

        if (startDate < new Date()) {
            setErrors({ startDate: 'Start date cannot be in the past' });
            return;
        }

        try {
            setLoading(true);
            const response = await vehicleService.addMaintenanceSchedule(vehicleId, maintenanceData);

            if (response.success) {
                alert('Maintenance scheduled successfully!');
                onClose();
            } else {
                alert(response.message || 'Failed to schedule maintenance');
            }
        } catch (error) {
            console.error('Error scheduling maintenance:', error);
            alert(error.message || 'Failed to schedule maintenance');
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Schedule Maintenance</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
                        <select
                            value={maintenanceData.type}
                            onChange={(e) => handleChange('type', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="scheduled_maintenance">Scheduled Maintenance</option>
                            <option value="repair">Repair</option>
                            <option value="inspection">Inspection</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input
                            type="text"
                            value={maintenanceData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Oil Change, Brake Service"
                            required
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={maintenanceData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                            placeholder="Additional details about the maintenance"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                            <input
                                type="datetime-local"
                                value={maintenanceData.startDate}
                                onChange={(e) => handleChange('startDate', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                            <input
                                type="datetime-local"
                                value={maintenanceData.endDate}
                                onChange={(e) => handleChange('endDate', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Scheduling...' : 'Schedule Maintenance'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default MaintenanceScheduler;
