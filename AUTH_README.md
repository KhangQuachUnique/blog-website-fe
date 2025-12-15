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
│   └── useAuth.ts                # Auth hooks
├── components/
│   └── ProtectedRoute/
│       └── index.tsx             # Protected route component
└── pages/
    └── auth/
        ├── loginPage.tsx         # Login UI
        ├── registerPage.tsx      # Register UI
        └── verifyEmailPage.tsx   # Email verification UI
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
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={() => login(email, password)}>Login</button>
      )}
    </div>
  );
}
```

### 3. Protected Routes

```tsx
import { ProtectedRoute } from '../components/ProtectedRoute';

// Route yêu cầu đăng nhập
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>

// Route chỉ cho user chưa đăng nhập (redirect nếu đã login)
<Route 
  path="/login" 
  element={
    <ProtectedRoute requireAuth={false} redirectTo="/">
      <LoginPage />
    </ProtectedRoute>
  } 
/>
```

### 4. Auth Hooks

```tsx
// Lấy thông tin user
import { useAuthUser } from '../hooks/useAuth';
const { user, isLoading, isAuthenticated } = useAuthUser();

// Lấy auth actions
import { useAuthActions } from '../hooks/useAuth';
const { login, register, logout, refreshUser } = useAuthActions();
```

## API Services

### Login
```tsx
await login(email, password);
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

## Auth State

Context cung cấp:
- `user`: User object hoặc null
- `isLoading`: Boolean - đang load user
- `isAuthenticated`: Boolean - user đã đăng nhập
- `login(email, password)`: Function
- `register(name, email, password)`: Function
- `logout()`: Function
- `refreshUser()`: Function

## Token Management

- Token được lưu trong `localStorage` với key `accessToken`
- Tự động attach vào headers trong `axiosCustomize`
- Tự động load user khi mount nếu có token
- Tự động clear token khi logout hoặc token invalid
