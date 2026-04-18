# Backend Commands Reference

## Current Status

**Backend Server Running:** ✅ http://127.0.0.1:8000  
**Database:** ✅ MySQL connected (bespoke)  
**Sanctum:** ✅ Configured and ready

---

## Essential Commands

### Start Backend Server

```powershell
cd backend
php artisan serve
```

- Runs on http://127.0.0.1:8000
- Auto-reloads on code changes
- Press Ctrl+C to stop

### Run Tests

```powershell
cd backend
php artisan test
```

- Runs all 10 authentication tests
- Expected: 10/10 PASSING
- Tests validate: login, logout, profile, role-based access, token refresh

### Seed Test Data

```powershell
cd backend
php artisan db:seed --class=UserSeeder
```

- Creates admin@jemaah.com / admin123
- Creates staff@jemaah.com / staff123
- Already done - run if you reset database

### Reset Database & Reseed

```powershell
cd backend
php artisan migrate:refresh --seed
```

- ⚠️ WARNING: Deletes all data!
- Use only if you want to start fresh
- Recreates all tables and seeds test data

---

## Database Commands

### Check Database Status

```powershell
cd backend
php artisan tinker
# Then type:
DB::connection()->getPDO();
# Should show PDOStatement object (success)
```

### View Database Contents

```powershell
cd backend
php artisan tinker
# Then type:
App\Models\User::all()->toArray();
```

### Access Laravel Tinker Shell

```powershell
cd backend
php artisan tinker
```

- Interactive PHP shell
- Can run any PHP/Eloquent code
- Type `exit` to quit

---

## API Endpoints (for testing in DevTools)

### Login

```
POST http://127.0.0.1:8000/api/login
Body: {
  "email": "admin@jemaah.com",
  "password": "admin123"
}
```

### Get Current User

```
GET http://127.0.0.1:8000/api/profile
Headers: Authorization: Bearer {token}
```

### Logout

```
POST http://127.0.0.1:8000/api/logout
Headers: Authorization: Bearer {token}
```

### Refresh Token

```
POST http://127.0.0.1:8000/api/refresh-token
Headers: Authorization: Bearer {token}
```

---

## Log Files

### Backend Error Log

```
backend/storage/logs/laravel.log
```

- Check here if API requests fail
- Contains detailed error messages

### View Live Logs

```powershell
cd backend
Get-Content storage\logs\laravel.log -Tail 50 -Wait
```

- Shows last 50 lines
- Use `-Wait` to auto-update as new logs arrive
- Press Ctrl+C to stop

---

## Debugging

### Check if Backend is Running

```powershell
Test-NetConnection -ComputerName localhost -Port 8000
```

- Should show: `TcpTestSucceeded : True`

### Clear Cache

```powershell
cd backend
php artisan cache:clear
php artisan config:clear
```

### Regenerate App Key

```powershell
cd backend
php artisan key:generate
```

### Clear Sanctum Tokens

```powershell
cd backend
php artisan tinker
# Then type:
DB::table('personal_access_tokens')->delete();
```

- Logs out all users
- Use if you want fresh start

---

## Troubleshooting

### "Connection refused" on /api/login

- Backend not running
- Run: `cd backend; php artisan serve`
- Verify running on http://127.0.0.1:8000

### "Undefined variable $token" errors

- Might be Sanctum not published
- Run: `cd backend; php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"`

### "Class 'Laravel\Sanctum\Sanctum' not found"

- Sanctum not installed
- Run: `cd backend; composer require laravel/sanctum`

### 422 Validation Error on Login

- Invalid email format or empty field
- Check request body includes valid email
- Check password is at least 6 characters

### 401 Unauthorized

- Token missing or expired
- Check Authorization header includes: `Bearer {token}`
- Check token matches what's in database

### 403 Forbidden (even with token)

- Role check failed
- Staff trying to access admin endpoint
- Staff getting 403 is correct - not an error!

---

## .env Configuration

**Key Settings (backend/.env):**

```env
APP_ENV=local
APP_DEBUG=true
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=bespoke
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000,localhost:5173,127.0.0.1:5173
```

If you change these, restart backend:

```powershell
cd backend
# Stop current server (Ctrl+C)
php artisan serve
```

---

## Useful Artisan Commands

```powershell
# List all commands
php artisan list

# Make new controller
php artisan make:controller Api/MyController

# Make new model with migration
php artisan make:model MyModel -m

# Make new middleware
php artisan make:middleware MyMiddleware

# Run specific test file
php artisan test tests/Feature/Auth/AuthenticationTest.php

# Clear everything)
php artisan optimize:clear
```

---

## Status Check Script

Run this PowerShell script to check everything:

```powershell
# Check if services running
Write-Host "Checking Backend..."
Test-NetConnection -ComputerName localhost -Port 8000 -ErrorAction SilentlyContinue | Select-Object TcpTestSucceeded

Write-Host "Checking MySQL..."
Test-NetConnection -ComputerName localhost -Port 3306 -ErrorAction SilentlyContinue | Select-Object TcpTestSucceeded

Write-Host "Checking Database Connection..."
cd backend
php -r "
require 'vendor/autoload.php';
\$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
\$dotenv->load();
try {
  \$conn = new mysqli(getenv('DB_HOST'), getenv('DB_USERNAME'), getenv('DB_PASSWORD'), getenv('DB_DATABASE'));
  echo 'Database: ' . (\$conn->connect_error ? 'FAILED' : 'OK') . PHP_EOL;
} catch (Exception \$e) {
  echo 'Database: ERROR' . PHP_EOL;
}
"
```

---

## Quick Start

**1. Start Backend:**

```powershell
cd backend
php artisan serve
```

**2. Start Frontend:**

```powershell
cd frontend
npm run dev
```

**3. Open Browser:**

```
http://localhost:5173/
```

**4. Login:**

```
admin@jemaah.com / admin123
```

**5. Check DevTools (F12):**

- Network tab should show Authorization headers
- No CORS errors
- API responses should be 200 OK

---

All systems ready! ✅
