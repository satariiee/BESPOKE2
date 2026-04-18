# Frontend Setup & Architecture

## 📁 Struktur Folder

```
frontend/
├── src/
│   ├── app/
│   │   ├── context/
│   │   │   └── AuthContext.tsx         # Global auth state management
│   │   ├── components/
│   │   │   ├── Layout.tsx               # Main layout wrapper
│   │   │   ├── Navbar.tsx               # Header with user menu & logout
│   │   │   ├── Sidebar.tsx              # Navigation with role-based menu
│   │   │   ├── ProtectedRoute.tsx       # Role-based route protection
│   │   │   ├── ui/                      # shadcn/ui components
│   │   │   └── ...other components
│   │   ├── pages/
│   │   │   ├── Login.tsx                # Login page (connected to API)
│   │   │   ├── Dashboard.tsx            # Admin & Staff dashboard
│   │   │   ├── DataCalonJemaah.tsx      # Calon jemaah list
│   │   │   ├── Pengguna.tsx             # User management (Admin only)
│   │   │   └── ...other pages
│   │   ├── lib/
│   │   │   └── api.ts                   # API client with auth support
│   │   ├── routes.tsx                   # Unified routing with role check
│   │   ├── App.tsx                      # App root with AuthProvider
│   │   └── main.tsx
│   └── styles/
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── .env.local                           # Environment variables
```

## 🔐 Authentication Flow

### Login

```
User Input → Login Page → AuthContext.login() → Backend API
  ↓
Token + User stored in localStorage
  ↓
Redirect to Dashboard
```

### Protected Routes

```
ProtectedRoute Component
  ↓
Check if token exists in AuthContext
  ↓
If no auth: Redirect to /login
If auth + role check fails: Show access denied
If auth + role OK: Render component
```

### Logout

```
Click Logout → AuthContext.logout()
  ↓
Call backend logout API
  ↓
Clear token & user from localStorage
  ↓
Redirect to /login
```

## 🎯 Key Features

### 1. AuthContext (`context/AuthContext.tsx`)

Global state management untuk authentication

- `user`: Current user info (name, email, role, etc.)
- `token`: API token
- `isAuthenticated`: Boolean flag
- `login()`: Authenticate user
- `logout()`: Clear auth & redirect
- `refreshToken()`: Renew token

**Usage:**

```typescript
const { user, token, isAuthenticated, login, logout } = useAuth();
```

### 2. ProtectedRoute (`components/ProtectedRoute.tsx`)

Component untuk protect routes berdasarkan authentication & role

**Usage:**

```typescript
// Protected for authenticated users only
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Protected for specific role
<ProtectedRoute requiredRole="admin">
  <UserManagement />
</ProtectedRoute>
```

### 3. Updated Routes (`routes.tsx`)

Satu router terkonsolidasi dengan role-based protection

- `/login` - Public route
- `/` - Protected root layout
- `/pengguna` - Admin only

**Key changes:**

- ❌ Tidak perlu dua router (admin/staff) terpisah
- ✅ Satu routing system dengan conditional rendering
- ✅ Role-based menu visibility di Sidebar
- ✅ Automatic role-based access control

### 4. Enhanced API Client (`lib/api.ts`)

- ✅ Automatic Authorization header untuk semua requests
- ✅ 401 handling - auto logout & redirect
- ✅ Token persistence
- ✅ Type-safe responses

**Features:**

- Gets token dari localStorage
- Add `Authorization: Bearer <token>` ke semua requests
- Handle 401 unauthorized responses
- Type-safe with TypeScript generics

### 5. Updated Navbar (`components/Navbar.tsx`)

- ✅ Show current user info (name, role)
- ✅ Functional logout button
- ✅ User avatar dengan initials
- ✅ Settings link

### 6. Role-Based Sidebar (`components/Sidebar.tsx`)

- ✅ Dynamic menu berdasarkan user role
- ✅ Admin only items (Pengguna/User Management)
- ✅ Common items untuk semua roles
- ✅ Active menu indicator

## 🚀 Setup & Running

### Prerequisites

- Node.js 16+
- npm atau yarn

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Update dengan API URL Anda
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## 🧪 Testing Login Flow

### 1. Start Backend

```bash
cd backend
php artisan serve
```

Backend: http://localhost:8000

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend: http://localhost:5173

### 3. Test Login

1. Go to http://localhost:5173/login
2. Enter credentials:
   - **Admin:** admin@jemaah.com / admin123
   - **Staff:** staff@jemaah.com / staff123
3. Should redirect to dashboard
4. Can see menu items based on role
5. Test logout button

