# Admin API Integration Guide

This document provides a comprehensive guide to the Butical Admin API integration.

## Table of Contents

- [Setup](#setup)
- [Configuration](#configuration)
- [Authentication](#authentication)
- [API Services](#api-services)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [TypeScript Types](#typescript-types)

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://165.227.22.118/api/v1
```

Available API URLs:
- **Production (Domain)**: `https://api.butical.com/api/v1`
- **Production (IP)**: `http://165.227.22.118/api/v1`
- **Development**: `http://localhost:3000/api/v1`

## Configuration

The API configuration is located in [src/lib/api/config.ts](src/lib/api/config.ts).

### API Endpoints

All admin endpoints are defined in `API_ENDPOINTS`:

```typescript
import { API_ENDPOINTS } from '@/lib/api';

// Examples:
API_ENDPOINTS.ADMIN_LOGIN
API_ENDPOINTS.ADMIN_DASHBOARD
API_ENDPOINTS.ADMIN_USERS
API_ENDPOINTS.ADMIN_USER_BY_ID('user-123')
```

## Authentication

The authentication service handles admin login, registration, token management, and logout.

### Login Example

```typescript
import { authService } from '@/lib/api';

async function handleLogin() {
  try {
    const response = await authService.login({
      email: 'admin@example.com',
      password: 'password123'
    });

    console.log('Logged in:', response.admin);
    // Tokens are automatically stored in localStorage
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

### Register Admin

```typescript
import { authService } from '@/lib/api';

async function handleRegister() {
  try {
    const response = await authService.register({
      email: 'newadmin@example.com',
      password: 'securepassword',
      name: 'Admin Name'
    });

    console.log('Registered:', response.admin);
  } catch (error) {
    console.error('Registration failed:', error);
  }
}
```

### Check Authentication

```typescript
import { isAuthenticated, getStoredAdmin } from '@/lib/api';

if (isAuthenticated()) {
  const admin = getStoredAdmin();
  console.log('Current admin:', admin);
} else {
  // Redirect to login
}
```

### Refresh Token

```typescript
import { authService } from '@/lib/api';

async function refreshAccessToken() {
  try {
    await authService.refreshToken();
    console.log('Token refreshed');
  } catch (error) {
    console.error('Token refresh failed:', error);
    authService.logout();
  }
}
```

### Logout

```typescript
import { authService } from '@/lib/api';

function handleLogout() {
  authService.logout();
  // Automatically clears tokens and redirects to login
}
```

## API Services

The admin service provides methods for all admin operations.

### Dashboard Statistics

```typescript
import { adminService } from '@/lib/api';

async function getDashboard() {
  try {
    const stats = await adminService.getDashboardStats();
    console.log('Dashboard stats:', stats);
    // stats.totalUsers, stats.totalRevenue, etc.
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### User Management

#### List Users

```typescript
import { adminService } from '@/lib/api';

async function listUsers() {
  try {
    const response = await adminService.getUsers({
      page: 1,
      limit: 20,
      role: 'DATING_USER',
      status: 'ACTIVE',
      search: 'john'
    });

    console.log('Users:', response.data);
    console.log('Pagination:', response.pagination);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

#### Get User by ID

```typescript
import { adminService } from '@/lib/api';

async function getUser(userId: string) {
  try {
    const user = await adminService.getUserById(userId);
    console.log('User:', user);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

#### Update User Status

```typescript
import { adminService } from '@/lib/api';

async function suspendUser(userId: string) {
  try {
    const user = await adminService.updateUserStatus(userId, {
      status: 'SUSPENDED',
      reason: 'Terms violation'
    });
    console.log('User suspended:', user);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Escort Management

#### List Escorts

```typescript
import { adminService } from '@/lib/api';

async function listEscorts() {
  try {
    const response = await adminService.getEscorts({
      page: 1,
      limit: 20,
      verified: false, // Only unverified escorts
      vipStatus: false,
      search: 'nairobi'
    });

    console.log('Escorts:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

#### Verify Escort

```typescript
import { adminService } from '@/lib/api';

async function verifyEscort(escortId: string) {
  try {
    const escort = await adminService.verifyEscort(escortId, {
      verified: true,
      notes: 'Documents verified'
    });
    console.log('Escort verified:', escort);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Payment Management

#### List Payments

```typescript
import { adminService } from '@/lib/api';

async function listPayments() {
  try {
    const response = await adminService.getPayments({
      page: 1,
      limit: 50,
      type: 'DATING_SUBSCRIPTION',
      status: 'COMPLETED',
      startDate: '2025-01-01',
      endDate: '2025-12-31'
    });

    console.log('Payments:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Withdrawal Management

#### List Withdrawals

```typescript
import { adminService } from '@/lib/api';

async function listWithdrawals() {
  try {
    const response = await adminService.getWithdrawals({
      page: 1,
      limit: 20,
      status: 'PENDING'
    });

    console.log('Withdrawals:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

#### Process Withdrawal

```typescript
import { adminService } from '@/lib/api';

async function approveWithdrawal(withdrawalId: string) {
  try {
    const withdrawal = await adminService.processWithdrawal(withdrawalId, {
      status: 'COMPLETED',
      mpesaTransactionId: 'ABC123XYZ',
      notes: 'Processed successfully'
    });
    console.log('Withdrawal processed:', withdrawal);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function rejectWithdrawal(withdrawalId: string) {
  try {
    const withdrawal = await adminService.processWithdrawal(withdrawalId, {
      status: 'REJECTED',
      notes: 'Insufficient verification'
    });
    console.log('Withdrawal rejected:', withdrawal);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Referral Management

#### List Referrals

```typescript
import { adminService } from '@/lib/api';

async function listReferrals() {
  try {
    const response = await adminService.getReferrals({
      page: 1,
      limit: 20,
      status: 'PENDING',
      level: 1
    });

    console.log('Referrals:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

#### Approve Referral

```typescript
import { adminService } from '@/lib/api';

async function approveReferral(referralId: string) {
  try {
    const referral = await adminService.approveReferral(referralId, {
      approve: true,
      notes: 'Referral verified and approved'
    });
    console.log('Referral approved:', referral);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Review Management

#### List Reviews

```typescript
import { adminService } from '@/lib/api';

async function listReviews() {
  try {
    const response = await adminService.getReviews({
      page: 1,
      limit: 20,
      visible: true,
      escortId: 'escort-123'
    });

    console.log('Reviews:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

#### Toggle Review Visibility

```typescript
import { adminService } from '@/lib/api';

async function hideReview(reviewId: string) {
  try {
    const review = await adminService.toggleReviewVisibility(reviewId, {
      visible: false
    });
    console.log('Review hidden:', review);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Error Handling

The API client includes comprehensive error handling:

```typescript
import { adminService, handleApiError, isAuthError, APIError } from '@/lib/api';

async function fetchData() {
  try {
    const stats = await adminService.getDashboardStats();
    return stats;
  } catch (error) {
    // Check if it's an authentication error
    if (isAuthError(error)) {
      console.log('Authentication failed, redirecting to login');
      authService.logout();
      return;
    }

    // Get error message
    const message = handleApiError(error);
    console.error('Error:', message);

    // Access detailed error information
    if (error instanceof APIError) {
      console.log('Status code:', error.statusCode);
      console.log('Message:', error.message);
      console.log('Validation errors:', error.errors);
    }
  }
}
```

### Common Error Codes

- **400**: Bad Request (invalid input)
- **401**: Unauthorized (no token, invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (email/phone already exists)
- **422**: Validation Error
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error

## TypeScript Types

All API types are fully typed. Import from the types file:

```typescript
import type {
  DashboardStats,
  User,
  UserRole,
  UserStatus,
  Escort,
  Payment,
  PaymentType,
  PaymentStatus,
  Withdrawal,
  Referral,
  Review,
  ApiResponse,
  Pagination
} from '@/types/api';
```

### Example Type Usage

```typescript
import type { User, UserRole, UserStatus } from '@/types/api';

const user: User = {
  id: '123',
  email: 'user@example.com',
  phone: '+254712345678',
  role: 'DATING_USER', // Type-safe enum
  status: 'ACTIVE',
  walletBalance: 0,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
};

// Type-safe role checks
const role: UserRole = 'ESCORT'; // Only valid roles allowed
const status: UserStatus = 'SUSPENDED'; // Only valid statuses allowed
```

## React/Next.js Usage Example

### Custom Hook for Dashboard

```typescript
'use client';

import { useState, useEffect } from 'react';
import { adminService, handleApiError } from '@/lib/api';
import type { DashboardStats } from '@/types/api';

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await adminService.getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
}
```

### Using the Hook in a Component

```typescript
'use client';

import { useDashboardStats } from '@/hooks/useDashboardStats';

export default function DashboardPage() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return <div>No data</div>;

  return (
    <div>
      <h1>Total Users: {stats.totalUsers}</h1>
      <h2>Total Revenue: KSh {stats.totalRevenue}</h2>
    </div>
  );
}
```

## Rate Limiting

The API has rate limiting:
- **100 requests per 15 minutes** per IP address

Handle rate limit errors appropriately:

```typescript
import { APIError } from '@/lib/api';

try {
  await adminService.getUsers();
} catch (error) {
  if (error instanceof APIError && error.statusCode === 429) {
    console.log('Rate limit exceeded. Please wait before retrying.');
  }
}
```

## Security Best Practices

1. **Never commit tokens**: Tokens are stored in localStorage, never commit them to version control
2. **Token refresh**: Implement automatic token refresh for long sessions
3. **Secure URLs**: Use HTTPS in production (`https://api.butical.com`)
4. **Error handling**: Never expose sensitive error details to end users
5. **Validation**: Always validate user input before sending to API

## API Structure

```
src/
├── lib/
│   └── api/
│       ├── admin.ts      # Admin service methods
│       ├── auth.ts       # Authentication service
│       ├── client.ts     # HTTP client & error handling
│       ├── config.ts     # API configuration
│       └── index.ts      # Barrel exports
└── types/
    └── api.ts            # TypeScript type definitions
```

## Support

For API issues or questions, refer to the main Butical API documentation or contact the backend team.
