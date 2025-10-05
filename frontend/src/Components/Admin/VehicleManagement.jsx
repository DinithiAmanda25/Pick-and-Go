import React, { useState, useEffect } from 'react';
import adminService from '../../Services/admin-service';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';

const VehicleManagement = () => {
    // State for vehicles
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // State for filtering and searching
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [vehicleType, setVehicleType] = useState('all');
    const [vehicleStatus, setVehicleStatus] = useState('all');

    // State for vehicle statistics
    const [stats, setStats] = useState({
        total: 0,
        car: 0,
        van: 0,
        truck: 0,
        bike: 0,
        approved: 0,
        pending: 0,
        rejected: 0
    });

    useEffect(() => {
        fetchVehicles();
    }, [vehicleType, vehicleStatus]);

    useEffect(() => {
        if (vehicles.length > 0) {
            const filtered = vehicles.filter(vehicle =>
                vehicle.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vehicle.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vehicle.type?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredVehicles(filtered);
        }
    }, [searchTerm, vehicles]);

    const fetchVehicles = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('Fetching vehicles data...');
            const response = await adminService.getAllVehicles();
            console.log('Vehicles response received:', response);

            if (response && response.success) {
                if (Array.isArray(response.vehicles)) {
                    const formattedVehicles = response.vehicles.map(formatVehicleData);
                    console.log(`Processed ${formattedVehicles.length} vehicle records`);

                    setVehicles(formattedVehicles);
                    updateVehicleStats(formattedVehicles);

                    // Apply filters if they are set
                    let filtered = formattedVehicles;

                    if (vehicleType !== 'all') {
                        filtered = filtered.filter(vehicle => vehicle.type?.toLowerCase() === vehicleType.toLowerCase());
                    }

                    if (vehicleStatus !== 'all') {
                        filtered = filtered.filter(vehicle => vehicle.status.toLowerCase() === vehicleStatus.toLowerCase());
                    }

                    setFilteredVehicles(filtered);
                } else {
                    console.warn('Vehicles data is not an array:', response.vehicles);
                    setVehicles([]);
                    setFilteredVehicles([]);
                    setError('Vehicles data format is invalid. Please contact support.');
                }
            } else {
                console.warn('Failed response from server:', response);
                setError('Failed to fetch vehicles data. Please try again later.');
                // Set empty arrays as fallback
                setVehicles([]);
                setFilteredVehicles([]);
            }
        } catch (err) {
            console.error('Error fetching vehicles:', err);
            setError('Error connecting to the server. Please try again later.');
            // Set empty arrays as fallback
            setVehicles([]);
            setFilteredVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    const formatVehicleData = (vehicle) => {
        return {
            id: vehicle._id,
            licensePlate: vehicle.licensePlate,
            model: `${vehicle.make} ${vehicle.model}`,
            type: vehicle.vehicleType, // Changed from vehicle.type to vehicle.vehicleType
            year: vehicle.year,
            color: vehicle.color,
            ownerName: vehicle.ownerDetails?.fullName || 'Unknown',
            ownerId: vehicle.ownerId,
            status: vehicle.status,
            passengerCapacity: vehicle.specifications?.passengerCapacity || 'N/A',
            cargoCapacity: vehicle.specifications?.cargoCapacity || 'N/A',
            fuelType: vehicle.specifications?.fuelType || 'N/A',
            transmission: vehicle.specifications?.transmission || 'N/A',
            dailyRate: vehicle.pricing?.daily || 'N/A',
            weeklyRate: vehicle.pricing?.weekly || 'N/A',
            monthlyRate: vehicle.pricing?.monthly || 'N/A',
            images: vehicle.images || [],
            documents: vehicle.documents || [],
            createdAt: new Date(vehicle.createdAt).toLocaleDateString(),
            updatedAt: new Date(vehicle.updatedAt).toLocaleDateString()
        };
    };

    const updateVehicleStats = (vehicleData) => {
        const newStats = {
            total: vehicleData.length,
            car: vehicleData.filter(v => v.type?.toLowerCase() === 'car').length,
            van: vehicleData.filter(v => v.type?.toLowerCase() === 'van').length,
            truck: vehicleData.filter(v => v.type?.toLowerCase() === 'truck').length,
            bike: vehicleData.filter(v => v.type?.toLowerCase() === 'bike').length,
            approved: vehicleData.filter(v => v.status?.toLowerCase() === 'approved').length,
            pending: vehicleData.filter(v => v.status?.toLowerCase() === 'pending').length,
            rejected: vehicleData.filter(v => v.status?.toLowerCase() === 'rejected').length
        };

        setStats(newStats);
    };

    const handleViewDetails = (vehicle) => {
        setSelectedVehicle(vehicle);
        setShowDetailsModal(true);
    };

    const handleRefresh = () => {
        fetchVehicles();
    };

    // Generate CSV Report
    const generateCSVReport = () => {
        const tableData = filteredVehicles.map(vehicle => [
            vehicle.licensePlate,
            vehicle.model,
            vehicle.type,
            vehicle.ownerName,
            vehicle.status,
            vehicle.year,
            vehicle.color,
            vehicle.createdAt
        ]);

        const tableHeader = ['License Plate', 'Model', 'Type', 'Owner', 'Status', 'Year', 'Color', 'Registration Date'];

        const csvContent = [
            tableHeader.join(','),
            ...tableData.map(row => row.join(','))
        ].join('\\n');

        const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `vehicle_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Generate PDF Report
    const generatePDFReport = () => {
        const doc = new jsPDF();
        const tableColumns = [
            { header: 'License Plate', dataKey: 'licensePlate' },
            { header: 'Model', dataKey: 'model' },
            { header: 'Type', dataKey: 'type' },
            { header: 'Owner', dataKey: 'owner' },
            { header: 'Status', dataKey: 'status' },
            { header: 'Year', dataKey: 'year' }
        ];

        const tableData = filteredVehicles.map(vehicle => ({
            licensePlate: vehicle.licensePlate,
            model: vehicle.model,
            type: vehicle.type,
            owner: vehicle.ownerName,
            status: vehicle.status,
            year: vehicle.year
        }));

        // Add title
        const title = `Vehicle Management Report - ${new Date().toLocaleDateString()}`;
        doc.setFontSize(18);
        doc.text(title, 14, 22);

        // Add stats
        const statText = `Total Vehicles: ${stats.total} | Approved: ${stats.approved} | Pending: ${stats.pending} | Rejected: ${stats.rejected}`;
        doc.setFontSize(12);
        const yPos = 35;
        doc.text(statText, 14, yPos);

        // Add table
        autoTable(doc, {
            startY: yPos + 10,
            columns: tableColumns.map(col => ({ header: col.header, dataKey: col.dataKey })),
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [200, 0, 0] }, // Red header
            margin: { top: 45 }
        });

        // Save PDF
        doc.save(`vehicle_report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    // Vehicle Details Modal Component
    const VehicleDetailsModal = () => {
        if (!selectedVehicle) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Vehicle Details</h2>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${selectedVehicle.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    selectedVehicle.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'}`}>
                                {selectedVehicle.status.charAt(0).toUpperCase() + selectedVehicle.status.slice(1)}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Basic Information</h3>
                                <div className="space-y-3">
                                    <p><span className="font-medium">License Plate:</span> {selectedVehicle.licensePlate}</p>
                                    <p><span className="font-medium">Model:</span> {selectedVehicle.model}</p>
                                    <p><span className="font-medium">Type:</span> {selectedVehicle.type}</p>
                                    <p><span className="font-medium">Year:</span> {selectedVehicle.year}</p>
                                    <p><span className="font-medium">Color:</span> {selectedVehicle.color}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Owner Information</h3>
                                <div className="space-y-3">
                                    <p><span className="font-medium">Owner Name:</span> {selectedVehicle.ownerName}</p>
                                    <p><span className="font-medium">Owner ID:</span> {selectedVehicle.ownerId}</p>
                                    <p><span className="font-medium">Registration Date:</span> {selectedVehicle.createdAt}</p>
                                    <p><span className="font-medium">Last Updated:</span> {selectedVehicle.updatedAt}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Specifications</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <p><span className="font-medium">Passenger Capacity:</span> {selectedVehicle.passengerCapacity}</p>
                                <p><span className="font-medium">Cargo Capacity:</span> {selectedVehicle.cargoCapacity}</p>
                                <p><span className="font-medium">Fuel Type:</span> {selectedVehicle.fuelType}</p>
                                <p><span className="font-medium">Transmission:</span> {selectedVehicle.transmission}</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Pricing</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <p><span className="font-medium">Daily Rate:</span> {selectedVehicle.dailyRate}</p>
                                <p><span className="font-medium">Weekly Rate:</span> {selectedVehicle.weeklyRate}</p>
                                <p><span className="font-medium">Monthly Rate:</span> {selectedVehicle.monthlyRate}</p>
                            </div>
                        </div>

                        {selectedVehicle.images && selectedVehicle.images.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Images</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {selectedVehicle.images.map((image, index) => (
                                        <div key={index} className="bg-gray-100 rounded-lg overflow-hidden">
                                            <img
                                                src={image.url || image}
                                                alt={`Vehicle ${index + 1}`}
                                                className="w-full h-32 object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedVehicle.documents && selectedVehicle.documents.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Documents</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {selectedVehicle.documents.map((doc, index) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center space-x-3">
                                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-sm font-medium">
                                                {doc.type ? doc.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : `Document ${index + 1}`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions - admin has view-only access */}
                        <div className="mt-8 border-t border-gray-200 pt-6 flex justify-end space-x-4">
                            <p className="text-sm text-gray-500 italic">Admin has view-only access</p>

                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header with Stats */}
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <h2 className="text-2xl font-bold mb-4 sm:mb-0">Vehicle Management</h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleRefresh}
                            className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                        <button
                            onClick={generatePDFReport}
                            className="flex items-center px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700 rounded transition-colors"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                            PDF Report
                        </button>
                        <button
                            onClick={generateCSVReport}
                            className="flex items-center px-3 py-1 text-sm bg-green-600 text-white hover:bg-green-700 rounded transition-colors"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                            CSV Report
                        </button>
                    </div>
                </div>

                {/* Stats Boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                        <h3 className="text-sm font-medium text-gray-500">Total Vehicles</h3>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                        <h3 className="text-sm font-medium text-gray-500">By Type</h3>
                        <p className="text-lg font-bold text-gray-900">
                            🚗 {stats.car} | 🚐 {stats.van} | 🚚 {stats.truck} | 🛵 {stats.bike}
                        </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                        <h3 className="text-sm font-medium text-gray-500">Approved Vehicles</h3>
                        <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                        <h3 className="text-sm font-medium text-gray-500">Pending Approval</h3>
                        <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div>
                        <label htmlFor="vehicle-type" className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                        <select
                            id="vehicle-type"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                            value={vehicleType}
                            onChange={(e) => setVehicleType(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="car">Cars</option>
                            <option value="van">Vans</option>
                            <option value="truck">Trucks</option>
                            <option value="bike">Bikes</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            id="status-filter"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                            value={vehicleStatus}
                            onChange={(e) => setVehicleStatus(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
                <div className="w-full sm:w-auto flex-1 sm:max-w-xs">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Vehicles</label>
                    <div className="relative">
                        <input
                            type="search"
                            id="search"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                            placeholder="Search by plate, model, owner..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehicle Table */}
            <div>
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vehicle Info
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Owner
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Registered
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredVehicles.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                No vehicles found matching your filters
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredVehicles.map((vehicle) => (
                                            <tr key={vehicle.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                            {vehicle.type === 'car' && '🚗'}
                                                            {vehicle.type === 'van' && '🚐'}
                                                            {vehicle.type === 'truck' && '🚚'}
                                                            {vehicle.type === 'bike' && '🛵'}
                                                            {!['car', 'van', 'truck', 'bike'].includes(vehicle.type) && '🚗'}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {vehicle.licensePlate}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {vehicle.model} ({vehicle.year})
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{vehicle.ownerName}</div>
                                                    <div className="text-sm text-gray-500">ID: {vehicle.ownerId.substring(0, 8)}...</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${vehicle.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                            vehicle.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'}`}>
                                                        {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {vehicle.createdAt}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleViewDetails(vehicle)}
                                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                                    >
                                                        View
                                                    </button>

                                                    {/* Action buttons removed - admin has view-only access */}
                                                    <span className="text-sm text-gray-500 italic">
                                                        View only
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Vehicle Details Modal */}
            {showDetailsModal && <VehicleDetailsModal />}
        </div>
    );
};

export default VehicleManagement;