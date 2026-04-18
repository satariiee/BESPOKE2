# Penjelasan Detail Sequence Diagrams - Tahap Per Tahap

Dokumen ini menjelaskan setiap sequence diagram secara detail, baris per baris, dengan fokus pada interaksi Frontend → API Backend → Database.

---

## 1. AUTHENTICATION FLOW - LOGIN

### Kode Mermaid:
```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend as Backend API
    participant DB as Database
    participant Auth as Sanctum

    User->>Frontend: Enter email & password
    Frontend->>Backend: POST /api/login
    Backend->>DB: Query user by email
    DB-->>Backend: User data
    Backend->>Auth: Generate API token
    Auth->>DB: Save token
    DB-->>Auth: Saved
    Auth-->>Backend: Token response
    Backend-->>Frontend: 200 OK + token + user data
    Frontend->>Frontend: Store token in localStorage
    Frontend->>Frontend: Store user in Context
    Frontend->>Frontend: Redirect to Dashboard
    User->>Frontend: Dashboard loaded
```

### Penjelasan Tahap Per Tahap:

#### **Tahap 1: User Input**
```
User->>Frontend: Enter email & password
```
- User membuka halaman login di browser
- User mengisi form: email + password
- User klik tombol "Login"
- Data dikirim ke Frontend (React/TypeScript)

#### **Tahap 2: Frontend → API Backend**
```
Frontend->>Backend: POST /api/login
```
- Frontend membuat HTTP POST request ke `http://127.0.0.1:8000/api/login`
- Header: `Content-Type: application/json`
- Body (JSON):
  ```json
  {
    "email": "admin@jemaah.com",
    "password": "admin123"
  }
  ```

#### **Tahap 3: Backend - Query User**
```
Backend->>DB: Query user by email
DB-->>Backend: User data
```
- Backend (Laravel) menerima POST request
- Jalankan query SQL:
  ```sql
  SELECT * FROM users WHERE email = 'admin@jemaah.com'
  ```
- Database MySQL mengembalikan data user:
  ```json
  {
    "id": 1,
    "name": "Admin",
    "email": "admin@jemaah.com",
    "password": "[hashed_password]",
    "role": "admin",
    "is_active": true
  }
  ```

#### **Tahap 4: Backend - Validate Password**
```
Backend->>Auth: Generate API token
```
- Backend verifikasi password yang dikirim user
- Cocokkan dengan hashed password di database
- Jika cocok → lanjut ke token generation
- Jika tidak → return error 401 Unauthorized

#### **Tahap 5: Sanctum - Generate Token**
```
Auth->>DB: Save token
DB-->>Auth: Saved
Auth-->>Backend: Token response
```
- Laravel Sanctum generate API token (random string 80 karakter)
- Token disimpan di tabel `personal_access_tokens`:
  ```sql
  INSERT INTO personal_access_tokens (
    tokenable_id, 
    tokenable_type, 
    name, 
    token, 
    abilities, 
    last_used_at, 
    created_at
  ) VALUES (
    1,
    'App\Models\User',
    'api_token',
    'hashed_token_value',
    '["*"]',
    NULL,
    NOW()
  )
  ```
- Sanctum return token response ke backend

#### **Tahap 6: Backend Response to Frontend**
```
Backend-->>Frontend: 200 OK + token + user data
```
- Backend return HTTP 200 OK dengan JSON:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": 1,
        "name": "Admin",
        "email": "admin@jemaah.com",
        "role": "admin"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

#### **Tahap 7-9: Frontend - Store Data**
```
Frontend->>Frontend: Store token in localStorage
Frontend->>Frontend: Store user in Context
Frontend->>Frontend: Redirect to Dashboard
```
- **localStorage**: Token disimpan untuk persistent login
  ```javascript
  localStorage.setItem('api_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
  ```
- **AuthContext**: User data disimpan di React Context
  ```typescript
  setAuth({
    user: { id: 1, name: "Admin", email: "...", role: "admin" },
    token: "eyJ...",
    isAuthenticated: true
  })
  ```
- **Redirect**: Frontend navigate ke `/` (Dashboard)

#### **Tahap 10: Dashboard Load**
```
User->>Frontend: Dashboard loaded
```
- Browser menampilkan halaman Dashboard
- Username "Admin" muncul di navbar
- Sidebar menampilkan menu sesuai role (admin)

---

## 2. PROSPECT MANAGEMENT FLOW

### Kode Mermaid:
```mermaid
sequenceDiagram
    actor Admin
    participant Frontend
    participant ProtectedRoute
    participant Backend as Backend API
    participant DB as Database

    Admin->>Frontend: Access /jemaah
    Frontend->>ProtectedRoute: Check auth & role
    ProtectedRoute->>Frontend: role === admin or staff?
    Frontend->>Backend: GET /api/calon-jemaah (Bearer token)
    Backend->>Backend: Verify token & role
    Backend->>DB: SELECT * FROM calon_jemaah
    DB-->>Backend: List of prospects
    Backend-->>Frontend: 200 OK + data
    Frontend->>Frontend: Render prospect list
    Admin->>Frontend: Click "Tambah Jemaah"
    Frontend->>Frontend: Show form modal
    Admin->>Frontend: Fill form & submit
    Frontend->>Backend: POST /api/calon-jemaah (data + token)
    Backend->>DB: INSERT into calon_jemaah
    DB-->>Backend: New prospect created
    Backend-->>Frontend: 201 Created + new data
    Frontend->>Frontend: Update list + show success
    Admin->>Frontend: See new prospect in list
```

### Penjelasan Tahap Per Tahap:

#### **TAHAP PEMBACAAN DATA - GET /api/calon-jemaah**

**Tahap 1: Admin akses /jemaah**
```
Admin->>Frontend: Access /jemaah
```
- Admin klik menu "Calon Jemaah" di sidebar
- Browser navigate ke URL: `http://localhost:5173/jemaah`

