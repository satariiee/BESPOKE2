# Panduan Autentikasi & Autorisasi API

## Overview

API ini menggunakan Laravel Sanctum untuk autentikasi berbasis token. Setiap request harus menyertakan token yang valid untuk mengakses resource yang terlindungi.

## Fitur Autentikasi

### 1. Login

**Endpoint:** `POST /api/login`

**Request:**

```json
{
    "email": "admin@jemaah.com",
    "password": "admin123"
}
```

**Response (Sukses - 200):**

```json
{
    "message": "Login berhasil",
    "data": {
        "user": {
            "id": 1,
            "name": "Administrator",
            "email": "admin@jemaah.com",
            "phone": "081234567890",
            "role": "admin",
            "is_active": true,
            "last_login_at": "2026-04-11T10:30:00.000000Z",
            "created_at": "2026-04-11T10:00:00.000000Z",
            "updated_at": "2026-04-11T10:30:00.000000Z"
        },
        "token": "1|abcdefghijklmnopqrstuvwxyz..."
    }
}
```

**Response (Gagal - 422):**

```json
{
    "message": "Email atau password salah",
    "errors": {
        "email": ["Email atau password tidak sesuai"]
    }
}
```

### 2. Logout

**Endpoint:** `POST /api/logout`

**Headers:** Wajib sertakan Authorization header

```
Authorization: Bearer <token>
```

**Response (Sukses - 200):**

```json
{
    "message": "Logout berhasil"
}
```

### 3. Get Profile

**Endpoint:** `GET /api/profile`

**Headers:**

```
Authorization: Bearer <token>
```

**Response (Sukses - 200):**

```json
{
    "data": {
        "id": 1,
        "name": "Administrator",
        "email": "admin@jemaah.com",
        "phone": "081234567890",
        "role": "admin",
        "is_active": true,
        "last_login_at": "2026-04-11T10:30:00.000000Z",
        "created_at": "2026-04-11T10:00:00.000000Z",
        "updated_at": "2026-04-11T10:30:00.000000Z"
    }
}
```

### 4. Refresh Token

**Endpoint:** `POST /api/refresh-token`

**Headers:**

```
Authorization: Bearer <token>
```

**Response (Sukses - 200):**

```json
{
  "message": "Token berhasil diperbarui",
  "data": {
    "user": { ... },
    "token": "2|new_token_here..."
  }
}
```

## Pembatasan Role (Authorization)

Ada dua role dalam sistem ini:

### Admin

- Dapat mengakses semua resource
- Dapat mengelola user/staff
- Dapat mengakses user management endpoint (`/api/users`)

### Staff

- Tidak dapat mengakses user management
- Dapat mengakses data jemaah, jadwal follow-up, dll
- Terbatas hanya pada data yang relevan

## Struktur Token

Token yang dikirim mengikuti format Bearer token. Setiap token:

- Unik per user per login
- Dapat di-revoke dengan logout
- Dapat diperbaharui dengan refresh-token endpoint
- Tidak memiliki expiration time default (dapat dikonfigurasi)

## Middleware Pembatasan

### 1. auth:sanctum

Memeriksa apakah user sudah login dan memiliki token yang valid.

**Usage di Route:**

```php
Route::middleware('auth:sanctum')->get('/protected', function () {
    // User harus login
});
```

### 2. admin

Memeriksa apakah user memiliki role 'admin'.

**Usage di Route:**

```php
Route::middleware('admin')->get('/admin-only', function () {
    // Hanya admin yang bisa akses
});
```

### 3. staff

Memeriksa apakah user memiliki role 'staff'.

**Usage di Route:**

```php
Route::middleware('staff')->get('/staff-only', function () {
    // Hanya staff yang bisa akses
});
```

### 4. check.role

Middleware fleksibel untuk mengecek multiple roles.

**Usage di Route:**

```php
Route::middleware('check.role:admin,staff')->get('/admin-or-staff', function () {
    // Admin dan staff bisa akses
});
```

## Test Accounts

Untuk pengembangan dan testing, tersedia 2 akun default:

### Admin Account

- Email: `admin@jemaah.com`
- Password: `admin123`
- Role: `admin`

### Staff Account

