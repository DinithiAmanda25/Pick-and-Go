import React, { useState, useEffect } from 'react';
import businessOwnerService from '../../Services/business-owner-service.js';
import PendingDriverApplications from './PendingDriverApplications';
import PendingVehicleApprovals from './PendingVehicleApprovals';

function PendingApplications() {
    const [activeTab, setActiveTab] = useState('all');
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const response = await businessOwnerService.getApprovalStatistics();
            if (response.success) {
                setStatistics(response.statistics);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, count, color, icon }) => (
        <div className={`${color} rounded-lg p-6 text-white`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-white/80 text-sm">{title}</p>
                    <p className="text-2xl font-bold">{count}</p>
                </div>
                <div className="text-white/80 text-2xl">
                    {icon}
                </div>
            </div>
        </div>
    );

    const TabButton = ({ id, label, isActive, count, onClick }) => (
        <button
            onClick={() => onClick(id)}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
            {label}
            {count !== undefined && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                    isActive ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                    {count}
                </span>
            )}
        </button>
    );

    const AllApplicationsView = () => {
        const [allApplications, setAllApplications] = useState(null);
        const [loadingAll, setLoadingAll] = useState(true);

        useEffect(() => {
            fetchAllApplications();
        }, []);

        const fetchAllApplications = async () => {
            try {
                setLoadingAll(true);
                const response = await businessOwnerService.getAllPendingApplications();
                if (response.success) {
                    setAllApplications(response.data);
                }
            } catch (error) {
                console.error('Error fetching all applications:', error);
            } finally {
                setLoadingAll(false);
            }
        };

        if (loadingAll) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading applications...</span>
                </div>
            );
        }

        if (!allApplications) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-600">Failed to load applications</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <StatCard
                        title="Pending Drivers"
                        count={allApplications.drivers.count}
                        color="bg-gradient-to-r from-orange-500 to-orange-600"
                        icon="👨‍💼"
                    />
                    <StatCard
                        title="Pending Vehicles"
                        count={allApplications.vehicles.count}
                        color="bg-gradient-to-r from-blue-500 to-blue-600"
                        icon="🚗"
                    />
                    <StatCard
                        title="Total Pending"
                        count={allApplications.totalPending}
                        color="bg-gradient-to-r from-purple-500 to-purple-600"
                        icon="📋"
                    />
                </div>

                {/* Drivers Section */}
                {allApplications.drivers.count > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                👨‍💼 Pending Driver Applications ({allApplications.drivers.count})
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {allApplications.drivers.applications.slice(0, 6).map((driver) => (
                                    <div key={driver._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                                <span className="text-orange-600 font-semibold">
                                                    {driver.fullName?.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-800">{driver.fullName}</h4>
                                                <p className="text-sm text-gray-600">{driver.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p><span className="font-medium">Phone:</span> {driver.phone}</p>
                                            <p><span className="font-medium">Vehicle:</span> {driver.vehicleInfo?.type || 'N/A'}</p>
                                            <p className="text-xs text-gray-500">
                                                Applied: {new Date(driver.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {allApplications.drivers.count > 6 && (
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={() => setActiveTab('drivers')}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        View all {allApplications.drivers.count} driver applications →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Vehicles Section */}
                {allApplications.vehicles.count > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                🚗 Pending Vehicle Applications ({allApplications.vehicles.count})
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {allApplications.vehicles.applications.slice(0, 6).map((vehicle) => (
                                    <div key={vehicle._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 text-xl">🚗</span>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-800">
                                                    {vehicle.make} {vehicle.model}
                                                </h4>
                                                <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p><span className="font-medium">Owner:</span> {vehicle.ownerId?.firstName} {vehicle.ownerId?.lastName}</p>
                                            <p><span className="font-medium">Type:</span> {vehicle.vehicleType}</p>
                                            <p><span className="font-medium">Year:</span> {vehicle.year}</p>
                                            <p className="text-xs text-gray-500">
                                                Applied: {new Date(vehicle.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {allApplications.vehicles.count > 6 && (
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={() => setActiveTab('vehicles')}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        View all {allApplications.vehicles.count} vehicle applications →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {allApplications.totalPending === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">All Caught Up!</h3>
                        <p className="text-gray-600">No pending applications to review at the moment.</p>
                    </div>
                )}
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'all':
                return <AllApplicationsView />;
            case 'drivers':
                return <PendingDriverApplications />;
            case 'vehicles':
                return <PendingVehicleApprovals />;
            default:
                return <AllApplicationsView />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading dashboard...</span>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Pending Applications</h1>
                <p className="text-gray-600">Review and approve driver and vehicle applications</p>
            </div>

            {/* Statistics Overview */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <StatCard
                        title="Pending Drivers"
                        count={statistics.pending.drivers}
                        color="bg-gradient-to-r from-orange-500 to-orange-600"
                        icon="👨‍💼"
                    />
                    <StatCard
                        title="Pending Vehicles"
                        count={statistics.pending.vehicles}
                        color="bg-gradient-to-r from-blue-500 to-blue-600"
                        icon="🚗"
                    />
                    <StatCard
                        title="Total Pending"
                        count={statistics.pending.total}
                        color="bg-gradient-to-r from-purple-500 to-purple-600"
                        icon="📋"
                    />
                    <StatCard
                        title="My Approvals"
                        count={statistics.myApprovals.total}
                        color="bg-gradient-to-r from-green-500 to-green-600"
                        icon="✅"
                    />
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex gap-4 mb-6 flex-wrap">
                <TabButton
                    id="all"
                    label="All Applications"
                    isActive={activeTab === 'all'}
                    count={statistics?.pending.total}
                    onClick={setActiveTab}
                />
                <TabButton
                    id="drivers"
                    label="Driver Applications"
                    isActive={activeTab === 'drivers'}
                    count={statistics?.pending.drivers}
                    onClick={setActiveTab}
                />
                <TabButton
                    id="vehicles"
                    label="Vehicle Applications"
                    isActive={activeTab === 'vehicles'}
                    count={statistics?.pending.vehicles}
                    onClick={setActiveTab}
                />
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {renderContent()}
            </div>
        </div>
    );
}

export default PendingApplications;
