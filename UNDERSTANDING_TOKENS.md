# Memahami TOKEN dalam Sistem - Penjelasan Lengkap

**Tanggal:** April 18, 2026

---

## 🎯 Apa Itu TOKEN?

Token adalah **kunci digital yang membuktikan identitas user** setelah login.

### Analogi Dunia Nyata:

```
Tanpa Token:
├─ User: "Halo, saya admin"
└─ Backend: "Siapa tahu? Siapa aja bisa bilang begitu!"
   ❌ Tidak aman

Dengan Token:
├─ User LOGIN dulu
├─ Backend: "OK, anda admin. Ini token khusus anda" 
│  (memberikan kartu ID digital)
├─ User: "Halo, saya admin. Ini token saya" 
│  (menunjukkan kartu ID)
└─ Backend: "OK, saya percaya. Silakan lanjut"
   ✅ Aman
```

---

## 🔐 Fungsi Token di Sistem Ini

### **Fungsi Utama:**

#### 1. **Authentikasi (Pembuktian Identitas)**
```
Tanpa token di setiap request:
1. User login → Backend terima username/password
2. Validasi di database
3. ✅ User login berhasil
4. User request jemaah list?
   └─ Backend: "Siapa kamu?" 
   └─ Perlu login lagi!
   ❌ User frustasi

Dengan token:
1. User login → Dapat token
2. Setiap request ke endpoint:
   └─ User kirim: Authorization: Bearer TOKEN
   └─ Backend Cek: "Token ini valid? User siapa?"
   └─ Backend find user dari token
   ✅ Lancar!
```

#### 2. **Authorization (Pengecekan Hak Akses)**
```
Request tanpa token:
GET /api/pengguna (admin only)
└─ Backend: "Siapa kamu? Tidak tahu role apa"
└─ Return 401 Unauthorized

Request dengan token:
GET /api/pengguna
Authorization: Bearer TOKEN_ADMIN
└─ Backend: "Token ini milik user ID 1"
└─ Query users: SELECT role FROM users WHERE id=1
└─ Role = "admin" ✅
└─ Return data pengguna

Request dengan token (staff):
GET /api/pengguna
Authorization: Bearer TOKEN_STAFF
└─ Backend: "Token ini milik user ID 2"
└─ Query users: SELECT role FROM users WHERE id=2
└─ Role = "staff" ✅
└─ Tapi /pengguna admin only!
└─ Return 403 Forbidden ❌
```

#### 3. **Session Management (Mengelola Sesi User)**
```
Tanpa token:
├─ User 1 login
├─ User 2 login
├─ Background: Siapa yang sedang online?
├─ Berapa lama session mereka?
└─ ❌ Sulit ditrack

Dengan token:
├─ User 1 login → Token A (expiry 24 jam)
├─ User 2 login → Token B (expiry 24 jam)
├─ Database track: Token A milik user 1, Token B milik user 2
├─ Ketika token expired → User harus login lagi
└─ ✅ Sesi terkelola baik
```

#### 4. **Security (Keamanan)**
```
Token melindungi dari:

1. Session Hijacking:
   ├─ Tanpa token, browser store session cookie
   ├─ Hacker bisa steal cookie → jadi kamu!
   ├─ Dengan token, hanya punya password yang aman
   └─ Hacker sulit ngakses

2. CSRF (Cross-Site Request Forgery):
   ├─ Hacker buat website palsu
   ├─ Tarik user ke website palsu
   ├─ Website palsu kirim request ke bank kami
   ├─ Tanpa token: Cookie otomatis terkirim ❌
   ├─ Dengan token: Token tidak di-send otomatis ✅
   └─ Perlu explicit header dari app

3. Unauthorized Access:
   ├─ Token ada expiry time
   ├─ Token bisa di-revoke kapan saja
   ├─ Jika user logout, token langsung delete
   └─ Beda dengan session yang bisa "tertinggal"
```

---

## 🔄 Lifecycle TOKEN - Dari Mula Sampai Akhir

