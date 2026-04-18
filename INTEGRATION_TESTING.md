# 🔗 Integration Testing Guide

**Status:** ✅ Both servers running

- Backend: http://127.0.0.1:8000
- Frontend: http://localhost:5173/

---

## Test Scenarios

### Test 1: Login with Admin Account ✅

**Objective:** Verify admin can log in and access admin-only features

**Steps:**

1. Go to http://localhost:5173/
2. Click "Masuk" (Login)
3. Enter credentials:
   - Email: `admin@jemaah.com`
   - Password: `admin123`
4. Click "Masuk"

**Expected Results:**

- ✅ Redirects to Dashboard
- ✅ Navbar shows "Admin" name
- ✅ Sidebar shows "Pengguna" menu item (admin only feature)
- ✅ Browser console shows no auth errors
- ✅ localStorage contains `api_token` and `user` data

**Network Verification (DevTools → Network tab):**

```
POST /api/login
Status: 200 OK
Request Body: { email: "admin@jemaah.com", password: "admin123" }
Response Body: {
  "token": "1|abc123...",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@jemaah.com",
    "role": "admin"
  }
}
```

**Subsequent Requests (DevTools → Network):**

- All requests to `/api/*` should include `Authorization: Bearer 1|abc123...`
- Example: GET /api/profile → includes Bearer token header

---

### Test 2: Login with Staff Account ✅

**Objective:** Verify staff can log in but cannot access admin features

**Steps (After logout from Test 1):**

1. Click logout (or clear localStorage)
2. Login with:
   - Email: `staff@jemaah.com`
   - Password: `staff123`
3. Click "Masuk"

**Expected Results:**

- ✅ Redirects to Dashboard
- ✅ Navbar shows "Staff" name
- ✅ Sidebar does NOT show "Pengguna" menu item (conditional rendering)
- ✅ Staff role visible in Navbar

**Verification:**

- Try manually navigating to http://localhost:5173/pengguna
- Expected: "Access Denied" page (ProtectedRoute component)
- Check browser console: No "401 Unauthorized" errors (should be 403 from component, not API)

---

### Test 3: Logout and Session Cleanup ✅

**Objective:** Verify logout removes auth state and redirects

**Steps (Logged in as any user):**

1. Click user profile area in top-right (avatar/name)
2. Click "Logout"

**Expected Results:**

- ✅ Redirects to /login page
- ✅ localStorage cleared (api_token, user removed)
- ✅ Navbar goes back to login buttons
- ✅ If you go back to dashboard URL, redirects to /login

**Network Verification:**

```
POST /api/logout
Status: 200 OK
Response: { "message": "Logged out successfully" }
```

---

### Test 4: Bearer Token Auto-Injection ✅

**Objective:** Verify all API requests include Bearer token

**Steps:**

1. Login as admin@jemaah.com
2. Open DevTools (F12)
3. Go to Network tab
4. Click any menu item or refresh page
5. Look at API requests (should see /api/profile, etc.)

**Expected Results:**
All API requests should have:

```
Authorization: Bearer {token}
```

**Example in DevTools:**

```
GET http://127.0.0.1:8000/api/profile
Status: 200 OK

Request Headers:
- Authorization: Bearer 1|abc123def456...
- Content-Type: application/json
- Accept: application/json

Response: {
  "data": {
    "id": 1,
    "name": "Admin",
    "email": "admin@jemaah.com",
    "role": "admin",
    "is_active": true
  }
}
```

---

### Test 5: Invalid Credentials ✅

**Objective:** Verify error handling for wrong credentials

**Steps:**

1. Go to http://localhost:5173/
2. Try login with:
   - Email: `admin@jemaah.com`
   - Password: `wrongpassword`
3. Click "Masuk"

**Expected Results:**

- ✅ Login form shows error message: "Email atau password salah"
- ✅ Does NOT navigate away from login page
- ✅ Form inputs stay filled (except password ideally)
- ✅ No token in localStorage

**Network Verification:**

```
POST /api/login
Status: 401 Unauthorized
Response: {
  "message": "Email atau password salah"
}
```

---

### Test 6: Protected Route Access ✅

**Objective:** Verify unauthenticated users can't access protected routes

**Steps:**

1. Clear localStorage (DevTools → Application → Local Storage)
2. Navigate to http://localhost:5173/dashboard

**Expected Results:**

- ✅ Redirects to /login page
- ✅ Shows login form with message or loading state
- ✅ No 401 errors in console (graceful redirect)

---