**Tahap 2: Frontend check auth & role**
```
Frontend->>ProtectedRoute: Check auth & role
ProtectedRoute->>Frontend: role === admin or staff?
```
- React Router trigger ProtectedRoute component
- Check localStorage untuk `api_token`
- Ambil user role dari AuthContext
- Validasi: role harus "admin" atau "staff"
- Jika valid → lanjut, jika tidak → redirect ke /login

**Tahap 3: Frontend → Backend (GET request)**
```
Frontend->>Backend: GET /api/calon-jemaah (Bearer token)
```
- Frontend buat HTTP GET request ke `/api/calon-jemaah`
- Endpoint: `http://127.0.0.1:8000/api/calon-jemaah`
- Header:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
  ```

**Tahap 4: Backend verify token & role**
```
Backend->>Backend: Verify token & role
```
- Laravel Sanctum middleware verify token di header
- Query tabel `personal_access_tokens` cek token valid
- Query tabel `users` ambil user data
- Validasi role: admin/staff
- Jika invalid → return 401 Unauthorized, 403 Forbidden

**Tahap 5: Backend query database**
```
Backend->>DB: SELECT * FROM calon_jemaah
DB-->>Backend: List of prospects
```
- Backend jalankan Eloquent query:
  ```php
  $jemaah = CalonJemaah::with(['staff', 'jadwalFollowUps'])
            ->orderBy('created_at', 'desc')
            ->get();
  ```
- SQL yang dijalankan:
  ```sql
  SELECT c.* FROM calon_jemaah c
  LEFT JOIN users u ON c.staff_id = u.id
  LEFT JOIN jadwal_follow_up j ON c.id = j.calon_jemaah_id
  ORDER BY c.created_at DESC
  ```
- Database return JSON array of prospects:
  ```json
  [
    {
      "id": 1,
      "nama": "Ahmad Syaiful",
      "kontak": "089123456789",
      "alamat": "Bandung",
      "sumber": "WhatsApp",
      "paket": "Umrah Plus",
      "staff_id": 2,
      "status_komunikasi": "Tertarik",
      "last_follow_up_at": "2026-04-18",
      "notes": "Minat paket premium"
    },
    ...
  ]
  ```

**Tahap 6: Backend response to Frontend**
```
Backend-->>Frontend: 200 OK + data
```
- Backend return HTTP 200 OK dengan JSON response:
  ```json
  {
    "success": true,
    "message": "Prospects retrieved successfully",
    "data": [
      { ... prospect 1 ... },
      { ... prospect 2 ... }
    ]
  }
  ```

**Tahap 7: Frontend render list**
```
Frontend->>Frontend: Render prospect list
```
- React state update dengan data dari backend
- Map data array ke HTML table/cards
- Render columns: Nama, Kontak, Status, Paket, Last Follow-up
- Tambah action buttons: Edit, Delete, Follow-up

---

#### **TAHAP PEMBUATAN DATA - POST /api/calon-jemaah**

**Tahap 8: Admin click "Tambah Jemaah"**
```
Admin->>Frontend: Click "Tambah Jemaah"
Frontend->>Frontend: Show form modal
```
- Admin klik tombol "Tambah Jemaah"
- React menampilkan modal dengan form input:
  - Nama Lengkap
  - Nomor Kontak
  - Alamat
  - Sumber Lead
  - Paket Pilihan
  - Assigned Staff

**Tahap 9: Admin submit form**
```
Admin->>Frontend: Fill form & submit
```
- Admin isi semua field form
- Click tombol "Simpan"
- Frontend validate form (client-side):
  - Semua field required
  - Format email/phone valid
  - etc.

**Tahap 10: Frontend → Backend (POST request)**
```
Frontend->>Backend: POST /api/calon-jemaah (data + token)
```
- Frontend buat HTTP POST request ke `/api/calon-jemaah`
- Endpoint: `http://127.0.0.1:8000/api/calon-jemaah`
- Headers:
  ```
  Authorization: Bearer eyJhbGci...
  Content-Type: application/json
  ```
- Body JSON:
  ```json
  {
    "nama": "Siti Nurhaliza",
    "kontak": "089876543210",
    "alamat": "Jakarta",
    "sumber": "Referral",
    "paket": "Umrah Standar",
    "staff_id": 2,
    "notes": "Tertarik dengan diskon grup"
  }
  ```

**Tahap 11: Backend validate & insert to DB**
```
Backend->>DB: INSERT into calon_jemaah
DB-->>Backend: New prospect created
```
- Backend validate data dari request
- Jalankan Eloquent create:
  ```php
  $jemaah = CalonJemaah::create([
    'nama' => $request->nama,
    'kontak' => $request->kontak,
    'alamat' => $request->alamat,
    'sumber' => $request->sumber,
    'paket' => $request->paket,
    'staff_id' => $request->staff_id,
    'status_komunikasi' => 'Prospek Baru',
    'notes' => $request->notes,
  ]);
  ```
- SQL INSERT:
  ```sql
  INSERT INTO calon_jemaah (
    nama, kontak, alamat, sumber, paket, 
    staff_id, status_komunikasi, notes, created_at, updated_at
  ) VALUES (
    'Siti Nurhaliza', '089876543210', 'Jakarta', 'Referral', 
    'Umrah Standar', 2, 'Prospek Baru', 'Tertarik dengan diskon grup', NOW(), NOW()
  )
  ```
- Database return new prospect ID: 42
- Backend log activity:
  ```sql
  INSERT INTO activity_logs (
    user_id, action, model_type, model_id, description, created_at
  ) VALUES (
    1, 'create', 'CalonJemaah', 42, 'Created new prospect: Siti Nurhaliza', NOW()
  )
  ```

**Tahap 12: Backend response**
```
Backend-->>Frontend: 201 Created + new data
```
- Backend return HTTP 201 Created:
  ```json
  {
    "success": true,
    "message": "Prospect created successfully",
    "data": {
      "id": 42,
      "nama": "Siti Nurhaliza",
      "kontak": "089876543210",
      "alamat": "Jakarta",
      "sumber": "Referral",
      "paket": "Umrah Standar",
      "staff_id": 2,
      "status_komunikasi": "Prospek Baru",
      "created_at": "2026-04-18T10:30:00Z"
    }
  }
  ```

