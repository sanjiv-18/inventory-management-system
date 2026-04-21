# GitHub Deployment Guide

## Overview
This guide will help you deploy your Inventory Management System to various platforms.

## Prerequisites
- GitHub account
- Node.js 18+ installed locally
- Git installed

## Option 1: GitHub Pages (Frontend Only)

### Step 1: Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `inventory-management-system`
3. Set it to Public (required for GitHub Pages)
4. Don't initialize with README (we already have one)

### Step 2: Push to GitHub
```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/inventory-management-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click Settings > Pages
3. Source: Deploy from a branch
4. Branch: main / (root)
5. Click Save

### Step 4: Automatic Deployment
- GitHub Actions will automatically build and deploy your site
- Your site will be available at: `https://YOUR_USERNAME.github.io/inventory-management-system`

## Option 2: Vercel (Full Stack)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Deploy to Vercel
```bash
# Deploy from project root
vercel

# Follow the prompts to link your project
# Deploy to production
npm run deploy:vercel
```

### Step 3: Configure Environment
- Add any environment variables in Vercel dashboard
- Your site will be available at a `.vercel.app` domain

## Option 3: Netlify (Full Stack)

### Step 1: Install Netlify CLI
```bash
npm i -g netlify-cli
```

### Step 2: Deploy to Netlify
```bash
# Login to Netlify
netlify login

# Deploy
npm run deploy:netlify
```

### Step 3: Configure
- Set up continuous deployment from GitHub
- Configure environment variables
- Your site will be available at a `.netlify.app` domain

## Option 4: Railway (Full Stack)

### Step 1: Install Railway CLI
```bash
npm i -g @railway/cli
```

### Step 2: Deploy to Railway
```bash
# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Environment Variables

For production deployment, you may need:

```env
NODE_ENV=production
REACT_APP_API_URL=your-api-url
PORT=3001
```

## Build Process

The build process automatically:
1. Installs dependencies
2. Builds the React app
3. Deploys to your chosen platform

## Troubleshooting

### GitHub Pages Issues
- Ensure repository is public
- Check GitHub Actions logs
- Verify build completes successfully

### Vercel/Netlify Issues
- Check environment variables
- Verify build logs
- Ensure proper routing configuration

### General Issues
- Clear cache and rebuild
- Check Node.js version compatibility
- Verify all dependencies are installed

## Production Considerations

1. **API Endpoints**: Configure proper API URLs for production
2. **Database**: Set up production database if needed
3. **Security**: Add authentication and authorization
4. **Performance**: Optimize bundle size and loading
5. **Monitoring**: Add error tracking and analytics

## Next Steps

1. Choose your deployment platform
2. Follow the specific instructions
3. Test your deployed application
4. Set up custom domain (optional)
5. Configure monitoring and analytics
