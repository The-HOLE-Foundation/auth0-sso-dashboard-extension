/**
 * Auth0 Action: Restrict Login by Email Domain
 *
 * Only allows users with @theholetruth.org or @theholefoundation.org email addresses
 * to access the HOLE Foundation SSO Dashboard.
 */

exports.onExecutePostLogin = async (event, api) => {
  const allowedDomains = ['theholetruth.org', 'theholefoundation.org'];

  // Get user's email
  const userEmail = event.user.email;

  if (!userEmail) {
    api.access.deny('email_required', 'Email address is required for authentication.');
    return;
  }

  // Extract domain from email
  const emailDomain = userEmail.split('@')[1];

  // Check if domain is allowed
  if (!allowedDomains.includes(emailDomain)) {
    api.access.deny(
      'unauthorized_domain',
      `Access denied. Only users with @theholetruth.org or @theholefoundation.org email addresses can access this application.`
    );
    return;
  }

  // Domain is allowed - add custom claim to token
  api.idToken.setCustomClaim('https://theholefoundation.org/email_domain', emailDomain);
  api.accessToken.setCustomClaim('https://theholefoundation.org/email_domain', emailDomain);
};