**Tahap 13-14: Frontend update & show**
```
Frontend->>Frontend: Update list + show success
Admin->>Frontend: See new prospect in list
```
- React state update: tambahkan prospect baru ke list
- Tutup modal form
- Tampilkan toast notification: "Prospect berhasil ditambahkan"
- Tabel list update real-time tanpa refresh page
- New prospect muncul di atas daftar

---

## 3. FOLLOW-UP SCHEDULING FLOW

### Kode Mermaid:
```mermaid
sequenceDiagram
    actor Admin
    participant Frontend
    participant Backend as Backend API
    participant DB as Database
    actor Staff

    Admin->>Frontend: Navigate to /jadwal
    Admin->>Frontend: Click "Buat Jadwal Follow Up"
    Frontend->>Frontend: Show form with prospects
    Admin->>Frontend: Select prospect & staff
    Admin->>Frontend: Set date, method, notes
    Admin->>Frontend: Submit form
    Frontend->>Backend: POST /api/jadwal-follow-up (data + token)
    Backend->>DB: INSERT into jadwal_follow_up
    DB-->>Backend: Schedule created
    Backend-->>Frontend: 201 Created + schedule
    Frontend->>Frontend: Update schedule list
    
    Staff->>Frontend: View assigned schedules
    Staff->>Frontend: Filter by date/status
    Frontend->>Backend: GET /api/jadwal-follow-up?filter=pending
    Backend->>DB: SELECT jadwal_follow_up WHERE status=pending AND staff_id=X
    DB-->>Backend: List of pending schedules
    Backend-->>Frontend: 200 OK + data
    
    Staff->>Frontend: Click schedule
    Frontend->>Frontend: Show schedule details
    Staff->>Frontend: Update status to "In Progress"
    Frontend->>Backend: PUT /api/jadwal-follow-up/{id} (status=in_progress)
    Backend->>DB: UPDATE jadwal_follow_up SET status='in_progress'
    DB-->>Backend: Updated
    Frontend->>Frontend: Update UI
```

### Penjelasan Tahap Per Tahap:

#### **TAHAP ADMIN - BUAT JADWAL**

**Tahap 1-3: Admin navigate & open form**
```
Admin->>Frontend: Navigate to /jadwal
Admin->>Frontend: Click "Buat Jadwal Follow Up"
Frontend->>Frontend: Show form with prospects
```
- Admin klik menu "Jadwal Follow Up" di sidebar
- Browser navigate ke `/jadwal`
- Admin klik tombol "Buat Jadwal"
- React render modal form dengan:
  - Dropdown list prospect (GET dari cache/state)
  - Dropdown list staff (GET dari cache/state)
  - Input field: Tanggal Follow Up (date picker)
  - Dropdown: Metode (Phone, Email, WhatsApp, Visit)
  - Textarea: Catatan

**Tahap 4-6: Admin fill & submit form**
```
Admin->>Frontend: Select prospect & staff
Admin->>Frontend: Set date, method, notes
Admin->>Frontend: Submit form
```
- Admin pilih prospect: "Ahmad Syaiful"
- Admin assign ke staff: "Eka (ID: 2)"
- Admin set tanggal: "2026-04-20"
- Admin pilih metode: "Phone Call"
- Admin tulis catatan: "Follow up status minat, tanya payment plan"
- Admin klik "Simpan"

**Tahap 7: Frontend → Backend (POST)**
```
Frontend->>Backend: POST /api/jadwal-follow-up (data + token)
```
- Frontend POST ke `http://127.0.0.1:8000/api/jadwal-follow-up`
- Headers:
  ```
  Authorization: Bearer token
  Content-Type: application/json
  ```
- Body:
  ```json
  {
    "calon_jemaah_id": 1,
    "staff_id": 2,
    "tanggal": "2026-04-20",
    "metode": "Phone Call",
    "catatan": "Follow up status minat, tanya payment plan"
  }
  ```

**Tahap 8-9: Backend → Database (INSERT)**
```
Backend->>DB: INSERT into jadwal_follow_up
DB-->>Backend: Schedule created
```
- Backend validate data
- Jalankan Eloquent create:
  ```php
  $jadwal = JadwalFollowUp::create([
    'calon_jemaah_id' => 1,
    'staff_id' => 2,
    'tanggal' => '2026-04-20',
    'metode' => 'Phone Call',
    'status' => 'pending', // default status
    'catatan' => 'Follow up status minat, tanya payment plan'
  ]);
  ```
- SQL INSERT:
  ```sql
  INSERT INTO jadwal_follow_up (
    calon_jemaah_id, staff_id, tanggal, metode, status, catatan, created_at, updated_at
  ) VALUES (
    1, 2, '2026-04-20', 'Phone Call', 'pending', 
    'Follow up status minat, tanya payment plan', NOW(), NOW()
  )
  ```
- Database return new schedule ID: 15
- Log activity:
  ```sql
  INSERT INTO activity_logs (
    user_id, action, model_type, model_id, description, created_at
  ) VALUES (
    1, 'create', 'JadwalFollowUp', 15, 
    'Created follow-up schedule for Ahmad (pending)', NOW()
  )
  ```

**Tahap 10: Backend response to Frontend**
```
Backend-->>Frontend: 201 Created + schedule
```
- Return HTTP 201:
  ```json
  {
    "success": true,
    "message": "Schedule created",
    "data": {
      "id": 15,
      "calon_jemaah_id": 1,
      "calon_jemaah": { "nama": "Ahmad Syaiful", ... },
      "staff_id": 2,
      "staff": { "name": "Eka", ... },
      "tanggal": "2026-04-20",
      "metode": "Phone Call",
      "status": "pending",
      "catatan": "Follow up status minat, tanya payment plan",
      "created_at": "2026-04-18T11:00:00Z"
    }
  }
  ```

**Tahap 11: Frontend update list**
```
Frontend->>Frontend: Update schedule list
```
- React add new schedule ke state
- Close modal
- Show toast: "Jadwal berhasil dibuat"
- List schedule ter-update