### **Tahap 1: Token Dibuat (saat Login)**

```
┌─────────────────────────────────────────────────────────┐
│ Frontend (Browser)                                       │
└─────────────────────────────────────────────────────────┘
            ↓ POST /api/login
            │ { "email": "admin@jemaah.com", "password": "..." }
            ↓
┌─────────────────────────────────────────────────────────┐
│ Backend (Laravel)                                        │
│ 1. Terima request                                        │
│ 2. Query: SELECT * FROM users WHERE email = '...'       │
│ 3. Verify password                                       │
│ 4. ✅ Valid! Now create token:                          │
│                                                          │
│    $token = $user->createToken('api_token')->plainText  │
│    // Result: "eyJhbGciqKHIyJH...a_very_long_string"   │
│                                                          │
│ 5. Laravel Sanctum:                                      │
│    INSERT INTO personal_access_tokens (                 │
│      tokenable_id: 1,                                    │
│      tokenable_type: 'App\Models\User',                 │
│      token: hash('sha256', token),                       │
│      created_at: NOW()                                   │
│    )                                                     │
└─────────────────────────────────────────────────────────┘
            ↓ HTTP 200 OK
            │ {
            │   "user": { "id": 1, "name": "Admin", ... },
            │   "token": "eyJhbGciqKHIyJH..."
            │ }
            ↓
┌─────────────────────────────────────────────────────────┐
│ Frontend (Browser)                                       │
│ 1. Terima token                                          │
│ 2. localStorage.setItem('api_token', token)             │
│ 3. useState(token) di AuthContext                       │
│ 4. State: isAuthenticated = true                        │
│ 5. Navigate ke Dashboard                                │
└─────────────────────────────────────────────────────────┘
```

---

### **Tahap 2: Token Digunakan (di setiap API request)**

```
┌─────────────────────────────────────────────────────────┐
│ Frontend (Browser) - User klik "Lihat Jemaah"           │
│ 1. React component mount                                │
│ 2. useEffect(() => {                                    │
│      const token = localStorage.getItem('api_token')    │
│      fetch('/api/calon-jemaah', {                       │
│        headers: {                                        │
│          'Authorization': `Bearer ${token}`,            │
│          'Content-Type': 'application/json'             │
│        }                                                 │
│      })                                                  │
│    })                                                    │
│                                                          │
│    // Token = "eyJhbGciqKHIyJH..."                      │
└─────────────────────────────────────────────────────────┘
            ↓ GET /api/calon-jemaah
            │ Headers: Authorization: Bearer eyJhbGciqKHIyJH...
            ↓
┌─────────────────────────────────────────────────────────┐
│ Backend (Laravel) - Middleware verify token             │
│ 1. Terima request dengan header Authorization           │
│ 2. Extract token dari header:                           │
│    Authorization: Bearer eyJhbGciqKHIyJH...             │
│    → token = "eyJhbGciqKHIyJH..."                       │
│                                                          │
│ 3. Hash token:                                          │
│    hashedToken = hash('sha256', token)                  │
│                                                          │
│ 4. Query database:                                      │
│    SELECT * FROM personal_access_tokens                │
│    WHERE token = 'hashedToken' LIMIT 1                 │
│                                                          │
│    Result: Found! Token milik user_id = 1              │
│                                                          │
│ 5. Get user dari token:                                │
│    user = User::find(1)                                │
│    → User: id=1, name="Admin", role="admin"            │
│                                                          │
│ 6. Attach user ke request:                             │
│    $request->user = $user                              │
│                                                          │
│ 7. ✅ Token VALID! Lanjut ke controller                │
└─────────────────────────────────────────────────────────┘
            ↓ GET request proceed
            │
      ┌─────────────────────────┐
      │ Check Authorization:    │
      │ Hanya admin & staff      │
      │ $user->role = "admin"   │
      │ ✅ AUTHORIZED           │
      └─────────────────────────┘
            ↓
      ┌─────────────────────────┐
      │ Query Database:         │
      │ SELECT * FROM           │
      │ calon_jemaah            │
      └─────────────────────────┘
            ↓ HTTP 200 OK
            │ [ { jemaah data }, ... ]
            ↓
┌─────────────────────────────────────────────────────────┐
│ Frontend (Browser)                                       │
│ 1. Terima response                                       │
│ 2. setState(jemaahList)                                 │
│ 3. Render table dengan data jemaah                      │
└─────────────────────────────────────────────────────────┘
```

