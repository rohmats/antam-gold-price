# Deployment Guide - ANTAM Gold Price Next.js App

## 🚀 Ready to Deploy!

Your Next.js app has been tested and is ready for production deployment.

---

## Option 1: Vercel (Recommended) ⭐

**Why Vercel?**
- Built specifically for Next.js
- Zero configuration needed
- Automatic deployments on git push
- Free SSL/HTTPS
- Global CDN
- Built-in analytics
- Edge functions support

### Steps:

1. **Push to GitHub** (if not already done)
   ```bash
   cd /workspaces/antam-gold-price
   git add .
   git commit -m "Add Next.js app"
   git push origin main
   ```

2. **Import to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Connect your GitHub repository
   - Select `antam-gold-price` repository

3. **Configure Project**
   - **Root Directory:** `nextjs-app`
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Deploy**
   - Click "Deploy"
   - Wait ~2 minutes
   - Your app will be live!

5. **Get Your URL**
   - Example: `https://your-project.vercel.app`
   - Custom domain available in settings

### Automatic Deployments
- Every push to `main` = automatic deployment
- Preview deployments for branches
- Rollback to any previous version

---

## Option 2: Netlify

### Steps:

1. **Push to GitHub** (see above)

2. **Import to Netlify**
   - Visit [app.netlify.com/start](https://app.netlify.com/start)
   - Connect GitHub
   - Select repository

3. **Configure Build**
   - **Base directory:** `nextjs-app`
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`

4. **Deploy**
   - Click "Deploy site"
   - Wait for build completion

---

## Option 3: Docker Container

### Create Dockerfile

In `nextjs-app/` directory:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

### Build & Run

```bash
# Build image
docker build -t antam-gold-nextjs .

# Run container
docker run -p 3000:3000 antam-gold-nextjs
```

---

## Option 4: Railway.app

### Steps:

1. Visit [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose repository
5. Configure:
   - **Root Directory:** `nextjs-app`
   - Auto-detected as Next.js
6. Deploy

**Features:**
- Free tier available
- PostgreSQL support
- Easy environment variables
- Custom domains

---

## Option 5: Self-Hosted (VPS)

### Requirements:
- Ubuntu/Debian server
- Node.js 18+
- nginx (optional, for reverse proxy)

### Setup:

```bash
# 1. Clone repository
git clone https://github.com/your-username/antam-gold-price.git
cd antam-gold-price/nextjs-app

# 2. Install dependencies
npm install

# 3. Build for production
npm run build

# 4. Start with PM2
npm install -g pm2
pm2 start npm --name "antam-gold" -- start

# 5. Make it persistent
pm2 startup
pm2 save
```

### Nginx Configuration (optional)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Environment Variables

### Optional Configuration

Create `.env.local` in `nextjs-app/`:

```env
# API Configuration (if needed)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Custom domain
NEXT_PUBLIC_DOMAIN=yourdomain.com
```

**Note:** Current app doesn't require any environment variables.

---

## Pre-Deployment Checklist

Before deploying, verify:

- [x] ✅ All tests passing (see TEST_REPORT.md)
- [x] ✅ Production build successful
- [x] ✅ No console errors
- [x] ✅ Data files accessible
- [x] ✅ API endpoints working
- [x] ✅ Pages loading correctly
- [ ] ⏳ Custom domain configured (optional)
- [ ] ⏳ Analytics added (optional)
- [ ] ⏳ Error monitoring setup (optional)

---

## Post-Deployment Tasks

### 1. Verify Deployment
```bash
# Test live site
curl https://your-domain.com/api/gold-prices
```

### 2. Monitor Performance
- Check Vercel Analytics (if using Vercel)
- Monitor error rates
- Check page load times

### 3. Set Up Monitoring (Optional)
- **Sentry:** Error tracking
- **Google Analytics:** User analytics
- **Vercel Analytics:** Built-in (if using Vercel)

### 4. Custom Domain (Optional)
- Purchase domain from registrar
- Add CNAME record pointing to Vercel/Netlify
- Configure in platform settings

---

## Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install & Build
        run: |
          cd nextjs-app
          npm install
          npm run build
```

---

## Performance Optimization

Already implemented:
- ✅ Static page generation
- ✅ Code splitting
- ✅ Image optimization (Next.js)
- ✅ CSS optimization (Tailwind)
- ✅ Gzip compression
- ✅ Caching headers

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Data Not Loading
- Verify `antam_buy.json` and `antam_sell.json` exist
- Check file paths in API route
- Review server logs

### Port Issues
```bash
# Use custom port
PORT=3001 npm start
```

---

## Cost Estimates

### Free Tier Options:
- **Vercel:** Free for personal/hobby projects
- **Netlify:** 100GB bandwidth/month free
- **Railway:** $5 free credit monthly
- **Self-hosted:** $5-10/month VPS

### Paid Plans:
- **Vercel Pro:** $20/month (team features)
- **Netlify Pro:** $19/month
- **Railway:** Pay-as-you-go after free credits

---

## Recommended: Vercel Deployment

**Quick Deploy:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd nextjs-app
vercel --prod
```

Follow prompts, and your app will be live in minutes!

---

## Support Resources

- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **Railway Docs:** https://docs.railway.app

---

## Summary

✅ **Your app is production-ready!**

**Fastest path to deployment:**
1. Push to GitHub
2. Import to Vercel
3. Set root directory to `nextjs-app`
4. Click Deploy
5. Live in 2 minutes!

**Next Steps:**
- Choose deployment platform
- Follow steps above
- Test live deployment
- Share your URL!

---

**Questions?** Check the documentation or deployment platform's support.

**Good luck with your deployment! 🚀**