---

#### **TAHAP STAFF - LIHAT & UPDATE JADWAL**

**Tahap 12-14: Staff view assigned schedules**
```
Staff->>Frontend: View assigned schedules
Staff->>Frontend: Filter by date/status
Frontend->>Backend: GET /api/jadwal-follow-up?filter=pending
```
- Staff login dan navigate ke `/jadwal`
- Staff klik filter "Status: Pending"
- Frontend build query string: `/api/jadwal-follow-up?status=pending&staff_id=2`
- Frontend POST ke backend dengan Bearer token

**Tahap 15-17: Backend query dengan filter**
```
Backend->>DB: SELECT jadwal_follow_up WHERE status=pending AND staff_id=X
DB-->>Backend: List of pending schedules
Backend-->>Frontend: 200 OK + data
```
- Backend jalankan Eloquent query:
  ```php
  $jadwal = JadwalFollowUp::where('staff_id', 2)
            ->where('status', 'pending')
            ->with('calonJemaah', 'staff')
            ->orderBy('tanggal', 'asc')
            ->get();
  ```
- SQL:
  ```sql
  SELECT j.* FROM jadwal_follow_up j
  WHERE j.staff_id = 2 AND j.status = 'pending'
  ORDER BY j.tanggal ASC
  ```
- Database return pending schedules untuk staff 2:
  ```json
  [
    {
      "id": 15,
      "calon_jemaah_id": 1,
      "calon_jemaah": { "nama": "Ahmad Syaiful", ... },
      "staff_id": 2,
      "tanggal": "2026-04-20",
      "metode": "Phone Call",
      "status": "pending",
      "catatan": "Follow up status minat, tanya payment plan"
    },
    { ... more schedules ... }
  ]
  ```

**Tahap 18: Frontend render table**
```
Backend-->>Frontend: 200 OK + data
```
- React render table dengan columns:
  - Prospect Name & Contact
  - Follow-up Date
  - Method
  - Status (badge: yellow=pending, blue=in_progress, green=done)
  - Action buttons

**Tahap 19-21: Staff click & update status**
```
Staff->>Frontend: Click schedule
Frontend->>Frontend: Show schedule details
Staff->>Frontend: Update status to "In Progress"
```
- Staff klik row schedule untuk Ahmad
- React show detail modal:
  - Prospect: Ahmad Syaiful
  - Contact: 089123456789
  - Date: 2026-04-20
  - Method: Phone Call
  - Status dropdown: [Pending, In Progress, Done]
  - Notes
- Staff ubah status dari "Pending" ke "In Progress"
- Staff klik "Update"

**Tahap 22: Frontend → Backend (PUT request)**
```
Frontend->>Backend: PUT /api/jadwal-follow-up/{id} (status=in_progress)
```
- Frontend PUT ke `http://127.0.0.1:8000/api/jadwal-follow-up/15`
- Headers:
  ```
  Authorization: Bearer token
  Content-Type: application/json
  X-HTTP-Method-Override: PUT
  ```
- Body:
  ```json
  {
    "status": "in_progress"
  }
  ```

**Tahap 23-24: Backend → Database (UPDATE)**
```
Backend->>DB: UPDATE jadwal_follow_up SET status='in_progress'
DB-->>Backend: Updated
```
- Backend validate authorization (hanya staff dengan ID 2 atau admin)
- Jalankan Eloquent update:
  ```php
  $jadwal = JadwalFollowUp::find(15);
  $jadwal->update(['status' => 'in_progress']);
  ```
- SQL UPDATE:
  ```sql
  UPDATE jadwal_follow_up 
  SET status = 'in_progress', updated_at = NOW()
  WHERE id = 15
  ```
- Log activity:
  ```sql
  INSERT INTO activity_logs (
    user_id, action, model_type, model_id, description, created_at
  ) VALUES (
    2, 'update', 'JadwalFollowUp', 15, 
    'Updated status to in_progress', NOW()
  )
  ```

**Tahap 25: Frontend update UI**
```
Frontend->>Frontend: Update UI
```
- React update schedule status di table
- Status badge berubah dari yellow (pending) ke blue (in_progress)
- Close modal
- Show toast: "Status updated"

---

## 4. COMMUNICATION STATUS UPDATE FLOW

### Kode Mermaid:
```mermaid
sequenceDiagram
    actor Staff
    participant Frontend
    participant Backend as Backend API
    participant DB as Database
    participant Logger as Activity Log

    Staff->>Frontend: Open follow-up schedule
    Frontend->>Frontend: Show communication form
    Staff->>Frontend: Select status (Prospek Baru/Dihubungi/Tertarik/Closing/Tidak Jadi)
    Staff->>Frontend: Add notes/comments
    Staff->>Frontend: Set follow-up method (phone/email/visit)
    Staff->>Frontend: Submit
    
    Frontend->>Backend: POST /api/status-komunikasi (data + token)
    Backend->>Backend: Validate data & auth
    Backend->>DB: BEGIN TRANSACTION
    Backend->>DB: INSERT into status_komunikasi
    DB-->>Backend: Status record created
    
    alt Status = "Closing"
        Backend->>DB: INSERT into laporan_closing
        DB-->>Backend: Report created
    end
    
    Backend->>DB: UPDATE calon_jemaah SET status_komunikasi=?, last_follow_up_at=NOW()
    DB-->>Backend: Prospect updated
    
    Backend->>Logger: Log activity (user_id, action, model, description)
    Logger->>DB: INSERT into activity_logs
    DB-->>Backend: Activity logged
    
    Backend->>DB: COMMIT TRANSACTION
    DB-->>Backend: Committed
    
    Backend-->>Frontend: 201 Created + status record
    Frontend->>Frontend: Show success message
    Frontend->>Frontend: Update prospect status display
    Staff->>Frontend: Status updated successfully
```

### Penjelasan Tahap Per Tahap:

**Tahap 1-2: Staff open schedule & show form**
```
Staff->>Frontend: Open follow-up schedule
Frontend->>Frontend: Show communication form
```
- Staff klik schedule di tabel
- React render communication update form dengan fields:
  - Communication Status (dropdown)
  - Follow-up Method
  - Notes/Comments
  - Add action button

