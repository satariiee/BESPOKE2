# ✅ Integration Testing Ready

**Timestamp:** April 11, 2026, 12:00 PM

---

## 🚀 Servers Running

✅ **Backend:** http://127.0.0.1:8000

```
INFO  Server running on [http://127.0.0.1:8000].
Press Ctrl+C to stop the server
```

✅ **Frontend:** http://localhost:5173/

```
VITE v6.3.5  ready in 1307 ms
Local:   http://localhost:5173/
```

---

## ✅ Configuration Verified

### Backend (.env)

```env
APP_ENV=local
APP_DEBUG=true
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000,localhost:5173,127.0.0.1:5173 ✅
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000/api ✅
```

### API Integration

- Base URL points to: http://localhost:8000/api ✅
- Sanctum CORS configured for port 5173 ✅
- Bearer token auto-injection enabled ✅
- 401 error handling configured ✅

---

## 📋 What's Ready to Test

### Authentication System

✅ Login endpoint: POST /api/login
✅ Logout endpoint: POST /api/logout
✅ Profile endpoint: GET /api/profile
✅ Token refresh: POST /api/refresh-token

### Test Accounts

```
Admin Account:
  Email: admin@jemaah.com
  Password: admin123

Staff Account:
  Email: staff@jemaah.com
  Password: staff123
```

### Frontend Features

✅ Login page with real API integration
✅ AuthContext with global state (useAuth hook)
✅ ProtectedRoute component for role-based access
✅ Bearer token auto-injection in requests
✅ 401 error handling with auto-redirect
✅ Navbar with user info + logout
✅ Sidebar with role-based menu items
✅ Single unified router (no more separate apps)

### Database

✅ MySQL connection active
✅ All migrations completed
✅ Test data seeded (admin & staff accounts)
✅ Sanctum tokens table ready

---

## 🧪 Testing Instructions

### Step 1: Open Frontend

```
http://localhost:5173/
```

### Step 2: Test Admin Login

```
Email: admin@jemaah.com
Password: admin123
```

**Expected:**

- Redirect to Dashboard
- Navbar shows Admin name
- Sidebar shows "Pengguna" (admin only menu)
- localStorage has api_token

### Step 3: Open DevTools

```
F12 → Network Tab
```

**Verify:**

- All requests to /api/\* include `Authorization: Bearer {token}`
- Status codes are 200 for successful requests
- No CORS errors

### Step 4: Test Staff Login

```
1. Logout (or clear localStorage)
2. Login with: staff@jemaah.com / staff123
```

**Expected:**

- Redirect to Dashboard
- Navbar shows Staff name
- Sidebar does NOT show "Pengguna" menu
- Try accessing /pengguna → "Access Denied"

### Step 5: Test Logout

```
1. Click user profile in navbar
2. Click Logout
```

**Expected:**

- Redirect to /login
- localStorage cleared (api_token, user removed)
- Cannot access /dashboard (redirected to /login)

### Step 6: Test Error Handling

```
1. Try login with: admin@jemaah.com / wrongpassword
```

**Expected:**

- Error message: "Email atau password salah"
- Stay on login page
- No localStorage token

---

## 🔗 Complete Integration Flow

```
User enters email & password on Login page
           ↓
Frontend calls: POST http://localhost:8000/api/login
           ↓
Backend validates credentials (LoginRequest)
           ↓
Backend returns token & user data (200 OK)
           ↓
Frontend stores token in localStorage
           ↓
AuthContext.login() sets user state
           ↓
Navigate to Dashboard
           ↓
Subsequent API calls auto-include Bearer token
           ↓
Backend validates token (auth:sanctum middleware)
           ↓
API responds with protected data (200 OK)
           ↓
Frontend displays data based on role
           ↓
User logs out
           ↓
Frontend calls: POST http://localhost:8000/api/logout
           ↓
Backend revokes token
           ↓
Frontend clears localStorage
           ↓
Navigate to /login
```

---

## 🐛 Common Issues & Fixes

### "Cannot GET /api/login"

**Fix:** Backend not running. Run: `cd backend; php artisan serve`

### "Failed to load resource (CORS error)"

**Fix:** Check SANCTUM_STATEFUL_DOMAINS in backend/.env includes localhost:5173

### "api_token not found in localStorage"

**Fix:** Check Network tab - if /api/login returns 401, login failed with wrong credentials

### "Bearer token not appearing in requests"

**Fix:** Check api.ts includes Bearer token injection code

### "Page loading forever"

**Fix:** Check browser console for errors, verify both servers running

### "Access Denied on /pengguna as staff"

**Expected behavior** - This is correct! ProtectedRoute is working.

---

## 📊 Test Checklist

Copy this to track your testing:

```
🔐 AUTHENTICATION
  □ Admin login works
  □ Staff login works
  □ Invalid password shows error
  □ Invalid email shows error
  □ Login form clears on error
  □ Logout works
  □ Logout redirects to /login
  □ localStorage cleared on logout

🔑 TOKENS & HEADERS
  □ Bearer token in localStorage after login
  □ Bearer token appears in Network requests
  □ Token format: Bearer {token}
  □ Token persists across page refreshes
  □ 401 response redirects to /login
  □ 401 clears localStorage

🛡️ ROLE-BASED ACCESS
  □ Admin sidebar shows "Pengguna" menu
  □ Staff sidebar hides "Pengguna" menu
  □ Admin can access /pengguna
  □ Staff accessing /pengguna shows "Access Denied"
  □ Admin cannot be "downgraded" to staff
  □ Staff cannot access admin features

💻 UI/UX
  □ Navbar shows correct user name
  □ Navbar shows correct user role
  □ Sidebar menu reflects user role
  □ Login page responsive
  □ Dashboard loads after login
  □ No console errors
  □ Loading states work properly

🔄 REDIRECT & FLOW
  □ Unauthenticated → /dashboard redirects to /login
  □ After login → redirects to dashboard
  □ After logout → redirects to /login
  □ Manual URL navigation respects auth
  □ Back button doesn't bypass auth
```

---

## 📝 Documentation Reference

For detailed test scenarios, see: **[INTEGRATION_TESTING.md](./INTEGRATION_TESTING.md)**

---

## 🎯 What Happens Next

**If all tests pass:**

- ✅ Integration is complete
- ✅ Ready for feature development
- ✅ Ready for production deployment planning

**If any test fails:**

1. Check browser console for errors
2. Check Network tab for API response details
3. Verify backend /storage/logs/laravel.log for backend errors
4. Compare with expected results in INTEGRATION_TESTING.md

---

## 🚀 Ready to Test!

**Frontend:** http://localhost:5173/

Click "Masuk" (Login) and test with the credentials above.

**All systems ready for integration testing!** ✅