### Test 7: Token Refresh (Optional) ✅

**Objective:** Verify token refresh works seamlessly

**Steps:**

1. Login as admin
2. Note the token in localStorage (api_token value)
3. Wait 5-10 minutes OR manually trigger refresh
4. Make an API call (refresh page or click a link)

**Expected Results:**

- ✅ Old token replaced with new token in localStorage
- ✅ New API requests use new token
- ✅ No "401 Unauthorized" errors

---

### Test 8: Role-Based Menu Visibility ✅

**Objective:** Verify different menus for different roles

**Steps:**

**As Admin:**

1. Login with admin@jemaah.com
2. Look at Sidebar menu items

**Expected Admin Menu:**

- Dashboard ✅
- Data Calon Jemaah ✅
- Jadwal Follow-Up ✅
- Laporan Closing ✅
- Status Komunikasi ✅
- Pengguna (ADMIN ONLY) ✅
- Settings ✅

**As Staff:**

1. Logout and login with staff@jemaah.com
2. Look at Sidebar menu items

**Expected Staff Menu:**

- Dashboard ✅
- Jemaah Saya ✅
- Jadwal Follow-Up ✅
- Status Komunikasi ✅
- Aktivitas Saya ✅
- Settings ✅
- NO "Pengguna" menu ✅

---

### Test 9: 401 Handling (Token Expiry) ✅

**Objective:** Verify 401 responses auto-logout and redirect

**Steps:**

1. Login as admin
2. Open DevTools → Network
3. Open DevTools → Console
4. Manually remove the `api_token` from localStorage:
   ```javascript
   localStorage.removeItem("api_token");
   ```
5. Make an API call (e.g., navigate to another page)

**Expected Results:**

- ✅ API call gets 401 from backend (no valid token)
- ✅ Frontend auto-catches 401 in api.ts
- ✅ Redirects to /login
- ✅ Clears remaining auth state
- ✅ Console shows no "401 Unauthorized" errors (gracefully handled)

---

## Common Issues & Fixes

### Issue: CORS Error

```
Access to XMLHttpRequest at 'http://127.0.0.1:8000/api/login'
from origin 'http://localhost:5173' blocked
```

**Fix:** Check backend `.env`:

```env
SANCTUM_STATEFUL_DOMAINS=127.0.0.1:3000,localhost:3000,127.0.0.1:5173,localhost:5173
```

### Issue: "Cannot find api_token"

```
localStorage.getItem('api_token') returns null
```

**Fix:** Make sure login actually succeeded:

1. Check Network tab for successful 200 POST to /api/login
2. Check Response tab for token in response
3. Check Application → Local Storage for api_token key

### Issue: Bearer Token Not Sent

```
Request headers missing "Authorization: Bearer"
```

**Fix:** Check api.ts file includes:

```typescript
if (token) {
  headers["Authorization"] = `Bearer ${token}`;
}
```

### Issue: Sidebar Shows Loading Forever

**Fix:** Check browser console for errors, verify backend is running on 8000

### Issue: "Access Denied" on Admin Pages as Staff

**Expected behavior** - not a bug! ProtectedRoute is working correctly.

---

## Quick Checklist ✅

- [ ] Backend running: http://127.0.0.1:8000
- [ ] Frontend running: http://localhost:5173/
- [ ] Admin login works
- [ ] Staff login works
- [ ] Bearer token appears in Network requests
- [ ] Sidebar shows different menus for admin vs staff
- [ ] Logout works and clears localStorage
- [ ] Logout redirects to /login
- [ ] Manual localStorage clear + API call = redirects to /login
- [ ] Invalid credentials show error message
- [ ] Unauthorized users redirected from protected routes
- [ ] Admin can see "Pengguna" menu
- [ ] Staff cannot see "Pengguna" menu
- [ ] Staff cannot access /pengguna (Access Denied)

---

## Test Data

**Admin Account:**

```
Email: admin@jemaah.com
Password: admin123
Role: admin
```

**Staff Account:**

```
Email: staff@jemaah.com
Password: staff123
Role: staff
```

---

## Next Steps After Integration Testing

1. ✅ If all tests pass → Proceed to feature development
2. ⚠️ If any test fails → Check console errors + network requests
3. 🔧 Debug with DevTools:
   - **Network tab:** Check request/response details
   - **Console:** Look for JavaScript errors
   - **Application → Local Storage:** Verify token storage
   - **Application → Cookies:** Check if Sanctum cookies set

---

**Status:** Ready for testing! Open http://localhost:5173/ in browser.
