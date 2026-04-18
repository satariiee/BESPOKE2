# Frontend Cleanup & Migration Guide

## ✅ What Was Improved

### Problem: Routing Architecture

**Before:**

- Two separate routers (admin & staff)
- Duplicate code and components
- Hard to manage role-based access
- frontend/src && frontend-staff/src (two apps)

**After:**

- Single unified router with role-based protection
- ProtectedRoute component handles role checks
- Dynamic Sidebar menu based on user role
- One app, one codebase

### Problem: Authentication

**Before:**

- Login was dummy/placeholder (no backend integration)
- No token management
- No global auth state

**After:**

- AuthContext for global state management
- Login connected to backend API (Sanctum)
- Automatic token injection in API calls
- Role-based access control

### Problem: Routing Logic

**Before:**

- No separation of concerns
- Menu showed all items to all roles
- Routes weren't protected
- Logout wasn't implemented

**After:**

- ProtectedRoute component for route protection
- Sidebar conditionally shows menu items based on role
- Admin menu only visible to admin users
- Functional logout with backend sync

## 📋 Files Changed/Created

### New Files Created

```
frontend/src/app/
├── context/
│   └── AuthContext.tsx                    # ✨ NEW - Global auth state
└── components/
    └── ProtectedRoute.tsx                 # ✨ NEW - Route protection
```

### Files Updated

| File                     | Changes                                                   |
| ------------------------ | --------------------------------------------------------- |
| `App.tsx`                | Removed staffRouter, added AuthProvider                   |
| `routes.tsx`             | Single router with ProtectedRoute, admin route protection |
| `pages/Login.tsx`        | Connected to backend API, real login logic                |
| `components/Navbar.tsx`  | Show current user, functional logout                      |
| `components/Sidebar.tsx` | Role-based menu items                                     |
| `lib/api.ts`             | Auto Bearer token injection, 401 handling                 |

### Files to Consider Removing

```
❌ frontend-staff/                         # Old staff app (no longer needed)
❌ src/staff/                              # Old staff routes
❌ src/staff/routes.tsx                    # Old staff router
❌ src/staff/components/                   # Old staff components
❌ src/staff/pages/                        # Old staff pages
```

## 🔄 Migration Checklist

If you had customizations in the old staff folder:

- [ ] Copy any custom staff components to `frontend/src/app/components/`
- [ ] Copy any custom staff pages to `frontend/src/app/pages/`
- [ ] Update any custom routes in `routes.tsx` with `ProtectedRoute`
- [ ] Update imports to use new context/paths
- [ ] Test all routes with both admin and staff accounts
- [ ] Remove old staff folder after verification

## 📁 Old Structure (Before)

```
frontend/
├── src/
│   ├── app/                    # Admin app
│   │   ├── pages/
│   │   ├── components/
│   │   ├── routes.tsx
│   │   └── App.tsx
│   └── staff/                  # Staff app (duplicate)
│       ├── pages/
│       ├── components/
│       ├── routes.tsx
│       └── App.tsx
└── ...

frontend-staff/                 # Separate app (now not needed)
├── src/
│   ├── app/
│   │   ├── pages/
│   │   └── components/
│   └── pages/
└── ...
```

## 📁 New Structure (After)

```
frontend/
├── src/
│   ├── app/
│   │   ├── context/            # ✨ NEW
│   │   │   └── AuthContext.tsx
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx  # ✨ NEW
│   │   │   ├── Layout.tsx
│   │   │   ├── Navbar.tsx       # Updated
│   │   │   ├── Sidebar.tsx      # Updated
│   │   │   └── ...
│   │   ├── pages/               # Props sama untuk admin & staff
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DataCalonJemaah.tsx
│   │   │   ├── Pengguna.tsx     # Admin only
│   │   │   ├── Login.tsx        # Updated
│   │   │   └── ...
│   │   ├── lib/
│   │   │   └── api.ts           # Updated
│   │   ├── routes.tsx           # Updated
│   │   ├── App.tsx              # Updated
│   │   └── main.tsx
│   └── styles/
└── ...

❌ frontend-staff/              # REMOVE after migration
❌ src/staff/                   # REMOVE after migration
```

## 🎯 Key Improvements

### 1. Authorization is Declarative

