# Pick and Go - Heroku Deployment Guide (GUI Method)

This guide will help you deploy the Pick and Go application to Heroku using the **Heroku Dashboard (GUI)**.

## Prerequisites

1. Heroku account (sign up at heroku.com)
2. Git repository initialized and pushed to GitHub
3. MongoDB Atlas account (for database)
4. Cloudinary account (for image uploads)

## Project Structure

The project is now configured with:
- **Root package.json**: Contains scripts to manage both frontend and backend
- **Concurrently**: Runs both services simultaneously in development
- **Production setup**: Backend serves the built frontend files
- **Procfile**: Tells Heroku how to start your app (`web: npm start`)

## Available Scripts

### Development
```bash
npm run dev          # Start both frontend and backend concurrently
npm run server       # Start backend only
npm run client       # Start frontend only
```

### Production
```bash
npm start           # Start production server (backend only)
npm run build       # Build frontend for production
npm run install-all # Install dependencies for both frontend and backend
```

## Heroku Deployment Steps (GUI Method)

### 1. Create Heroku App
1. Go to [dashboard.heroku.com](https://dashboard.heroku.com)
2. Click **"New"** → **"Create new app"**
3. Enter your app name (e.g., `pick-and-go-app`)
4. Choose a region
5. Click **"Create app"**

### 2. Connect to GitHub
1. In your new app dashboard, go to the **"Deploy"** tab
2. Under **"Deployment method"**, select **"GitHub"**
3. Click **"Connect to GitHub"** and authorize if needed
4. Search for your repository name: `Pick-and-Go`
5. Click **"Connect"** next to your repository

### 3. Set Environment Variables
1. Go to the **"Settings"** tab
2. Click **"Reveal Config Vars"**
3. Add the following environment variables:

| KEY | VALUE |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `your_mongodb_atlas_connection_string` |
| `CLOUDINARY_CLOUD_NAME` | `your_cloudinary_cloud_name` |
| `CLOUDINARY_API_KEY` | `your_cloudinary_api_key` |
| `CLOUDINARY_API_SECRET` | `your_cloudinary_api_secret` |

### 4. Configure Buildpack (Usually Auto-detected)
1. Still in **"Settings"** tab, scroll to **"Buildpacks"**
2. Heroku should automatically detect **Node.js**
3. If not, click **"Add buildpack"** and select **"nodejs"**

### 5. Deploy Your App
1. Go back to the **"Deploy"** tab
2. Scroll to **"Manual deploy"** section
3. Select the branch you want to deploy (usually `main` or `Deployment`)
4. Click **"Deploy Branch"**
5. Wait for the build to complete

### 6. Enable Automatic Deploys (Optional)
1. In the **"Deploy"** tab, find **"Automatic deploys"**
2. Select your branch
3. Click **"Enable Automatic Deploys"**
4. Now every push to that branch will auto-deploy

## Why the Procfile?

The **Procfile** is a Heroku-specific file that tells Heroku:
- **What type of process to run**: `web` (for web applications)
- **What command to execute**: `npm start`

Without it, Heroku won't know how to start your application. The `web: npm start` tells Heroku to run your production server when someone visits your app.

## How It Works

### Development Mode
- `npm run dev` uses concurrently to start:
  - Backend on http://localhost:9000
  - Frontend on http://localhost:5173

### Production Mode (Heroku)
- Heroku runs `npm start` (from Procfile)
- This starts only the backend server
- Backend serves the built frontend files from `/frontend/dist`
- All frontend routes are handled by React Router
- API routes are prefixed with `/api/`

## Important Files

- **Procfile**: Tells Heroku how to start the app
- **package.json**: Root configuration with all scripts
- **backend/server.js**: Modified to serve static files in production
- **.env.example**: Template for environment variables

## Troubleshooting

### Common Build Issues

1. **Vite Build Dependencies Error**: 
   - **Problem**: `Cannot find package '@vitejs/plugin-react'`
   - **Solution**: Move `@vitejs/plugin-react` and `vite` from `devDependencies` to `dependencies` in frontend/package.json

2. **Node Version Issues**:
   - **Problem**: "Vite requires Node.js version 20.19+ or 22.12+"
   - **Solution**: Update `engines.node` to `"20.x"` in root package.json
   - **Problem**: "Dangerous semver range (>) in engines.node"
   - **Solution**: Use specific versions like `"node": "20.x"` instead of `">=14.0.0"`

3. **Import Resolution Error**:
   - **Problem**: `Could not resolve "../../Services/Auth-service"`
   - **Solution**: Add `.js` extension to service imports: `'../../Services/Auth-service.js'`

### Other Issues

3. **Build Fails**: Check that all dependencies are listed in package.json
4. **App Crashes**: Check Heroku logs with `heroku logs --tail`
5. **Database Connection**: Ensure MONGODB_URI is correctly set
6. **File Uploads**: Verify Cloudinary credentials are set

## Local Testing of Production Build

To test the production setup locally:
```bash
# Build the frontend
npm run build

# Set NODE_ENV to production
$env:NODE_ENV="production"  # PowerShell
# or
set NODE_ENV=production     # Command Prompt

# Start the production server
npm start
```

Then visit http://localhost:9000 to see the app running as it would on Heroku.
