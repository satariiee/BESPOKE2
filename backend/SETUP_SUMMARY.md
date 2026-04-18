# Setup Autentikasi Sanctum - Ringkasan Implementasi

## ✅ Apa yang Telah Diimplementasikan

### 1. **Laravel Sanctum Installation**

- ✅ Installed `laravel/sanctum` package
- ✅ Published Sanctum configuration (`config/sanctum.php`)
- ✅ Created `personal_access_tokens` table via migration
- ✅ Updated User model dengan `HasApiTokens` trait

### 2. **Authentication Endpoints**

```
POST   /api/login              - Login dan dapatkan token
POST   /api/logout             - Logout dan revoke token
GET    /api/profile            - Get current user profile
POST   /api/refresh-token      - Refresh API token
```

### 3. **Authorization Middleware**

TERSEDIA middleware berikut:

- `auth:sanctum` - Cek apakah user sudah authenticated
- `admin` - Hanya admin yang bisa akses
- `staff` - Hanya staff yang bisa akses
- `check.role:admin,staff` - Flexible role checking

### 4. **API Route Protection**

```php
// Public routes
POST /api/login              # No authentication needed

// Protected routes (auth:sanctum required)
POST /api/logout
GET  /api/profile
POST /api/refresh-token

// Admin only
GET   /api/users            # List users
POST  /api/users            # Create user
GET   /api/users/{id}       # View user
PUT   /api/users/{id}       # Update user
DELETE /api/users/{id}      # Delete user

// Accessible to all authenticated users
GET   /api/dashboard
GET   /api/activity-log
POST  /api/calon-jemaah
PUT   /api/calon-jemaah/{id}
// ... dan seterusnya
```

### 5. **Test Accounts**

Dua akun test sudah dibuat via seeder:

**Admin Account:**

- Email: `admin@jemaah.com`
- Password: `admin123`
- Role: `admin`

**Staff Account:**

- Email: `staff@jemaah.com`
- Password: `staff123`
- Role: `staff`

### 6. **Test Coverage**

✅ Semua authentication flows di-test dengan automated tests:

- User login dengan credentials valid
- User tidak bisa login dengan email tidak valid
- User tidak bisa login dengan password salah
- User tidak aktif tidak bisa login
- User bisa logout
- User bisa get profile
- User tidak bisa akses protected route tanpa token
- Admin bisa akses user management
- Staff tidak bisa akses user management
- User bisa refresh token

**Status:** 10/10 tests PASSING ✅

### 7. **Configuration Updates**

- ✅ `config/auth.php` - Added sanctum guard
- ✅ `bootstrap/app.php` - Registered middleware aliases
- ✅ `.env` - Added SANCTUM_STATEFUL_DOMAINS configuration
- ✅ `routes/api.php` - Protected routes dengan proper middleware

### 8. **Code Files Created**

1. `app/Http/Controllers/Api/AuthController.php` - Authentication controller
2. `app/Http/Requests/LoginRequest.php` - Login request validation
3. `app/Http/Resources/UserResource.php` - User API resource
4. `app/Http/Middleware/IsAdmin.php` - Admin role middleware
5. `app/Http/Middleware/IsStaff.php` - Staff role middleware
6. `app/Http/Middleware/CheckRole.php` - Generic role checking middleware
7. `database/seeders/UserSeeder.php` - Seed test users
8. `tests/Feature/Auth/AuthenticationTest.php` - Comprehensive tests

### 9. **Documentation Files**

1. `AUTHENTICATION.md` - Detailed API documentation
2. `API_CLIENT_EXAMPLE.ts` - Frontend API client example
3. `LOGIN_COMPONENT_EXAMPLE.tsx` - Example login component
4. `FRONTEND_ENV_EXAMPLE` - Frontend environment configuration

## 🚀 Cara Menggunakan

### Backend (API) - Testing Endpoints

1. **Login:**

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@jemaah.com",
    "password": "admin123"
  }'
```

Response:

```json
{
  "message": "Login berhasil",
  "data": {
    "user": { ... },
    "token": "1|abcdefghijklmnopqrstuvwxyz..."
  }
}
```

2. **Get Profile (dengan token):**

```bash
curl -X GET http://localhost:8000/api/profile \
  -H "Authorization: Bearer 1|abcdefghijklmnopqrstuvwxyz..."
```

3. **Logout:**

```bash
curl -X POST http://localhost:8000/api/logout \
  -H "Authorization: Bearer 1|abcdefghijklmnopqrstuvwxyz..."