---

### **Tahap 3: Token Di-Revoke (saat Logout)**

```
┌─────────────────────────────────────────────────────────┐
│ Frontend (Browser) - User klik "Logout"                 │
│ 1. Ambil token dari localStorage:                       │
│    token = localStorage.getItem('api_token')            │
│ 2. POST ke /api/logout                                  │
│    Headers: Authorization: Bearer ${token}              │
└─────────────────────────────────────────────────────────┘
            ↓ POST /api/logout
            │ Authorization: Bearer eyJhbGciqKHIyJH...
            ↓
┌─────────────────────────────────────────────────────────┐
│ Backend (Laravel)                                        │
│ 1. Terima logout request                                │
│ 2. Verify token (sama seperti GET request)              │
│    → User found: id=1                                    │
│ 3. REVOKE token:                                        │
│                                                          │
│    Auth::user()->currentAccessToken()->delete()         │
│    // Atau:                                             │
│    DELETE FROM personal_access_tokens                   │
│    WHERE id = (token_id yang sesuai)                    │
│                                                          │
│ 4. ✅ Token deleted dari database                       │
│ 5. Return HTTP 200 OK                                   │
└─────────────────────────────────────────────────────────┘
            ↓ HTTP 200 OK
            │ { "message": "Logged out" }
            ↓
┌─────────────────────────────────────────────────────────┐
│ Frontend (Browser)                                       │
│ 1. Terima response                                       │
│ 2. localStorage.removeItem('api_token')                 │
│ 3. setAuth({ token: null, isAuth: false })             │
│ 4. navigate('/login')                                   │
│ 5. Login page displayed                                 │
└─────────────────────────────────────────────────────────┘
```

---

### **Tahap 4: Token Expired atau Invalid**

```
SKENARIO 1: User coba akses dengan token expired

┌─────────────────────────────────────────────────────────┐
│ Frontend (Browser)                                       │
│ 1. localStorage masih ada token lama                     │
│ 2. POST request dengan token lama:                       │
│    Authorization: Bearer eyJhbGciExpiredToken...         │
└─────────────────────────────────────────────────────────┘
            ↓ GET /api/jemaah
            │ Authorization: Bearer EXPIRED_TOKEN
            ↓
┌─────────────────────────────────────────────────────────┐
│ Backend (Laravel)                                        │
│ 1. Extract & hash token                                 │
│ 2. Query: SELECT * FROM personal_access_tokens          │
│    WHERE token = 'hashedExpiredToken'                   │
│                                                          │
│ 3. Result: NOT FOUND ❌                                 │
│    (token sudah expired & di-delete)                    │
│                                                          │
│ 4. Throw exception: Unauthenticated                      │
│ 5. Return HTTP 401 Unauthorized                         │
└─────────────────────────────────────────────────────────┘
            ↓ HTTP 401 Unauthorized
            │ { "error": "Unauthenticated" }
            ↓
┌─────────────────────────────────────────────────────────┐
│ Frontend (Browser)                                       │
│ 1. Catch 401 error                                       │
│ 2. localStorage.removeItem('api_token')                 │
│ 3. setAuth({ token: null })                             │
│ 4. navigate('/login')                                    │
│ 5. Show message: "Session expired, please login"        │
└─────────────────────────────────────────────────────────┘
```

