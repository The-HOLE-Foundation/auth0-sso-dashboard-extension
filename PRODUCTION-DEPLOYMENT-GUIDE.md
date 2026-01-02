# SSO Dashboard - Production Deployment & Integration Guide

## Understanding the SSO Dashboard

### What This Dashboard Does

The SSO Dashboard is an **administrative tool** for managing Auth0 applications. It allows you to:

✅ **View all Auth0 applications** in your tenant
✅ **Create new applications** (SPAs, M2M clients, etc.)
✅ **Update application settings** (callbacks, origins, etc.)
✅ **Delete applications**
✅ **Manage connections** (social, database, enterprise)

### What This Dashboard Is NOT

❌ **Not a login portal** - Users don't login through this
❌ **Not a user-facing SSO gateway** - It's for admins only
❌ **Not required for SSO** - Your apps already have Auth0 SSO!

---

## Your Current SSO Setup (Already Working!)

According to your `CLAUDE.md`, you already have Auth0 SSO configured for:

1. **theholetruth.org** - Tools site with Auth0 authentication
2. **theholefoundation.org** - Corporate site with Auth0 authentication

**These apps ALREADY have SSO!** When a user logs into one, they're automatically logged into the other (same Auth0 tenant).

### How Your Existing SSO Works

```
User logs into theholetruth.org
    ↓
Auth0 Universal Login
    ↓
User authenticated (session created)
    ↓
User visits theholefoundation.org
    ↓
Auth0 sees existing session
    ↓
User automatically logged in (no password needed!)
```

**This is SSO** - Single Sign-On across your applications. ✅ You already have it!

---

## Deploy SSO Dashboard to Production

### Recommended: Cloudflare Workers

Since you're already using Cloudflare Workers for your apps, deploy the SSO Dashboard there.

### Deployment Steps

#### 1. Install Wrangler (if not already installed)

```bash
npm install -g wrangler
```

#### 2. Create Cloudflare Worker Configuration

```bash
cd /Volumes/HOLE-RAID-DRIVE/Projects/auth0-sso-dashboard-extension
```

Create `wrangler.toml`:

```toml
name = "hole-sso-dashboard"
main = "index.js"
compatibility_date = "2024-12-01"
node_compat = true

[observability]
enabled = true

# Environment variables
[vars]
AUTH0_RTA = "dev-4fszoklachwdh46m.us.auth0.com"
AUTH0_DOMAIN = "dev-4fszoklachwdh46m.us.auth0.com"
TITLE = "HOLE Foundation SSO Dashboard"
BASE_URL = "https://sso.theholetruth.org"
PUBLIC_WT_URL = "https://sso.theholetruth.org"

# Secrets (use wrangler secret put)
# AUTH0_CLIENT_ID
# AUTH0_CLIENT_SECRET
# EXTENSION_CLIENT_ID
# EXTENSION_SECRET

# Static assets
[[rules]]
type = "Text"
globs = ["**/*.css", "**/*.js", "**/*.json"]
fallthrough = true

# Custom domain (optional)
[[routes]]
pattern = "sso.theholetruth.org/*"
zone_name = "theholetruth.org"
```

#### 3. Set Cloudflare Secrets

```bash
# Set the secrets (one-time setup)
echo "MhZwdzqjYLF1EE1TiBZ50wnxR17cyq2M" | wrangler secret put AUTH0_CLIENT_ID
echo "DXCPx-T-YNPd7cxUn4F_zthZfjaAmzbHlYJ5fuOnsKQ3lI-HiX1Ov9sHTy-cKbND" | wrangler secret put AUTH0_CLIENT_SECRET
echo "SFV4AVu8vOl4YbXxkv6Ld4pZaYQXUcD0" | wrangler secret put EXTENSION_CLIENT_ID
echo "586a4b25d32488bf211472767fbbbdc5133ebccf928dc90c91610e10d4b55484" | wrangler secret put EXTENSION_SECRET
```

#### 4. Update Auth0 Callback URLs

```bash
# Update the SPA client with production URLs
auth0 apps update SFV4AVu8vOl4YbXxkv6Ld4pZaYQXUcD0 \
  --callbacks "http://localhost:3001/admins/login/callback,https://sso.theholetruth.org/admins/login/callback,https://sso.theholefoundation.org/admins/login/callback" \
  --web-origins "http://localhost:3001,https://sso.theholetruth.org,https://sso.theholefoundation.org" \
  --logout-urls "http://localhost:3001,https://sso.theholetruth.org,https://sso.theholefoundation.org"
```

#### 5. Build for Production

```bash
npm run build
```

#### 6. Deploy to Cloudflare Workers

```bash
wrangler deploy
```

#### 7. Set Up Custom Domain (Optional)

In Cloudflare Dashboard:
1. Go to Workers & Pages
2. Select your worker
3. Add custom domain: `sso.theholetruth.org`

