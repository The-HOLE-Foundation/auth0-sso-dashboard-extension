# SSO Dashboard - Login Instructions

## Why the Dashboard Appears Blank

The SSO Dashboard shows a blank page when you're **not logged in**. This is expected behavior!

## How to Fix It

### Option 1: Use the Login URL (Recommended)

Open this URL in your browser:
```
http://localhost:3001/admins/login
```

This will:
1. Redirect you to Auth0 login page
2. Show the HOLE Foundation branding
3. After login, redirect back to the dashboard
4. Display all your Auth0 applications

### Option 2: Configure Auto-Redirect

The homepage (http://localhost:3001) could be configured to auto-redirect to `/admins/login` if not authenticated, but this requires code changes.

## What You Should See After Login

✅ **Header**: Democracy Blue gradient with HOLE Foundation Portal title
✅ **Navigation**: User menu in top-right corner
✅ **Content**: List of all Auth0 applications
✅ **Sidebar**: Applications, Settings, Authorization tabs (if admin)

## Troubleshooting

### Still seeing blank page after login?

1. **Check browser console** (F12 → Console tab)
   - Look for JavaScript errors (red text)
   - Look for failed network requests (Network tab)

2. **Clear browser cache**
   ```
   Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   ```

3. **Verify authentication token**
   - Check browser DevTools → Application → Session Storage
   - Look for key: `sso-dashboard:apiToken`
   - If missing, try logging in again

### Auth0 Configuration Verified ✅

- ✅ Callback URL: `http://localhost:3001/admins/login/callback`
- ✅ Web Origins: `http://localhost:3001`
- ✅ Logout URL: `http://localhost:3001`
- ✅ Client ID: `SFV4AVu8vOl4YbXxkv6Ld4pZaYQXUcD0`

## Quick Test

Run this in your terminal to verify the server is working:

```bash
# Should return HTML with Auth0 login form
curl http://localhost:3001/admins/login | head -20

# Should return 200 OK
curl -I http://localhost:3001
```

## Next Steps

Once you're logged in:

1. **Test the Dashboard**: Navigate through applications, settings
2. **Verify Theme**: Check if HOLE Foundation colors/fonts are applied
3. **Test CRUD Operations**: Create, update, delete applications
4. **Test Auth0 Integration**: Verify all API calls work

---

**Status**: Server running on http://localhost:3001 ✅
**Login URL**: http://localhost:3001/admins/login (just opened in your browser)
