# Deployment Guide

This guide will help you deploy the Truck Maintenance Portal to production.

## Overview

The application consists of:
- **Frontend**: React app (deployed to Netlify)
- **Backend**: Flask API (deployed to Render)
- **Database**: PostgreSQL (managed by Render)

## Prerequisites

1. GitHub account
2. Netlify account
3. Render account
4. Git repository with the project

## Backend Deployment (Render)

### 1. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub
- Connect your repository

### 2. Deploy Backend
- Create a new Web Service
- Select your GitHub repository
- Use the following settings:
  - **Name**: `truck-maintenance-backend`
  - **Environment**: Python
  - **Build Command**: `pip install -r requirements.txt && python init_db.py`
  - **Start Command**: `gunicorn app:app`
  - **Instance Type**: Free (or Starter for production)

### 3. Environment Variables
Set these environment variables in Render:
- `FLASK_ENV=production`
- `SECRET_KEY=your-secure-secret-key`
- `JWT_SECRET_KEY=your-jwt-secret-key`

## Frontend Deployment (Netlify)

### 1. Create Netlify Account
- Go to [netlify.com](https://netlify.com)
- Sign up with GitHub
- Import your repository

### 2. Deploy Frontend
- Import your project from GitHub
- Use the following settings:
  - **Build Command**: `npm run build`
  - **Publish Directory**: `build`
  - **Environment Variables**: Set `REACT_APP_API_URL` to your Render backend URL

### 3. Environment Variables
Set these environment variables in Netlify:
- `REACT_APP_API_URL=https://your-backend-url.onrender.com`

## Post-Deployment Configuration

### 1. Update CORS Settings
Update the backend CORS configuration to allow requests from your Netlify domain:
```python
# In app.py, update the CORS headers
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'https://your-frontend-url.netlify.app')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response
```

### 2. Database Initialization
The database will be automatically initialized during the first deployment.

### 3. Test the Deployment
- Visit your Netlify URL to access the frontend
- Test user registration and login
- Create a test maintenance report
- Verify the backend API is working

## URLs After Deployment
- **Frontend**: `https://your-project-name.netlify.app`
- **Backend**: `https://your-backend-name.onrender.com`
- **API Base**: `https://your-backend-name.onrender.com/api/v1`

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the frontend URL is allowed in backend CORS settings
2. **Database Connection**: Check DATABASE_URL environment variable
3. **Build Failures**: Verify all dependencies are listed in requirements.txt
4. **Static Files**: Ensure Flask is configured to serve static files

### Debug Commands

```bash
# Check backend logs on Render
# Go to Render dashboard → Logs

# Check frontend build logs on Netlify
# Go to Netlify dashboard → Deploy log
```

## Monitoring

- **Render**: Monitor backend performance and logs
- **Netlify**: Monitor frontend performance and build status
- **Database**: Monitor database connections and performance

## Updates

To update the application:
1. Push changes to your GitHub repository
2. Both Render and Netlify will auto-deploy from the main branch
3. Monitor the deployment status in both platforms