---

## Alternative: Cloudflare Pages

If you prefer Pages (for static hosting + Workers):

```bash
# Install adapter
npm install -D @cloudflare/pages-plugin-static-assets

# Deploy
npm run build
wrangler pages deploy dist --project-name hole-sso-dashboard
```

---

## Alternative: Traditional Hosting

### Option 1: Docker + Cloud Run / AWS ECS

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and deploy:
```bash
docker build -t hole-sso-dashboard .
docker run -p 3000:3000 \
  -e AUTH0_DOMAIN=dev-4fszoklachwdh46m.us.auth0.com \
  -e AUTH0_CLIENT_ID=MhZwdzqjYLF1EE1TiBZ50wnxR17cyq2M \
  # ... other env vars
  hole-sso-dashboard
```

### Option 2: Heroku

```bash
git init
heroku create hole-sso-dashboard
heroku config:set AUTH0_DOMAIN=dev-4fszoklachwdh46m.us.auth0.com
heroku config:set AUTH0_CLIENT_ID=MhZwdzqjYLF1EE1TiBZ50wnxR17cyq2M
# ... set other config
git push heroku main
```

### Option 3: DigitalOcean App Platform

```yaml
# .do/app.yaml
name: hole-sso-dashboard
services:
  - name: web
    github:
      repo: your-org/sso-dashboard
      branch: main
    build_command: npm run build
    run_command: npm start
    envs:
      - key: AUTH0_DOMAIN
        value: dev-4fszoklachwdh46m.us.auth0.com
      # ... other env vars
```

---

## Production URLs

### Recommended Structure

```
https://sso.theholetruth.org          - Main dashboard
https://sso.theholetruth.org/admins/login    - Admin login
```

**Or for foundation:**
```
https://sso.theholefoundation.org     - Alternative domain
```

### Why Use a Subdomain?

✅ **Clear separation** - Admin tool vs. user-facing apps
✅ **Security** - Isolate admin functionality
✅ **Easy to remember** - `sso.` prefix is standard

---

## How to Use SSO Dashboard in Production

### Access the Dashboard

1. **Navigate to**: `https://sso.theholetruth.org/admins/login`
2. **Login with**: Your `@theholetruth.org` or `@theholefoundation.org` email
3. **Manage applications**: Create, update, delete Auth0 apps

### Who Should Access This?

**ONLY administrators** who need to manage Auth0 applications:
- ✅ IT admins
- ✅ DevOps team
- ✅ Technical leadership

**NOT regular users** - they login directly to your apps (theholetruth.org, theholefoundation.org)

---

## Integration with Your Web Apps

### Your Apps Already Have SSO!

Your existing apps use Auth0 directly. Here's how they work:

#### App 1: theholetruth.org

```javascript
// Already configured (from CLAUDE.md)
import { auth } from './auth.config';

// User clicks "Login"
auth.login(); // Redirects to Auth0

// After auth, user is redirected back
// Token is stored, user is logged in
```

#### App 2: theholefoundation.org

```javascript
// Same Auth0 tenant = Automatic SSO!
import { auth } from './auth.config';

// If user already logged into theholetruth.org,
// they're automatically logged in here too!
```

### The Magic of SSO

```
┌─────────────────────────────────────────┐
│  User logs into theholetruth.org        │
│  Auth0 creates session                  │
└─────────────┬───────────────────────────┘
              │
              │ Session stored in Auth0
              │
┌─────────────▼───────────────────────────┐
│  User visits theholefoundation.org      │
│  Auth0 sees existing session            │
│  User automatically logged in! ✨       │
└─────────────────────────────────────────┘
```

**No SSO Dashboard required for this!** Auth0 handles it automatically.

---

## When to Use SSO Dashboard vs. Direct Auth0 Integration

### Use SSO Dashboard For:

✅ **Managing Auth0 applications** (create, update, delete)
✅ **Administrative tasks** (configure clients, connections)
✅ **Internal tools** (IT admin portal)

### Use Direct Auth0 Integration For:

✅ **User-facing applications** (your websites)
✅ **Production apps** (theholetruth.org, theholefoundation.org)
✅ **Mobile apps**
✅ **APIs**

---

## Architecture Diagram

### Current Setup (What You Have)

```
┌─────────────────────────────────────────────────────────────┐
│                      Auth0 Tenant                            │
│              dev-4fszoklachwdh46m.us.auth0.com              │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ App: Truth   │  │ App: Found.  │  │ App: SSO Dash│     │
│  │ (theholetr.) │  │ (theholef.)  │  │ (admin)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
         ▲                  ▲                  ▲
         │                  │                  │
         │ Users login      │ Users login      │ Admins login
         │ here             │ here             │ here
         │                  │                  │
┌────────┴────────┐ ┌───────┴────────┐ ┌──────┴──────────┐
│ theholetruth.org│ │theholefound.org│ │ sso.theholetr.  │
│  (Public site)  │ │ (Public site)  │ │ (Admin only)    │
└─────────────────┘ └────────────────┘ └─────────────────┘
```

