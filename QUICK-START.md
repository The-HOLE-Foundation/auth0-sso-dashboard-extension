# HOLE Foundation SSO Dashboard - Quick Start

**⚡ Get running in 15 minutes**

---

## 1. Auth0 Setup (5 minutes)

### Create SPA Client

```
Auth0 Dashboard → Applications → Create Application
Name: HOLE Foundation SSO Dashboard
Type: Single Page Application
Algorithm: RS256 (Advanced Settings → OAuth)
Connections: [Select your connections]

Copy: Client ID
```

### Create M2M Client

```
Auth0 Dashboard → Applications → Create Application
Name: HOLE SSO Dashboard API Client
Type: Machine to Machine
Authorize: Auth0 Management API

Scopes (select ALL):
✓ read:clients, update:clients, delete:clients
✓ read:connections, read:users, read:logs
✓ read:device_credentials
✓ read:resource_servers, create:resource_servers
✓ read:client_grants, create:client_grants, delete:client_grants

Copy: Client ID, Client Secret
```

---

## 2. Local Configuration (3 minutes)

Create `server/config.json`:

```json
{
  "EXTENSION_SECRET": "GENERATE_WITH_COMMAND_BELOW",
  "AUTH0_RTA": "auth0.auth0.com",
  "WT_URL": "http://localhost:3000",
  "PUBLIC_WT_URL": "http://localhost:3000",
  "AUTH0_DOMAIN": "dev-4fszoklachwdh46m.us.auth0.com",
  "EXTENSION_CLIENT_ID": "YOUR_SPA_CLIENT_ID",
  "AUTH0_CLIENT_ID": "YOUR_M2M_CLIENT_ID",
  "AUTH0_CLIENT_SECRET": "YOUR_M2M_CLIENT_SECRET",
  "TITLE": "HOLE Foundation Portal",
  "CUSTOM_CSS": "http://localhost:3000/hole-foundation-theme.css"
}
```

**Generate EXTENSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3. Install Dependencies (2 minutes)

```bash
cd /Volumes/HOLE-RAID-DRIVE/Projects/auth0-sso-dashboard-extension
npm install
```

---

## 4. Add HOLE Foundation Fonts (3 minutes)

```bash
# Create fonts directory
mkdir -p client/fonts

# Copy AgencyFB fonts
cp /Volumes/HOLE-RAID-DRIVE/HOLE-Assets/HOLE-Design-System/HOLE-Fonts/WOFF2/9866822-AgencyFBCompressedBold.woff2 \
   client/fonts/AgencyFBCompressedBold.woff2

cp /Volumes/HOLE-RAID-DRIVE/HOLE-Assets/HOLE-Design-System/HOLE-Fonts/WOFF2/9866820-AgencyFBCompressedRegular.woff2 \
   client/fonts/AgencyFBCompressedRegular.woff2

cp /Volumes/HOLE-RAID-DRIVE/HOLE-Assets/HOLE-Design-System/HOLE-Fonts/WOFF2/9866818-AgencyFBCompressedLight.woff2 \
   client/fonts/AgencyFBCompressedLight.woff2

# Verify fonts copied
ls -lh client/fonts/
```

---

## 5. Configure Webpack for Fonts (2 minutes)

**Install copy plugin:**
```bash
npm install --save-dev copy-webpack-plugin@6.4.1
```

**Edit `build/webpack/config.js`:**

Add at the top:
```javascript
const CopyWebpackPlugin = require('copy-webpack-plugin');
```

Add to `plugins` array (around line 50):
```javascript
new CopyWebpackPlugin({
  patterns: [
    { from: 'client/fonts', to: 'fonts' }
  ]
})
```

---

## 6. Start Development Server

```bash
npm run serve:dev
```

**Open in browser:** `http://localhost:3000`

---

## ✅ Verification Checklist

- [ ] Auth0 login page appears
- [ ] Login successful with your Auth0 credentials
- [ ] Dashboard shows your Auth0 applications
- [ ] Header displays "HOLE FOUNDATION PORTAL" in AgencyFB font
- [ ] Header background is Democracy Blue gradient
- [ ] Custom theme applied (check browser DevTools)

---

## 🎨 Theme Preview

### What You Should See

**Header:**
- Background: Blue gradient (Democracy Blue #6d78d3 → #9ea5ff)
- Border: Green underline (Transparency Green #66c13d)
- Logo: White "H" circle on left
- Title: "HOLE FOUNDATION PORTAL" (uppercase, AgencyFB)

**Body:**
- Background: Light grey/white (#fdfdf6)
- Text: Dark grey (Warm Grey #1f1d1d)
- Font: Apercu Pro

**Buttons:**
- Primary: Blue gradient
- Success: Green gradient
- Danger/Delete: Orange gradient

---

## 🐛 Troubleshooting

### "Cannot find module 'auth0-extension-tools'"

```bash
rm -rf node_modules package-lock.json
npm install
```

### "Invalid JWT token"

1. Check `EXTENSION_CLIENT_ID` matches SPA Client ID (not M2M!)
2. Verify SPA client uses RS256 algorithm
3. Check `AUTH0_DOMAIN` is correct

### Fonts not loading

```bash
# Rebuild to copy fonts to dist/
npm run client:build
npm run serve:dev
```

### Custom CSS not applying

1. Check `hole-foundation-theme.css` exists in project root
2. Verify browser DevTools → Network tab shows CSS loaded (200 OK)
3. Clear browser cache (Cmd+Shift+R)

---

## 📚 Next Steps

1. **Read full guide**: `HOLE-CONFIGURATION-GUIDE.md`
2. **Customize settings**: Edit `server/config.json`
3. **Add more apps**: Configure in Auth0 Dashboard
4. **Deploy**: See "Deployment Strategy" section in guide

---

## 🚀 Production Deployment (Future)

### Option 1: Cloudflare Workers (Recommended)

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
wrangler deploy
```

See full deployment guide in `HOLE-CONFIGURATION-GUIDE.md` → Section 7

---

## 📞 Support

- **Issues**: Create GitHub issue
- **Auth0 Help**: Check HOLE-CONFIGURATION-GUIDE.md → Troubleshooting
- **Design System**: `/Volumes/HOLE-RAID-DRIVE/HOLE-Assets/HOLE-Design-System/`

---

**Last Updated:** December 30, 2025
**Version:** 1.0.0
