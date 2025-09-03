# Cloudinary Upload Integration

## Setup Instructions

1. **Get Cloudinary Credentials:**
   - Sign up at [cloudinary.com](https://cloudinary.com)
   - Go to Dashboard to get your credentials
   - Update the `.env` file with your actual values:

```env
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

## API Endpoints

### 1. Upload Single File

- **URL:** `POST /api/upload/single`
- **Body:** `multipart/form-data`
  - `file`: The file to upload
  - `folder`: (optional) Cloudinary folder name
  - `category`: (optional) Category for organizing files

**Example using curl:**

```bash
curl -X POST http://localhost:9000/api/upload/single \
  -F "file=@path/to/your/file.jpg" \
  -F "category=profile" \
  -F "folder=pick-and-go"
```

### 2. Upload Multiple Files

- **URL:** `POST /api/upload/multiple`
- **Body:** `multipart/form-data`
  - `files`: Array of files to upload (max 10)
  - `folder`: (optional) Cloudinary folder name
  - `category`: (optional) Category for organizing files

### 3. Upload Profile Image

- **URL:** `POST /api/upload/profile`
- **Body:** `multipart/form-data`
  - `profileImage`: Image file
  - `userId`: User ID
  - `userType`: Type of user (client, driver, vehicle_owner, etc.)

### 4. Upload Document

- **URL:** `POST /api/upload/document`
- **Body:** `multipart/form-data`
  - `document`: Document file (image or PDF)
  - `userId`: User ID
  - `userType`: Type of user
  - `documentType`: Type of document (license, registration, insurance, etc.)

### 5. Delete File

- **URL:** `DELETE /api/upload/:publicId`
- **Params:** `publicId` - Cloudinary public ID of the file to delete

## File Organization

Files are organized in Cloudinary as follows:

```
pick-and-go/
├── profiles/
│   ├── profile_client_userId_timestamp
│   ├── profile_driver_userId_timestamp
│   └── profile_vehicle_owner_userId_timestamp
├── documents/
│   ├── client/
│   ├── driver/
│   └── vehicle_owner/
└── general/
    ├── category_timestamp_filename
    └── ...
```

## Response Format

### Success Response:

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "pick-and-go/profiles/profile_client_123_1693824000000",
    "format": "jpg",
    "size": 204800,
    "width": 800,
    "height": 600,
    "originalName": "profile.jpg",
    "uploadedAt": "2024-09-03T12:00:00.000Z"
  }
}
```

### Error Response:

```json
{
  "success": false,
  "message": "File upload failed",
  "error": "Error details..."
}
```

## File Restrictions

- **Allowed Types:** Images (jpg, png, gif, webp) and PDFs
- **Max File Size:** 10MB per file
- **Max Files:** 10 files per multiple upload request

## Frontend Integration Examples

### React with Axios:

```javascript
const uploadProfileImage = async (file, userId, userType) => {
  const formData = new FormData();
  formData.append("profileImage", file);
  formData.append("userId", userId);
  formData.append("userType", userType);

  try {
    const response = await axios.post("/api/upload/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};
```

### React File Input Component:

```jsx
const FileUpload = ({ onUpload }) => {
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const result = await uploadProfileImage(file, userId, userType);
        onUpload(result.file);
      } catch (error) {
        console.error("Upload error:", error);
      }
    }
  };

  return <input type="file" accept="image/*" onChange={handleFileChange} />;
};
```