```
SKENARIO 2: User try different token (hacker)

┌─────────────────────────────────────────────────────────┐
│ Hacker (Attack)                                          │
│ 1. Buat random token string                              │
│ 2. POST request dengan fake token:                       │
│    Authorization: Bearer FAKE_RANDOM_TOKEN               │
└─────────────────────────────────────────────────────────┘
            ↓ GET /api/jemaah
            │ Authorization: Bearer FAKE_RANDOM_TOKEN
            ↓
┌─────────────────────────────────────────────────────────┐
│ Backend (Laravel)                                        │
│ 1. Extract token: "FAKE_RANDOM_TOKEN"                   │
│ 2. Hash token                                            │
│ 3. Query: SELECT * FROM personal_access_tokens          │
│    WHERE token = 'HASHED_FAKE_TOKEN'                    │
│                                                          │
│ 4. Result: NOT FOUND ❌                                 │
│    (token tidak pernah ada di DB)                       │
│                                                          │
│ 5. Return HTTP 401 Unauthorized                         │
│ 6. Log: Suspicious activity detected                    │
└─────────────────────────────────────────────────────────┘
            ↓ HTTP 401 Unauthorized
            │ Access denied!
            ↓
┌─────────────────────────────────────────────────────────┐
│ Hacker (Failed Attack)                                   │
│ ❌ Cannot access data                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Diagram Token Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ LOGIN FLOW                                                       │
└─────────────────────────────────────────────────────────────────┘

  Frontend                    Backend               Database
     │                           │                      │
     │  POST /api/login          │                      │
     │  {email, password}        │                      │
     ├──────────────────────────→│                      │
     │                           │  Query user by email │
     │                           ├─────────────────────→│
     │                           │←─────────────────────┤
     │                           │  { user data }       │
     │                           │                      │
     │                           │  Verify password ✓   │
     │                           │                      │
     │                           │  CREATE TOKEN        │
     │                           │  "eyJhb..."         │
     │                           │                      │
     │                           │  INSERT token to DB │
     │                           ├─────────────────────→│
     │                           │←─────────────────────┤
     │                           │  Token saved ✓       │
     │                           │                      │
     │←──────────────────────────┤                      │
     │  200 OK + token           │                      │
     │  { user, token }          │                      │
     │                           │                      │
     │  localStorage.setItem     │                      │
     │  ('api_token', token)     │                      │
     │                           │                      │

┌─────────────────────────────────────────────────────────────────┐
│ AUTHENTICATED REQUEST FLOW                                       │
└─────────────────────────────────────────────────────────────────┘

  Frontend                    Backend               Database
     │                           │                      │
     │  GET /api/jemaah          │                      │
     │  Headers:                 │                      │
     │  Authorization: Bearer    │                      │
     │  "eyJhb..."              │                      │
     ├──────────────────────────→│                      │
     │                           │  VERIFY TOKEN        │
     │                           │  Extract & hash      │
     │                           │                      │
     │                           │  Query token from DB │
     │                           ├─────────────────────→│
     │                           │←─────────────────────┤
     │                           │  Token found! ✓      │
     │                           │  user_id = 1         │
     │                           │                      │
     │                           │  Get user data       │
     │                           ├─────────────────────→│
     │                           │←─────────────────────┤
     │                           │  { user with role }  │
     │                           │                      │
     │                           │  CHECK ROLE          │
     │                           │  role = "admin" ✓    │
     │                           │                      │
     │                           │  Query jemaah        │
     │                           ├─────────────────────→│
     │                           │←─────────────────────┤
     │                           │  [ jemaah list ]     │
     │                           │                      │
     │←──────────────────────────┤                      │
     │  200 OK + data            │                      │
     │                           │                      │

┌─────────────────────────────────────────────────────────────────┐
│ LOGOUT FLOW                                                      │
└─────────────────────────────────────────────────────────────────┘

  Frontend                    Backend               Database
     │                           │                      │
     │  POST /api/logout         │                      │
     │  Headers:                 │                      │
     │  Authorization: Bearer    │                      │
     │  "eyJhb..."              │                      │
     ├──────────────────────────→│                      │
     │                           │  VERIFY TOKEN        │
     │                           │  (same as request)   │
     │                           │                      │
     │                           │ REVOKE TOKEN         │
     │                           │ DELETE from DB       │
     │                           ├─────────────────────→│
     │                           │←─────────────────────┤
     │                           │ Token deleted ✓      │
     │                           │                      │
     │←──────────────────────────┤                      │
     │  200 OK + message         │                      │
     │  "Logged out"             │                      │
     │                           │                      │
     │  localStorage.removeItem  │                      │
     │  ('api_token')            │                      │
     │  navigate('/login')       │                      │
     │                           │                      │
```

