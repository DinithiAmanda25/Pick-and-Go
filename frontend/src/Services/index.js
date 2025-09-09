// Service Exports - Clean Actor-based Architecture
// This file provides organized imports for all authentication and actor services

// Universal Authentication Service
export { default as AuthService } from './Auth-service';

// Actor-specific Services
export { default as AdminService } from './Admin-service';
export { default as BusinessOwnerService } from './BusinessOwner-service';
export { default as DriverService } from './Driver-service';
export { default as CustomerService } from './customer-service'; // Client service
export { default as VehicleOwnerService } from './VehicleOwner-service';

// Other Services
export { default as VehicleService } from './Vehicle-service';
export { default as BusinessAgreementService } from './BusinessAgreement-service';
export { default as UploadService } from './upload-service';

// HTTP Common Service
export { HTTP } from './httpCommon-service';

// Service Usage Examples:
//
// Universal Authentication:
// import { AuthService } from './Services';
// const loginResult = await AuthService.login({ identifier: 'email', password: 'pass' });
//
// Actor-specific operations:
// import { AdminService, VehicleOwnerService } from './Services';
// const drivers = await AdminService.getAllDrivers();
// const profile = await VehicleOwnerService.getProfile(userId);
