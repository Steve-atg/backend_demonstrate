# Refresh Token Implementation Guide

This implementation provides a secure refresh token system for your NestJS application with the following features:

## Overview

The refresh token system uses a **dual-token approach**:

1. **Access Token**: Short-lived (15 minutes) - used for API requests
2. **Refresh Token**: Long-lived (7 days) - used to get new access tokens

## Key Features

### 🔒 Security Features

- **Token Rotation**: Each refresh generates a new refresh token and invalidates the old one
- **Secure Storage**: Refresh tokens are hashed before storing in database
- **Expiration**: Both tokens have configurable expiration times
- **Revocation**: Tokens can be revoked individually or all at once
- **Device Tracking**: Optional device info and IP address logging

### 🚀 API Endpoints

#### Authentication Endpoints

```bash
POST /auth/register    # Register + get tokens
POST /auth/login       # Login + get tokens
POST /auth/refresh     # Exchange refresh token for new tokens
POST /auth/logout      # Revoke specific refresh token
POST /auth/logout-all  # Revoke all user refresh tokens
```

#### Protected Endpoints

```bash
GET /auth/profile      # Get user profile (requires access token)
GET /auth/me          # Get current user info (requires access token)
```

## Usage Examples

### 1. Register/Login Flow

```typescript
// Registration
const response = await fetch('/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    email: 'john@example.com',
    password: 'SecurePassword123!',
  }),
});

const { access_token, refresh_token, user } = await response.json();

// Store tokens securely
localStorage.setItem('access_token', access_token);
localStorage.setItem('refresh_token', refresh_token); // Better: use httpOnly cookie
```

### 2. Making Authenticated Requests

```typescript
// Use access token for API requests
const profileResponse = await fetch('/auth/profile', {
  headers: {
    Authorization: `Bearer ${access_token}`,
  },
});
```

### 3. Token Refresh Flow

```typescript
// When access token expires (401 response), use refresh token
const refreshResponse = await fetch('/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refresh_token: stored_refresh_token,
  }),
});

const { access_token: newAccessToken, refresh_token: newRefreshToken } =
  await refreshResponse.json();

// Update stored tokens
localStorage.setItem('access_token', newAccessToken);
localStorage.setItem('refresh_token', newRefreshToken);
```

### 4. Automatic Token Refresh (Frontend Implementation)

```typescript
// Axios interceptor example
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post('/auth/refresh', {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);
```

## Database Schema

The refresh tokens are stored in a dedicated table:

```sql
-- refresh_token table
CREATE TABLE refresh_token (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

## Configuration

### Environment Variables

```bash
# JWT secrets (use strong, different secrets for production)
JWT_SECRET=your-access-token-secret-key
JWT_REFRESH_SECRET=your-refresh-token-secret-key

# Database connection
DATABASE_URL=postgresql://username:password@localhost:5432/database
```

### Token Lifetimes

- **Access Token**: 15 minutes (configurable in `auth.module.ts`)
- **Refresh Token**: 7 days (configurable in `auth.service.ts`)

## Security Best Practices

### ✅ What This Implementation Does

1. **Short-lived access tokens** - reduces window of compromise
2. **Token rotation** - invalidates old refresh tokens
3. **Secure hashing** - refresh tokens are hashed before database storage
4. **Proper validation** - validates token signatures and expiration
5. **Revocation support** - can invalidate tokens when needed

### 🔒 Additional Security Recommendations

1. **Use HTTPS only** - never transmit tokens over HTTP
2. **HttpOnly cookies** - store refresh tokens in httpOnly cookies instead of localStorage
3. **CSRF protection** - implement CSRF tokens for cookie-based auth
4. **Rate limiting** - limit refresh token endpoint calls
5. **Device fingerprinting** - track device characteristics for additional security
6. **Refresh token family** - implement refresh token families for better security

### 🚫 Common Security Pitfalls to Avoid

1. **Don't store refresh tokens in localStorage** - use httpOnly cookies
2. **Don't make refresh tokens too long-lived** - 7 days max recommended
3. **Don't reuse refresh tokens** - always rotate on refresh
4. **Don't skip token validation** - always verify signatures and expiration
5. **Don't ignore revocation** - implement proper logout functionality

## Testing

Run the test script to verify the implementation:

```bash
# Make the script executable
chmod +x test-refresh-tokens.sh

# Run the tests (ensure your server is running on localhost:3000)
./test-refresh-tokens.sh
```

The test covers:

- User registration with token generation
- Access token validation
- Token refresh flow
- Old token invalidation
- Logout functionality
- Post-logout token validation

## Troubleshooting

### Common Issues

1. **"Property 'refreshToken' does not exist"**
   - Run Prisma migration: `npx prisma migrate dev`
   - Regenerate Prisma client: `npx prisma generate`

2. **"Invalid refresh token" errors**
   - Check JWT_REFRESH_SECRET environment variable
   - Verify token hasn't expired
   - Ensure token hasn't been revoked

3. **TypeScript errors**
   - Regenerate Prisma client after schema changes
   - Check import paths for DTOs and guards

## Migration Command

After setting up the schema, run:

```bash
npx prisma migrate dev --name add-refresh-tokens
```

This will create the necessary database tables for the refresh token system.