```typescript
// Before: Routes open to everyone, no protection
<Route path="/pengguna" element={<Pengguna />} />

// After: Clear role requirement
<Route path="/pengguna"
  element={<ProtectedRoute requiredRole="admin"><Pengguna /></ProtectedRoute>}
/>
```

### 2. State Management is Centralized

```typescript
// Before: Each app had its own auth state
// After: Single AuthContext for both apps
const { user, token, isAuthenticated } = useAuth();
```

### 3. Menu is Dynamic

```typescript
// Before: Same menu for everyone
const menuItems = [{ label: "Pengguna", ... }];

// After: Menu adapts to user role
const adminMenuItems = [{ label: "Pengguna", ... }];
{user?.role === 'admin' && adminMenuItems}
```

### 4. API Calls are Automatic

```typescript
// Before: Manual token injection
headers: {
  Authorization: `Bearer ${token}`;
}

// After: Automatic in api.ts
// Just call: getCalonJemaah()
```

## 🚀 Testing After Migration

### Login Flow Test

```bash
npm run dev
# Visit http://localhost:5173/login

# Login as admin@jemaah.com / admin123
# Should see: Dashboard + "Pengguna" menu

# Logout and login as staff@jemaah.com / staff123
# Should see: Dashboard only, NO "Pengguna" menu
```

### Protected Route Test

```bash
# As staff user, try accessing /pengguna
# Should show "Akses Ditolak"

# As admin user, should access /pengguna
# Should work normally
```

### API Call Test

```typescript
// In browser console
const data = await getCalonJemaah();
console.log(data);
// Should work with automatic auth header
```

## 📝 Notes

1. **Token Persistence**: Token is stored in localStorage
   - Survives page refresh
   - Cleared on logout
   - Can be cleared manually in DevTools

2. **Auto 401 Handling**: When token expires (401)
   - Automatically redirects to /login
   - Clears token from localStorage
   - User can login again

3. **Role-Based Access**: Checked in two places
   - ProtectedRoute component (frontend protection)
   - Backend middleware (backend protection)
   - Both required for complete security

4. **UI Adaptation**: Multiple ways to hide UI
   - ProtectedRoute for routes
   - useAuth hook for component content
   - Sidebar dynamic menu items
   - Choose based on use case

## ⚠️ Common Pitfalls to Avoid

❌ **Don't hardcode roles in component render**

```typescript
// Bad - hardcoded
if (user.role === 'admin') { ... }

// Good - use ProtectedRoute for routes
// or make it configurable for components
```

❌ **Don't store sensitive data in localStorage**

```typescript
// Bad
localStorage.setItem("user_id", userData.id);

// Good - only store token, get user from API
localStorage.setItem("api_token", token);
```

❌ **Don't skip backend authorization**

```typescript
// Bad - only frontend check
<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>

// Good - both frontend AND backend check
// Frontend prevents UI access
// Backend prevents API access
```

## ✅ Verification Checklist

- ✅ AuthContext created and working
- ✅ Login page connected to backend
- ✅ Logout functional
- ✅ Protected routes implemented
- ✅ Role-based menu working
- ✅ API client with auto auth headers
- ✅ Single router (not two)
- ✅ Build successful
- ✅ No TypeScript errors
- ✅ Navbar shows current user
- ✅ Sidebar adapts to role

## 📚 Documentation Files

- `FRONTEND_SETUP.md` - Architecture & setup guide
- `AUTHENTICATION.md` - Auth API documentation (in backend)
- `API_CLIENT_EXAMPLE.ts` - Example client implementation (in root)
- `LOGIN_COMPONENT_EXAMPLE.tsx` - Example component (in root)

## 🎓 Learning Resources

- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- [React Router Protected Routes](https://reactrouter.com/en/main/start/concepts)
- [TypeScript in React](https://react-typescript-cheatsheet.netlify.app/)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)

## 🔗 Related Documentation

- Backend Setup: `/backend/SETUP_SUMMARY.md`
- Authentication: `/backend/AUTHENTICATION.md`
- API Examples: `/API_CLIENT_EXAMPLE.ts`

---

**Migration Status:** ✅ COMPLETE
**Architecture:** Single App + Role-Based Access Control
**Auth Pattern:** Context API + ProtectedRoute
**Next Step:** Test with backend API