---

## 🔒 Token Structure - Apa Isinya?

### **Token di /api/login Response:**

```json
// Response dari backend:
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@jemaah.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
  }
}
```

### **Token Format (JWT - JSON Web Token):**

```
Token terdiri dari 3 bagian dipisahkan dengan titik (.)
TOKEN = HEADER.PAYLOAD.SIGNATURE

┌─────────────────────────────────────────────────┐ 
│ HEADER (Base64URL encoded)                      │
├─────────────────────────────────────────────────┤
│ {                                               │
│   "alg": "HS256",                               │
│   "typ": "JWT"                                  │
│ }                                               │
└─────────────────────────────────────────────────┘
                       │
                       (encoded to:)
                       │
            eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9

┌─────────────────────────────────────────────────┐
│ PAYLOAD (Base64URL encoded) - KLAIM USER        │
├─────────────────────────────────────────────────┤
│ {                                               │
│   "user_id": 1,                                 │
│   "tokenable_id": 1,                            │
│   "name": "Admin",                              │
│   "iat": 1516239022,      (issued at)          │
│   "exp": 1516325422       (expiration time)    │
│ }                                               │
└─────────────────────────────────────────────────┘
                       │
                       (encoded to:)
                       │
            eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ

┌─────────────────────────────────────────────────┐
│ SIGNATURE (HMAC SHA256)                         │
├─────────────────────────────────────────────────┤
│ HMACSHA256(                                     │
│   base64UrlEncode(header) + "." +               │
│   base64UrlEncode(payload),                     │
│   secret                                        │
│ )                                               │
│                                                 │
│ Untuk memastikan token tidak di-tamper!        │
└─────────────────────────────────────────────────┘
                       │
                       (encoded to:)
                       │
            SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### **Cara Backend Verify Token:**

```php
// Saat menerima request dengan token di header:
// Authorization: Bearer eyJhbGci...

$token = $request->bearerToken(); 
// Extract: "eyJhbGci..."

// Hash token
$hashedToken = hash('sha256', $token);
// Hash result: "abc123def456..."

// Query database
$tokenRecord = DB::table('personal_access_tokens')
    ->where('token', $hashedToken)
    ->first();

if ($tokenRecord) {
    // ✅ Token valid
    $user = User::find($tokenRecord->tokenable_id);
    // $user = Admin (id: 1, role: admin)
} else {
    // ❌ Token tidak valid
    // Token expired atau tidak pernah ada
}
```

---

## 🛡️ Token Security - Bagaimana Token Aman?

### **1. Token Disimpan Hashed di Database**

```
Frontend punya:
└─ Token Plain: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

Database menyimpan:
└─ Token Hashed: "a7f3b2c9d1e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5..."

Jika hacker access database:
├─ Hacker dapat: Token Hashed
├─ Hacker coba kirim ke API: Authorization: Bearer [hashed_token]
├─ Backend: Verify dengan hash ulang token hashed
├─ Tidak matching! (double hash)
└─ ❌ Hacker gagal akses
```

### **2. Token Punya Expiration Time**

```
Token dibuat: 2026-04-18 10:00:00
Token expired: 2026-04-19 10:00:00 (24 jam kemudian)

Saat user request dengan token lama:
├─ Backend check: token.expiration < NOW()
├─ Result: TRUE (token sudah expired)
├─ Delete token dari personal_access_tokens table
└─ Return 401 Unauthorized → User harus login lagi
```

### **3. Token Bisa Di-Revoke Kapan Saja**

```
Normal logout:
1. User POST /api/logout
2. Backend: DELETE FROM personal_access_tokens WHERE id = X
3. ✅ Token langsung tidak bisa digunakan

