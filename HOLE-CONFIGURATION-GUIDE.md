# HOLE Foundation SSO Dashboard - Configuration & Implementation Guide

**Version:** 1.0.0
**Date:** December 30, 2025
**Author:** HOLE Foundation Development Team

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Auth0 Setup](#auth0-setup)
4. [Local Development Configuration](#local-development-configuration)
5. [Custom Styling Implementation](#custom-styling-implementation)
6. [Code Cleanup & Modernization](#code-cleanup--modernization)
7. [Deployment Strategy](#deployment-strategy)
8. [Testing & Validation](#testing--validation)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This Auth0 SSO Dashboard Extension provides a unified authentication portal for HOLE Foundation users. This guide covers:

- **Auth0 configuration** (2 clients required: SPA + M2M)
- **HOLE Foundation design system integration**
- **Code modernization** (React upgrade path)
- **Deployment** options (Webtask vs. self-hosted)

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Auth0 SSO Dashboard Extension                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend (React 0.14.8)                               │
│  ├── Components (Header, Applications, etc.)           │
│  ├── Redux Store (State Management)                    │
│  └── Custom Theme (HOLE Foundation Design)             │
│                                                         │
│  Backend (Express + Auth0 Management API)               │
│  ├── API Routes (/api/applications, /api/connections)  │
│  ├── Authentication (JWT + express-jwt)                │
│  └── Storage (WebtaskStorage or FileStorage)           │
│                                                         │
│  Auth0 Integration                                      │
│  ├── SPA Client (User Authentication)                  │
│  └── M2M Client (Management API Access)                │
└─────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### Required

- Node.js 18+ (current: requires Node 4.x - **needs upgrade**)
- npm 8+
- Auth0 Account (with Management API access)
- Git

### HOLE Foundation Assets

Located at `/Volumes/HOLE-RAID-DRIVE/HOLE-Assets/`:

1. **Color System**: `Color-System-Tiles/HOLE-Foundation-Colors.js`
2. **Text Styles**: `HOLE-Design-System/textStyles.json`
3. **Fonts (WOFF2)**: `HOLE-Design-System/HOLE-Fonts/WOFF2/`
   - AgencyFB (Display/Headings)
   - Apercu Pro (Body Text)
   - Open Sans (Fallback)
   - Typewriter 1950 Tech Mono (Monospace)

---

## Auth0 Setup

### Step 1: Create Single Page Application (SPA) Client

1. **Navigate to**: Auth0 Dashboard → Applications → Create Application
2. **Settings**:
   ```
   Name: HOLE Foundation SSO Dashboard
   Type: Single Page Application
   Allowed Callback URLs: http://localhost:3000/callback, https://your-domain.com/callback
   Allowed Logout URLs: http://localhost:3000, https://your-domain.com
   Allowed Web Origins: http://localhost:3000, https://your-domain.com
   ```

3. **Advanced Settings** → OAuth:
   ```
   JsonWebToken Signature Algorithm: RS256
   OIDC Conformant: ✓ Enabled
   ```

4. **Connections**:
   - Enable only the connections you want users to see
   - Example: Username-Password-Authentication, Google-OAuth2, etc.

5. **Save** and copy the `Client ID`

### Step 2: Create Machine-to-Machine (M2M) Client

1. **Navigate to**: Auth0 Dashboard → Applications → Create Application
2. **Settings**:
   ```
   Name: HOLE SSO Dashboard API Client
   Type: Machine to Machine Applications
   Authorize: Auth0 Management API
   ```

3. **Required Scopes** (select ALL of these):
   ```
   read:clients
   update:clients
   delete:clients
   read:connections
   read:users
   read:logs
   read:device_credentials
   read:resource_servers
   create:resource_servers
   read:client_grants
   create:client_grants
   delete:client_grants
   ```

4. **Save** and copy:
   - `Client ID`
   - `Client Secret`

### Step 3: Get Your Auth0 Domain

From Auth0 Dashboard → Settings → General:
```
Domain: dev-4fszoklachwdh46m.us.auth0.com
Tenant: dev-4fszoklachwdh46m
Region: us
```

**Note**: Based on CLAUDE.md, your Auth0 tenant is `dev-4fszoklachwdh46m.us.auth0.com`

---

## Local Development Configuration

### Step 1: Clone and Install

```bash
cd /Volumes/HOLE-RAID-DRIVE/Projects/auth0-sso-dashboard-extension
npm install
```

### Step 2: Create Configuration File

Create `server/config.json` (from `server/config.example.json`):

```json
{
  "EXTENSION_SECRET": "your-random-secret-string-min-32-chars",
  "AUTH0_RTA": "auth0.auth0.com",
  "WT_URL": "http://localhost:3000",
  "PUBLIC_WT_URL": "http://localhost:3000",
  "AUTH0_DOMAIN": "dev-4fszoklachwdh46m.us.auth0.com",
  "EXTENSION_CLIENT_ID": "[SPA_CLIENT_ID_FROM_STEP_1]",
  "AUTH0_CLIENT_ID": "[M2M_CLIENT_ID_FROM_STEP_2]",
  "AUTH0_CLIENT_SECRET": "[M2M_CLIENT_SECRET_FROM_STEP_2]",
  "TITLE": "HOLE Foundation Portal",
  "CUSTOM_CSS": "http://localhost:3000/hole-foundation-theme.css"
}
```

**Generate EXTENSION_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Add Custom Fonts

1. **Create fonts directory**:
   ```bash
   mkdir -p client/fonts
   ```

2. **Copy fonts from design system**:
   ```bash
   cp /Volumes/HOLE-RAID-DRIVE/HOLE-Assets/HOLE-Design-System/HOLE-Fonts/WOFF2/9866822-AgencyFBCompressedBold.woff2 \
      client/fonts/AgencyFBCompressedBold.woff2

   cp /Volumes/HOLE-RAID-DRIVE/HOLE-Assets/HOLE-Design-System/HOLE-Fonts/WOFF2/9866820-AgencyFBCompressedRegular.woff2 \
      client/fonts/AgencyFBCompressedRegular.woff2

   cp /Volumes/HOLE-RAID-DRIVE/HOLE-Assets/HOLE-Design-System/HOLE-Fonts/WOFF2/9866818-AgencyFBCompressedLight.woff2 \
      client/fonts/AgencyFBCompressedLight.woff2

   # Add Apercu Pro fonts (if available in WOFF2)
   # If not available, the theme will fallback to system fonts
   ```

3. **Update webpack config** to copy fonts to dist:

   Edit `build/webpack/config.js` and add to the `plugins` section:

   ```javascript
   const CopyWebpackPlugin = require('copy-webpack-plugin');

   // In plugins array:
   new CopyWebpackPlugin({
     patterns: [
       { from: 'client/fonts', to: 'fonts' }
     ]
   })
   ```

   Install the plugin:
   ```bash
   npm install --save-dev copy-webpack-plugin@6.4.1
   ```

### Step 4: Add Custom CSS Theme

The custom theme file `hole-foundation-theme.css` has been created in the project root with:

- HOLE Foundation color system (CSS variables)
- AgencyFB + Apercu Pro font imports
- Header styling with Democracy Blue gradient
- Transparency Green accents
- Responsive design
- Accessibility features (WCAG 2.1 AA compliant)

### Step 5: Start Development Server

```bash
npm run serve:dev
```

Visit: `http://localhost:3000`

---

## Custom Styling Implementation

### Hosting Options for Custom CSS

#### Option 1: Self-Hosted (Recommended for Development)

The `hole-foundation-theme.css` file is served from your local server:

```json
{
  "CUSTOM_CSS": "http://localhost:3000/hole-foundation-theme.css"
}
```

#### Option 2: CDN-Hosted (Recommended for Production)

Host on Cloudflare Workers or R2:

1. **Upload to Cloudflare R2**:
   ```bash
   # Using Cloudflare Wrangler
   npx wrangler r2 object put hole-assets/hole-foundation-theme.css \
     --file=hole-foundation-theme.css \
     --content-type=text/css
   ```

2. **Update config.json**:
   ```json
   {
     "CUSTOM_CSS": "https://assets.theholefoundation.org/hole-foundation-theme.css"
   }
   ```

#### Option 3: GitHub Pages (Free)

1. Create a new repo: `hole-sso-assets`
2. Upload `hole-foundation-theme.css` and fonts
3. Enable GitHub Pages
4. Reference: `https://yourusername.github.io/hole-sso-assets/hole-foundation-theme.css`

### Design System Color Mappings

| HOLE Foundation Color | Usage | CSS Variable |
|-----------------------|-------|--------------|
| **Democracy Blue** (#6d78d3) | Primary brand, header background | `--democracy-blue-500` |
| **Transparency Green** (#2c9300) | Success states, CTAs | `--transparency-green-500` |
| **AI Orange** (#e14e00) | Warnings, destructive actions | `--ai-orange-500` |
| **Surface Blue** (#181c30 - #eff1ff) | Backgrounds, depth | `--surface-blue-*` |
| **Warm Grey** (#1f1d1d - #f6f3f3) | Text, borders | `--warm-grey-*` |

### Typography Hierarchy

| Element | Font | Weight | Size | Usage |
|---------|------|--------|------|-------|
| H1 (Display) | AgencyFB Compressed | Bold (700) | 58px | Page titles |
| H2 (Heading) | AgencyFB Compressed | Bold (700) | 36px | Section headers |
| H3 (Heading) | AgencyFB Compressed | Regular (400) | 24px | Subsections |
| Body Text | Apercu Pro | Regular (400) | 16px | Paragraph text |
| Small Text | Apercu Pro | Medium (500) | 12px | Captions, labels |

---

## Code Cleanup & Modernization

### Critical Issues Found

1. **Outdated Dependencies** ⚠️
   - React 0.14.8 (2016) → Upgrade to React 18.x
   - Node.js 4.x → Upgrade to Node.js 18+
   - Webpack 4 → Upgrade to Webpack 5
   - Many security vulnerabilities

2. **Deprecated APIs**
   - `React.PropTypes` → Use `prop-types` package
   - `react-router` v2 → Upgrade to v6
   - Class components → Convert to functional components + hooks

3. **Security Concerns**
   - Outdated `jsonwebtoken` (7.1.9)
   - Old `express` version (4.12.4)
   - Missing security headers

### Recommended Modernization Path

#### Phase 1: Dependency Updates (Week 1)

```bash
# Update Node.js requirement in package.json
{
  "engines": {
    "node": ">=18.0.0"
  }
}

# Update core dependencies
npm install react@18 react-dom@18
npm install react-router-dom@6
npm install webpack@5 webpack-cli@5
npm install express@4.18.0
npm install jsonwebtoken@9.0.0
```

#### Phase 2: Code Refactoring (Week 2-3)

1. **Convert class components to functional components**

   Example transformation for `Header.jsx`:

   ```jsx
   // OLD (Class Component - React 0.14)
   import React, { Component } from 'react';

   export default class Header extends Component {
     static propTypes = {
       user: React.PropTypes.object,
       onLogout: React.PropTypes.func.isRequired
     }

     render() {
       const { user, onLogout } = this.props;
       return <header>...</header>;
     }
   }

   // NEW (Functional Component - React 18)
   import React from 'react';
   import PropTypes from 'prop-types';

   export default function Header({ user, onLogout }) {
     return <header>...</header>;
   }

   Header.propTypes = {
     user: PropTypes.object,
     onLogout: PropTypes.func.isRequired
   };
   ```

2. **Upgrade React Router**

   ```jsx
   // OLD (react-router v2)
   import { Router, Route, browserHistory } from 'react-router';

   <Router history={browserHistory}>
     <Route path="/" component={App} />
   </Router>

   // NEW (react-router-dom v6)
   import { BrowserRouter, Routes, Route } from 'react-router-dom';

   <BrowserRouter>
     <Routes>
       <Route path="/" element={<App />} />
     </Routes>
   </BrowserRouter>
   ```

3. **Update Redux patterns**

   ```javascript
   // Consider migrating to Redux Toolkit
   npm install @reduxjs/toolkit react-redux
   ```

#### Phase 3: Security Hardening (Week 4)

1. **Add security headers** (in `server/index.js`):

   ```javascript
   import helmet from 'helmet';

   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.auth0.com"],
         scriptSrc: ["'self'", "https://cdn.auth0.com"],
         imgSrc: ["'self'", "data:", "https:"],
         fontSrc: ["'self'", "data:"]
       }
     }
   }));
   ```

2. **Update JWT validation**:

   ```javascript
   import jwt from 'express-jwt';
   import jwksRsa from 'jwks-rsa';

   app.use(jwt({
     secret: jwksRsa.expressJwtSecret({
       cache: true,
       rateLimit: true,
       jwksUri: `https://${config('AUTH0_DOMAIN')}/.well-known/jwks.json`
     }),
     audience: config('EXTENSION_CLIENT_ID'),
     issuer: `https://${config('AUTH0_DOMAIN')}/`,
     algorithms: ['RS256']
   }));
   ```

3. **Add rate limiting**:

   ```javascript
   import rateLimit from 'express-rate-limit';

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });

   app.use('/api/', limiter);
   ```

---

## Deployment Strategy

### Option 1: Auth0 Extensions (Webtask.io) - **DEPRECATED**

⚠️ **Warning**: Auth0 Extensions are deprecated as of June 2024. Do NOT deploy as a traditional extension.

### Option 2: Cloudflare Workers (Recommended for HOLE Foundation)

Based on CLAUDE.md, you're already using Cloudflare infrastructure:

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create wrangler.toml
cat > wrangler.toml <<EOF
name = "hole-sso-dashboard"
main = "dist/worker.js"
compatibility_date = "2025-01-01"

[env.production]
name = "hole-sso-dashboard-prod"
route = "sso.theholefoundation.org/*"

[vars]
AUTH0_DOMAIN = "dev-4fszoklachwdh46m.us.auth0.com"
TITLE = "HOLE Foundation Portal"
CUSTOM_CSS = "https://assets.theholefoundation.org/hole-foundation-theme.css"

[[kv_namespaces]]
binding = "SSO_STORAGE"
id = "your-kv-namespace-id"
EOF

# Deploy
wrangler deploy
```

### Option 3: Docker + Kubernetes (Enterprise)

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "serve:prod"]
```

Build and deploy:

```bash
docker build -t hole-sso-dashboard .
docker run -p 3000:3000 \
  -e AUTH0_DOMAIN=dev-4fszoklachwdh46m.us.auth0.com \
  -e EXTENSION_CLIENT_ID=your-spa-client-id \
  -e AUTH0_CLIENT_ID=your-m2m-client-id \
  -e AUTH0_CLIENT_SECRET=your-m2m-secret \
  hole-sso-dashboard
```

### Option 4: Vercel / Netlify (Serverless)

Not recommended due to Auth0 Management API requirements and state management needs.

---

## Testing & Validation

### Step 1: Functional Testing

Create `tests/integration/sso-flow.test.js`:

```javascript
const request = require('supertest');
const app = require('../server');

describe('SSO Dashboard Flow', () => {
  it('should redirect to Auth0 login', async () => {
    const res = await request(app)
      .get('/admins/login')
      .expect(302);

    expect(res.headers.location).toContain('auth0.com/authorize');
  });

  it('should fetch applications after authentication', async () => {
    const token = 'valid-jwt-token'; // Mock JWT
    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('applications');
  });
});
```

### Step 2: Security Testing

```bash
# Run security audit
npm audit

# Fix vulnerabilities
npm audit fix

# Test HTTPS enforcement
curl -I http://localhost:3000
# Should redirect to HTTPS in production

# Test CORS headers
curl -H "Origin: https://evil.com" http://localhost:3000/api/applications
# Should return 403 Forbidden
```

### Step 3: Accessibility Testing

1. **Install axe-core**:
   ```bash
   npm install --save-dev @axe-core/cli
   ```

2. **Run accessibility audit**:
   ```bash
   npx axe http://localhost:3000 --rules wcag2a,wcag2aa
   ```

3. **Manual checks**:
   - Keyboard navigation (Tab, Enter, Esc)
   - Screen reader compatibility (VoiceOver, NVDA)
   - Color contrast (min 4.5:1 for text)

### Step 4: Performance Testing

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run performance audit
lhci autorun --collect.url=http://localhost:3000

# Expected scores:
# Performance: >90
# Accessibility: 100
# Best Practices: >90
# SEO: >90
```

---

## Troubleshooting

### Issue 1: "Cannot find module 'auth0-extension-tools'"

**Cause**: npm install failed or incomplete
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: "Invalid JWT token"

**Cause**: Wrong algorithm or audience
**Solution**:
1. Verify SPA client uses RS256 (not HS256)
2. Check `EXTENSION_CLIENT_ID` matches SPA Client ID
3. Ensure `AUTH0_DOMAIN` is correct

```javascript
// Debug JWT
const decoded = require('jsonwebtoken').decode(token, { complete: true });
console.log('Algorithm:', decoded.header.alg); // Should be RS256
console.log('Audience:', decoded.payload.aud); // Should match EXTENSION_CLIENT_ID
```

### Issue 3: "Management API scopes missing"

**Cause**: M2M client doesn't have required permissions
**Solution**:
1. Go to Auth0 Dashboard → Applications → [M2M Client]
2. Click "APIs" tab
3. Expand "Auth0 Management API"
4. Verify ALL scopes from Step 2 are checked

### Issue 4: Custom CSS not loading

**Cause**: CORS, HTTPS, or incorrect URL
**Solution**:

1. **Check CORS headers** on CSS host:
   ```
   Access-Control-Allow-Origin: http://localhost:3000
   ```

2. **Verify CUSTOM_CSS URL**:
   ```bash
   curl -I https://your-cdn.com/hole-foundation-theme.css
   # Should return 200 OK with Content-Type: text/css
   ```

3. **Check browser console** for errors

### Issue 5: Fonts not displaying

**Cause**: Font files not served or incorrect paths
**Solution**:

1. **Verify font files exist**:
   ```bash
   ls -la client/fonts/
   ```

2. **Check webpack bundle includes fonts**:
   ```bash
   npm run build
   ls -la dist/fonts/
   ```

3. **Test font loading**:
   ```bash
   curl -I http://localhost:3000/fonts/AgencyFBCompressedBold.woff2
   # Should return 200 OK
   ```

---

## Next Steps

### Immediate Actions (This Week)

1. ✅ **Create Auth0 clients** (SPA + M2M)
2. ✅ **Configure `server/config.json`**
3. ✅ **Copy font files** to `client/fonts/`
4. ✅ **Test local development** (`npm run serve:dev`)
5. ✅ **Verify custom theme** loads correctly

### Short-term (Next 2 Weeks)

1. 🔄 **Modernize dependencies** (React 18, Node 18)
2. 🔄 **Add security headers** (helmet.js)
3. 🔄 **Implement rate limiting**
4. 🔄 **Write integration tests**
5. 🔄 **Set up CI/CD pipeline**

### Long-term (Next Month)

1. 🔜 **Deploy to Cloudflare Workers**
2. 🔜 **Set up monitoring** (Sentry, Datadog)
3. 🔜 **Create admin documentation**
4. 🔜 **User acceptance testing**
5. 🔜 **Production launch**

---

## Additional Resources

### Documentation

- [Auth0 Management API Reference](https://auth0.com/docs/api/management/v2)
- [Auth0 Extensions (Deprecated)](https://auth0.com/docs/extensions)
- [HOLE Foundation Design System](/HOLE-Assets/HOLE-Design-System/)
- [React 18 Migration Guide](https://react.dev/blog/2022/03/08/react-18-upgrade-guide)

### Internal Links

- **CLAUDE.md**: `/Volumes/HOLE-RAID-DRIVE/Projects/CLAUDE.md`
- **Design Tokens**: `/Volumes/HOLE-RAID-DRIVE/HOLE-Assets/Color-System-Tiles/HOLE-Foundation-Colors.js`
- **Font Library**: `/Volumes/HOLE-RAID-DRIVE/HOLE-Assets/HOLE-Design-System/HOLE-Fonts/WOFF2/`

### Support

- **Technical Issues**: Create issue in GitHub repo
- **Auth0 Support**: support@auth0.com
- **HOLE Foundation**: [Contact form on theholefoundation.org]

---

**Document Version:** 1.0.0
**Last Updated:** December 30, 2025
**Maintained By:** HOLE Foundation Development Team

---

## Appendix A: Complete Dependency Upgrade Matrix

| Package | Current | Target | Breaking Changes | Notes |
|---------|---------|--------|------------------|-------|
| react | 0.14.8 | 18.2.0 | PropTypes, Context API | Major refactor |
| react-dom | 0.14.8 | 18.2.0 | render() → createRoot() | Update all mounts |
| react-router | 2.6.1 | 6.20.0 | Route structure, hooks | Complete rewrite |
| webpack | 4.5.0 | 5.89.0 | Module federation, config | Update loaders |
| express | 4.12.4 | 4.18.0 | Security patches | Minor updates |
| jsonwebtoken | 7.1.9 | 9.0.2 | Algorithm changes | Update validation |
| node | 4.x | 18.x | ES modules, async/await | Infrastructure change |

## Appendix B: Environment Variables Reference

```bash
# Required
EXTENSION_SECRET=<32+ character random string>
AUTH0_DOMAIN=dev-4fszoklachwdh46m.us.auth0.com
AUTH0_RTA=auth0.auth0.com
EXTENSION_CLIENT_ID=<SPA Client ID>
AUTH0_CLIENT_ID=<M2M Client ID>
AUTH0_CLIENT_SECRET=<M2M Client Secret>

# URLs
WT_URL=http://localhost:3000
PUBLIC_WT_URL=http://localhost:3000

# Optional
TITLE=HOLE Foundation Portal
CUSTOM_CSS=http://localhost:3000/hole-foundation-theme.css
AUTH0_CUSTOM_DOMAIN=sso.theholefoundation.org
ALLOW_AUTHZ=false
AUTH0_MANAGE_URL=https://manage.auth0.com
```

## Appendix C: Auth0 Management API Scopes Explained

| Scope | Purpose | Required For |
|-------|---------|--------------|
| `read:clients` | List all applications | Main dashboard view |
| `update:clients` | Modify application settings | Edit app metadata |
| `delete:clients` | Remove applications | Delete functionality |
| `read:connections` | List identity providers | Connection selector |
| `read:users` | View user profiles | User management |
| `read:logs` | Access audit logs | Activity monitoring |
| `read:device_credentials` | See device registrations | Mobile app support |
| `read:resource_servers` | List APIs | API access control |
| `create:resource_servers` | Add new APIs | API provisioning |
| `read:client_grants` | View M2M permissions | Authorization display |
| `create:client_grants` | Grant API access | Permission management |
| `delete:client_grants` | Revoke API access | Cleanup operations |

---

*End of Configuration Guide*
