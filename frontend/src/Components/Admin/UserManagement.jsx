import React, { useState, useEffect } from 'react';
import adminService from '../../Services/admin-service';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const UserManagement = () => {
    // State for all user types
    const [userType, setUserType] = useState('all');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // State for filtering and searching
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);

    // State for user statistics
    const [stats, setStats] = useState({
        total: 0,
        drivers: 0,
        clients: 0,
        vehicleOwners: 0,
        businessOwners: 0,
        active: 0,
        pending: 0,
        inactive: 0
    });

    useEffect(() => {
        fetchUsers(userType);
    }, [userType]);

    useEffect(() => {
        if (users.length > 0) {
            const filtered = users.filter(user =>
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchTerm, users]);

    const fetchUsers = async (type) => {
        setLoading(true);
        setError(null);

        try {
            let userData = [];

            switch (type) {
                case 'drivers':
                    try {
                        console.log('Fetching drivers data...');
                        const response = await adminService.getAllDrivers();
                        console.log('Drivers response received:', response);

                        if (response && response.success) {
                            if (Array.isArray(response.drivers)) {
                                userData = response.drivers.map(formatDriverData);
                                console.log(`Processed ${userData.length} driver records`);
                            } else {
                                console.warn('Drivers data is not an array:', response.drivers);
                                userData = [];
                                setError('Drivers data format is invalid. Please contact support.');
                            }
                        } else {
                            console.warn('Failed response from server:', response);
                            setError('Failed to fetch drivers data. Please try again later.');
                        }
                    } catch (err) {
                        console.error('Error fetching drivers:', err);
                        setError('Error connecting to the server. Please try again later.');
                    }
                    break;
                case 'clients':
                    try {
                        console.log('Fetching clients data...');
                        const response = await adminService.getAllClients();
                        console.log('Clients response received:', response);

                        if (response && response.success) {
                            if (Array.isArray(response.clients)) {
                                userData = response.clients.map(formatClientData);
                                console.log(`Processed ${userData.length} client records`);
                            } else {
                                console.warn('Clients data is not an array:', response.clients);
                                userData = [];
                                setError('Clients data format is invalid. Please contact support.');
                            }
                        } else {
                            console.warn('Failed response from server:', response);
                            setError('Failed to fetch clients data. Please try again later.');
                        }
                    } catch (err) {
                        console.error('Error fetching clients:', err);
                        setError('Error connecting to the server. Please try again later.');
                    }
                    break;
                case 'vehicleOwners':
                    try {
                        console.log('Fetching vehicle owners data...');
                        const response = await adminService.getAllVehicleOwners();
                        console.log('Vehicle owners response received:', response);

                        if (response && response.success) {
                            if (Array.isArray(response.vehicleOwners)) {
                                userData = response.vehicleOwners.map(formatVehicleOwnerData);
                                console.log(`Processed ${userData.length} vehicle owner records`);
                            } else {
                                console.warn('Vehicle owners data is not an array:', response.vehicleOwners);
                                userData = [];
                                setError('Vehicle owners data format is invalid. Please contact support.');
                            }
                        } else {
                            console.warn('Failed response from server:', response);
                            setError('Failed to fetch vehicle owners data. Please try again later.');
                        }
                    } catch (err) {
                        console.error('Error fetching vehicle owners:', err);
                        setError('Error connecting to the server. Please try again later.');
                    }
                    break;
                case 'businessOwners':
                    try {
                        console.log('Fetching business owners data...');
                        const response = await adminService.getAllBusinessOwners();
                        console.log('Business owners response received:', response);

                        if (response && response.success) {
                            if (Array.isArray(response.businessOwners)) {
                                userData = response.businessOwners.map(formatBusinessOwnerData);
                                console.log(`Processed ${userData.length} business owner records`);
                            } else {
                                console.warn('Business owners data is not an array:', response.businessOwners);
                                userData = [];
                                setError('Business owners data format is invalid. Please contact support.');
                            }
                        } else {
                            console.warn('Failed response from server:', response);
                            setError('Failed to fetch business owners data. Please try again later.');
                        }
                    } catch (err) {
                        console.error('Error fetching business owners:', err);
                        setError('Error connecting to the server. Please try again later.');
                    }
                    break;
                case 'all':
                default:
                    // Try to fetch each type independently
                    let errorCount = 0;

                    try {
                        const driversResp = await adminService.getAllDrivers();
                        if (driversResp && driversResp.success) {
                            userData = [...userData, ...driversResp.drivers.map(formatDriverData)];
                        } else {
                            errorCount++;
                        }
                    } catch (err) {
                        console.error('Error fetching drivers:', err);
                        errorCount++;
                    }

                    try {
                        const clientsResp = await adminService.getAllClients();
                        if (clientsResp && clientsResp.success) {
                            userData = [...userData, ...clientsResp.clients.map(formatClientData)];
                        } else {
                            errorCount++;
                        }
                    } catch (err) {
                        console.error('Error fetching clients:', err);
                        errorCount++;
                    }

                    try {
                        const vehicleOwnersResp = await adminService.getAllVehicleOwners();
                        if (vehicleOwnersResp && vehicleOwnersResp.success) {
                            userData = [...userData, ...vehicleOwnersResp.vehicleOwners.map(formatVehicleOwnerData)];
                        } else {
                            errorCount++;
                        }
                    } catch (err) {
                        console.error('Error fetching vehicle owners:', err);
                        errorCount++;
                    }

                    try {
                        const businessOwnersResp = await adminService.getAllBusinessOwners();
                        if (businessOwnersResp && businessOwnersResp.success) {
                            userData = [...userData, ...businessOwnersResp.businessOwners.map(formatBusinessOwnerData)];
                        } else {
                            errorCount++;
                        }
                    } catch (err) {
                        console.error('Error fetching business owners:', err);
                        errorCount++;
                    }

                    if (errorCount === 4) {
                        setError('Failed to fetch any user data. Please check your connection and try again.');
                    } else if (errorCount > 0) {
                        setError('Some user data could not be loaded. Results may be incomplete.');
                    }
                    break;
            }

            // Update the users state with fetched data
            setUsers(userData);
            setFilteredUsers(userData);
            calculateStats(userData);

        } catch (err) {
            console.error('Error fetching users:', err);
            setError('An unexpected error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Format user data consistently based on user type
    const formatDriverData = (driver) => {
        // Check if driver is valid
        if (!driver || typeof driver !== 'object') {
            console.warn('Invalid driver data:', driver);
            return {
                id: 'invalid-data',
                type: 'driver',
                name: 'Invalid Data',
                email: 'N/A',
                phone: 'N/A',
                status: 'unknown',
                createdAt: new Date().toISOString(),
                details: {}
            };
        }

        // For our mock data structure
        const fullName = driver.fullName ||
            `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || 'N/A';

        // Determine status based on different possible status fields
        let status = 'unknown';
        if (driver.status) {
            status = driver.status;
        } else if (driver.isApproved) {
            status = 'approved';
        } else if (driver.isRejected) {
            status = 'rejected';
        } else if (driver.isPending !== undefined) {
            status = driver.isPending ? 'pending' : 'unknown';
        }

        return {
            id: driver._id || 'unknown',
            type: 'driver',
            name: fullName,
            email: driver.email || 'N/A',
            phone: driver.phone || 'N/A',
            status: status,
            createdAt: driver.createdAt || new Date().toISOString(),
            profileImage: driver.profileImage?.url || null,
            details: {
                licenseNumber: driver.drivingLicenseNo || driver.licenseNumber || 'N/A',
                experience: driver.yearsOfExperience || 'N/A',
                vehicleInfo: driver.vehicleInfo || {},
                documents: driver.documents || []
            }
        };
    };

    const formatClientData = (client) => {
        // Check if client is valid
        if (!client || typeof client !== 'object') {
            console.warn('Invalid client data:', client);
            return {
                id: 'invalid-data',
                type: 'client',
                name: 'Invalid Data',
                email: 'N/A',
                phone: 'N/A',
                status: 'unknown',
                createdAt: new Date().toISOString(),
                details: {}
            };
        }

        return {
            id: client._id || 'unknown',
            type: 'client',
            name: `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.name || 'N/A',
            email: client.email || 'N/A',
            phone: client.phone || 'N/A',
            status: client.isActive === false ? 'inactive' : 'active',
            createdAt: client.createdAt || new Date().toISOString(),
            profileImage: client.profileImage?.url || null,
            details: {
                address: client.address || {},
                paymentMethod: client.paymentMethod || 'N/A'
            }
        };
    };

    const formatVehicleOwnerData = (owner) => {
        // Check if owner is valid
        if (!owner || typeof owner !== 'object') {
            console.warn('Invalid vehicle owner data:', owner);
            return {
                id: 'invalid-data',
                type: 'vehicleOwner',
                name: 'Invalid Data',
                email: 'N/A',
                phone: 'N/A',
                status: 'unknown',
                createdAt: new Date().toISOString(),
                details: {}
            };
        }

        return {
            id: owner._id || 'unknown',
            type: 'vehicleOwner',
            name: `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'N/A',
            email: owner.email || 'N/A',
            phone: owner.phone || 'N/A',
            status: owner.isActive === false ? 'inactive' : 'active',
            createdAt: owner.createdAt || new Date().toISOString(),
            profileImage: owner.profileImage?.url || null,
            details: {
                vehicles: owner.vehicles || [],
                address: owner.address || {},
                nic: owner.nic || 'N/A'
            }
        };
    };

    const formatBusinessOwnerData = (owner) => {
        // Check if owner is valid
        if (!owner || typeof owner !== 'object') {
            console.warn('Invalid business owner data:', owner);
            return {
                id: 'invalid-data',
                type: 'businessOwner',
                name: 'Invalid Data',
                ownerName: 'N/A',
                email: 'N/A',
                phone: 'N/A',
                status: 'unknown',
                createdAt: new Date().toISOString(),
                details: {}
            };
        }

        return {
            id: owner._id || 'unknown',
            type: 'businessOwner',
            name: owner.businessName || 'N/A',
            ownerName: owner.ownerName || `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'N/A',
            email: owner.email || 'N/A',
            phone: owner.contactNumber || owner.phone || 'N/A',
            status: owner.isActive === false ? 'inactive' : 'active',
            createdAt: owner.createdAt || new Date().toISOString(),
            profileImage: owner.profileImage?.url || null,
            details: {
                businessType: owner.businessType || 'N/A',
                businessAddress: owner.businessAddress || owner.address || {},
                businessLicense: owner.businessLicense || 'N/A',
                taxId: owner.taxId || 'N/A'
            }
        };
    };

    // Calculate statistics based on users array
    const calculateStats = (usersArray) => {
        const newStats = {
            total: usersArray.length,
            drivers: usersArray.filter(u => u.type === 'driver').length,
            clients: usersArray.filter(u => u.type === 'client').length,
            vehicleOwners: usersArray.filter(u => u.type === 'vehicleOwner').length,
            businessOwners: usersArray.filter(u => u.type === 'businessOwner').length,
            active: usersArray.filter(u => u.status === 'active' || u.status === 'approved').length,
            pending: usersArray.filter(u => u.status === 'pending').length,
            inactive: usersArray.filter(u => u.status === 'inactive' || u.status === 'rejected').length
        };

        setStats(newStats);
    };

    // Handle user actions - view only, no approve/reject/deactivate functions
    const handleUserAction = async (userId, action, userType) => {
        try {
            let response;

            // All action functions have been removed as per requirement
            // Admin has view-only functionality
            console.log(`Action ${action} is not available - admin has view-only permissions`);

            // Display notification to the user that these actions are not available
            toast.info(`Admin has view-only permissions. ${action.charAt(0).toUpperCase() + action.slice(1)} action is not available.`);

            return;

            /* Previous functionality removed:
               - approve driver
               - reject driver
               - deactivate user
               - activate user
            */

            if (response && response.success) {
                // Refresh the user list
                fetchUsers(userType);

                // Close the details modal if open
                if (showDetailsModal) {
                    setShowDetailsModal(false);
                }
            }

        } catch (err) {
            console.error(`Error performing action ${action}:`, err);
            setError(`Failed to ${action} user. Please try again.`);
        }
    };

    // View user details
    const viewUserDetails = (user) => {
        setSelectedUser(user);
        setShowDetailsModal(true);
    };

    // Render user status badge
    const renderStatusBadge = (status) => {
        let bgColor = '';
        let textColor = '';

        switch (status) {
            case 'approved':
            case 'active':
                bgColor = 'bg-green-100';
                textColor = 'text-green-800';
                break;
            case 'pending':
                bgColor = 'bg-yellow-100';
                textColor = 'text-yellow-800';
                break;
            case 'rejected':
            case 'inactive':
                bgColor = 'bg-red-100';
                textColor = 'text-red-800';
                break;
            default:
                bgColor = 'bg-gray-100';
                textColor = 'text-gray-800';
                break;
        }

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    // Render user type badge

    // Generate and download reports
    const generateCSVReport = () => {
        try {
            // Define CSV headers
            const headers = ['Name', 'Email', 'Phone', 'User Type', 'Status', 'Joined Date'];

            // Create CSV content
            let csvContent = headers.join(',') + '\n';

            // Add user data rows
            filteredUsers.forEach(user => {
                const rowData = [
                    `"${(user.name || '').replace(/"/g, '""')}"`,  // Handle quotes in names and null values
                    `"${(user.email || '').replace(/"/g, '""')}"`,
                    `"${(user.phone || '').replace(/"/g, '""')}"`,
                    `"${getUserTypeName(user.type)}"`,
                    `"${user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Unknown'}"`,
                    `"${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}"`
                ];

                csvContent += rowData.join(',') + '\n';
            });

            // Create a blob and download the file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            // Set filename with timestamp and user type
            const timestamp = new Date().toISOString().split('T')[0];
            const userTypeForFileName = userType === 'all' ? 'all-users' : userType;
            const fileName = `pick-and-go_${userTypeForFileName}_${timestamp}.csv`;

            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('CSV report generated successfully');
        } catch (error) {
            console.error('Error generating CSV report:', error);
            alert('Failed to generate CSV report. Please try again.');
        }
    };

    const generatePDFReport = () => {
        try {
            // Create PDF document
            const doc = new jsPDF();

            // Add title
            const userTypeTitle = {
                'all': 'All Users',
                'drivers': 'Drivers',
                'clients': 'Clients',
                'vehicleOwners': 'Vehicle Owners',
                'businessOwners': 'Business Owners'
            }[userType] || 'Users';

            const title = `Pick-and-Go ${userTypeTitle} Report`;

            // Add logo and title
            doc.setFontSize(18);
            doc.setTextColor(220, 38, 38); // Red color
            doc.text(title, 105, 15, { align: 'center' });

            // Add timestamp
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100); // Gray color
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });

            // Add statistics section
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text('User Statistics:', 14, 30);

            doc.setFontSize(10);
            let yPos = 35;

            doc.text(`Total Users: ${stats.total || 0}`, 20, yPos);
            yPos += 5;

            if (userType === 'all') {
                doc.text(`Drivers: ${stats.drivers || 0}`, 20, yPos);
                yPos += 5;
                doc.text(`Clients: ${stats.clients || 0}`, 20, yPos);
                yPos += 5;
                doc.text(`Vehicle Owners: ${stats.vehicleOwners || 0}`, 20, yPos);
                yPos += 5;
                doc.text(`Business Owners: ${stats.businessOwners || 0}`, 20, yPos);
                yPos += 5;
            }

            doc.text(`Active: ${stats.active || 0}`, 20, yPos);
            yPos += 5;
            doc.text(`Pending: ${stats.pending || 0}`, 20, yPos);
            yPos += 5;
            doc.text(`Inactive: ${stats.inactive || 0}`, 20, yPos);

            // Add user table
            const tableColumns = [
                { header: 'Name', dataKey: 'name' },
                { header: 'Email', dataKey: 'email' },
                { header: 'Phone', dataKey: 'phone' },
                userType === 'all' ? { header: 'Type', dataKey: 'type' } : null,
                { header: 'Status', dataKey: 'status' },
                { header: 'Joined', dataKey: 'joined' }
            ].filter(Boolean); // Remove null entries

            const tableData = filteredUsers.map(user => {
                const row = {
                    name: user.name || 'N/A',
                    email: user.email || 'N/A',
                    phone: user.phone || 'N/A',
                    status: user.status ? (user.status.charAt(0).toUpperCase() + user.status.slice(1)) : 'Unknown',
                    joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
                };

                if (userType === 'all') {
                    row.type = getUserTypeName(user.type);
                }

                return row;
            });

            // Generate the table
            autoTable(doc, {
                startY: yPos + 10,
                columns: tableColumns.map(col => ({
                    header: col.header,
                    dataKey: col.dataKey
                })),
                body: tableData,
                theme: 'striped',
                headStyles: {
                    fillColor: [220, 38, 38],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                margin: { top: 30 },
                didDrawPage: (data) => {
                    // Add page number at the bottom
                    const pageCount = doc.internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.text(
                        `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`,
                        data.settings.margin.left,
                        doc.internal.pageSize.height - 10
                    );
                }
            });

            // Set filename with timestamp and user type
            const timestamp = new Date().toISOString().split('T')[0];
            const userTypeForFileName = userType === 'all' ? 'all-users' : userType;
            const fileName = `pick-and-go_${userTypeForFileName}_${timestamp}.pdf`;

            // Save the PDF
            doc.save(fileName);
            console.log('PDF report generated successfully');
        } catch (error) {
            console.error('Error generating PDF report:', error);
            alert('Failed to generate PDF report. Please try again.');
        }
    };

    // Helper function to get user type name
    const getUserTypeName = (type) => {
        return {
            'driver': 'Driver',
            'client': 'Client',
            'vehicleOwner': 'Vehicle Owner',
            'businessOwner': 'Business Owner'
        }[type] || type;
    };

    const renderUserTypeBadge = (type) => {
        let bgColor = '';
        let icon = '';

        switch (type) {
            case 'driver':
                bgColor = 'bg-blue-100 text-blue-800';
                icon = '🚘';
                break;
            case 'client':
                bgColor = 'bg-purple-100 text-purple-800';
                icon = '👤';
                break;
            case 'vehicleOwner':
                bgColor = 'bg-orange-100 text-orange-800';
                icon = '🚗';
                break;
            case 'businessOwner':
                bgColor = 'bg-red-100 text-red-800';
                icon = '🏢';
                break;
            default:
                bgColor = 'bg-gray-100 text-gray-800';
                icon = '👥';
                break;
        }

        const typeName = {
            'driver': 'Driver',
            'client': 'Client',
            'vehicleOwner': 'Vehicle Owner',
            'businessOwner': 'Business Owner'
        }[type] || type;

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${bgColor}`}>
                <span>{icon}</span>
                <span>{typeName}</span>
            </span>
        );
    };

    // Modal for user details
    const UserDetailsModal = () => {
        if (!selectedUser) return null;

        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                <motion.div
                    className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                {selectedUser.profileImage ? (
                                    <img
                                        src={selectedUser.profileImage}
                                        alt={selectedUser.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xl">
                                        {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : '?'}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                                <div className="flex items-center space-x-2">
                                    {renderUserTypeBadge(selectedUser.type)}
                                    {renderStatusBadge(selectedUser.status)}
                                </div>
                            </div>
                        </div>
                        <button
                            className="text-gray-400 hover:text-gray-600"
                            onClick={() => setShowDetailsModal(false)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                                    <p><span className="font-medium">Phone:</span> {selectedUser.phone}</p>
                                    <p><span className="font-medium">Joined:</span> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                    {selectedUser.type === 'businessOwner' && (
                                        <p><span className="font-medium">Owner Name:</span> {selectedUser.ownerName}</p>
                                    )}
                                </div>
                            </div>

                            {/* Type Specific Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-3">Additional Details</h4>
                                <div className="space-y-2 text-sm">
                                    {selectedUser.type === 'driver' && (
                                        <>
                                            <p><span className="font-medium">License Number:</span> {selectedUser.details.licenseNumber}</p>
                                            <p><span className="font-medium">Experience:</span> {selectedUser.details.experience} years</p>
                                        </>
                                    )}

                                    {selectedUser.type === 'businessOwner' && (
                                        <>
                                            <p><span className="font-medium">Business Type:</span> {selectedUser.details.businessType}</p>
                                            <p><span className="font-medium">Tax ID:</span> {selectedUser.details.taxId}</p>
                                            <p><span className="font-medium">License:</span> {selectedUser.details.businessLicense}</p>
                                        </>
                                    )}

                                    {selectedUser.type === 'vehicleOwner' && (
                                        <>
                                            <p><span className="font-medium">NIC:</span> {selectedUser.details.nic}</p>
                                            <p><span className="font-medium">Vehicles:</span> {selectedUser.details.vehicles?.length || 0}</p>
                                        </>
                                    )}

                                    {selectedUser.type === 'client' && (
                                        <>
                                            <p><span className="font-medium">Payment Method:</span> {selectedUser.details.paymentMethod}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Documents Section for Driver */}
                        {selectedUser.type === 'driver' && selectedUser.details.documents && selectedUser.details.documents.length > 0 && (
                            <div className="mt-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Documents</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {selectedUser.details.documents.map((doc, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                                            <div className="aspect-w-16 aspect-h-9 mb-2">
                                                <img
                                                    src={doc.url}
                                                    alt={doc.type || `Document ${index + 1}`}
                                                    className="object-cover rounded-md w-full h-32"
                                                />
                                            </div>
                                            <p className="text-sm font-medium text-gray-700">
                                                {doc.type ? doc.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : `Document ${index + 1}`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Address Section if available */}
                        {(selectedUser.type === 'client' || selectedUser.type === 'vehicleOwner' || selectedUser.type === 'businessOwner') &&
                            selectedUser.details.address && Object.keys(selectedUser.details.address).length > 0 && (
                                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-3">Address</h4>
                                    <p className="text-sm">
                                        {[
                                            selectedUser.details.address.street,
                                            selectedUser.details.address.city,
                                            selectedUser.details.address.state,
                                            selectedUser.details.address.zipCode,
                                            selectedUser.details.address.country
                                        ].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            )}

                        {/* Actions removed - admin has view-only access */}
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
                            <p className="text-sm text-red-700">
                                {error}
                            </p>
                        </div>
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    onClick={() => setError(null)}
                                    className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header with Stats */}
            <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-gray-600">Manage all users across the platform</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 min-w-[120px]">
                        <p className="text-sm text-gray-500">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 min-w-[120px]">
                        <p className="text-sm text-gray-500">Active Users</p>
                        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 min-w-[120px]">
                        <p className="text-sm text-gray-500">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                </div>
            </div>

            {/* Filter and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="overflow-x-auto" style={{ maxHeight: '300px' }}>
                    <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setUserType('all')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${userType === 'all'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                All Users
                            </button>
                            <button
                                onClick={() => setUserType('drivers')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${userType === 'drivers'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Drivers
                            </button>
                            <button
                                onClick={() => setUserType('clients')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${userType === 'clients'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Clients
                            </button>
                            <button
                                onClick={() => setUserType('vehicleOwners')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${userType === 'vehicleOwners'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Vehicle Owners
                            </button>
                            <button
                                onClick={() => setUserType('businessOwners')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${userType === 'businessOwners'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Business Owners
                            </button>
                        </div>

                        <div className="relative flex-1 max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Report generation buttons */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={generateCSVReport}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                disabled={loading || filteredUsers.length === 0}
                                title="Export data to CSV file"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                CSV
                            </button>
                            <button
                                onClick={generatePDFReport}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                disabled={loading || filteredUsers.length === 0}
                                title="Export data to PDF file"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* User List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        <span className="ml-2 text-gray-600">Loading users...</span>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <p className="text-red-600 mb-2">{error}</p>
                            <button
                                onClick={() => fetchUsers(userType)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <p className="text-gray-600 mb-2">No users found</p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto" style={{ maxHeight: '70vh' }}>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    {userType === 'all' && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                                                    {user.profileImage ? (
                                                        <img
                                                            src={user.profileImage}
                                                            alt={user.name}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-red-600 font-bold">
                                                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    {user.type === 'businessOwner' && user.ownerName && (
                                                        <div className="text-xs text-gray-500">{user.ownerName}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        {userType === 'all' && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {renderUserTypeBadge(user.type)}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{user.email}</div>
                                            <div className="text-sm text-gray-500">{user.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {renderStatusBadge(user.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => viewUserDetails(user)}
                                                className="text-red-600 hover:text-red-900 mr-4"
                                            >
                                                View
                                            </button>

                                            {/* Action buttons removed - admin has view-only access */}
                                            <span className="text-sm text-gray-500 italic">
                                                View only
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {showDetailsModal && <UserDetailsModal />}
        </div>
    );
};

export default UserManagement;