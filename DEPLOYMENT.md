# EVENTFLEX - Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
1. **GitHub Account** - Push your code to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **MongoDB Atlas** - Set up cloud database
4. **Cloudinary Account** - For file uploads

---

## 📋 Step-by-Step Deployment

### 1. **Prepare Environment Variables**

In Vercel dashboard, add these environment variables:

```env
# Backend Variables
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/eventflex
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend Variables
VITE_API_URL=https://your-app.vercel.app/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=ml_default
```

### 2. **MongoDB Atlas Setup**

1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create new cluster
3. Add database user
4. Whitelist IP addresses (0.0.0.0/0 for Vercel)
5. Get connection string

### 3. **Cloudinary Setup**

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get credentials from dashboard
3. Create upload preset:
   - Name: `ml_default`
   - Signing mode: `Unsigned`
   - Folder: `eventflex`

### 4. **Deploy to Vercel**

#### Option A: Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

#### Option B: GitHub Integration
1. Connect GitHub repo to Vercel
2. Import project
3. Add environment variables
4. Deploy

---

## 🔧 Build Configuration

The project includes:
- ✅ `vercel.json` - Deployment configuration
- ✅ Root `package.json` - Build scripts
- ✅ Environment variables template
- ✅ Optimized for full-stack deployment

---

## 🌐 Production URLs

After deployment:
- **Frontend**: `https://your-app.vercel.app`
- **API**: `https://your-app.vercel.app/api`
- **Socket.IO**: Auto-configured

---

## 🔍 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check environment variables
   - Verify MongoDB connection string
   - Ensure all dependencies installed

2. **Socket.IO Not Working**
   - Vercel supports WebSockets
   - Check CORS configuration
   - Verify API URL in frontend

3. **File Uploads Fail**
   - Verify Cloudinary credentials
   - Check upload preset configuration
   - Ensure folder permissions

---

## 📊 Performance Optimization

- ✅ Static file caching
- ✅ API route optimization
- ✅ Database connection pooling
- ✅ Image optimization via Cloudinary
- ✅ Gzip compression enabled

---

## 🔒 Security Checklist

- ✅ Environment variables secured
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ Input validation implemented
- ✅ JWT tokens secured

---

## 📈 Monitoring

Monitor your deployment:
- Vercel Analytics
- MongoDB Atlas monitoring
- Cloudinary usage stats
- Error tracking via Vercel logs

---

## 🚀 Go Live!

Your EVENTFLEX platform is now ready for production use with:
- Real-time notifications
- File uploads
- Database persistence
- Scalable architecture
- Professional deployment