# Full Stack Setup & Running Guide

## 📚 Table of Contents

1. [Quick Start (5 minutes)](#quick-start)
2. [Detailed Setup](#detailed-setup)
3. [Running the Application](#running-the-application)
4. [Testing the Complete Flow](#testing-the-complete-flow)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites

- PHP 8.2+ with MySQL
- Node.js 16+
- Composer
- Git

### 1. Backend Setup (2 minutes)

```bash
cd backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Setup database
php artisan migrate
php artisan db:seed --class=UserSeeder

# Start server
php artisan serve
```

✅ Backend running at http://localhost:8000

### 2. Frontend Setup (2 minutes)

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Start dev server
npm run dev
```

✅ Frontend running at http://localhost:5173

### 3. Test Login (1 minute)

1. Open http://localhost:5173 in browser
2. Login with:
   - Email: `admin@jemaah.com`
   - Password: `admin123`
3. Should see dashboard 🎉

---

## 🔧 Detailed Setup

### Backend Setup

#### Step 1: Navigate to Backend

```bash
cd backend
```

#### Step 2: Install Dependencies

```bash
composer install
```

#### Step 3: Create Environment File

```bash
cp .env.example .env
```

#### Step 4: Generate App Key

```bash
php artisan key:generate
```

#### Step 5: Configure Database (if needed)

Edit `.env`:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bespoke
DB_USERNAME=root
DB_PASSWORD=
```

#### Step 6: Run Migrations

```bash
php artisan migrate
```

Database tables created:

- users
- calon_jemaahs
- jadwal_follow_ups
- status_komunikasis
- laporan_closings
- activity_logs
- personal_access_tokens (Sanctum)

#### Step 7: Seed Test Data

```bash
php artisan db:seed --class=UserSeeder
```

Test accounts created:

- Admin: admin@jemaah.com / admin123
- Staff: staff@jemaah.com / staff123

#### Step 8: Start Backend Server

```bash
php artisan serve
```

Backend API: http://localhost:8000
API Documentation: http://localhost:8000/api/health

---

### Frontend Setup

#### Step 1: Navigate to Frontend

```bash
cd frontend
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Setup Environment

```bash
cp .env.example .env.local
```

Verify `.env.local`:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

#### Step 4: Start Development Server

```bash
npm run dev
```

Frontend dev server: http://localhost:5173

---

## ▶️ Running the Application

### Method 1: Two Terminal Windows (Recommended)

**Terminal 1: Backend**

```bash
cd backend
php artisan serve
```

**Terminal 2: Frontend**

```bash
cd frontend
npm run dev
```

Both run simultaneously and can see output from each.

### Method 2: Using Docker (Optional)

If you have Docker installed:

```bash
# In root directory
docker-compose up
# Both services run together
```

### Method 3: Manual Start (Single Terminal)

```bash
# Start backend in background
cd backend && php artisan serve &

# Wait a second
sleep 1

# Start frontend
cd ../frontend && npm run dev
```

---

## 🧪 Testing the Complete Flow

### Test 1: Health Check

```bash
# In new terminal
curl http://localhost:8000/api/health

# Expected response:
# {"status":"ok","service":"jemaah-follow-up-api"}
```

### Test 2: Login Flow

**Step 1:** Open http://localhost:5173/login

**Step 2:** Enter credentials

- Email: admin@jemaah.com
- Password: admin123

**Step 3:** Verify

- ✅ Login succeeds
- ✅ Redirects to dashboard
- ✅ Shows user name in navbar
- ✅ Shows admin role
- ✅ Can see "Pengguna" menu item

### Test 3: Admin vs Staff Access

**As Admin:**

```bash
# Login with admin@jemaah.com
# Can access: /pengguna (user management)
# Can see: "Pengguna" menu item
```

**As Staff:**

```bash
# Logout and login with staff@jemaah.com
# Cannot access: /pengguna (shows access denied)
# Cannot see: "Pengguna" menu item
```

### Test 4: API Call

1. Open browser DevTools (F12)
2. Go to Network tab
3. Click a data loading action
4. Check request headers:
   - Should have: `Authorization: Bearer [token]`
5. Check response status: 200 OK

### Test 5: Logout

1. Click user dropdown (top right)
2. Click "Logout"
3. Should redirect to login page
4. localStorage should be cleared

---

## 🔍 Verification Checklist

### Backend Verification

- ✅ `php artisan serve` runs without errors
- ✅ `/api/health` returns 200 OK
- ✅ Database has 3 tables created
- ✅ Test users seeded (check with `php artisan tinker > User::all()`)
- ✅ Sanctum migration ran

### Frontend Verification

- ✅ `npm install` completes without errors
- ✅ `npm run dev` starts server
- ✅ http://localhost:5173 loads
- ✅ `.env.local` has correct API URL
- ✅ No TypeScript errors
- ✅ `npm run build` succeeds

### Integration Verification

- ✅ Can login from frontend
- ✅ Token appears in Network requests
- ✅ User info shows in navbar
- ✅ Menu adapts to role
- ✅ Logout clears auth
- ✅ Protected routes work

---

## 🐛 Troubleshooting

### Backend Issues

#### "Port 8000 already in use"

```bash
# Use different port
php artisan serve --port=8001

# Then update frontend .env.local:
VITE_API_BASE_URL=http://localhost:8001/api
```

#### "Database connection refused"

```bash
# Check database is running
# Update .env with correct details:
DB_HOST=127.0.0.1
DB_DATABASE=bespoke
DB_USERNAME=root
DB_PASSWORD=

# Try connecting directly:
mysql -u root -h 127.0.0.1 -p
```

#### "SQLSTATE[HY000] [1049] Unknown database"

```bash
# Database doesn't exist - create it
mysql -u root -p -e "CREATE DATABASE bespoke;"

# Then run migration
php artisan migrate
```

#### "Call to undefined method... Laravel\Sanctum..."

```bash
# Re-publish Sanctum files
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider" --force

# Re-run migrations
php artisan migrate
```

### Frontend Issues

#### "VITE_API_BASE_URL is undefined"

```bash
# Make sure .env.local exists
cp .env.example .env.local

# Make sure it has:
VITE_API_BASE_URL=http://localhost:8000/api

# Restart dev server
npm run dev
```

#### "Failed to fetch - 404"

```bash
# Check backend is running
curl http://localhost:8000/api/health

# Check frontend .env.local has correct URL
# Make sure backend database has data
php artisan migrate
php artisan db:seed --class=UserSeeder
```

#### "CORS error in browser console"

```bash
# Make sure backend .env has:
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000,localhost:5173,127.0.0.1:5173

# Restart backend server
```

#### "npm ERR! missing: lucide-react"

```bash
# Install missing dependency
npm install lucide-react

# Then start dev server
npm run dev
```

### Common Login Issues

#### "Email or password wrong"

```bash
# Verify test users were seeded
php artisan tinker
>>> User::where('email', 'admin@jemaah.com')->first()

# If not found, seed again
php artisan db:seed --class=UserSeeder
```

#### "Request failed with status 422"

```bash
# Check backend logs:
tail storage/logs/laravel.log

# Verify request body is valid:
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jemaah.com","password":"admin123"}'
```

#### "Redirect loop on login"

```bash
# Check browser LocalStorage (F12 > Application > LocalStorage)
# Should have 'api_token' and 'user' after login

# Clear and try again:
localStorage.clear()
# Refresh page and login again
```

### API Call Issues

#### "401 Unauthorized"

```bash
# Token might be expired or invalid
# Try logging in again

# Or refresh token:
curl -X POST http://localhost:8000/api/refresh-token \
  -H "Authorization: Bearer [your-token]"
```

#### "403 Forbidden"

```bash
# User doesn't have permission for this endpoint
# Check user role:
curl -X GET http://localhost:8000/api/profile \
  -H "Authorization: Bearer [your-token]"

# /pengguna only works for admin role
```

#### "Token not in requests"

```bash
# Check api.ts is correctly configured
# Verify localStorage has 'api_token'
# Restart dev server: npm run dev

# In browser console, check:
console.log(localStorage.getItem('api_token'));
// Should print your token
```

---

## 📊 Project Status Checklist

| Component       | Status | Location          |
| --------------- | ------ | ----------------- |
| Backend Setup   | ✅     | `/backend`        |
| Database Schema | ✅     | Migrations        |
| API Endpoints   | ✅     | RESTful           |
| Authentication  | ✅     | Sanctum           |
| Authorization   | ✅     | Middleware        |
| Frontend Setup  | ✅     | `/frontend`       |
| AuthContext     | ✅     | `context/`        |
| ProtectedRoute  | ✅     | `components/`     |
| Login Page      | ✅     | Connected to API  |
| Role-Based UI   | ✅     | Sidebar + Navbar  |
| API Integration | ✅     | Auto auth headers |

---

## 🎯 What's Working

✅ **Authentication**

- Backend: Sanctum tokens
- Frontend: Login/logout with API

✅ **Authorization**

- Role-based route protection
- Role-based menu visibility
- Backend middleware checks

✅ **Integration**

- Frontend connects to backend API
- Automatic token injection
- 401 handling

✅ **User Experience**

- Clean login page
- Protected routes
- Dynamic sidebar
- Current user display
- Functional logout

---

## 📖 Documentation

| Document                      | Content               |
| ----------------------------- | --------------------- |
| `/backend/AUTHENTICATION.md`  | API docs & auth flow  |
| `/backend/SETUP_SUMMARY.md`   | Backend setup recap   |
| `/frontend/FRONTEND_SETUP.md` | Frontend architecture |
| `/frontend/CLEANUP_GUIDE.md`  | Migration guide       |
| `FRONTEND_IMPROVEMENTS.md`    | Improvements summary  |
| This file                     | Full stack setup      |

---

## 🎓 Next Steps

1. **Test the setup**
   - Follow "Testing the Complete Flow" section
   - Verify all checkboxes pass

2. **Develop features**
   - Create new pages
   - Add API endpoints
   - Expand functionality

3. **Deploy**
   - Frontend: Build & upload static files
   - Backend: Setup production Laravel
   - Update API URLs
   - Setup HTTPS

4. **Monitor**
   - Check logs for errors
   - Monitor API performance
   - Track user activity

---

## 💬 Support

For issues:

1. Check troubleshooting section
2. Check logs: `tail -f backend/storage/logs/laravel.log`
3. Check browser console: F12 > Console
4. Check network requests: F12 > Network

---

**Complete Stack:** ✅ READY TO RUN
**Backend Status:** ✅ WORKING
**Frontend Status:** ✅ WORKING
**Integration:** ✅ TESTED

**Next Action:** Start servers and test login flow!