**Tahap 3-6: Staff fill form**
```
Staff->>Frontend: Select status (Prospek Baru/Dihubungi/Tertarik/Closing/Tidak Jadi)
Staff->>Frontend: Add notes/comments
Staff->>Frontend: Set follow-up method (phone/email/visit)
Staff->>Frontend: Submit
```
- Staff pilih status: "Tertarik"
- Staff pilih metode: "Phone Call"
- Staff tulis notes: "Tertarik paket Umrah Plus, akan diskusi dengan keluarga. Follow up minggu depan"
- Staff klik "Submit"

**Tahap 7: Frontend → Backend (POST)**
```
Frontend->>Backend: POST /api/status-komunikasi (data + token)
```
- Frontend POST ke `http://127.0.0.1:8000/api/status-komunikasi`
- Headers:
  ```
  Authorization: Bearer token
  Content-Type: application/json
  ```
- Body:
  ```json
  {
    "jadwal_follow_up_id": 15,
    "metode": "Phone Call",
    "status": "Tertarik",
    "catatan": "Tertarik paket Umrah Plus, akan diskusi dengan keluarga. Follow up minggu depan",
    "follow_up_at": "2026-04-18T14:30:00Z"
  }
  ```

**Tahap 8-9: Backend validate & start transaction**
```
Backend->>Backend: Validate data & auth
Backend->>DB: BEGIN TRANSACTION
```
- Backend validate request:
  - Token valid
  - Staff authorized untuk jadwal ini
  - Status value valid
  - Required fields ada
- Start database transaction untuk data integrity:
  ```php
  DB::beginTransaction();
  ```

**Tahap 10-11: Backend INSERT communication status**
```
Backend->>DB: INSERT into status_komunikasi
DB-->>Backend: Status record created
```
- Backend Eloquent create:
  ```php
  $statusKom = StatusKomunikasi::create([
    'jadwal_follow_up_id' => 15,
    'metode' => 'Phone Call',
    'status' => 'Tertarik',
    'catatan' => '...',
    'follow_up_at' => now()
  ]);
  ```
- SQL INSERT:
  ```sql
  INSERT INTO status_komunikasi (
    jadwal_follow_up_id, metode, status, catatan, follow_up_at, created_at, updated_at
  ) VALUES (
    15, 'Phone Call', 'Tertarik', '...', NOW(), NOW(), NOW()
  )
  ```
- Database return new status record

**Tahap 12-14: Backend conditional INSERT closing report**
```
alt Status = "Closing"
    Backend->>DB: INSERT into laporan_closing
    DB-->>Backend: Report created
end
```
- Jika status = "Closing":
  ```php
  if ($statusKom->status === 'Closing') {
    LaporanClosing::create([
      'calon_jemaah_id' => $jadwal->calon_jemaah_id,
      'closing_date' => now(),
      'package_value' => 10000000, // from package
      'notes' => $request->catatan
    ]);
  }
  ```
- SQL INSERT laporan_closing:
  ```sql
  INSERT INTO laporan_closing (
    calon_jemaah_id, closing_date, package_value, notes, created_at, updated_at
  ) VALUES (
    1, NOW(), 10000000, '...', NOW(), NOW()
  )
  ```

**Tahap 15-16: Backend UPDATE prospect**
```
Backend->>DB: UPDATE calon_jemaah SET status_komunikasi=?, last_follow_up_at=NOW()
DB-->>Backend: Prospect updated
```
- Backend update prospect record:
  ```php
  $jadwal->calonJemaah()->update([
    'status_komunikasi' => 'Tertarik',
    'last_follow_up_at' => now()
  ]);
  ```
- SQL UPDATE:
  ```sql
  UPDATE calon_jemaah 
  SET status_komunikasi = 'Tertarik', last_follow_up_at = NOW(), updated_at = NOW()
  WHERE id = 1
  ```

**Tahap 17-19: Backend log activity**
```
Backend->>Logger: Log activity (user_id, action, model, description)
Logger->>DB: INSERT into activity_logs
DB-->>Backend: Activity logged
```
- Backend create activity log:
  ```php
  ActivityLogService::log(
    user_id: 2,
    action: 'update_status',
    model: 'StatusKomunikasi',
    model_id: $statusKom->id,
    description: 'Updated communication status to Tertarik for Ahmad Syaiful'
  );
  ```
- SQL INSERT:
  ```sql
  INSERT INTO activity_logs (
    user_id, action, model_type, model_id, description, created_at
  ) VALUES (
    2, 'update_status', 'StatusKomunikasi', 'id', 
    'Updated communication status to Tertarik for Ahmad Syaiful', NOW()
  )
  ```

**Tahap 20-21: Backend COMMIT & response**
```
Backend->>DB: COMMIT TRANSACTION
DB-->>Backend: Committed
Backend-->>Frontend: 201 Created + status record
```
- Backend commit transaction:
  ```php
  DB::commit();
  ```
- SQL COMMIT dimulai jika semua query sukses
- Return HTTP 201:
  ```json
  {
    "success": true,
    "message": "Communication status updated",
    "data": {
      "id": 8,
      "jadwal_follow_up_id": 15,
      "metode": "Phone Call",
      "status": "Tertarik",
      "catatan": "...",
      "follow_up_at": "2026-04-18T14:30:00Z",
      "prospect": {
        "id": 1,
        "nama": "Ahmad Syaiful",
        "status_komunikasi": "Tertarik",
        "last_follow_up_at": "2026-04-18T14:30:00Z"
      }
    }
  }
  ```

**Tahap 22-24: Frontend update & show**
```
Frontend->>Frontend: Show success message
Frontend->>Frontend: Update prospect status display
Staff->>Frontend: Status updated successfully
```
- React show toast: "Status komunikasi berhasil diupdate"
- Update prospect card di list dengan status "Tertarik" (yellow badge)
- Update last_follow_up_at timestamp
- Close modal
- Table refresh menampilkan data terbaru

