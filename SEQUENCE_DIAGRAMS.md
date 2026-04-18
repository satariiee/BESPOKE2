# Sequence Diagrams - Jemaah Follow Up Management System

Dokumen ini berisi semua kode Mermaid untuk sequence diagrams sistem.

---

## 1. Authentication Flow - Login

**Deskripsi:** Menunjukkan alur login dari user input hingga token tersimpan dan redirect ke dashboard

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

---

## 2. Prospect Management Flow

**Deskripsi:** Menunjukkan alur CRUD operasi untuk manajemen data calon jemaah

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

---

## 3. Follow-up Scheduling Flow

**Deskripsi:** Menunjukkan alur pembuatan jadwal follow-up oleh admin dan akses oleh staff

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

---

## 4. Communication Status Update Flow

**Deskripsi:** Menunjukkan alur update status komunikasi dengan transaction handling dan activity logging

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

---

## 5. Dashboard & Reporting Flow

**Deskripsi:** Menunjukkan alur dashboard dengan caching strategy untuk performa optimal

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

---

## 6. Logout Flow

**Deskripsi:** Menunjukkan alur logout dengan token revocation dan cache clearing

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

---

## 7. Role-Based Access Control Flow

**Deskripsi:** Menunjukkan alur validasi akses berdasarkan role dari frontend hingga backend

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

---

## Catatan Penggunaan

### Cara Menggunakan Kode Mermaid:

1. **Di Markdown File:**
   ```markdown
   ```mermaid
   [PASTE KODE MERMAID DI SINI]
   ```
   ```

2. **Di GitHub:**
   - Langsung paste kode dalam code block dengan ` ```mermaid `
   - GitHub akan otomatis merender diagram

3. **Di Dokumentasi Online:**
   - Gunakan [Mermaid Live Editor](https://mermaid.live)
   - Copy-paste kode dan klik "Copy as Markdown"

4. **Di Aplikasi lain:**
   - Notion: Paste ke code block dengan language "mermaid"
   - Confluence: Gunakan Mermaid diagram macro
   - VS Code: Install extension "Markdown Preview Mermaid Support"

---

## Ringkasan Diagram:

| No | Nama | Deskripsi | Actors |
|----|------|-----------|--------|
| 1 | Authentication Flow | Login & token generation | User, Frontend, Backend, Sanctum |
| 2 | Prospect Management | CRUD for calon jemaah | Admin, Frontend, Backend, DB |
| 3 | Follow-up Scheduling | Create & track schedules | Admin, Staff, Frontend, Backend |
| 4 | Status Communication | Update komunikasi & logging | Staff, Frontend, Backend, DB, Logger |
| 5 | Dashboard & Reporting | Analytics dengan caching | Admin, Frontend, Backend, Cache |
| 6 | Logout | Token revocation & cleanup | User, Frontend, Backend, Sanctum |
| 7 | RBAC | Role-based access control | User, Frontend, ProtectedRoute, Backend |

---

*Generated: April 18, 2026*