### Recommended Production Setup

```
Production Domains:
├── https://theholetruth.org              (Public - Users login here)
├── https://theholefoundation.org         (Public - Users login here)
└── https://sso.theholetruth.org          (Admin - IT manages Auth0)

All three → Same Auth0 Tenant → Automatic SSO! ✨
```

---

## Step-by-Step Production Deployment

### Quick Start (Cloudflare Workers)

```bash
# 1. Navigate to project
cd /Volumes/HOLE-RAID-DRIVE/Projects/auth0-sso-dashboard-extension

# 2. Create wrangler.toml (see template above)
# Edit and add your settings

# 3. Set secrets
echo "MhZwdzqjYLF1EE1TiBZ50wnxR17cyq2M" | wrangler secret put AUTH0_CLIENT_ID
echo "DXCPx-T-YNPd7cxUn4F_zthZfjaAmzbHlYJ5fuOnsKQ3lI-HiX1Ov9sHTy-cKbND" | wrangler secret put AUTH0_CLIENT_SECRET
echo "SFV4AVu8vOl4YbXxkv6Ld4pZaYQXUcD0" | wrangler secret put EXTENSION_CLIENT_ID
echo "586a4b25d32488bf211472767fbbbdc5133ebccf928dc90c91610e10d4b55484" | wrangler secret put EXTENSION_SECRET

# 4. Update Auth0 callbacks for production
auth0 apps update SFV4AVu8vOl4YbXxkv6Ld4pZaYQXUcD0 \
  --callbacks "https://sso.theholetruth.org/admins/login/callback" \
  --web-origins "https://sso.theholetruth.org" \
  --logout-urls "https://sso.theholetruth.org"

# 5. Build
npm run build

# 6. Deploy!
wrangler deploy

# 7. Access at your Worker URL
# https://hole-sso-dashboard.your-subdomain.workers.dev
```

---

## Security Checklist

### Before Going to Production

- ✅ **Email domain restriction** is active (already done!)
- ✅ **HTTPS only** (enforce in production)
- ✅ **Secrets in environment variables** (never in code)
- ✅ **Auth0 production callbacks** configured
- ✅ **Custom domain** (use `sso.theholetruth.org`, not `*.workers.dev`)
- ✅ **Monitor Auth0 logs** for unauthorized access attempts
- ✅ **Enable MFA** for admin accounts
- ✅ **Regular security audits**

---

## Monitoring & Maintenance

### Cloudflare Analytics

```bash
# View Worker analytics
wrangler tail hole-sso-dashboard
```

### Auth0 Logs

```bash
# Monitor authentication attempts
auth0 logs tail --filter "client_id:SFV4AVu8vOl4YbXxkv6Ld4pZaYQXUcD0"
```

### Health Check

Create a `/health` endpoint:
```
https://sso.theholetruth.org/health
```

---

## Cost Estimate

### Cloudflare Workers (Recommended)

- **Free tier**: 100,000 requests/day
- **Paid tier**: $5/month for 10M requests
- **Your usage**: Probably free tier (admin tool, low traffic)

### Alternative Hosting

- **Heroku**: $7/month (Eco dyno)
- **DigitalOcean**: $5/month (Basic droplet)
- **AWS**: Variable, ~$10-20/month

**Recommendation**: Use Cloudflare Workers (you're already using it, likely free tier)

---

## Next Steps

1. **Choose deployment method** (Cloudflare Workers recommended)
2. **Create `wrangler.toml`** with production config
3. **Deploy to Cloudflare**
4. **Set up custom domain**: `sso.theholetruth.org`
5. **Update Auth0 callbacks** for production
6. **Test production login**
7. **Share URL with IT team**

---

## FAQ

### Q: Do my users login through the SSO Dashboard?

**A: No!** Users login directly to your apps (theholetruth.org, theholefoundation.org). The SSO Dashboard is only for **admins** to manage Auth0 applications.

### Q: How does SSO work between my apps?

**A: Automatically!** All apps use the same Auth0 tenant. When a user logs into one app, Auth0 remembers them. When they visit another app, Auth0 sees the session and logs them in automatically.

### Q: Can I use this as a login portal for all my apps?

**A: You could, but you shouldn't.** It's better to integrate Auth0 directly into each app. The SSO Dashboard is meant for administration, not as a user-facing login portal.

### Q: How do I add a new app to SSO?

**A: Two ways:**
1. Use the SSO Dashboard to create a new Auth0 application
2. Use the Auth0 CLI: `auth0 apps create`

Then integrate Auth0 into your new app using the client credentials.

---

**Ready to deploy?** Start with Cloudflare Workers - it matches your existing stack and is the easiest option!
