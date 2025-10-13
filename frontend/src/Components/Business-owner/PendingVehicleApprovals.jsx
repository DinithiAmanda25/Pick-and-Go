import React, { useState } from 'react';

const PendingVehicleApprovals = ({ pendingApplications }) => {
    const [activeTab, setActiveTab] = useState('drivers');
    const [selectedItems, setSelectedItems] = useState({});

    const handleSelectAll = (type) => {
        const newSelected = { ...selectedItems };
        const items = pendingApplications[type] || [];

        if (items.every(item => selectedItems[`${type}_${item.id}`])) {
            items.forEach(item => {
                delete newSelected[`${type}_${item.id}`];
            });
        } else {
            items.forEach(item => {
                newSelected[`${type}_${item.id}`] = true;
            });
        }

        setSelectedItems(newSelected);
    };

    const handleItemSelect = (type, id) => {
        const key = `${type}_${id}`;
        setSelectedItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleApprove = (type) => {
        const selectedKeys = Object.keys(selectedItems).filter(
            key => key.startsWith(`${type}_`) && selectedItems[key]
        );

        if (selectedKeys.length === 0) {
            alert(`Please select ${type} to approve`);
            return;
        }

        console.log(`Approving ${selectedKeys.length} ${type}`);
        alert(`${selectedKeys.length} ${type} approved successfully!`);

        const newSelected = { ...selectedItems };
        selectedKeys.forEach(key => delete newSelected[key]);
        setSelectedItems(newSelected);
    };

    const handleReject = (type) => {
        const selectedKeys = Object.keys(selectedItems).filter(
            key => key.startsWith(`${type}_`) && selectedItems[key]
        );

        if (selectedKeys.length === 0) {
            alert(`Please select ${type} to reject`);
            return;
        }

        console.log(`Rejecting ${selectedKeys.length} ${type}`);
        alert(`${selectedKeys.length} ${type} rejected successfully!`);

        const newSelected = { ...selectedItems };
        selectedKeys.forEach(key => delete newSelected[key]);
        setSelectedItems(newSelected);
    };

    const renderDrivers = () => {
        const drivers = pendingApplications.drivers || [];

        if (drivers.length === 0) {
            return (
                <div className="empty-state">
                    <p>No pending driver applications</p>
                </div>
            );
        }

        return (
            <div className="applications-table">
                <div className="table-header">
                    <div className="select-all">
                        <input
                            type="checkbox"
                            onChange={() => handleSelectAll('drivers')}
                            checked={drivers.every(driver => selectedItems[`drivers_${driver.id}`])}
                        />
                        <span>Select All</span>
                    </div>
                    <div className="action-buttons">
                        <button
                            className="approve-btn"
                            onClick={() => handleApprove('drivers')}
                        >
                            Approve Selected
                        </button>
                        <button
                            className="reject-btn"
                            onClick={() => handleReject('drivers')}
                        >
                            Reject Selected
                        </button>
                    </div>
                </div>

                <div className="applications-list">
                    {drivers.map((driver) => (
                        <div key={driver.id} className="application-card">
                            <div className="application-header">
                                <input
                                    type="checkbox"
                                    checked={selectedItems[`drivers_${driver.id}`] || false}
                                    onChange={() => handleItemSelect('drivers', driver.id)}
                                />
                                <div className="applicant-info">
                                    <h4>{driver.name}</h4>
                                    <p className="email">{driver.email}</p>
                                </div>
                                <div className="status-badge pending">Pending</div>
                            </div>

                            <div className="application-details">
                                <div className="detail-item">
                                    <span className="label">Phone:</span>
                                    <span className="value">{driver.phone}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">License Number:</span>
                                    <span className="value">{driver.licenseNumber}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Experience:</span>
                                    <span className="value">{driver.experience} years</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Applied Date:</span>
                                    <span className="value">{driver.appliedDate}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderVehicles = () => {
        const vehicles = pendingApplications.vehicles || [];

        if (vehicles.length === 0) {
            return (
                <div className="empty-state">
                    <p>No pending vehicle applications</p>
                </div>
            );
        }

        return (
            <div className="applications-table">
                <div className="table-header">
                    <div className="select-all">
                        <input
                            type="checkbox"
                            onChange={() => handleSelectAll('vehicles')}
                            checked={vehicles.every(vehicle => selectedItems[`vehicles_${vehicle.id}`])}
                        />
                        <span>Select All</span>
                    </div>
                    <div className="action-buttons">
                        <button
                            className="approve-btn"
                            onClick={() => handleApprove('vehicles')}
                        >
                            Approve Selected
                        </button>
                        <button
                            className="reject-btn"
                            onClick={() => handleReject('vehicles')}
                        >
                            Reject Selected
                        </button>
                    </div>
                </div>

                <div className="applications-list">
                    {vehicles.map((vehicle) => (
                        <div key={vehicle.id} className="application-card">
                            <div className="application-header">
                                <input
                                    type="checkbox"
                                    checked={selectedItems[`vehicles_${vehicle.id}`] || false}
                                    onChange={() => handleItemSelect('vehicles', vehicle.id)}
                                />
                                <div className="applicant-info">
                                    <h4>{vehicle.make} {vehicle.model}</h4>
                                    <p className="owner">Owner: {vehicle.ownerName}</p>
                                </div>
                                <div className="status-badge pending">Pending</div>
                            </div>

                            <div className="application-details">
                                <div className="detail-item">
                                    <span className="label">License Plate:</span>
                                    <span className="value">{vehicle.licensePlate}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Year:</span>
                                    <span className="value">{vehicle.year}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Color:</span>
                                    <span className="value">{vehicle.color}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Applied Date:</span>
                                    <span className="value">{vehicle.appliedDate}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const totalCount = (pendingApplications.drivers?.length || 0) + (pendingApplications.vehicles?.length || 0);

    return (
        <div className="pending-approvals">
            <div className="page-header">
                <h2>Pending Applications</h2>
                <div className="summary">
                    <span className="count">{totalCount} applications pending review</span>
                </div>
            </div>

            <div className="tab-navigation">
                <button
                    className={`tab-btn ${activeTab === 'drivers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('drivers')}
                >
                    Drivers ({pendingApplications.drivers?.length || 0})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'vehicles' ? 'active' : ''}`}
                    onClick={() => setActiveTab('vehicles')}
                >
                    Vehicles ({pendingApplications.vehicles?.length || 0})
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'drivers' && renderDrivers()}
                {activeTab === 'vehicles' && renderVehicles()}
            </div>
        </div>
    );
};

export default PendingVehicleApprovals;