---

## 5. DASHBOARD & REPORTING FLOW

### Kode Mermaid:
```mermaid
sequenceDiagram
    actor Admin
    participant Frontend
    participant Backend as Backend API
    participant DB as Database
    participant Cache as Cache Layer

    Admin->>Frontend: Access Dashboard
    Frontend->>Backend: GET /api/reports/dashboard (Bearer token)
    Backend->>Backend: Verify token
    
    alt Data in Cache
        Backend->>Cache: Get cached dashboard data
        Cache-->>Backend: Cached data
    else Cache Miss
        Backend->>DB: COUNT(*) total prospects
        DB-->>Backend: Total count
        Backend->>DB: COUNT(*) pending follow-ups (today)
        DB-->>Backend: Pending count
        Backend->>DB: COUNT(*) closing status
        DB-->>Backend: Closing count
        Backend->>DB: Calculate conversion rate
        DB-->>Backend: Conversion %
        Backend->>DB: Get recent activities
        DB-->>Backend: Activity list
        Backend->>Cache: Store results (TTL: 5 min)
        Cache-->>Backend: Stored
    end
    
    Backend-->>Frontend: 200 OK + dashboard data
    Frontend->>Frontend: Render dashboard cards
    Frontend->>Frontend: Render conversion chart
    Frontend->>Frontend: Render activity timeline
    
    Admin->>Frontend: View by date range
    Frontend->>Frontend: Update filter (date range)
    Frontend->>Backend: GET /api/reports/closing?start=X&end=Y
    Backend->>DB: Query laporan_closing WHERE date BETWEEN ? AND ?
    DB-->>Backend: Filtered closing data
    Backend-->>Frontend: 200 OK + report data
    Frontend->>Frontend: Update reports display
    Admin->>Frontend: See conversion rate report
```

### Penjelasan Tahap Per Tahap:

**Tahap 1-2: Admin access dashboard**
```
Admin->>Frontend: Access Dashboard
Frontend->>Backend: GET /api/reports/dashboard (Bearer token)
```
- Admin login & klik Dashboard di sidebar
- Browser navigate ke `/` (dashboard)
- React component mounted: `<Dashboard />`
- React useEffect trigger: fetch dashboard data
- Frontend GET ke `http://127.0.0.1:8000/api/reports/dashboard`
- Headers:
  ```
  Authorization: Bearer token
  Content-Type: application/json
  ```

**Tahap 3: Backend verify token**
```
Backend->>Backend: Verify token
```
- Laravel middleware verify bearer token
- Query `personal_access_tokens` table
- Cek token valid & tidak expired
- Return user data attached to request

**Tahap 4-7: Backend check cache vs query DB**
```
alt Data in Cache
    Backend->>Cache: Get cached dashboard data
    Cache-->>Backend: Cached data
else Cache Miss
    ...query database...
end
```

**KONDISI 1: Data Ada di Cache**
```
Backend->>Cache: Get cached dashboard data
Cache-->>Backend: Cached data
```
- Backend cek Laravel Cache (Redis/Memcached):
  ```php
  $dashboardData = Cache::get('dashboard_data_' . Auth::id());
  ```
- Jika data ada di cache & belum expired → gunakan cached data
- Response time ~10ms (sangat cepat)

**KONDISI 2: Cache Miss - Query Database**
```
Backend->>DB: COUNT(*) total prospects
DB-->>Backend: Total count
```
- Backend jalankan SQL COUNT:
  ```sql
  SELECT COUNT(*) as total FROM calon_jemaah
  ```
- Response: `total: 28`

```
Backend->>DB: COUNT(*) pending follow-ups (today)
DB-->>Backend: Pending count
```
- Query pending follow-ups hari ini:
  ```sql
  SELECT COUNT(*) as pending FROM jadwal_follow_up
  WHERE DATE(tanggal) = CURDATE() AND status = 'pending'
  ```
- Response: `pending: 5`

```
Backend->>DB: COUNT(*) closing status
DB-->>Backend: Closing count
```
- Query closing ini bulan:
  ```sql
  SELECT COUNT(*) as closing FROM laporan_closing
  WHERE MONTH(closing_date) = MONTH(NOW())
  AND YEAR(closing_date) = YEAR(NOW())
  ```
- Response: `closing: 12`

```
Backend->>DB: Calculate conversion rate
DB-->>Backend: Conversion %
```
- Calculate conversion rate:
  ```php
  $conversionRate = ($closingThisMonth / $totalProspects) * 100;
  // = (12 / 28) * 100 = 42.86%
  ```

```
Backend->>DB: Get recent activities
DB-->>Backend: Activity list
```
- Query recent activities (last 10):
  ```sql
  SELECT * FROM activity_logs
  ORDER BY created_at DESC
  LIMIT 10
  ```

```
Backend->>Cache: Store results (TTL: 5 min)
Cache-->>Backend: Stored
```
- Backend cache hasil untuk 5 menit:
  ```php
  Cache::put(
    'dashboard_data_' . Auth::id(),
    $dashboardData,
    now()->addMinutes(5)
  );
  ```

**Tahap 8: Backend response to Frontend**
```
Backend-->>Frontend: 200 OK + dashboard data
```
- Return HTTP 200 dengan JSON:
  ```json
  {
    "success": true,
    "data": {
      "total_prospects": 28,
      "pending_today": 5,
      "closing_this_month": 12,
      "conversion_rate": 42.86,
      "recent_activities": [
        {
          "id": 1,
          "user_name": "Eka",
          "action": "update_status",
          "description": "Updated status to Tertarik",
          "created_at": "2026-04-18T14:30:00Z"
        },
        ...
      ]
    }
  }
  ```

**Tahap 9-11: Frontend render dashboard**
```
Frontend->>Frontend: Render dashboard cards
Frontend->>Frontend: Render conversion chart
Frontend->>Frontend: Render activity timeline
```
- React update state dengan API response
- Render card components:
  - Card 1: "Total Prospects: 28"
  - Card 2: "Pending Today: 5"
  - Card 3: "Closing This Month: 12"
  - Card 4: "Conversion Rate: 42.86%"