```

### Frontend Integration

1. **Copy API Client File**
    - Copy `API_CLIENT_EXAMPLE.ts` → `frontend/src/lib/api.ts`
    - Sesuaikan path imports

2. **Setup Environment**
    - Copy `FRONTEND_ENV_EXAMPLE` → `frontend/.env.local`
    - Update dengan API URL yang benar

3. **Create Login Page**
    - Gunakan `LOGIN_COMPONENT_EXAMPLE.tsx` sebagai referensi
    - Integrate dengan `apiClient` yang sudah di-setup

4. **Protect Routes**
    - Gunakan `ProtectedRoute` component untuk protect routes
    - Cek user role sesuai kebutuhan

## 📋 Checklist - Next Steps

- [ ] Copy API client example ke frontend
- [ ] Setup environment variables di frontend
- [ ] Buat login page
- [ ] Setup route protection di frontend
- [ ] Integrate login flow ke dalam app
- [ ] Test end-to-end login/logout
- [ ] Setup token refresh logic (optional)
- [ ] Setup error handling untuk expired tokens
- [ ] Test dengan multiple concurrent users
- [ ] Test dengan role-based access

## 🔐 Security Considerations

1. **Token Storage**
    - Gunakan localStorage atau sessionStorage untuk development
    - Untuk production, pertimbangkan secure httpOnly cookies

2. **HTTPS in Production**
    - Selalu gunakan HTTPS di production
    - Set `APP_DEBUG=false` di production

3. **CORS Configuration**
    - Update `SANCTUM_STATEFUL_DOMAINS` di .env
    - Match dengan frontend domain Anda

4. **Rate Limiting**
    - Pertimbangkan menambahkan rate limiting di login endpoint
    - Cegah brute force attacks

5. **Token Expiration** (Optional)
    - Saat ini tokens tidak expire
    - Untuk production, pertimbangkan set SANCTUM_EXPIRATION

## 📚 Files Reference

### Backend Files

| File                                          | Purpose                      |
| --------------------------------------------- | ---------------------------- |
| `app/Http/Controllers/Api/AuthController.php` | Login/logout logic           |
| `app/Http/Middleware/IsAdmin.php`             | Admin authorization          |
| `app/Http/Middleware/IsStaff.php`             | Staff authorization          |
| `app/Http/Middleware/CheckRole.php`           | Generic role checking        |
| `app/Http/Requests/LoginRequest.php`          | Login validation             |
| `app/Http/Resources/UserResource.php`         | API response formatting      |
| `config/sanctum.php`                          | Sanctum configuration        |
| `config/auth.php`                             | Authentication configuration |
| `.env`                                        | Environment variables        |
| `routes/api.php`                              | API route definitions        |
| `database/seeders/UserSeeder.php`             | Test data                    |
| `AUTHENTICATION.md`                           | Full API documentation       |

### Frontend References

| File                          | Purpose                   |
| ----------------------------- | ------------------------- |
| `API_CLIENT_EXAMPLE.ts`       | API client implementation |
| `LOGIN_COMPONENT_EXAMPLE.tsx` | Example login component   |
| `FRONTEND_ENV_EXAMPLE`        | Frontend .env template    |

## 🧪 Running Tests

```bash
# Run authentication tests
php artisan test tests/Feature/Auth/AuthenticationTest.php

# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage
```

## 🔧 Troubleshooting

### 401 Unauthorized

- Pastikan token disertakan di header: `Authorization: Bearer <token>`
- Cek apakah token sudah di-revoke (logout)
- Refresh token menggunakan `/api/refresh-token`

### 403 Forbidden

- Cek user role dari `/api/profile`
- Pastikan endpoint memiliki middleware yang sesuai
- Verify permission pada database

### CORS Error (Frontend)

- Update `SANCTUM_STATEFUL_DOMAINS` di .env
- Pastikan frontend URL sudah ditambahkan
- Restart Laravel server

### Database Errors

- Run migrations: `php artisan migrate`
- Clear cache: `php artisan config:cache`
- seed tes users: `php artisan db:seed --class=UserSeeder`

## 📞 Support

Untuk pertanyaan atau issues:

1. Cek logs di `storage/logs/laravel.log`
2. Baca dokumentasi di `AUTHENTICATION.md`
3. Review test file di `tests/Feature/Auth/AuthenticationTest.php`
4. Cek API client example di `API_CLIENT_EXAMPLE.ts`

---

**Status:** ✅ COMPLETE & TESTED
**Last Updated:** 2026-04-11
**Laravel Version:** 11.31
**Sanctum Version:** 4.3.1