## 📋 Common Tasks

### Add New Protected Route

```typescript
// In routes.tsx
{
  path: "admin-feature",
  Component: () => (
    <ProtectedRoute requiredRole="admin">
      <AdminFeature />
    </ProtectedRoute>
  ),
}
```

### Access Current User

```typescript
import { useAuth } from '@/app/context/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  return <p>Hello {user?.name}</p>;
}
```

### Make API Call with Auth

```typescript
import { getCalonJemaah } from "@/app/lib/api";

const data = await getCalonJemaah();
// Token is automatically included in request
```

### Add Role-Based UI

```typescript
import { useAuth } from '@/app/context/AuthContext';

function MyComponent() {
  const { user } = useAuth();

  return (
    <>
      <p>For everyone</p>
      {user?.role === 'admin' && (
        <p>Admin only content</p>
      )}
    </>
  );
}
```

## 🔄 State Management Flow

```
┌─────────────────────────────────────────────┐
│         App Component (Root)                │
│         ↓ wrapped with AuthProvider         │
│  ┌──────────────────────────────────────┐  │
│  │    AuthContext.Provider              │  │
│  │  ┌─────────────────────────────────┐│  │
│  │  │  RouterProvider with router     ││  │
│  │  │                                  ││  │
│  │  │ ┌──────────────────────────────┐││  │
│  │  │ │ /login → Login Page          │││  │
│  │  │ │ /      → ProtectedRoute      │││  │
│  │  │ │           ├─ Layout          │││  │
│  │  │ │           └─ Pages (+ role)  │││  │
│  │  │ └──────────────────────────────┘││  │
│  │  └─────────────────────────────────┘│  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## 🎨 Component Hierarchy

```
App
├─ AuthProvider
│  └─ RouterProvider
│     ├─ /login
│     │  └─ Login
│     └─ /
│        └─ ProtectedRoute
│           └─ Layout
│              ├─ Navbar (with AuthContext)
│              ├─ Sidebar (role-based menu)
│              └─ Outlet (Pages)
│                 ├─ Dashboard
│                 ├─ DataCalonJemaah
│                 ├─ JadwalFollowUp
│                 └─ ... other pages
```

## 🐛 Troubleshooting

### Issue: 401 Unauthorized after login

**Solution:**

- Check VITE_API_BASE_URL di .env.local
- Verify token in localStorage (F12 > Application > localStorage)
- Verify backend /api/login endpoint works

### Issue: Redirect loop on login

**Solution:**

- Check if login response includes token and user
- Verify localStorage is being set
- Check browser console for errors

### Issue: Menu items not showing for admin

**Solution:**

- Check user.role in localStorage (should be 'admin')
- Verify ProtectedRoute requiredRole prop
- Clear localStorage dan login ulang

### Issue: API calls returning 403

**Solution:**

- Check if user has permission for that endpoint
- Verify role-based middleware di backend
- Check user role matches endpoint requirements

## 📚 Important Files Reference

| File                            | Purpose                         |
| ------------------------------- | ------------------------------- |
| `context/AuthContext.tsx`       | Auth state & logic              |
| `components/ProtectedRoute.tsx` | Route protection                |
| `pages/Login.tsx`               | Login page                      |
| `components/Navbar.tsx`         | Header with logout              |
| `components/Sidebar.tsx`        | Navigation with role-based menu |
| `lib/api.ts`                    | API client with auth            |
| `routes.tsx`                    | Unified routing                 |
| `App.tsx`                       | App root                        |

## 🔗 Integration with Backend

Frontend expects these endpoints:

- `POST /api/login` → Get token
- `POST /api/logout` → Revoke token
- `GET /api/profile` → Get current user
- `POST /api/refresh-token` → Renew token (optional)
- Other resources protected with `Authorization: Bearer <token>`

## ✅ Checklist

- ✅ AuthContext created and working
- ✅ Login page connected to API
- ✅ Protected routes implemented
- ✅ Role-based menu in Sidebar
- ✅ Logout functionality
- ✅ API client with auth headers
- ✅ Single unified router (not separate admin/staff)
- ✅ Environment setup
- ✅ All components cleaned up

## 🎯 Next Steps

1. Test full authentication flow
2. Integrate more API endpoints
3. Add role-based features UI
4. Implement error boundaries
5. Setup token refresh logic (if needed)
6. Add loading states & error handling
7. Setup production deployment

---

**Frontend Status:** ✅ CLEANED UP & READY
**Pattern:** Context + Protected Routes + Role-Based Sidebar
**Single Source of Truth:** AuthContext (not separate admin/staff apps)