- Render chart (Chart.js):
  - Bar chart: Prospects per month
  - Line chart: Conversion rate trend
  - Pie chart: Status distribution
- Render activity timeline dengan list activities

**Tahap 12-15: Admin filter by date range**
```
Admin->>Frontend: View by date range
Frontend->>Frontend: Update filter (date range)
Frontend->>Backend: GET /api/reports/closing?start=X&end=Y
```
- Admin klik filter "Custom Date Range"
- DatePicker dialog muncul
- Admin select: Dari "2026-04-01" hingga "2026-04-18"
- React update date state
- Frontend build query string: `?start_date=2026-04-01&end_date=2026-04-18`
- Frontend POST ke `/api/reports/closing?start_date=2026-04-01&end_date=2026-04-18`

**Tahap 16-17: Backend query closing reports**
```
Backend->>DB: Query laporan_closing WHERE date BETWEEN ? AND ?
DB-->>Backend: Filtered closing data
```
- Backend validate date parameters
- Query closing reports:
  ```sql
  SELECT 
    COUNT(*) as total,
    SUM(package_value) as total_value
  FROM laporan_closing
  WHERE closing_date BETWEEN '2026-04-01' AND '2026-04-18'
  ```
- Detail closing reports:
  ```sql
  SELECT 
    lc.*,
    c.nama,
    u.name as staff_name
  FROM laporan_closing lc
  JOIN calon_jemaah c ON lc.calon_jemaah_id = c.id
  JOIN users u ON c.staff_id = u.id
  WHERE lc.closing_date BETWEEN '2026-04-01' AND '2026-04-18'
  ORDER BY lc.closing_date DESC
  ```
- Response dengan detail closing reports (8 records dalam range ini)

**Tahap 18: Backend response**
```
Backend-->>Frontend: 200 OK + report data
```
- Return HTTP 200:
  ```json
  {
    "success": true,
    "data": {
      "summary": {
        "total_closing": 8,
        "total_value": 80000000,
        "average_value": 10000000
      },
      "details": [
        {
          "id": 1,
          "prospect_name": "Ahmad Syaiful",
          "staff_name": "Eka",
          "closing_date": "2026-04-18",
          "package_value": 12000000,
          "notes": "..."
        },
        ...
      ]
    }
  }
  ```

**Tahap 19-21: Frontend render reports**
```
Frontend->>Frontend: Update reports display
Admin->>Frontend: See conversion rate report
```
- React update report section
- Render summary cards dengan filter date
- Render detailed table dengan 8 closing records
- Update conversion rate calculation: 8/28 = 28.57%
- Report fully updated

---

## 6. LOGOUT FLOW

### Kode Mermaid:
```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend as Backend API
    participant DB as Database
    participant Auth as Sanctum

    User->>Frontend: Click user menu
    Frontend->>Frontend: Show dropdown (Logout)
    User->>Frontend: Click Logout
    Frontend->>Backend: POST /api/logout (Bearer token)
    Backend->>Auth: Revoke token
    Auth->>DB: Find & delete API token
    DB-->>Auth: Deleted
    Auth->>Backend: Token revoked
    Backend->>DB: Log activity (logout)
    DB-->>Backend: Logged
    Backend-->>Frontend: 200 OK (logged out)
    Frontend->>Frontend: Clear localStorage (token, user)
    Frontend->>Frontend: Clear AuthContext
    Frontend->>Frontend: Redirect to /login
    User->>Frontend: Redirected to login page
```

### Penjelasan Tahap Per Tahap:

**Tahap 1-3: User click logout**
```
User->>Frontend: Click user menu
Frontend->>Frontend: Show dropdown (Logout)
User->>Frontend: Click Logout
```
- Admin klik user avatar/name di navbar
- React render dropdown menu dengan options:
  - Profile
  - Settings
  - Logout
- Admin klik "Logout"

**Tahap 4: Frontend → Backend (POST logout)**
```
Frontend->>Backend: POST /api/logout (Bearer token)
```
- Frontend POST ke `http://127.0.0.1:8000/api/logout`
- Headers:
  ```
  Authorization: Bearer eyJhbGci...
  Content-Type: application/json
  ```
- Body: (kosong atau bisa berisi user_id)

**Tahap 5-8: Backend revoke token**
```
Backend->>Auth: Revoke token
Auth->>DB: Find & delete API token
DB-->>Auth: Deleted
Auth->>Backend: Token revoked
```
- Backend Sanctum revoke token:
  ```php
  Auth::user()->currentAccessToken()->delete();
  ```
- Jalankan SQL DELETE:
  ```sql
  DELETE FROM personal_access_tokens
  WHERE id = (SELECT token_id WHERE token = HASH(Bearer_Token))
  LIMIT 1
  ```
- Database confirm deletion
- Sanctum return confirmation

**Tahap 9-10: Backend log activity & response**
```
Backend->>DB: Log activity (logout)
DB-->>Backend: Logged
Backend-->>Frontend: 200 OK (logged out)
```
- Log logout activity:
  ```sql
  INSERT INTO activity_logs (
    user_id, action, model_type, model_id, description, created_at
  ) VALUES (
    1, 'logout', 'User', 1, 'User logged out', NOW()
  )
  ```
- Return HTTP 200:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

**Tahap 11-13: Frontend cleanup**
```
Frontend->>Frontend: Clear localStorage (token, user)
Frontend->>Frontend: Clear AuthContext
Frontend->>Frontend: Redirect to /login
```
- Clear localStorage:
  ```javascript
  localStorage.removeItem('api_token');
  localStorage.removeItem('user');
  ```
- Clear AuthContext:
  ```typescript
  setAuth({
    user: null,
    token: null,
    isAuthenticated: false
  })
  ```
- React-Router navigate ke `/login`:
  ```javascript
  navigate('/login', { replace: true });
  ```

**Tahap 14: Login page displayed**
```
User->>Frontend: Redirected to login page
```
- Browser render login page
- User bisa login kembali

---

