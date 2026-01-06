# Security Policy

## Overview

This document outlines the security measures implemented in the Indrolend website and provides guidelines for maintaining security best practices.

## Security Features

### 1. Environment Variable Management

**Current Implementation:**
- All sensitive credentials (API keys, passwords) are stored in `.env` files
- `.env` files are excluded from version control via `.gitignore`
- Both Python (`python-dotenv`) and Node.js (`dotenv`) applications use environment variables

**Best Practices:**
- Never commit `.env` files to the repository
- Use `.env.example` files as templates (without actual credentials)
- Rotate credentials periodically
- Use different credentials for development and production environments

**Setup Instructions:**

For Python scripts (Spotify scraper):
```bash
# Copy the example file
cp .env.example .env

# Edit and add your credentials
nano .env
```

For Node.js backend:
```bash
cd backend/
cp .env.example .env
nano .env
```

### 2. Input Sanitization and XSS Prevention

**Current Implementation:**
- HTML escaping for all user-controlled content in `js/spotify-integration.js`
- URL sanitization to only allow trusted Spotify domains
- Image URL validation to only allow Spotify's CDN
- HTTPS enforcement for all external URLs

**Security Functions:**
- `escapeHtml()`: Escapes HTML special characters to prevent XSS
- `sanitizeSpotifyUrl()`: Validates URLs are from spotify.com domains with HTTPS
- `sanitizeImageUrl()`: Validates image URLs are from Spotify's CDN with HTTPS

**Best Practices:**
- Always escape user input before inserting into HTML
- Validate all external URLs before use
- Use `textContent` instead of `innerHTML` when possible
- Sanitize data from external APIs before rendering

### 3. Secure Communication

**Current Implementation:**
- HTTPS enforced for all production URLs
- Backend uses HTTPS for all Spotify API calls
- External links use `rel="noopener noreferrer"` to prevent tabnabbing
- CORS properly configured in backend with explicit origins

**Best Practices:**
- Always use HTTPS in production
- Use HTTP only for localhost development
- Keep CORS restrictive - only allow necessary origins
- Use secure headers (CSP, HSTS, X-Content-Type-Options)

**Recommended Headers (for production deployment):**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://*.scdn.co https://*.spotifycdn.com data:; connect-src 'self' https://spotify-stats-backend-y8hb.onrender.com https://api.spotify.com
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### 4. Error Handling

**Current Implementation:**
- Detailed errors logged server-side only
- Generic error messages returned to clients
- No stack traces exposed in production
- Error logging in console for debugging (server-side only)

**Error Handling Pattern:**
```javascript
try {
  // Operation
} catch (error) {
  // Log detailed error server-side
  console.error('Detailed error:', error);
  
  // Return generic message to client
  res.status(500).json({
    error: 'Operation failed',
    message: 'A generic user-friendly message'
  });
}
```

### 5. Dependency Management

**Current Implementation:**
- All dependencies vetted through GitHub Advisory Database
- No known vulnerabilities in current dependency versions
- Regular dependency updates recommended

**Python Dependencies (scripts/requirements.txt):**
- pytesseract==0.3.13
- Pillow==12.0.0
- selenium==4.27.1
- python-dotenv==1.0.1
- webdriver-manager==4.0.2

**Node.js Dependencies (backend/package.json):**
- express@^4.18.2
- cors@^2.8.5
- dotenv@^16.3.1
- node-fetch@^3.3.2

**Best Practices:**
- Run `npm audit` and `pip check` regularly
- Update dependencies to patch security vulnerabilities
- Review changelogs before updating to new versions
- Use lock files (`package-lock.json`, etc.) for consistency

### 6. Access Control

**Current Implementation:**
- No authentication required (all data is public read-only)
- Backend endpoints are publicly accessible
- No admin interfaces or privileged operations

**Rate Limiting (Recommended for Production):**

For the backend API, consider implementing rate limiting:

```javascript
// Install: npm install express-rate-limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);
```

### 7. Static Content Security

**Current Implementation:**
- No sensitive information in static files
- Images and assets properly organized
- Screenshots auto-deleted after OCR processing
- Example screenshots committed intentionally for validation

**Best Practices:**
- Review files before committing
- Use `.gitignore` to exclude sensitive files
- Don't commit configuration files with credentials
- Audit static assets regularly

### 8. Third-Party Integration Security

**Spotify API Integration:**
- Uses OAuth 2.0 Client Credentials Flow (secure)
- Client secret never exposed to frontend
- API calls made server-side only
- Access tokens cached securely with expiration

**Selenium Web Scraping:**
- Credentials stored in environment variables
- Headless mode available for security
- URL validation before navigation
- Secure HTTPS enforcement

## Security Checklist

Before deploying to production:

- [ ] All `.env` files excluded from repository
- [ ] Environment variables properly configured
- [ ] HTTPS enabled for all external communications
- [ ] Security headers configured on web server
- [ ] Dependencies checked for vulnerabilities
- [ ] Error messages don't expose sensitive information
- [ ] Input validation implemented for all user inputs
- [ ] Rate limiting enabled on API endpoints
- [ ] Access logs enabled for monitoring
- [ ] Regular security audits scheduled

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email the maintainer directly with details
3. Provide steps to reproduce if possible
4. Allow reasonable time for a fix before public disclosure

## Security Updates

This document should be reviewed and updated:
- When adding new features that handle sensitive data
- After security audits
- When updating dependencies
- At least quarterly

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Python Security Best Practices](https://python.readthedocs.io/en/latest/library/security.html)

## Compliance

This website:
- Does not collect personal user data
- Does not use cookies or tracking
- Does not require user authentication
- Fetches only public data from Spotify API
- Complies with Spotify's API Terms of Service

---

Last Updated: 2026-01-06