Jika user dicurigai hacker:
1. Admin DELETE semua token user dari DB
2. Semua device user langsung logged out
3. User harus login dengan password baru

Keuntungan dibanding session cookie:
├─ Session cookie susah di-revoke (tersimpan di client)
├─ Token bisa di-revoke instant (delete di DB)
└─ Lebih aman!
```

### **4. Token Dikirim via Secure Header**

```
Token tidak dikirim via:
├─ Query string: GET /api/jemaah?token=xyz ❌
│  (bisa terlihat di browser history, log server)
└─ Cookie (default) ❌
   (bisa di-steal via CSRF)

Token dikirim via:
└─ Authorization header: Authorization: Bearer TOKEN ✅
   (hanya dikirim jika explicit di request)
```

---

## 📈 Flow: Mengapa Token di SETIAP Tahap?

### **Tanpa Token di Setiap Request:**

```
Login → Token
  ↓ 
GET /api/jemaah (tanpa token)
  ├─ Backend: "Siapa kamu?"
  └─ Return: 401 Unauthorized
Login lagi!
  ↓
GET /api/jadwal (dengan token baru)
Login lagi!
  ↓
POST /api/create (dengan token baru)
Login lagi!

😫 User harus login setiap kali bikin request!
```

### **Dengan Token di Setiap Request:**

```
Login → Token
  ↓ (simpan di localStorage)
GET /api/jemaah (+ token)
  ├─ Backend verify: token valid ✓, role admin ✓
  └─ Return 200 OK + data jemaah
GET /api/jadwal (+ token)
  ├─ Backend verify: token valid ✓, role admin ✓
  └─ Return 200 OK + data jadwal
POST /api/create (+ token)
  ├─ Backend verify: token valid ✓, role admin ✓
  └─ Create data, log activity
→ GET /api/dashboard (+ token)
  ├─ Backend verify: token valid ✓, role admin ✓
  └─ Return 200 OK + dashboard data

😊 User logout sekali, akses ribuan fitur tanpa login berulang!
```

---

## 🎯 Ringkasan: Mengapa Token PENTING?

| Aspek | Tanpa Token | Dengan Token |
|-------|-----------|-------------|
| **Authentikasi** | Setiap request harus kirim password ❌ | Kirim token, password sekali ✅ |
| **Keamanan** | Password ter-expose berkali-kali ❌ | Password hanya login sekali ✅ |
| **Session** | Tidak ada session management ❌ | Session clear di DB ✅ |
| **Authorization** | Sulit check role setiap request ❌ | Role di-attach ke token ✅ |
| **Logout** | Session bisa "tertinggal" ❌ | Token instant ter-revoke ✅ |
| **UX** | Login berkali-kali 😫 | Login 1x, akses banyak 😊 |
| **Performance** | Cek password setiap request ❌ | Cek token (lebih cepat) ✅ |

---

## 🔑 Kesimpulan

> **Token adalah "tiket digital" yang membuktikan identitas user setelah login.**

### **Wajib ada di setiap request karena:**

1. ✅ **Membuktikan user adalah siapa** (bukan orang lain)
2. ✅ **Membuktikan user punya hak akses** (role check)
3. ✅ **Melindungi dari unauthorized access** (expired token, revoke)
4. ✅ **Mengelola session user** (kapan login, kapan logout)
5. ✅ **Aman dari security threats** (CSRF, session hijacking)

### **Dalam sequence diagrams:**
- **Setiap request ke backend HARUS bawa token**
- **Setiap response, backend validate token dulu**
- **Jika token tidak ada/invalid → 401 Unauthorized**
- **Jika role tidak sesuai → 403 Forbidden**

```
Token di setiap tahap = Security foundation aplikasi!
```

---

*Dokumentasi: April 18, 2026*
*Disclaimer: Token adalah konsep fundamental dalam API security modern*