## 7. ROLE-BASED ACCESS CONTROL (RBAC) FLOW

### Kode Mermaid:
```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant ProtectedRoute
    participant AuthContext
    participant Backend as Backend API

    User->>Frontend: Try to access protected route
    Frontend->>ProtectedRoute: Check route access
    ProtectedRoute->>AuthContext: Get auth state
    AuthContext-->>ProtectedRoute: { user, token, isAuth }
    
    alt No Token (Not Logged In)
        ProtectedRoute->>Frontend: Redirect to /login
        Frontend->>User: Show login page
    else Has Token
        ProtectedRoute->>AuthContext: Get user role
        
        alt Route requires admin
            AuthContext-->>ProtectedRoute: user.role
            
            alt Role = "admin"
                ProtectedRoute->>Frontend: Render protected component
                Frontend->>Backend: GET /api/data (Bearer token)
                Backend->>Backend: Verify token
                Backend->>Backend: Check user role
                
                alt Role authorized
                    Backend-->>Frontend: 200 OK + data
                    Frontend->>User: Show admin content
                else Role not authorized
                    Backend-->>Frontend: 403 Forbidden
                    Frontend->>User: Show error
                end
            else Role != "admin"
                ProtectedRoute->>Frontend: Redirect to /unauthorized
                Frontend->>User: Show "Not authorized" page
            end
        else Route allows staff
            ProtectedRoute->>Frontend: Render protected component
            Frontend->>User: Show staff content
        end
    end
```

### Penjelasan Tahap Per Tahap:

**Tahap 1-4: Check authentication**
```
User->>Frontend: Try to access protected route
Frontend->>ProtectedRoute: Check route access
ProtectedRoute->>AuthContext: Get auth state
AuthContext-->>ProtectedRoute: { user, token, isAuth }
```
- User ketik URL: `http://localhost:5173/pengguna` (manage users - admin only)
- React-Router render `<ProtectedRoute>` component
- ProtectedRoute check auth context:
  ```typescript
  const { user, token, isAuthenticated } = useAuth();
  ```
- AuthContext return auth state object

**Tahap 5-7: No token - redirect to login**
```
alt No Token (Not Logged In)
    ProtectedRoute->>Frontend: Redirect to /login
    Frontend->>User: Show login page
```
- Jika `token === null && isAuthenticated === false`:
  ```typescript
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  ```
- React-Router navigate ke `/login`
- User lihat login page

**KONDISI KEDUA: Has Token**

```
else Has Token
    ProtectedRoute->>AuthContext: Get user role
```

**Tahap 8-11: Check role requirement**
```
alt Route requires admin
    AuthContext-->>ProtectedRoute: user.role
    
    alt Role = "admin"
        ProtectedRoute->>Frontend: Render protected component
```
- Ambil `user.role` dari AuthContext
- Cek route requirement (dari route config):
  ```typescript
  const adminOnlyRoutes = ['/pengguna', '/reports', '/settings'];
  const staffAllowedRoutes = ['/jemaah', '/jadwal'];
  ```
- Jika route = `/pengguna` (admin only) & user.role = "admin":
  - Render component
  - Component muncul di browser

```
        Frontend->>Backend: GET /api/data (Bearer token)
```
- Component mount, jalankan useEffect
- Fetch data dari backend dengan token:
  ```typescript
  const response = await fetch('/api/data', {
    headers: { Authorization: `Bearer ${token}` }
  });
  ```

```
        Backend->>Backend: Verify token
        Backend->>Backend: Check user role
```
- Backend middleware verify token:
  ```php
  $user = Auth::guard('sanctum')->user();
  ```
- Check user role:
  ```php
  if ($user->role !== 'admin') {
    return response()->json(['error' => 'Forbidden'], 403);
  }
  ```

```
        alt Role authorized
            Backend-->>Frontend: 200 OK + data
            Frontend->>User: Show admin content
```
- Role authorized → return HTTP 200 dengan data
- Frontend render admin-only content

```
        else Role not authorized
            Backend-->>Frontend: 403 Forbidden
            Frontend->>User: Show error
```
- Jika role tidak sesuai → return 403 Forbidden
- Frontend show error: "You don't have permission"

**Tahap 12-14: Role != admin - redirect to unauthorized**
```
    else Role != "admin"
        ProtectedRoute->>Frontend: Redirect to /unauthorized
        Frontend->>User: Show "Not authorized" page
```
- Jika user.role = "staff" tapi route = `/pengguna`:
  ```typescript
  if (user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }
  ```
- React navigate ke `/unauthorized`
- User lihat error page

**Tahap 15: Route allows staff**
```
    else Route allows staff
        ProtectedRoute->>Frontend: Render protected component
        Frontend->>User: Show staff content
```
- Jika route = `/jemaah` (allows both admin & staff):
  ```typescript
  if (['admin', 'staff'].includes(user.role)) {
    return children;
  }
  ```
- Component render normally
- Staff bisa akses content

---

## Ringkasan Alur Keseluruhan

### Lifecycle User di Sistem:

1. **LOGIN** → Token generated di backend, disimpan di frontend
2. **NAVIGATION** → ProtectedRoute check token & role
3. **DATA REQUEST** → Frontend POST/GET with Bearer token
4. **BACKEND VALIDATION** → Verify token, check role, execute query
5. **DATABASE** → Execute SQL, return data
6. **RESPONSE** → Backend return 200 OK atau error
7. **FRONTEND UPDATE** → State update, UI re-render
8. **LOGOUT** → Token deleted, localStorage cleared, redirect to login

### Key Points:

✅ **Frontend Security:**
- Token stored in localStorage (persisten across refresh)
- AuthContext for global auth state
- ProtectedRoute for client-side access control

✅ **Backend Security:**
- Sanctum middleware verify token
- Role check di setiap endpoint
- Activity logging untuk audit trail
- Transaction handling untuk data integrity

✅ **Database:**
- Proper relationships dengan foreign keys
- Indexed columns untuk performance
- Soft delete capability (future)
- Audit trail di activity_logs table

---

*Dokumentasi ini dibuat: April 18, 2026*