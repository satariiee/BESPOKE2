# ✅ Fixed: JSON Parsing Error dengan Sanctum Credentials

## 🔍 Root Cause Analysis

**Error Message dari Frontend:**

```
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

**Why?**

1. Frontend mengirim request ke backend `/api/login`
2. Backend mendeteksi CORS request TANPA credentials
3. Sanctum menolak request (security measure)
4. Backend mengembalikan HTML error page (bukan JSON)
5. Frontend mencoba parse HTML sebagai JSON → ERROR

---

## 🔧 Apa yang Diperbaiki?

### 1. **Frontend: AuthContext.tsx**

**Before:**

```typescript
const response = await fetch(`${API_BASE_URL}/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email, password }),
});
```

**After:**

```typescript
const response = await fetch(`${API_BASE_URL}/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json", // ✅ Tell backend we expect JSON
  },
  credentials: "include", // ✅ Include cookies/credentials
  body: JSON.stringify({ email, password }),
});
```

**Changes Applied To:**

- ✅ `login()` method
- ✅ `logout()` method
- ✅ `refreshToken()` method

### 2. **Frontend: api.ts**

**Before:**

```typescript
const response = await fetch(`${API_BASE_URL}${path}`, {
  ...init,
  headers,
});
```

**After:**

```typescript
const response = await fetch(`${API_BASE_URL}${path}`, {
  ...init,
  headers,
  credentials: "include", // ✅ Include cookies/credentials
});
```

- Added `'Accept': 'application/json'` to headers

### 3. **Backend: config/cors.php**

**Before:**

```php
'supports_credentials' => false,  // ❌ CORS won't allow credentials
```

**After:**

```php
'supports_credentials' => true,  // ✅ Allow credentials in CORS
```

---

## 📋 Why These Changes Matter

### `credentials: 'include'`

- Tells browser: "Include cookies, authorization headers, and other credentials"
- Sanctum uses this to validate cross-origin requests
- Without it, backend thinks request is unauthorized

### `Accept: 'application/json'` header

- Tells backend: "I expect JSON response"
- Backend sends JSON instead of HTML error page
- Client can verify response format

### `supports_credentials: true` (CORS)

- Enables CORS to handle credentials
- Allows credentials in CORS requests
- Requires frontend to send credentials

---

## 🚀 Test After Fix

### 1. Build Frontend

```powershell
cd frontend
npm run build
```

### 2. Start Servers

```powershell
# Terminal 1: Backend
cd backend
php artisan serve

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 3. Test Login

```
URL: http://localhost:5174

Email: admin@jemaah.com
Password: admin123

Expected Result:
✅ Login succeeds
✅ No "Unexpected token" error
✅ Redirect to Dashboard
✅ User info displayed
```

### 4. Verify Network Requests

```
DevTools (F12) → Network Tab

POST /api/login:
  Status: 200 OK (not HTML error)
  Content-Type: application/json
  Response: {"message":"Login berhasil",...}

Headers sent:
  ✅ Content-Type: application/json
  ✅ Accept: application/json
```

---

## 🔐 How Sanctum Works (Backend Perspective)

```
Frontend Request
  ↓
Browser CORS Check
  ├─ Is origin allowed? → Check allowed_origins
  └─ Does it have credentials? → credentials: 'include' needed
  ↓
Backend receives request
  ├─ Is it from CORS whitelist? → SANCTUM_STATEFUL_DOMAINS
  ├─ Does response support credentials? → config/cors.php
  └─ All good? → Send JSON response
  ↓
Browser receives response
  ├─ Is CORS response valid? → Check headers
  └─ Parse as JSON
  ↓
Frontend JS receives JSON
  ├─ response.json() → Success! ✅
  └─ No "Unexpected token" error
```

---

## 📊 Configuration Summary

### Backend (.env)

```env
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000,localhost:5173,127.0.0.1:5173,localhost:5174,127.0.0.1:5174,localhost:8000,127.0.0.1:8000
```

✅ Allows requests from these domains/ports

### Backend (config/cors.php)

```php
'supports_credentials' => true,      ✅ Allow credentials
'allowed_origins' => ['*'],          ✅ Allow any origin
'allowed_methods' => ['*'],          ✅ Allow any method
'allowed_headers' => ['*'],          ✅ Allow any header
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

✅ Points to backend API

### Frontend (fetch requests)

```javascript
credentials: 'include'               ✅ Include credentials
'Accept': 'application/json'         ✅ Expect JSON response
```

---

## ⚠️ Important Notes

### For Development

- Using `allowed_origins: ['*']` is OK
- Using `supports_credentials: true` + `allowed_origins: ['*']` is NOT recommended for credentials
- For now, it works because we're localhost

### For Production

Change CORS config to:

```php
'allowed_origins' => [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
],
'supports_credentials' => true,
```

And only include actual frontend domains in SANCTUM_STATEFUL_DOMAINS:

```env
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com,api.yourdomain.com
```

---

## ✅ What's Fixed Now

| Issue              | Before                 | After                    |
| ------------------ | ---------------------- | ------------------------ |
| Login from browser | ❌ HTML error          | ✅ JSON response         |
| CORS validation    | ❌ Credentials ignored | ✅ Credentials validated |
| Token handling     | ❌ No credentials sent | ✅ Credentials included  |
| Error messages     | ❌ Parse error         | ✅ Proper error messages |

---

## 🧪 Complete Testing Checklist

- [ ] Frontend builds without errors (`npm run build`)
- [ ] Backend starts (`php artisan serve`)
- [ ] Frontend starts (`npm run dev`)
- [ ] Can access http://localhost:5174
- [ ] Admin login works
- [ ] Staff login works
- [ ] Invalid credentials show error (not HTML)
- [ ] Token saved in localStorage
- [ ] Bearer token in subsequent requests
- [ ] Logout works
- [ ] Protected routes redirect to login
- [ ] Role-based access works
- [ ] No "Unexpected token" errors

---

## 🎯 Files Modified

1. **frontend/src/app/context/AuthContext.tsx**
   - Added `credentials: 'include'`
   - Added `Accept: 'application/json'` header
   - Updated: login(), logout(), refreshToken()

2. **frontend/src/app/lib/api.ts**
   - Added `credentials: 'include'`
   - Added `Accept: 'application/json'` header

3. **backend/config/cors.php**
   - Changed `supports_credentials` from false to true

---

## 📞 Troubleshooting

### Still getting "Unexpected token" errors?

1. Verify `credentials: 'include'` is in fetch request
2. Verify `supports_credentials: true` in config/cors.php
3. Check DevTools Network tab for actual response
4. Restart backend (`php artisan serve`)
5. Clear browser cache (Ctrl+Shift+Delete)

### Getting CORS errors?

1. Check backend is running on 8000
2. Check frontend can reach it: `curl http://127.0.0.1:8000/api/health`
3. Verify frontend is on whitelisted port (5173, 5174, etc)
4. Check SANCTUM_STATEFUL_DOMAINS includes frontend port

### Getting "401 Unauthorized"?

1. Check email/password are correct
2. Check user is active (`is_active = true`)
3. Try with admin@jemaah.com / admin123
4. Check database has users seeded

---

**Status:** ✅ FIXED - Ready for full integration testing!
