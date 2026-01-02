# Email Domain Restriction - Setup Complete ✅

## What Was Configured

An Auth0 Action has been created and deployed that **restricts login access** to users with the following email domains:

- ✅ `@theholetruth.org`
- ✅ `@theholefoundation.org`

**Action ID**: `045a6cd6-e31a-4832-9337-802e1947522e`
**Status**: ✅ Deployed and Active in Post-Login Flow

---

## How It Works

### Login Process

1. **User attempts to login** → Auth0 authentication starts
2. **Email address is validated**
3. **Domain is checked** against allowed list:
   - If domain matches → ✅ Login succeeds
   - If domain doesn't match → ❌ Login denied with clear error message

### Error Message for Unauthorized Domains

Users with unauthorized email domains (e.g., `@gmail.com`, `@yahoo.com`) will see:

```
Access denied. Only users with @theholetruth.org or @theholefoundation.org
email addresses can access this application.
```

---

## What Happens During Login

### Allowed Email Examples (✅ Will succeed)
- `joe@theholetruth.org`
- `admin@theholefoundation.org`
- `support@theholetruth.org`

### Blocked Email Examples (❌ Will fail)
- `joe@gmail.com`
- `someone@yahoo.com`
- `user@example.com`

### Custom Claims Added

For successful logins, the Action adds a custom claim to both the ID token and Access token:

```json
{
  "https://theholefoundation.org/email_domain": "theholetruth.org"
}
```

This can be used in your application to identify which organization the user belongs to.

---

## Testing the Restriction

### Test with Allowed Domain ✅

1. Go to: http://localhost:3001/admins/login
2. Login with: `your-email@theholetruth.org`
3. **Expected**: Login succeeds, dashboard loads

### Test with Blocked Domain ❌

1. Create a test user with `testuser@gmail.com`
2. Go to: http://localhost:3001/admins/login
3. Try to login
4. **Expected**: Error message appears, login denied

---

## Action Code Location

The Action code is saved in:
```
/Volumes/HOLE-RAID-DRIVE/Projects/auth0-sso-dashboard-extension/restrict-email-domains.js
```

### Action Code Summary

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const allowedDomains = ['theholetruth.org', 'theholefoundation.org'];
  const userEmail = event.user.email;
  const emailDomain = userEmail.split('@')[1];

  // Deny access if domain not allowed
  if (!allowedDomains.includes(emailDomain)) {
    api.access.deny('unauthorized_domain', '...');
    return;
  }

  // Add custom claim for allowed users
  api.idToken.setCustomClaim('https://theholefoundation.org/email_domain', emailDomain);
};
```

---

## Managing the Action

### View Action in Auth0 Dashboard

```bash
auth0 actions open 045a6cd6-e31a-4832-9337-802e1947522e
```

### Update Allowed Domains

If you need to add more domains (e.g., `@holepartners.org`):

1. Edit `restrict-email-domains.js`
2. Add domain to `allowedDomains` array:
   ```javascript
   const allowedDomains = [
     'theholetruth.org',
     'theholefoundation.org',
     'holepartners.org'  // NEW
   ];
   ```
3. Update the Action:
   ```bash
   auth0 actions update 045a6cd6-e31a-4832-9337-802e1947522e \
     --code "$(cat restrict-email-domains.js)"
   ```
4. Deploy the update:
   ```bash
   auth0 actions deploy 045a6cd6-e31a-4832-9337-802e1947522e
   ```

### Temporarily Disable Restriction

To disable without deleting:

```bash
# Remove from login flow
auth0 api patch "actions/triggers/post-login/bindings" --data '{"bindings": []}'

# Re-enable later
auth0 api patch "actions/triggers/post-login/bindings" \
  --data '{
    "bindings": [{
      "ref": {"type": "action_id", "value": "045a6cd6-e31a-4832-9337-802e1947522e"},
      "display_name": "Restrict Login by Email Domain"
    }]
  }'
```

### Delete Action Completely

```bash
# First remove from login flow
auth0 api patch "actions/triggers/post-login/bindings" --data '{"bindings": []}'

# Then delete the action
auth0 actions delete 045a6cd6-e31a-4832-9337-802e1947522e
```

---

## Security Considerations

### What This Protects

✅ **Prevents unauthorized access** from external email addresses
✅ **Organization-level access control**
✅ **Clear error messaging** for denied users

### What This Doesn't Protect

⚠️ **Email verification**: Users can create accounts with any email
⚠️ **Domain ownership**: Doesn't verify you own these domains
⚠️ **Existing users**: Won't remove access for already-created accounts

### Recommendations

1. **Enable email verification** in Auth0 settings
2. **Use Auth0 Organizations** for enterprise features
3. **Regularly audit** user accounts
4. **Monitor Auth0 logs** for denied login attempts

---

## Auth0 CLI Commands Reference

```bash
# View all actions
auth0 actions list

# Show specific action
auth0 actions show 045a6cd6-e31a-4832-9337-802e1947522e

# View action in browser
auth0 actions open 045a6cd6-e31a-4832-9337-802e1947522e

# Check current login flow
auth0 api get "actions/triggers/post-login/bindings"

# View Auth0 logs (to see denied logins)
auth0 logs tail
```

---

## Current Configuration

✅ **Action Created**: January 1, 2026
✅ **Status**: Deployed and Active
✅ **Trigger**: Post-Login
✅ **Runtime**: Node.js 18
✅ **Allowed Domains**: `@theholetruth.org`, `@theholefoundation.org`

---

## Support

If users report access issues:

1. **Verify their email domain** matches allowed list
2. **Check Auth0 logs**:
   ```bash
   auth0 logs tail --filter "user_id:USER_EMAIL"
   ```
3. **Look for error**: `unauthorized_domain`
4. **If legitimate**, add their domain to allowed list

---

**Last Updated**: January 1, 2026
**Configured By**: Auth0 CLI
**Documentation**: This file