- Email: `staff@jemaah.com`
- Password: `staff123`
- Role: `staff`

## Error Responses

### 401 Unauthorized

```json
{
    "message": "Unauthenticated",
    "errors": {
        "authorization": ["Unauthorized"]
    }
}
```

**Penyebab:** Token tidak valid atau tidak disertakan.

### 403 Forbidden

```json
{
    "message": "Akses ditolak. Hanya admin yang dapat mengakses resource ini.",
    "errors": {
        "authorization": ["Unauthorized"]
    }
}
```

**Penyebab:** User tidak memiliki role yang diperlukan untuk mengakses resource.

### 422 Unprocessable Entity

```json
{
    "message": "Email atau password salah",
    "errors": {
        "email": ["Email atau password tidak sesuai"]
    }
}
```

**Penyebab:** Invalid login credentials atau validation error.

## Frontend Integration

### Setup Authorization Header

Setelah user login dan mendapatkan token, sertakan token di setiap request:

**JavaScript/Fetch:**

```javascript
const token = localStorage.getItem("api_token");

fetch("http://localhost:8000/api/profile", {
    method: "GET",
    headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    },
})
    .then((response) => response.json())
    .then((data) => console.log(data));
```

**Axios:**

```javascript
import axios from "axios";

const token = localStorage.getItem("api_token");

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    },
});

// Gunakan api instance untuk semua requests
api.get("/profile").then((response) => console.log(response.data));
```

### CORS Configuration

Di `.env`, pastikan frontend URL sudah ditambahkan:

```
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
```

## Database Schema

### personal_access_tokens table

Table yang menyimpan tokens Sanctum:

- `id`: ID token
- `tokenable_type`: Tipe model (App\Models\User)
- `tokenable_id`: ID user
- `name`: Nama token
- `token`: Hash dari token (stored securely)
- `abilities`: JSON array permission (default: ['*'])
- `last_used_at`: Waktu terakhir token digunakan
- `expires_at`: Waktu expiration (optional)
- `created_at`: Waktu pembuatan token

## Security Best Practices

1. **Simpan Token Securely**
    - Gunakan localStorage atau sessionStorage (untuk aplikasi web)
    - Jangan commit token ke repository

2. **HTTPS Only**
    - Selalu gunakan HTTPS di production
    - Set `APP_DEBUG=false` di production

3. **Token Rotation**
    - Refresh token secara berkala menggunakan `/api/refresh-token`
    - Logout ketika user tidak aktif (lama)

4. **Rate Limiting**
    - Implementasikan rate limiting di login endpoint

5. **Password Policy**
    - Enforce strong passwords
    - Minimal 6 karakter (dapat disesuaikan)

## Troubleshooting

### Token tidak valid

- Pastikan token disertakan di header `Authorization: Bearer <token>`
- Cek apakah token sudah di-revoke (logout)
- Refresh token jika sudah lama (optional)

### Akses Forbidden (403)

- Cek role user di `/api/profile`
- Pastikan user memiliki role yang sesuai dengan endpoint yang diakses

### Akses Unauthorized (401)

- Pastikan user sudah login
- Pastikan token valid dan belum expired
- Coba login ulang

## API Endpoints Summary

| Method | Endpoint                | Auth | Role  | Deskripsi                |
| ------ | ----------------------- | ---- | ----- | ------------------------ |
| POST   | `/api/login`            | ❌   | -     | Login user               |
| POST   | `/api/logout`           | ✅   | All   | Logout user              |
| GET    | `/api/profile`          | ✅   | All   | Get current user profile |
| POST   | `/api/refresh-token`    | ✅   | All   | Refresh API token        |
| GET    | `/api/users`            | ✅   | Admin | List all users           |
| POST   | `/api/users`            | ✅   | Admin | Create new user          |
| GET    | `/api/dashboard`        | ✅   | All   | Dashboard data           |
| GET    | `/api/calon-jemaah`     | ✅   | All   | List calon jemaah        |
| POST   | `/api/calon-jemaah`     | ✅   | All   | Create calon jemaah      |
| GET    | `/api/jadwal-follow-up` | ✅   | All   | List jadwal follow-up    |
| POST   | `/api/jadwal-follow-up` | ✅   | All   | Create jadwal follow-up  |
