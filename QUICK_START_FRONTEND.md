# Quick Start Guide - Frontend Integration

## 🎯 Setup dalam 5 Menit

### Step 1: Copy API Client (~2 menit)

```bash
# Copy dari root project ke frontend
cp API_CLIENT_EXAMPLE.ts frontend/src/lib/api.ts
```

Update imports di dalam `api.ts` jika path berbeda:

```typescript
// Sesuaikan path import ini dengan struktur project Anda
import axios, { AxiosInstance, AxiosError } from "axios";
```

### Step 2: Setup Environment (~1 menit)

Copy environment template:

```bash
cp FRONTEND_ENV_EXAMPLE frontend/.env.local
```

Update nilai VITE_API_URL sesuai backend Anda:

```
VITE_API_URL=http://localhost:8000/api
```

### Step 3: Create/Update Login Component (~2 menit)

Gunakan `LOGIN_COMPONENT_EXAMPLE.tsx` sebagai referensi untuk membuat halaman login di project Anda.

Key points:

- Import `apiClient` dari lib/api
- Handle submit dengan `apiClient.login()`
- Redirect ke dashboard sesuai role

### Step 4: Protect Routes (~1 menit)

Update routing Anda:

```typescript
// Example di routes.tsx
import { ProtectedRoute } from '@/lib/api';

export const routes = [
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/admin/dashboard',
    element: <ProtectedRoute
      element={<AdminDashboard />}
      requiredRole="admin"
    />
  },
  {
    path: '/staff/dashboard',
    element: <ProtectedRoute
      element={<StaffDashboard />}
      requiredRole="staff"
    />
  }
];
```

## 🧪 Test Manual

Berikut langkah-langkah untuk test authentication secara manual:

### 1. Test Login di Frontend

```typescript
import apiClient from "@/lib/api";

// Di console browser
await apiClient.login({
  email: "admin@jemaah.com",
  password: "admin123",
});
// Seharusnya return user dan token
```

### 2. Test Get Profile

```typescript
await apiClient.getProfile();
// Seharusnya menampilkan user profile
```

### 3. Test Logout

```typescript
await apiClient.logout();
// Token seharusnya di-revoke, localStorage cleared
```

### 4. Test API Calls Dengan Token

```typescript
// Setiap request otomatis include Authorization header
const jemaah = await apiClient.get("/calon-jemaah");
console.log(jemaah);
```

## 🔄 Integration Checklist

- [ ] API Client dipindahkan ke `frontend/src/lib/api.ts`
- [ ] Environment variables sudah di-setup di `.env.local`
- [ ] Login component dibuat/diupdate
- [ ] Routes sudah diproteksi dengan middleware/component
- [ ] Token tersimpan di localStorage
- [ ] Authorization header otomatis ditambahkan ke requests
- [ ] Logout berfungsi dan membersihkan token
- [ ] Redirect berhasil sesuai role user
- [ ] Error handling ditangani dengan baik
- [ ] Manual testing sudah dilakukan ✅

## 📱 Frontend Pages yang Harus Ada

1. **Login Page** (`/login`)
   - Input: email, password
   - Output: token, redirect ke dashboard
   - Error handling untuk invalid credentials

2. **Admin Dashboard** (`/admin/dashboard`)
   - Accessible hanya untuk admin
   - Akses ke `/api/users` endpoint
   - User management features

3. **Staff Dashboard** (`/staff/dashboard`)
   - Accessible untuk staff
   - Tidak bisa akses `/api/users`
   - Limited to assigned data

4. **Navbar/Header**
   - Show current user info
   - Logout button

## 🚨 Common Issues & Solutions

### Issue: 401 Unauthorized

**Solution:**

```typescript
// Pastikan token tersimpan di localStorage
console.log(localStorage.getItem("api_token"));

// Jika kosong, perlu login terlebih dahulu
// Jika ada, pastikan format Authorization header: Bearer <token>
```

### Issue: CORS Error

**Solution:**
Pastikan `.env` backend punya:

```
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
```

Sesuaikan dengan frontend URL Anda.

### Issue: Token tidak automatic di-include

**Solution:**
Pastikan di `api.ts` sudah punya interceptor:

```typescript
this.axiosInstance.interceptors.request.use((config) => {
  if (this.token) {
    config.headers.Authorization = `Bearer ${this.token}`;
  }
  return config;
});
```

### Issue: 403 Forbidden untuk staff

**Solution:**
Ini adalah behavior yang benar! Staff tidak boleh akses `/api/users`. Gunakan route protection:

```typescript
<ProtectedRoute
  element={<UserManagement />}
  requiredRole="admin"
/>
```

## 📦 Dependencies

Pastikan frontend sudah install:

```bash
npm install axios
# atau
yarn add axios
```

## 🚀 Backend Status

- ✅ Sanctum authentication sudah implement dan tested
- ✅ Login/logout endpoints ready
- ✅ Role-based access control ready
- ✅ Test accounts ready:
  - admin@jemaah.com / admin123
  - staff@jemaah.com / staff123

## 💡 Tips

1. **Development**: Gunakan test accounts untuk testing
2. **Token Storage**: Simpan di localStorage untuk convenience (bukan production best practice)
3. **Error Handling**: Always handle 401/403 errors dengan graceful
4. **Auto-refresh**: Considerkan implement auto-refresh token sebelum expiry
5. **Logging**: Log authentication events untuk debugging

---

**Backend API Ready!** 🎉 Tinggal integrasikan dengan frontend.

Jika ada pertanyaan, refer ke:

- `AUTHENTICATION.md` - Detailed API docs
- `API_CLIENT_EXAMPLE.ts` - API client implementation
- `LOGIN_COMPONENT_EXAMPLE.tsx` - Component example
