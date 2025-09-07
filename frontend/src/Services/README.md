# Services Architecture Reorganization

## Overview
The authentication services have been reorganized from a monolithic structure to a clean, actor-based architecture. Each actor now has their own dedicated service file.

## File Structure

### Universal Authentication Service
- **auth-service.js** - Handles universal authentication functions (login, logout, session management)
  - `login(credentials)` - Universal login for all actors
  - `logout()` - Clear all authentication data
  - `getCurrentUser()` - Get current user data
  - `getCurrentUserId()` - Get current user ID
  - `isAuthenticated()` - Check authentication status
  - `getUserRole()` - Get current user role
  - `updateStoredUser(data)` - Update localStorage user data

### Actor-Specific Services

#### Admin-service.js
- `getProfile(userId)` - Get admin profile
- `updateProfile(userId, data)` - Update admin profile
- `changePassword(userId, data)` - Change admin password
- `approveDriver(driverId, status)` - Approve/reject drivers
- `getPendingDrivers()` - Get drivers pending approval
- `getAllDrivers()` - Get all drivers
- `getAllClients()` - Get all clients
- `getAllVehicleOwners()` - Get all vehicle owners
- `getAllBusinessOwners()` - Get all business owners

#### BusinessOwner-service.js
- `registerBusinessOwner(data)` - Register new business owner
- `getProfile(userId)` - Get business owner profile
- `updateProfile(userId, data)` - Update business owner profile
- `uploadProfileImage(userId, formData)` - Upload profile image
- `changePassword(userId, data)` - Change password
- `deleteProfile(userId)` - Delete profile

#### Driver-service.js
- `registerDriver(formData)` - Register driver with file uploads
- `getProfile(userId)` - Get driver profile
- `updateProfile(userId, data)` - Update driver profile
- `changePassword(userId, data)` - Change password
- `uploadDocument(userId, type, formData)` - Upload documents
- `getDriverStatus(userId)` - Get approval status

#### customer-service.js (Client Service)
- `registerCustomer(data)` - Register new client
- `login(formData)` - Client login
- `getProfile(userId)` - Get client profile
- `updateProfile(userId, data)` - Update client profile
- `uploadProfileImage(userId, formData)` - Upload profile image
- `changePassword(userId, data)` - Change password
- `deleteProfile(userId)` - Delete profile

#### VehicleOwner-service.js
- `getProfile(userId)` - Get vehicle owner profile
- `updateProfile(userId, data)` - Update vehicle owner profile
- `uploadProfileImage(userId, formData)` - Upload profile image
- `changePassword(userId, data)` - Change password
- `uploadDocument(userId, type, formData)` - Upload documents
- `deleteProfile(userId)` - Delete profile

### Utility Services
- **httpCommon-service.js** - Axios HTTP client configuration
- **upload-service.js** - File upload utilities
- **Vehicle-service.js** - Vehicle management
- **index.js** - Service exports for organized imports

## Usage Examples

### Universal Authentication
```javascript
import AuthService from './Services/authentication';

// Login (works for all actors)
const result = await AuthService.login({
  identifier: 'user@example.com',
  password: 'password123'
});

// Check authentication
if (AuthService.isAuthenticated()) {
  const role = AuthService.getUserRole();
  const dashboardRoute = AuthService.getDashboardRoute();
}
```

### Actor-Specific Operations
```javascript
import AdminService from './Services/Admin-service';
import VehicleOwnerService from './Services/VehicleOwner-service';

// Admin operations
const pendingDrivers = await AdminService.getPendingDrivers();
await AdminService.approveDriver(driverId, 'approved');

// Vehicle Owner operations
const profile = await VehicleOwnerService.getProfile(userId);
await VehicleOwnerService.updateProfile(userId, updatedData);
```

### Organized Imports (using index.js)
```javascript
import { 
  AuthService, 
  AdminService, 
  VehicleOwnerService,
  CustomerService 
} from './Services';
```

## Benefits

1. **Separation of Concerns** - Each actor has dedicated service functions
2. **Maintainability** - Easier to find and modify actor-specific code
3. **Scalability** - Easy to add new actor types or functions
4. **Code Organization** - Clear structure and logical grouping
5. **Reduced Complexity** - No more mixed actor functions in single files
6. **Type Safety** - Better IDE support and error detection

## Migration Notes

- All existing functionality has been preserved
- API endpoints remain unchanged
- localStorage management is consistent across all services
- Error handling follows the same patterns
- The universal AuthService handles session management for all actors

## Files Removed/Cleaned

- Old monolithic auth service (replaced with clean universal version)
- **Removed duplicate auth service files:**
  - `Auth-service.js` (capital A - removed)
  - `auth-service-clean.js` (temporary file - removed)
- **Kept:** `auth-service.js` (lowercase - the main file)
- Duplicate `VehicleOwner-service-new.js`
- Fixed typo: `BusinessOwsner-service.js` → `BusinessOwner-service.js`

## Current Service Files

✅ **authentication.js** - Universal authentication (login, logout, session management)
✅ **Admin-service.js** - Admin-specific functions
✅ **BusinessOwner-service.js** - Business owner functions  
✅ **Driver-service.js** - Driver-specific functions
✅ **customer-service.js** - Client/customer functions
✅ **VehicleOwner-service.js** - Vehicle owner functions
✅ **index.js** - Clean organized exports
