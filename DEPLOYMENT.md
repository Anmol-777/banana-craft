# Vercel Deployment Guide for Om Banana Crafts

## Architecture Overview

This is a monorepo with:
- **Client** (`/client`) - React + Vite frontend (static site)
- **Server** (`/server`) - Express.js API with MongoDB (requires Node.js runtime)

## Deployment Strategy

**Vercel only hosts static sites and serverless functions.** The Express server uses:
- Long-running process
- MongoDB connection pooling
- File uploads (multer) to local disk
- WebSocket/bootstrap admin on startup

**These don't work on Vercel serverless functions without major refactoring.**

### Recommended: Hybrid Deployment

| Component | Platform | Why |
|-----------|----------|-----|
| **Client (React)** | **Vercel** | Optimized for static sites, global CDN, preview deployments |
| **Server (Express API)** | **Railway / Render / Fly.io** | Supports long-running Node.js, persistent storage, MongoDB |

---

## Option 1: Hybrid (Recommended) - Client on Vercel, Server on Railway

### 1. Deploy Server to Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select this repository
4. Set **Root Directory** to `server`
5. Add environment variables in Railway dashboard:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
   JWT_SECRET=your-32-char-min-secret-key-here
   NODE_ENV=production
   PORT=4000
   HOST=0.0.0.0
   CORS_ORIGINS=https://your-app.vercel.app
   PUBLIC_URL=https://your-api.railway.app
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=secure-password
   ADMIN_USERNAME=admin
   ADMIN_NAME=Site Admin
   ```
6. Deploy → Get your API URL (e.g., `https://om-banana-crafts-api.railway.app`)

### 2. Deploy Client to Vercel

1. Go to [vercel.com](https://vercel.com) → Add New Project → Import from GitHub
2. Select this repository
3. **Framework Preset**: Vite
3. **Root Directory**: `client`
4. **Build Command**: `npm run build` (auto-detected)
5. **Output Directory**: `dist` (auto-detected)
6. Add Environment Variable:
   ```
   VITE_API_URL = https://your-api.railway.app
   ```
7. Deploy

### 3. Update CORS on Server

After Vercel gives you a URL (e.g., `https://om-banana-crafts.vercel.app`):
1. Go to Railway → Variables → Update `CORS_ORIGINS`
2. Add your Vercel URL: `https://om-banana-crafts.vercel.app`
3. Redeploy server

---

## Option 2: Both on Vercel (Advanced - Requires Code Changes)

To run Express on Vercel, you need to:
1. Convert Express app to serverless functions
2. Use MongoDB connection pooling for serverless
3. Move file uploads to cloud storage (S3/Cloudinary)
4. Remove bootstrap admin on startup

### vercel.json for Monorepo (if you adapt server):

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "server/src/index.js": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/server/src/index.js" },
    { "source": "/uploads/(.*)", "destination": "/server/src/index.js" },
    { "source": "/(.*)", "destination": "/client/dist/$1" }
  ]
}
```

**Not recommended without significant refactoring.**

---

## Environment Variables Summary

### Server (Railway/Render/Fly.io)
| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | 32+ char random string |
| `NODE_ENV` | Yes | `production` |
| `PORT` | No | Default 4000 |
| `CORS_ORIGINS` | Yes | Comma-separated list including Vercel URL |
| `PUBLIC_URL` | Yes | Your server's public URL |
| `ADMIN_EMAIL` | Yes | Initial admin email |
| `ADMIN_PASSWORD` | Yes | Initial admin password |
| `ADMIN_USERNAME` | No | Admin username |
| `ADMIN_NAME` | No | Admin display name |

### Client (Vercel)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Full URL to your deployed API (e.g., `https://api.railway.app`) |

---

## Local Development

```bash
# Install all dependencies
npm install

# Start both client and server
npm run dev

# Or separately:
npm run dev:server  # Runs on http://localhost:4000
npm run dev:client  # Runs on http://localhost:5173 (proxies /api to server)
```

---

## Alternative Server Hosting Options

| Platform | Free Tier | Best For |
|----------|-----------|----------|
| **Railway** | $5 credit/mo | Simple, auto-deploys from GitHub |
| **Render** | Yes (spins down) | Web services, background workers |
| **Fly.io** | 3 shared-cpu VMs | Global deployment, more control |
| **Cyclic** | Yes | AWS-based, simple Node.js hosting |

---

## Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGINS` on server includes your exact Vercel URL (no trailing slash)
- Check browser network tab for failed requests

### API Calls Failing
- Verify `VITE_API_URL` is set in Vercel dashboard (Project → Settings → Environment Variables)
- Redeploy client after changing env vars

### Images Not Loading
- Server serves uploads at `/uploads/*` 
- Ensure `PUBLIC_URL` on server matches your API domain
- Client uses relative paths via `VITE_API_URL`

### Admin Login Not Working
- Check `JWT_SECRET` is set and same across redeploys
- Verify `ADMIN_EMAIL`/`ADMIN_PASSWORD` in server env
- Check browser console for 401 errors

---

## Quick Deploy Commands

```bash
# 1. Commit and push
git add .
git commit -m "Prepare for deployment"
git push origin main

# 2. Deploy server to Railway (via dashboard)
# 3. Deploy client to Vercel (via dashboard)
# 4. Update CORS_ORIGINS on Railway with Vercel URL
# 5. Done!
```