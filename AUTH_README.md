# Auth Module Documentation

## Cấu trúc

```
src/
├── contexts/
│   └── AuthContext.tsx          # Auth context & provider
├── services/
│   └── auth/
│       └── index.ts              # Auth API service
├── hooks/
│   ├── useAuth.ts                # Auth hooks
│   └── useRole.ts                # Role checking hook
├── components/
│   ├── guards/
│   │   ├── RoleGuard.tsx         # Route guard (auth + role)
│   │   ├── AuthGuard.tsx         # Wrapper (deprecated)
│   │   └── index.ts
│   └── ProtectedRoute/
│       └── index.tsx             # Wrapper (deprecated)
├── types/
│   └── user.ts                   # User & EUserRole types
└── pages/
    └── auth/
        ├── loginPage.tsx         # Login UI
        ├── registerPage.tsx      # Register UI
        ├── verifyEmailPage.tsx   # Email verification UI
        └── forgotPasswordPage.tsx # Forgot password UI
```

## Sử dụng

### 1. Setup Provider (đã setup trong main.tsx)

```tsx
import { AuthProvider } from './contexts/AuthContext';

<AuthProvider>
  <App />
</AuthProvider>
```

### 2. Sử dụng Auth trong component

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Hello {user?.username}</p>
          <p>Role: {user?.role}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={() => login(emailOrUsername, password)}>Login</button>
      )}
    </div>
  );
}
```

### 3. Route Guards (RoleGuard)

```tsx
import RoleGuard from '../components/guards/RoleGuard';
import { EUserRole } from '../types/user';

// Chỉ yêu cầu đăng nhập
<Route 
  path="/profile" 
  element={
    <RoleGuard>
      <ProfilePage />
    </RoleGuard>
  } 
/>

// Yêu cầu role cụ thể (Admin only)
<Route 
  path="/admin/*" 
  element={
    <RoleGuard allowedRoles={[EUserRole.ADMIN]} redirectTo="/">
      <AdminLayout />
    </RoleGuard>
  } 
/>

// Guest only - chỉ cho chưa đăng nhập (redirect nếu đã login)
<Route 
  path="/login" 
  element={
    <RoleGuard guestOnly>
      <LoginPage />
    </RoleGuard>
  } 
/>

// Nhiều role
<Route 
  path="/dashboard" 
  element={
    <RoleGuard allowedRoles={[EUserRole.ADMIN, EUserRole.USER]}>
      <DashboardPage />
    </RoleGuard>
  } 
/>
```

### 4. Role Checking Hook

```tsx
import { useRole } from '../hooks/useRole';
import { EUserRole } from '../types/user';

function MyComponent() {
  const { isAdmin, isUser, hasRole } = useRole();

  return (
    <div>
      {isAdmin && <button>Admin Action</button>}
      {hasRole(EUserRole.ADMIN, EUserRole.USER) && <p>Visible to all logged in</p>}
    </div>
  );
}
```

### 5. Auth Hooks

```tsx
// Lấy thông tin user
import { useAuthUser } from '../hooks/useAuth';
const { user, isLoading, isAuthenticated } = useAuthUser();

// Lấy auth actions
import { useAuthActions } from '../hooks/useAuth';
const { login, register, logout, refreshUser } = useAuthActions();
```

## API Services

### Login (email hoặc username)
```tsx
await login(emailOrUsername, password);
```

### Register
```tsx
await register(name, email, password);
```

### Logout
```tsx
await logout();
```

### Refresh User Data
```tsx
await refreshUser();
```

### Send OTP (xác thực email)
```tsx
await sendOtp(email);
```

### Verify OTP
```tsx
await verifyOtp(email, otp);
```

### Forgot Password
```tsx
await sendResetOtp(email);       // Gửi OTP reset password
await resetPassword(email, otp, newPassword);  // Reset password
```

## Auth State

Context cung cấp:
- `user`: User object hoặc null (bao gồm role)
- `isLoading`: Boolean - đang load user
- `isAuthenticated`: Boolean - user đã đăng nhập
- `login(emailOrUsername, password)`: Function
- `register(name, email, password)`: Function
- `logout()`: Function
- `refreshUser()`: Function

## User Type

```tsx
interface User {
  id: number;
  username: string;
  email: string;
  role?: 'admin' | 'user';
  avatarUrl?: string;
  displayName?: string;
}
```

## Role Constants

```tsx
const EUserRole = {
  ADMIN: 'admin',
  USER: 'user',
} as const;
```

## Token Management

- Token được lưu trong `localStorage` với key `accessToken`
- Refresh token lưu trong HttpOnly cookie
- Tự động attach vào headers trong `axiosCustomize`
- Tự động load user (bao gồm role) khi mount nếu có token
- Tự động clear token khi logout hoặc token invalid

## RoleGuard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | required | Component con |
| `allowedRoles` | EUserRole[] | undefined | Các role được phép (không truyền = chỉ cần đăng nhập) |
| `redirectTo` | string | '/' | Redirect khi không có quyền |
| `guestOnly` | boolean | false | Chỉ cho guest (chưa đăng nhập) |
