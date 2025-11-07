# EVENTFLEX Vercel Deployment Guide

## Prerequisites
1. Vercel account
2. MongoDB Atlas database
3. GitHub repository

## Deployment Steps

### 1. Environment Variables
Set these in Vercel dashboard (Settings → Environment Variables):

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/eventflex
JWT_SECRET=your_secure_jwt_secret_key
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 3. Configure Domain
- Go to Vercel dashboard
- Add custom domain or use provided .vercel.app URL
- Update CORS origins in api/index.js if needed

## Project Structure
```
/
├── api/index.js          # Serverless API functions
├── src/                  # React frontend source
├── dist/                 # Built frontend (auto-generated)
├── vercel.json          # Vercel configuration
└── package.json         # Build configuration
```

## Troubleshooting

### Build Errors
- Ensure all dependencies are in package.json
- Check Node.js version compatibility
- Verify environment variables are set

### API Errors
- Check MongoDB connection string
- Verify JWT secret is set
- Check function logs in Vercel dashboard

### CORS Issues
- Update allowed origins in api/index.js
- Ensure credentials: true is set