# Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

The `.env.local` file has been created with the default production API URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://165.227.22.118/api/v1
```

**Available API URLs:**
- **Production (IP)**: `http://165.227.22.118/api/v1` ⬅️ Currently configured
- **Production (Domain)**: `https://api.butical.com/api/v1` (Use when HTTPS is available)
- **Local Development**: `http://localhost:3000/api/v1` (For local backend testing)

To change the API URL, edit `.env.local` and restart the dev server.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Admin Login

Before you can access the dashboard, you need to authenticate:

1. Navigate to your login page
2. Use admin credentials to login
3. The auth token will be automatically stored in localStorage
4. You'll have access to all admin endpoints

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard with API integration
│   │   ├── users/                # User management pages
│   │   ├── escorts/              # Escort management pages
│   │   └── ...
│   └── layout.tsx
├── lib/
│   └── api/
│       ├── admin.ts              # Admin API service (all endpoints)
│       ├── auth.ts               # Authentication service
│       ├── client.ts             # HTTP client & error handling
│       ├── config.ts             # API configuration
│       └── index.ts              # Barrel exports
└── types/
    └── api.ts                    # TypeScript type definitions
```

## Available API Services

### Authentication Service

```typescript
import { authService } from '@/lib/api';

// Login
await authService.login({ email, password });

// Register admin
await authService.register({ email, password, name });

// Get profile
await authService.getProfile();

// Refresh token
await authService.refreshToken();

// Logout
authService.logout();

// Check if authenticated
if (isAuthenticated()) { ... }
```

### Admin Service

```typescript
import { adminService } from '@/lib/api';

// Dashboard
await adminService.getDashboardStats();

// Users
await adminService.getUsers({ page: 1, limit: 20 });
await adminService.getUserById(id);
await adminService.updateUserStatus(id, { status: 'SUSPENDED' });

// Escorts
await adminService.getEscorts({ verified: false });
await adminService.verifyEscort(id, { verified: true });

// Payments
await adminService.getPayments({ status: 'COMPLETED' });

// Withdrawals
await adminService.getWithdrawals({ status: 'PENDING' });
await adminService.processWithdrawal(id, { status: 'COMPLETED' });

// Referrals
await adminService.getReferrals({ status: 'PENDING' });
await adminService.approveReferral(id, { approve: true });

// Reviews
await adminService.getReviews({ visible: true });
await adminService.toggleReviewVisibility(id, { visible: false });
```

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Butical API base URL | `http://165.227.22.118/api/v1` |

**Important:** The prefix `NEXT_PUBLIC_` makes this variable accessible in the browser. Never put sensitive secrets here.

## API Rate Limits

- **100 requests per 15 minutes** per IP address
- Requests exceeding this limit will receive a `429 Too Many Requests` error

## Token Management

- **Access tokens** are stored in localStorage as `admin_access_token`
- **Refresh tokens** are stored in localStorage as `admin_refresh_token`
- Tokens are automatically included in all authenticated requests
- Tokens are cleared on logout

## Error Handling

All API errors are handled with the `APIError` class:

```typescript
import { adminService, handleApiError, isAuthError } from '@/lib/api';

try {
  await adminService.getDashboardStats();
} catch (error) {
  if (isAuthError(error)) {
    // Handle authentication error
    authService.logout();
  } else {
    const message = handleApiError(error);
    console.error(message);
  }
}
```

## Common Issues

### 1. API Connection Errors

**Problem:** "Network error. Please check your connection."

**Solutions:**
- Check if the API server is running
- Verify the `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Check firewall/network settings
- Try using the IP address instead of domain (or vice versa)

### 2. 401 Unauthorized

**Problem:** "Unauthorized" errors on API calls

**Solutions:**
- Make sure you're logged in
- Check if token is stored in localStorage
- Try refreshing the token with `authService.refreshToken()`
- Login again if refresh fails

### 3. CORS Errors

**Problem:** CORS policy errors in browser console

**Solutions:**
- This should be configured on the backend
- Contact backend team to add your domain to allowed origins
- For development, ensure `http://localhost:3000` is allowed

### 4. Rate Limit Exceeded

**Problem:** "Too Many Requests" (429) errors

**Solutions:**
- Wait 15 minutes before retrying
- Implement request throttling in your application
- Cache API responses where appropriate

## TypeScript Support

All API types are fully typed. Import from:

```typescript
import type {
  DashboardStats,
  User,
  Escort,
  Payment,
  Withdrawal,
  Referral,
  Review
} from '@/types/api';
```

## Documentation

- **API Integration Guide**: See [API_INTEGRATION.md](./API_INTEGRATION.md)
- **Butical API Docs**: Check with backend team for full API documentation

## Support

For issues:
1. Check the [API_INTEGRATION.md](./API_INTEGRATION.md) documentation
2. Review error messages in browser console
3. Contact the backend team for API-related issues
