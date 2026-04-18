# COMPLETE SYSTEM EXPLANATION - Jemaah Follow Up Management System
## Presentasi Lengkap untuk Fundamental Understanding

**Date:** April 18, 2026  
**Purpose:** Comprehensive documentation untuk presentasi  
**Audience:** Technical & non-technical presenters

---

# 📚 TABLE OF CONTENTS

1. [Overview Aplikasi](#1-overview-aplikasi)
2. [Tech Stack & Tools](#2-tech-stack--tools)
3. [DFD Level 0 & 1](#3-dfd-data-flow-diagram)
4. [ERD - Database Schema](#4-erd-entity-relationship-diagram)
5. [Class Diagram](#5-class-diagram)
6. [System Architecture](#6-system-architecture)
7. [API Endpoints & Functions](#7-api-endpoints--functions)
8. [Controller Functions](#8-controller-functions)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Backend Architecture](#10-backend-architecture)
11. [Sequence Diagrams](#11-sequence-diagrams)
12. [Application Flow](#12-complete-application-flow)
13. [Security Implementation](#13-security-implementation)

---

# 1. OVERVIEW APLIKASI

## 🎯 Visi & Misi

**Aplikasi:** Jemaah Follow Up Management System

**Visi:**
- Menyediakan sistem CRM terintegrasi untuk bisnis travel umroh/haji
- Meningkatkan efisiensi tim marketing dalam mengelola prospek
- Meningkatkan conversion rate melalui follow-up terstruktur

**Misi:**
- Centralized data management
- Automated follow-up tracking
- Real-time performance analytics
- Role-based access control

## 👥 Users & Roles

```
┌─────────────────────────────────────────┐
│         Jemaah Follow Up System          │
└─────────────────────────────────────────┘
              ↓
        ┌─────┴─────┐
        ↓           ↓
    ┌──────┐    ┌──────┐
    │ ADMIN│    │STAFF │
    └──────┘    └──────┘
    
ADMIN:
├─ Kelola user (staff)
├─ Kelola seluruh data prospek
├─ Buat & assign jadwal follow-up
├─ Lihat semua activity & reports
└─ Full system access

STAFF (Marketing):
├─ Lihat prospek yang di-assign
├─ Lakukan follow-up
├─ Update status komunikasi
├─ Lihat personal activity log
└─ Limited access
```

## 📊 Problem & Solution

**Masalah Sebelumnya:**
- Data prospek tersebar (Excel, WhatsApp, Notes)
- Tidak ada tracking follow-up yang sistematis
- Sulit monitor progres sale
- Tidak ada performance metrics

**Solusi Aplikasi:**
- Database terpusat untuk semua prospek
- Scheduling system otomatis
- Real-time status tracking
- Dashboard analytics & reports

---

# 2. TECH STACK & TOOLS

## 🛠️ Frontend Stack

### **React 18 + TypeScript**
```
Mengapa React?
├─ Component-based architecture
├─ Virtual DOM untuk performance
├─ Large community & ecosystem
├─ Easy state management

Mengapa TypeScript?
├─ Type safety (catch errors early)
├─ Better IDE support
├─ Self-documenting code
└─ Catch bugs before runtime
```

### **Vite Build Tool**
```
Mengapa Vite?
├─ Hot Module Replacement (HMR)
├─ Fast development server (<100ms)
├─ Optimized bundle size
├─ Native ES modules support

Perbandingan dengan Webpack:
├─ Webpack: 5-10 detik build time
├─ Vite: <1 detik build time
└─ Vite: Modern & faster!
```

### **Tailwind CSS**
```
Utility-first CSS framework

Keuntungan:
├─ Responsive design built-in
├─ Consistent styling
├─ Small bundle size
├─ Easy theming & customization

Contoh:
└─ <button className="bg-blue-500 text-white px-4 py-2 rounded">
       Click me
   </button>
```

### **React Router**
```
Client-side routing

Features:
├─ Navigation tanpa page refresh
├─ Protected routes (role-based)
├─ History management
├─ Dynamic route parameters
```

### **Axios / Fetch API**
```
HTTP client untuk API calls

Fungsi:
├─ POST /api/login (authentication)
├─ GET /api/calon-jemaah (fetch data)
├─ PUT /api/jadwal-follow-up (update)
├─ DELETE /api/calon-jemaah (delete)
└─ Auto inject Bearer token di headers
```

## 🗄️ Backend Stack

### **Laravel 11**
```
PHP Web Framework

Mengapa Laravel?
├─ MVC Architecture (Model-View-Controller)
├─ Eloquent ORM (easy DB access)
├─ Built-in authentication (Sanctum)
├─ Powerful routing system
├─ Middleware support
├─ Database migrations
└─ Testing framework (PHPUnit)

Architecture:
├─ Models: Data representation
├─ Controllers: Business logic
├─ Routes: URL mapping
├─ Migrations: Database schema
└─ Services: Reusable business logic
```

### **MySQL 8.0**
```
Relational Database

Mengapa MySQL?
├─ Open source & free
├─ Reliable & stable
├─ Good performance for OLTP
├─ ACID transactions support
├─ Foreign key constraints
└─ Good for normalization

Features digunakan:
├─ Transactions (data integrity)
├─ Relationships (foreign keys)
├─ Indexes (performa query)
├─ Date/timestamp columns
└─ Enum types (status fields)
```

### **Laravel Sanctum**
```
API Authentication & Token Management

Fungsi:
├─ Generate API tokens
├─ Token validation
├─ Route middleware protection
├─ Personal access tokens table
└─ Token revocation

Flow:
1. User login → generate token
2. Store hashed token di personal_access_tokens
3. Frontend kirim token di Authorization header
4. Backend verify token
5. Middleware attach user ke request
6. Route handler bisa akses Auth::user()
```

## 🔗 Integration Points

```
┌──────────────┐
│   Frontend   │ (React + TypeScript + Vite)
│  (Port 5173) │
└──────┬───────┘
       │ HTTP/HTTPS
       │ Bearer Token
       │
       ↓
┌──────────────────────┐
│  Backend API         │ (Laravel 11)
│  (Port 8000)         │
│  - Routes            │
│  - Controllers       │
│  - Middleware        │
│  - Sanctum Auth      │
└──────┬───────────────┘
       │ SQL Queries
       │
       ↓
┌──────────────┐
│   MySQL 8.0  │ (Database)
│ (Port 3306)  │
└──────────────┘

CORS Configuration:
├─ Frontend: http://localhost:5173
├─ Backend: http://127.0.0.1:8000
└─ allowed origins: localhost:5173, 127.0.0.1:5173
```

---

# 3. DFD (Data Flow Diagram)

## DFD Level 0 - Context Diagram

```
                    ┌─────────────────────┐
                    │   System External   │
                    │    Actors/Users     │
                    └─────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ↓                  ↓                  ↓
    ┌──────┐          ┌──────┐          ┌──────┐
    │ ADMIN│          │STAFF │          │ DATA │
    └───┬──┘          └───┬──┘          └──┬───┘
        │                  │                │
        │  1. Request      │  1. Request    │
        │  2. Response     │  2. Response   │
        │                  │                │
        └──────────────────┼────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────┐
        │  Jemaah Follow Up Management     │
        │      System (Black Box)          │
        │                                  │
        │  - Authentication                │
        │  - Data Management               │
        │  - Follow-up Tracking            │
        │  - Reporting & Analytics         │
        └──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ↓                  ↓                  ↓
    ┌─────────┐     ┌──────────┐      ┌────────┐
    │ Reports │     │ Activities│      │Alerts  │
    └─────────┘     └──────────┘      └────────┘
```

## DFD Level 1 - Main Processes

```
┌─────────────────────────────────────────────────────────────┐
│                    Jemaah Follow Up System                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ACTOR: Admin / Staff                                         │
└─────────────────────────────────────────────────────────────┘

                    ↓

    ┌───────────────────────────────────────┐
    │  P1: Authentication & Authorization   │
    │  ├─ Login                             │
    │  ├─ Verify Token                      │
    │  └─ Role-based Access Control         │
    └───────────────────────────────────────┘
                    ↓
    D1: Users (email, password, role)
    D2: Tokens (personal_access_tokens)
                    ↓
            ┌──────────────────┐
            │   User Request   │
            │   Authenticated  │
            └──────────────────┘
                    ↓
    ┌───────────────────────────────────────┐
    │  P2: Prospect Management              │
    │  ├─ Create prospect                   │
    │  ├─ Read prospect list                │
    │  ├─ Update prospect info              │
    │  └─ Delete prospect                   │
    └───────────────────────────────────────┘
                    ↓
    D3: Calon Jemaah (name, contact, source, package, etc)
                    ↓
    ┌───────────────────────────────────────┐
    │  P3: Follow-up Scheduling             │
    │  ├─ Create jadwal follow-up           │
    │  ├─ View assigned schedules           │
    │  ├─ Update schedule status            │
    │  └─ Filter by date/staff/status       │
    └───────────────────────────────────────┘
                    ↓
    D4: Jadwal Follow Up (date, method, status, notes)
                    ↓
    ┌───────────────────────────────────────┐
    │  P4: Communication Tracking           │
    │  ├─ Record communication status       │
    │  ├─ Log communication history         │
    │  ├─ Update prospect status            │
    │  └─ Create closing report (if status) │
    └───────────────────────────────────────┘
                    ↓
    D5: Status Komunikasi (status, method, date, notes)
    D6: Laporan Closing (closing_date, value, notes)
    D7: Activity Logs (action, timestamp, user)
                    ↓
    ┌───────────────────────────────────────┐
    │  P5: Reporting & Analytics            │
    │  ├─ Dashboard metrics                 │
    │  ├─ Conversion rate calculation       │
    │  ├─ Activity timeline                 │
    │  └─ Closing reports (by date range)   │
    └───────────────────────────────────────┘
                    ↓
    Return: Reports, Charts, Metrics
                    ↓
    Admin/Staff View Results

DATA STORES:
├─ D1: Users Table
├─ D2: Personal Access Tokens
├─ D3: Calon Jemaah
├─ D4: Jadwal Follow Up
├─ D5: Status Komunikasi
├─ D6: Laporan Closing
└─ D7: Activity Logs
```

## DFD Level 2 - Detail P2 (Prospect Management)

```
┌────────────────────────────────────────────────────┐
│  P2: Prospect Management (Detail)                  │
└────────────────────────────────────────────────────┘

ADMIN/STAFF Request
        ↓
    ┌──────────────────────────────────┐
    │  P2.1: Validate Request          │
    │  ├─ Check token valid            │
    │  ├─ Check user role              │
    │  ├─ Check data integrity         │
    │  └─ Validate input format        │
    └──────────────────────────────────┘
        ↓
    If invalid → Return error 400/403
    If valid → Continue
        ↓
    ┌──────────────────────────────────┐
    │  P2.2: Route to Sub-Process      │
    │  ├─ GET → P2.3 (Read)            │
    │  ├─ POST → P2.4 (Create)         │
    │  ├─ PUT → P2.5 (Update)          │
    │  └─ DELETE → P2.6 (Delete)       │
    └──────────────────────────────────┘
        ↓ (example: POST)
    ┌──────────────────────────────────┐
    │  P2.4: Create Prospect           │
    │  1. Extract data dari request    │
    │  2. Validate format & required   │
    │  3. INSERT ke calon_jemaah table │
    │  4. Log activity                 │
    │  5. Return 201 + new data        │
    └──────────────────────────────────┘
        ↓
    D3: Calon Jemaah (INSERT/READ/UPDATE/DELETE)
        ↓
    Return response ke frontend
```

---

# 4. ERD (Entity Relationship Diagram)

## Database Schema Visual

```
┌─────────────────────┐         ┌────────────────────────┐
│     Users           │         │ Personal Access Tokens │
├─────────────────────┤         ├────────────────────────┤
│ PK: id              │◄───┐    │ PK: id                 │
│ email (unique)      │    │    │ token (hashed)         │
│ password (hashed)   │    │    │ tokenable_id (FK)      │
│ name                │    └────│ tokenable_type='User'  │
│ phone               │         │ created_at             │
│ role (admin/staff)  │         │ last_used_at           │
│ is_active           │         └────────────────────────┘
│ created_at          │
└─────────────────────┘
    │         ▲
    │         │ 1:Many
    │         │
1:Many│       │
    │         │
    ↓         │
┌────────────────────────┐      ┌──────────────────────────┐
│  Calon Jemaah          │      │  Jadwal Follow Up        │
├────────────────────────┤      ├──────────────────────────┤
│ PK: id                 │◄─┐   │ PK: id                   │
│ nama                   │  │   │ calon_jemaah_id (FK)◄───┤
│ kontak                 │  │   │ staff_id (FK)            │
│ alamat                 │  │   │ tanggal                  │
│ sumber                 │  │   │ metode                   │
│ paket                  │  │   │ status (pending/done)    │
│ staff_id (FK)          │  │   │ catatan                  │
│ status_komunikasi      │  │   │ created_at               │
│ last_follow_up_at      │  │   └──────────────────────────┘
│ notes                  │  │       │
│ created_at             │  │   1:Many
└────────────────────────┘  │       │
    │                        │       ↓
    │                        │   ┌──────────────────────────┐
    │                        │   │ Status Komunikasi        │
    │                        │   ├──────────────────────────┤
    │                        │   │ PK: id                   │
    │                        │   │ jadwal_follow_up_id (FK) │
1:Many                       │   │ metode                   │
    │                        │   │ status (5 options)       │
    │                        └───│ catatan                  │
    │                            │ follow_up_at             │
    │                            │ created_at               │
    │                            └──────────────────────────┘
    │                                │
    │                            1:1 │ (conditional)
    │                                ↓
    │                            ┌──────────────────────────┐
    │                            │ Laporan Closing          │
    │                            ├──────────────────────────┤
    │                            │ PK: id                   │
    └───────────────────────────│ calon_jemaah_id (FK)     │
                                │ closing_date             │
                                │ package_value            │
                                │ notes                    │
                                │ created_at               │
                                └──────────────────────────┘

                            ┌──────────────────────────┐
                            │ Activity Logs            │
                            ├──────────────────────────┤
                            │ PK: id                   │
                            │ user_id (FK)             │
                            │ action                   │
                            │ model_type               │
                            │ model_id                 │
                            │ description              │
                            │ created_at               │
                            └──────────────────────────┘
```

## Relationships Detail

```
1. Users ←→ Calon Jemaah (1:Many)
   ├─ 1 staff dapat assign banyak prospek
   ├─ Foreign Key: calon_jemaah.staff_id → users.id
   └─ Jika staff dihapus → prospek tetap ada (soft delete potential)

2. Calon Jemaah ←→ Jadwal Follow Up (1:Many)
   ├─ 1 prospek dapat punya banyak jadwal follow-up
   ├─ Foreign Key: jadwal_follow_up.calon_jemaah_id → calon_jemaah.id
   └─ Tracking setiap follow-up attempt

3. Jadwal Follow Up ←→ Status Komunikasi (1:Many)
   ├─ 1 jadwal dapat punya banyak status (history)
   ├─ Foreign Key: status_komunikasi.jadwal_follow_up_id → jadwal_follow_up.id
   └─ Audit trail komunikasi

4. Jadwal Follow Up ←→ Users (Many:1)
   ├─ Banyak jadwal bisa di-assign ke 1 staff
   ├─ Foreign Key: jadwal_follow_up.staff_id → users.id
   └─ Track siapa yang handle follow-up

5. Calon Jemaah ←→ Laporan Closing (1:1)
   ├─ 1 prospek bisa punya maksimal 1 closing report
   ├─ Foreign Key: laporan_closing.calon_jemaah_id → calon_jemaah.id
   ├─ Created saat Status Komunikasi = "Closing"
   └─ Final record ketika prospek close

6. Activity Logs ←→ Users (Many:1)
   ├─ Banyak activity dari 1 user
   ├─ Foreign Key: activity_logs.user_id → users.id
   └─ Audit trail untuk security
```

---

# 5. CLASS DIAGRAM

## Backend Classes

```
┌────────────────────────────────────────┐
│           User Model                   │
├────────────────────────────────────────┤
│ Properties:                            │
│ - id: integer                          │
│ - name: string                         │
│ - email: string                        │
│ - password: string (hashed)            │
│ - phone: string                        │
│ - role: enum(admin, staff)             │
│ - is_active: boolean                   │
│ - created_at: timestamp                │
│                                        │
│ Methods:                               │
│ + hasRole(role): boolean               │
│ + canAccess(resource): boolean         │
│ + tokens(): Relation                   │
│ + calonJemaah(): Relation              │
│ + jadwalFollowUps(): Relation          │
│ + activityLogs(): Relation             │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│        CalonJemaah Model               │
├────────────────────────────────────────┤
│ Properties:                            │
│ - id: integer                          │
│ - nama: string                         │
│ - kontak: string                       │
│ - alamat: text                         │
│ - sumber: string                       │
│ - paket: string                        │
│ - staff_id: integer (FK)               │
│ - status_komunikasi: enum              │
│ - last_follow_up_at: timestamp         │
│ - notes: text                          │
│                                        │
│ Methods:                               │
│ + getStatus(): string                  │
│ + updateStatus(status): void           │
│ + staff(): Relation                    │
│ + jadwalFollowUps(): Relation          │
│ + closingReport(): Relation            │
│ + canBeAccessedBy(user): boolean       │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│      JadwalFollowUp Model              │
├────────────────────────────────────────┤
│ Properties:                            │
│ - id: integer                          │
│ - calon_jemaah_id: integer (FK)        │
│ - staff_id: integer (FK)               │
│ - tanggal: date                        │
│ - metode: string                       │
│ - status: enum(pending, in_progress)   │
│ - catatan: text                        │
│                                        │
│ Methods:                               │
│ + markAsDone(): void                   │
│ + isPending(): boolean                 │
│ + calonJemaah(): Relation              │
│ + staff(): Relation                    │
│ + statusKomunikasi(): Relation         │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│      StatusKomunikasi Model            │
├────────────────────────────────────────┤
│ Properties:                            │
│ - id: integer                          │
│ - jadwal_follow_up_id: integer (FK)    │
│ - metode: string                       │
│ - status: enum (5 options)             │
│ - catatan: text                        │
│ - follow_up_at: timestamp              │
│                                        │
│ Methods:                               │
│ + isClosing(): boolean                 │
│ + getStatusColor(): string             │
│ + jadwalFollowUp(): Relation           │
└────────────────────────────────────────┘

         ↓ Relationships

User ←────────────────→ CalonJemaah
 │ 1                        │
 │                          │ Many
 │                      Many│
 └──────→ JadwalFollowUp ←───┘
          │
          │ 1
          │ Many
          ↓
      StatusKomunikasi
          │
          │ (if closing)
          ↓
      LaporanClosing
```

## Frontend Components

```
┌────────────────────────────────────────┐
│         App Component                  │
├────────────────────────────────────────┤
│ Purpose: Root component, routing       │
│ State: AuthContext                     │
│ Routes:                                │
│ - /login → <Login />                   │
│ - / → <ProtectedRoute> <Dashboard />   │
│ - /jemaah → <ProtectedRoute> <Jemaah />│
│ - /jadwal → <ProtectedRoute> <Jadwal />│
│ - /pengguna → Admin only               │
└────────────────────────────────────────┘
        │
        ├─ <AuthContext.Provider>
        │
        ├─ <BrowserRouter>
        │
        └─ <Routes>

┌────────────────────────────────────────┐
│      Login Component                   │
├────────────────────────────────────────┤
│ State:                                 │
│ - email: string                        │
│ - password: string                     │
│ - loading: boolean                     │
│ - error: string                        │
│                                        │
│ Methods:                               │
│ + handleSubmit(): Promise              │
│ + POST /api/login                      │
│ + setAuth(context)                     │
│ + localStorage.setItem('api_token')    │
│ + navigate('/')                        │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│   ProtectedRoute Component             │
├────────────────────────────────────────┤
│ Props:                                 │
│ - children: ReactNode                  │
│ - requiredRole?: string                │
│                                        │
│ Logic:                                 │
│ - Check token exists                   │
│ - Check role if required               │
│ - Render children or redirect          │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│    Dashboard Component                 │
├────────────────────────────────────────┤
│ State:                                 │
│ - metrics: object                      │
│ - activities: array                    │
│ - loading: boolean                     │
│                                        │
│ Effects:                               │
│ + useEffect → GET /api/reports/dash    │
│ + Fetch metrics                        │
│ + Render cards                         │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│      Jemaah Component                  │
├────────────────────────────────────────┤
│ State:                                 │
│ - jemaahList: array                    │
│ - filters: object                      │
│ - showForm: boolean                    │
│ - selectedJemaah: object               │
│                                        │
│ Methods:                               │
│ + fetchJemaah(): GET /api/calon-jemaah │
│ + createJemaah(): POST                 │
│ + updateJemaah(): PUT                  │
│ + deleteJemaah(): DELETE               │
│ + handleFilter(): filter list          │
│ + handleSearch(): search               │
└────────────────────────────────────────┘

    Similar Components:
    - <Jadwal /> (follow-up scheduling)
    - <Reports /> (reporting & analytics)
    - <Navbar /> (navigation & user info)
    - <Sidebar /> (role-based menu)
```

---

# 6. SYSTEM ARCHITECTURE

## Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                         │
│                   (React Browser App)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Pages/      │  │  Components  │  │  Hooks/      │     │
│  │  Routes      │  │              │  │  Context     │     │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤     │
│  │ Login        │  │ Navbar       │  │ useAuth      │     │
│  │ Dashboard    │  │ Sidebar      │  │ useEffect    │     │
│  │ Jemaah       │  │ Form         │  │ useState     │     │
│  │ Jadwal       │  │ Table        │  └──────────────┘     │
│  │ Reports      │  │ Modal        │                       │
│  └──────────────┘  └──────────────┘                       │
│                                                             │
│                     ↓ HTTP Requests                        │
│            (with Authorization: Bearer Token)             │
└────────────────────────┬──────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │ CORS Policy Check             │
         └───────────────┬───────────────┘
                         │
┌────────────────────────┴──────────────────────────────────┐
│                   API LAYER                              │
│              (Laravel Backend - Port 8000)               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────┐            │
│  │ Routing Layer (routes/api.php)           │            │
│  │ POST   /login     → AuthController       │            │
│  │ POST   /logout    → AuthController       │            │
│  │ GET    /calon-jemaah → JemaahController  │            │
│  │ POST   /calon-jemaah → JemaahController  │            │
│  │ PUT    /jadwal-follow-up/{id}            │            │
│  │ POST   /status-komunikasi                │            │
│  └──────────────────────────────────────────┘            │
│                         ↓                                 │
│  ┌──────────────────────────────────────────┐            │
│  │ Middleware Layer                         │            │
│  │ 1. Sanctum Auth Middleware               │            │
│  │    - Extract Bearer token                │            │
│  │    - Verify token exists                 │            │
│  │    - Query personal_access_tokens        │            │
│  │    - Attach user to request              │            │
│  │ 2. CORS Middleware                       │            │
│  │ 3. Request Validation                    │            │
│  └──────────────────────────────────────────┘            │
│                         ↓                                 │
│  ┌──────────────────────────────────────────┐            │
│  │ Controller Layer                         │            │
│  │ Business logic & data processing         │            │
│  │ - Validate input                         │            │
│  │ - Check authorization                    │            │
│  │ - Call services/models                   │            │
│  │ - Format response                        │            │
│  └──────────────────────────────────────────┘            │
│                         ↓                                 │
│  ┌──────────────────────────────────────────┐            │
│  │ Service Layer (Optional)                 │            │
│  │ Reusable business logic                  │            │
│  │ - ActivityLogService                     │            │
│  │ - ReportService                          │            │
│  │ - etc.                                   │            │
│  └──────────────────────────────────────────┘            │
│                         ↓                                 │
│  ┌──────────────────────────────────────────┐            │
│  │ Model Layer (Eloquent ORM)               │            │
│  │ - User                                   │            │
│  │ - CalonJemaah                            │            │
│  │ - JadwalFollowUp                         │            │
│  │ - StatusKomunikasi                       │            │
│  │ - LaporanClosing                         │            │
│  │ - ActivityLog                            │            │
│  └──────────────────────────────────────────┘            │
│                         ↓                                 │
│              SQL Queries Generated                        │
└────────────────────────┬──────────────────────────────────┘
                         │
┌────────────────────────┴──────────────────────────────────┐
│                  DATABASE LAYER                          │
│              (MySQL - Port 3306)                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Tables:                                                 │
│  ├─ users                                                │
│  ├─ personal_access_tokens                               │
│  ├─ calon_jemaah                                         │
│  ├─ jadwal_follow_up                                     │
│  ├─ status_komunikasi                                    │
│  ├─ laporan_closing                                      │
│  └─ activity_logs                                        │
│                                                          │
│  Operations:                                             │
│  ├─ INSERT (create new records)                          │
│  ├─ SELECT (read data)                                   │
│  ├─ UPDATE (modify records)                              │
│  ├─ DELETE (remove records)                              │
│  └─ TRANSACTIONS (data integrity)                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

# 7. API ENDPOINTS & FUNCTIONS

## Authentication Endpoints

```
┌─────────────────────────────────────────────────┐
│ POST /api/login                                 │
├─────────────────────────────────────────────────┤
│ Purpose: Authenticate user & generate token     │
│ Auth: None (public)                             │
│                                                 │
│ Request Body:                                   │
│ {                                               │
│   "email": "admin@jemaah.com",                  │
│   "password": "admin123"                        │
│ }                                               │
│                                                 │
│ Response (200 OK):                              │
│ {                                               │
│   "success": true,                              │
│   "data": {                                      │
│     "user": {                                    │
│       "id": 1,                                   │
│       "name": "Admin",                           │
│       "email": "admin@jemaah.com",               │
│       "role": "admin"                            │
│     },                                           │
│     "token": "eyJhb..."                          │
│   }                                              │
│ }                                               │
│                                                 │
│ Errors:                                         │
│ 401: Invalid credentials                        │
│ 422: Validation failed                          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ POST /api/logout                                │
├─────────────────────────────────────────────────┤
│ Purpose: Revoke current user's token            │
│ Auth: Bearer Token (required)                   │
│                                                 │
│ Request Headers:                                │
│ Authorization: Bearer eyJhb...                  │
│                                                 │
│ Response (200 OK):                              │
│ {                                               │
│   "success": true,                              │
│   "message": "Logged out successfully"          │
│ }                                               │
│                                                 │
│ Errors:                                         │
│ 401: Unauthorized (no token)                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ GET /api/profile                                │
├─────────────────────────────────────────────────┤
│ Purpose: Get logged-in user's profile           │
│ Auth: Bearer Token (required)                   │
│                                                 │
│ Response (200 OK):                              │
│ {                                               │
│   "success": true,                              │
│   "data": {                                      │
│     "id": 1,                                     │
│     "name": "Admin",                             │
│     "email": "admin@jemaah.com",                 │
│     "role": "admin",                             │
│     "is_active": true                            │
│   }                                              │
│ }                                               │
└─────────────────────────────────────────────────┘
```

## Prospect Management Endpoints

```
┌─────────────────────────────────────────────────┐
│ GET /api/calon-jemaah                           │
├─────────────────────────────────────────────────┤
│ Purpose: List all prospects (with filters)      │
│ Auth: Bearer Token (admin/staff)                │
│                                                 │
│ Query Parameters:                               │
│ ?status=tertarik&staff_id=2&search=ahmad       │
│                                                 │
│ Response (200 OK):                              │
│ {                                               │
│   "success": true,                              │
│   "data": [                                      │
│     {                                            │
│       "id": 1,                                   │
│       "nama": "Ahmad Syaiful",                   │
│       "kontak": "089123456789",                  │
│       "sumber": "WhatsApp",                      │
│       "paket": "Umrah Plus",                     │
│       "status_komunikasi": "Tertarik",           │
│       "staff": { "id": 2, "name": "Eka" }       │
│     },                                           │
│     ...                                          │
│   ]                                              │
│ }                                               │
│                                                 │
│ Errors:                                         │
│ 401: Unauthorized                              │
│ 403: Forbidden (role tidak sesuai)              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ POST /api/calon-jemaah                          │
├─────────────────────────────────────────────────┤
│ Purpose: Create new prospect                    │
│ Auth: Bearer Token (admin)                      │
│                                                 │
│ Request Body:                                   │
│ {                                               │
│   "nama": "Siti Nurhaliza",                      │
│   "kontak": "089876543210",                      │
│   "alamat": "Jakarta",                           │
│   "sumber": "Referral",                          │
│   "paket": "Umrah Standar",                      │
│   "staff_id": 2,                                 │
│   "notes": "Tertarik dengan diskon grup"         │
│ }                                               │
│                                                 │
│ Response (201 Created):                         │
│ {                                               │
│   "success": true,                              │
│   "message": "Prospect created",                 │
│   "data": {                                      │
│     "id": 42,                                    │
│     "nama": "Siti Nurhaliza",                    │
│     ... (full object)                            │
│   }                                              │
│ }                                               │
│                                                 │
│ Errors:                                         │
│ 422: Validation failed                          │
│ 403: Forbidden (admin only)                     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ PUT /api/calon-jemaah/{id}                      │
├─────────────────────────────────────────────────┤
│ Purpose: Update prospect information            │
│ Auth: Bearer Token (admin/staff own assignment) │
│                                                 │
│ Request Body:                                   │
│ {                                               │
│   "nama": "Siti Nurhaliza",                      │
│   "kontak": "089876543215",                      │
│   "paket": "Umrah Plus",                         │
│   "notes": "Updated info"                        │
│ }                                               │
│                                                 │
│ Response (200 OK):                              │
│ {                                               │
│   "success": true,                              │
│   "data": { ... updated object ... }            │
│ }                                               │
│                                                 │
│ Errors:                                         │
│ 404: Prospect not found                         │
│ 403: Unauthorized                               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ DELETE /api/calon-jemaah/{id}                   │
├─────────────────────────────────────────────────┤
│ Purpose: Delete prospect                        │
│ Auth: Bearer Token (admin)                      │
│                                                 │
│ Response (200 OK):                              │
│ {                                               │
│   "success": true,                              │
│   "message": "Prospect deleted"                 │
│ }                                               │
│                                                 │
│ Errors:                                         │
│ 404: Not found                                  │
│ 403: Forbidden                                  │
└─────────────────────────────────────────────────┘
```

## Follow-up Scheduling Endpoints

```
┌─────────────────────────────────────────────────┐
│ GET /api/jadwal-follow-up                       │
├─────────────────────────────────────────────────┤
│ Purpose: List follow-up schedules (with filter) │
│ Auth: Bearer Token (admin/staff)                │
│                                                 │
│ Query:                                          │
│ ?status=pending&staff_id=2&date_from=2026-04-18│
│                                                 │
│ Response (200 OK):                              │
│ [                                               │
│   {                                             │
│     "id": 15,                                    │
│     "calon_jemaah": { "id": 1, "nama": "..." }, │
│     "staff": { "id": 2, "name": "Eka" },        │
│     "tanggal": "2026-04-20",                     │
│     "metode": "Phone Call",                      │
│     "status": "pending",                         │
│     "catatan": "Follow up status minat"          │
│   },                                             │
│   ...                                            │
│ ]                                               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ POST /api/jadwal-follow-up                      │
├─────────────────────────────────────────────────┤
│ Purpose: Create new follow-up schedule          │
│ Auth: Bearer Token (admin)                      │
│                                                 │
│ Request:                                        │
│ {                                               │
│   "calon_jemaah_id": 1,                          │
│   "staff_id": 2,                                 │
│   "tanggal": "2026-04-20",                       │
│   "metode": "Phone Call",                        │
│   "catatan": "Follow up status minat"            │
│ }                                               │
│                                                 │
│ Response (201 Created):                         │
│ { ... created schedule object ... }             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ PUT /api/jadwal-follow-up/{id}                  │
├─────────────────────────────────────────────────┤
│ Purpose: Update schedule status                 │
│ Auth: Bearer Token (staff/admin)                │
│                                                 │
│ Request:                                        │
│ {                                               │
│   "status": "in_progress"                        │
│ }                                               │
│                                                 │
│ Response (200 OK):                              │
│ { ... updated schedule ... }                    │
└─────────────────────────────────────────────────┘
```

## Communication Status Endpoints

```
┌─────────────────────────────────────────────────┐
│ POST /api/status-komunikasi                     │
├─────────────────────────────────────────────────┤
│ Purpose: Record communication status & result   │
│ Auth: Bearer Token (staff)                      │
│ Important: Triggers transaction + logging       │
│                                                 │
│ Request:                                        │
│ {                                               │
│   "jadwal_follow_up_id": 15,                     │
│   "metode": "Phone Call",                        │
│   "status": "Tertarik",                          │
│   "catatan": "Tertarik paket Umrah Plus",        │
│   "follow_up_at": "2026-04-18T14:30:00Z"         │
│ }                                               │
│                                                 │
│ Backend Processing:                             │
│ 1. BEGIN TRANSACTION                            │
│ 2. INSERT into status_komunikasi                │
│ 3. IF status=='Closing' → INSERT laporan_closing│
│ 4. UPDATE calon_jemaah status                   │
│ 5. INSERT activity log                          │
│ 6. COMMIT                                       │
│                                                 │
│ Response (201 Created):                         │
│ {                                               │
│   "success": true,                              │
│   "data": {                                      │
│     "id": 8,                                     │
│     "status": "Tertarik",                        │
│     "prospect_updated": true,                    │
│     "closing_report_created": false              │
│   }                                              │
│ }                                               │
│                                                 │
│ Errors:                                         │
│ 422: Validation failed / Invalid status         │
│ 500: Transaction failed                         │
└─────────────────────────────────────────────────┘
```

## Reporting Endpoints

```
┌─────────────────────────────────────────────────┐
│ GET /api/reports/dashboard                      │
├─────────────────────────────────────────────────┤
│ Purpose: Get dashboard metrics                  │
│ Auth: Bearer Token (admin/staff)                │
│ Caching: 5 minutes TTL                          │
│                                                 │
│ Response (200 OK):                              │
│ {                                               │
│   "total_prospects": 28,                         │
│   "pending_today": 5,                            │
│   "closing_this_month": 12,                      │
│   "conversion_rate": 42.86,                      │
│   "recent_activities": [                         │
│     {                                            │
│       "user": "Eka",                             │
│       "action": "Update Status",                 │
│       "timestamp": "2026-04-18 14:30"             │
│     },                                           │
│     ...                                          │
│   ]                                              │
│ }                                               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ GET /api/reports/closing                        │
├─────────────────────────────────────────────────┤
│ Purpose: Get closing reports with filters       │
│ Auth: Bearer Token (admin)                      │
│                                                 │
│ Query:                                          │
│ ?start_date=2026-04-01&end_date=2026-04-18     │
│                                                 │
│ Response (200 OK):                              │
│ {                                               │
│   "summary": {                                   │
│     "total_closing": 8,                          │
│     "total_value": 80000000,                     │
│     "average_value": 10000000                    │
│   },                                             │
│   "details": [                                   │
│     {                                            │
│       "prospect_name": "Ahmad",                  │
│       "staff_name": "Eka",                       │
│       "closing_date": "2026-04-18",              │
│       "package_value": 12000000,                 │
│       "package_name": "Umrah Plus"               │
│     },                                           │
│     ...                                          │
│   ]                                              │
│ }                                               │
└─────────────────────────────────────────────────┘
```

---

# 8. CONTROLLER FUNCTIONS

## AuthController

```php
class AuthController extends Controller
{
    // POST /api/login
    public function login(Request $request)
    {
        // 1. Validate input
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);
        
        // 2. Query user by email
        $user = User::where('email', $validated['email'])->first();
        
        // 3. Check if user exists
        if (!$user) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }
        
        // 4. Verify password
        if (!Hash::check($validated['password'], $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }
        
        // 5. Check if user is active
        if (!$user->is_active) {
            return response()->json(['error' => 'Account inactive'], 403);
        }
        
        // 6. Generate token
        $token = $user->createToken('api_token')->plainTextToken;
        
        // 7. Log activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'login',
            'description' => 'User logged in'
        ]);
        
        // 8. Return response with token
        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role
                ],
                'token' => $token
            ]
        ]);
    }
    
    // POST /api/logout
    public function logout(Request $request)
    {
        // 1. Get authenticated user
        $user = Auth::user();
        
        // 2. Revoke current token
        $user->currentAccessToken()->delete();
        
        // 3. Log activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'logout',
            'description' => 'User logged out'
        ]);
        
        // 4. Return response
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }
    
    // GET /api/profile
    public function profile(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()
        ]);
    }
}
```

## JemaahController

```php
class JemaahController extends Controller
{
    // GET /api/calon-jemaah
    public function index(Request $request)
    {
        // 1. Get authenticated user
        $user = Auth::user();
        
        // 2. Start query builder
        $query = CalonJemaah::with(['staff']);
        
        // 3. Apply filters based on user role
        if ($user->role === 'staff') {
            // Staff hanya bisa lihat prospek mereka
            $query->where('staff_id', $user->id);
        }
        // Admin bisa lihat semua
        
        // 4. Apply search filter
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('nama', 'like', "%$search%")
                  ->orWhere('kontak', 'like', "%$search%");
        }
        
        // 5. Apply status filter
        if ($request->has('status')) {
            $query->where('status_komunikasi', $request->get('status'));
        }
        
        // 6. Apply staff filter (admin only)
        if ($request->has('staff_id') && $user->role === 'admin') {
            $query->where('staff_id', $request->get('staff_id'));
        }
        
        // 7. Execute query
        $jemaah = $query->orderBy('created_at', 'desc')->get();
        
        // 8. Return response
        return response()->json([
            'success' => true,
            'data' => $jemaah
        ]);
    }
    
    // POST /api/calon-jemaah
    public function store(Request $request)
    {
        // 1. Check authorization (admin only)
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        
        // 2. Validate input
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'kontak' => 'required|string|max:20',
            'alamat' => 'required|string',
            'sumber' => 'required|string',
            'paket' => 'required|string',
            'staff_id' => 'required|exists:users,id',
            'notes' => 'nullable|string'
        ]);
        
        // 3. Create prospect
        $jemaah = CalonJemaah::create([
            ...$validated,
            'status_komunikasi' => 'Prospek Baru'
        ]);
        
        // 4. Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'create',
            'model_type' => 'CalonJemaah',
            'model_id' => $jemaah->id,
            'description' => "Created prospect: {$jemaah->nama}"
        ]);
        
        // 5. Return response
        return response()->json([
            'success' => true,
            'message' => 'Prospect created',
            'data' => $jemaah->load('staff')
        ], 201);
    }
    
    // PUT /api/calon-jemaah/{id}
    public function update(Request $request, CalonJemaah $jemaah)
    {
        // 1. Check authorization
        $user = Auth::user();
        if ($user->role === 'staff' && $jemaah->staff_id !== $user->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        
        // 2. Validate input
        $validated = $request->validate([
            'nama' => 'sometimes|string|max:100',
            'kontak' => 'sometimes|string|max:20',
            'alamat' => 'sometimes|string',
            'paket' => 'sometimes|string',
            'notes' => 'nullable|string'
        ]);
        
        // 3. Update prospect
        $jemaah->update($validated);
        
        // 4. Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'update',
            'model_type' => 'CalonJemaah',
            'model_id' => $jemaah->id,
            'description' => "Updated prospect: {$jemaah->nama}"
        ]);
        
        // 5. Return response
        return response()->json([
            'success' => true,
            'data' => $jemaah
        ]);
    }
    
    // DELETE /api/calon-jemaah/{id}
    public function destroy(CalonJemaah $jemaah)
    {
        // 1. Check authorization (admin only)
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        
        // 2. Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'delete',
            'model_type' => 'CalonJemaah',
            'model_id' => $jemaah->id,
            'description' => "Deleted prospect: {$jemaah->nama}"
        ]);
        
        // 3. Delete prospect
        $jemaah->delete();
        
        // 4. Return response
        return response()->json([
            'success' => true,
            'message' => 'Prospect deleted'
        ]);
    }
}
```

## StatusKomunikasiController

```php
class StatusKomunikasiController extends Controller
{
    // POST /api/status-komunikasi
    // IMPORTANT: Uses transaction for data integrity
    public function store(Request $request)
    {
        // 1. Validate input
        $validated = $request->validate([
            'jadwal_follow_up_id' => 'required|exists:jadwal_follow_up,id',
            'metode' => 'required|string',
            'status' => 'required|in:Prospek Baru,Dihubungi,Tertarik,Closing,Tidak Jadi',
            'catatan' => 'required|string',
            'follow_up_at' => 'required|date'
        ]);
        
        // 2. Get jadwal to verify authorization
        $jadwal = JadwalFollowUp::find($validated['jadwal_follow_up_id']);
        $user = Auth::user();
        
        // Check if user is authorized
        if ($user->role === 'staff' && $jadwal->staff_id !== $user->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        
        // 3. START DATABASE TRANSACTION
        DB::beginTransaction();
        
        try {
            // 4. Create status komunikasi record
            $status = StatusKomunikasi::create($validated);
            
            // 5. IF status = Closing → Create laporan_closing
            if ($validated['status'] === 'Closing') {
                LaporanClosing::create([
                    'calon_jemaah_id' => $jadwal->calon_jemaah_id,
                    'closing_date' => now(),
                    'package_value' => 10000000, // dari package logic
                    'notes' => $validated['catatan']
                ]);
            }
            
            // 6. Update prospect status
            $jadwal->calonJemaah()->update([
                'status_komunikasi' => $validated['status'],
                'last_follow_up_at' => now()
            ]);
            
            // 7. Update jadwal status
            $jadwal->update(['status' => 'done']);
            
            // 8. Log activity
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'update_status',
                'model_type' => 'StatusKomunikasi',
                'model_id' => $status->id,
                'description' => "Updated status to {$validated['status']}"
            ]);
            
            // 9. COMMIT TRANSACTION
            DB::commit();
            
            // 10. Return response
            return response()->json([
                'success' => true,
                'message' => 'Status updated',
                'data' => $status
            ], 201);
            
        } catch (\Exception $e) {
            // If error occurred → ROLLBACK all changes
            DB::rollback();
            
            return response()->json([
                'error' => 'Failed to update status',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
```

---

# 9. FRONTEND ARCHITECTURE

## Component Hierarchy

```
App
├── AuthContext (Global State)
│   ├── user: object
│   ├── token: string
│   ├── isAuthenticated: boolean
│   └── setAuth(): function
│
├── Routes
│   ├── / (public)
│   │   └── <Login />
│   │
│   └── Protected Routes
│       ├── / (Dashboard)
│       │   └── <Dashboard />
│       │       ├── <MetricsCard />
│       │       ├── <ActivityChart />
│       │       └── <RecentActivities />
│       │
│       ├── /jemaah (Prospect Management)
│       │   └── <Jemaah />
│       │       ├── <SearchBar />
│       │       ├── <FilterBar />
│       │       ├── <ProspectTable />
│       │       ├── <ProspectForm /> (modal)
│       │       └── <ProspectDetail /> (modal)
│       │
│       ├── /jadwal (Follow-up Schedule)
│       │   └── <Jadwal />
│       │       ├── <ScheduleForm /> (modal)
│       │       ├── <ScheduleList />
│       │       └── <ScheduleDetail /> (modal)
│       │
│       ├── /laporan (Reports)
│       │   └── <Reports />
│       │       ├── <DateRangeFilter />
│       │       ├── <ConversionChart />
│       │       └── <ClosingTable />
│       │
│       └── /pengguna (User Management - Admin Only)
│           └── <Pengguna />
│               ├── <UserForm /> (modal)
│               └── <UserTable />
│
└── Layout
    ├── <Navbar />
    │   ├── Logo
    │   ├── User Info
    │   └── Logout Button
    │
    └── <Sidebar />
        ├── Dashboard Link
        ├── Jemaah Link
        ├── Jadwal Link
        ├── Reports Link (admin)
        └── Users Link (admin)
```

## State Management Pattern

```
Frontend State Management:

┌────────────────────────────────────────┐
│         AuthContext (Global)           │
├────────────────────────────────────────┤
│ Manages:                               │
│ - User authentication                  │
│ - User role/permissions                │
│ - API token storage                    │
│ - Login/logout operations              │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│    Component Local State (useState)    │
├────────────────────────────────────────┤
│ Examples:                              │
│ - Jemaah component state:              │
│   * jemaahList: []                     │
│   * filters: {}                        │
│   * showForm: boolean                  │
│   * selectedJemaah: object             │
│   * loading: boolean                   │
│   * error: string                      │
│                                        │
│ - Dashboard component state:           │
│   * metrics: {}                        │
│   * activities: []                     │
│   * loading: boolean                   │
└────────────────────────────────────────┘

Data Flow:
1. User interacts with component
2. Component trigger useState/useEffect
3. Fetch API with Bearer token (from AuthContext)
4. Backend verify token
5. Backend return 200 OK + data
6. Frontend setState with new data
7. Component re-render with new data
```

## API Integration Pattern

```typescript
// Typical API call in Frontend

// 1. In useEffect hook
useEffect(() => {
  const fetchJemaah = async () => {
    try {
      setLoading(true);
      
      // 2. Get token from AuthContext
      const token = useAuth().token;
      
      // 3. Build URL with parameters
      let url = '/api/calon-jemaah';
      if (filters.status) url += `?status=${filters.status}`;
      
      // 4. Make API request
      const response = await fetch(`http://127.0.0.1:8000${url}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,  // Attach token
          'Content-Type': 'application/json'
        }
      });
      
      // 5. Check response status
      if (response.status === 401) {
        // Token expired
        logout(); // Redirect to login
        return;
      }
      
      if (response.status === 403) {
        // Forbidden
        setError('You do not have permission');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      
      // 6. Parse JSON response
      const data = await response.json();
      
      // 7. Update state
      setJemaahList(data.data);
      setError(null);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchJemaah();
}, [filters]); // Re-run when filters change
```

---

# 10. BACKEND ARCHITECTURE

## MVC Pattern Implementation

```
MVC = Model - View - Controller

In Laravel API (No View Layer):

┌──────────────────────────────────────┐
│           Routes (routes/api.php)    │
├──────────────────────────────────────┤
│ Maps URLs to Controller Actions       │
│                                       │
│ POST   /login     → AuthController    │
│ GET    /jemaah    → JemaahController  │
│ POST   /jemaah    → JemaahController  │
└───────────────┬──────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│       Controllers                    │
├──────────────────────────────────────┤
│ Business Logic:                      │
│ - Validate requests                  │
│ - Check authorization                │
│ - Call models/services               │
│ - Format response                    │
│ - Handle errors                      │
└───────────────┬──────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│         Models (Eloquent ORM)        │
├──────────────────────────────────────┤
│ Database Abstraction:                │
│ - Define table schema                │
│ - Define relationships               │
│ - Provide query builder              │
│ - Handle data validation             │
│ - Define fillable attributes         │
└───────────────┬──────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│    JSON Response (viewed by Frontend)│
├──────────────────────────────────────┤
│ {                                    │
│   "success": true,                   │
│   "data": [ ... ]                    │
│ }                                    │
└──────────────────────────────────────┘
```

## Request Lifecycle

```
1. HTTP Request arrives
   ↓
2. Laravel Bootstrap (load config, services)
   ↓
3. Middleware Pipeline
   ├─ CORS Middleware
   ├─ Sanctum Auth Middleware (verify token)
   ├─ Request validation middleware
   └─ Custom middleware
   ↓
4. Routing (match URL to controller action)
   ↓
5. Authorization Check (if using policies)
   ↓
6. Controller Action Execution
   ├─ Validate request data
   ├─ Call model/service
   ├─ Process business logic
   └─ Build response
   ↓
7. Response Middleware
   ├─ Add headers
   ├─ Format JSON
   └─ Compress if needed
   ↓
8. HTTP Response sent to Frontend
```

## Middleware Flow

```
Request In
    ↓
┌─────────────────────────────────┐
│ 1. Encryption Middleware        │
│    - Decrypt cookie data        │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 2. CORS Middleware              │
│    - Check allowed origins      │
│    - Set CORS headers           │
│    - Validate preflight request │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 3. Sanctum Auth Middleware      │
│    - Extract Bearer token       │
│    - Hash token                 │
│    - Query personal_access_tokens
│    - Find user                  │
│    - Attach to request          │
│    - Continue or return 401     │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 4. Request Validation           │
│    - Validate JSON format       │
│    - Check required fields      │
│    - Type casting               │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 5. Route Handler (Controller)   │
│    - Receive verified request   │
│    - Execute business logic     │
│    - Return response            │
└─────────────────────────────────┘
    ↓
Response Out
```

## Database Query Optimization

```
Inefficient Pattern (N+1 Query Problem):

Controller:
$jemaah = CalonJemaah::all(); // 1 query
foreach ($jemaah as $j) {
    echo $j->staff->name; // 28 separate queries
}
// Total: 29 queries! ❌

Optimized Pattern (Eager Loading):

Controller:
$jemaah = CalonJemaah::with('staff')->get();
// 2 queries: 1 for jemaah, 1 for all staff
foreach ($jemaah as $j) {
    echo $j->staff->name; // No additional queries
}
// Total: 2 queries! ✅
```

---

# 11. SEQUENCE DIAGRAMS (Summary)

## Authentication Sequence

```
User → Frontend → Backend → DB → Frontend → User
 │        │         │       │       │        │
 └─Login  │         │       │       │        │
          │         │       │       │        │
          └─POST    │       │       │        │
          /login    │       │       │        │
                    │       │       │        │
                    └─Query │       │        │
                    user    │       │        │
                            │       │        │
                    ← User  ├───────┘        │
                    data    │                │
                            │                │
                    Generate token          │
                    & save to DB             │
                            │                │
                    ← HTTP 200 OK ├──────────┘
                    + token      │
                                 │
                    Save token & user to localStorage
                    Navigate to Dashboard
```

---

# 12. COMPLETE APPLICATION FLOW

## User Journey from Login to Logout

```
┌────────────────────────────────────────────────────────┐
│ STEP 1: USER VISITS APPLICATION                        │
└────────────────────────────────────────────────────────┘
        │
        User visits: http://localhost:5173
        │
        Browser loads React app
        │
        App component: Check if token in localStorage?
        │
        ├─ No token → Redirect to /login
        └─ Token exists → Redirect to /


┌────────────────────────────────────────────────────────┐
│ STEP 2: LOGIN PAGE                                     │
└────────────────────────────────────────────────────────┘
        │
        User sees login form
        │
        User enters:
        ├─ Email: admin@jemaah.com
        └─ Password: admin123
        │
        User clicks "Login"
        │
        Frontend: Validate form (email format, password not empty)
        │
        Frontend: POST /api/login
        {
          "email": "admin@jemaah.com",
          "password": "admin123"
        }
        │
        Backend: Receive request
        ├─ Query Users table for email
        ├─ Compare password with hash
        ├─ Generate token
        ├─ INSERT token to personal_access_tokens
        └─ Return 200 OK + token
        │
        Frontend: Receive token
        ├─ localStorage.setItem('api_token', token)
        ├─ setAuth(user, token, true) → AuthContext
        └─ navigate('/') → Dashboard


┌────────────────────────────────────────────────────────┐
│ STEP 3: DASHBOARD                                      │
└────────────────────────────────────────────────────────┘
        │
        Dashboard component mounts
        │
        useEffect: Fetch dashboard data
        │
        Frontend: GET /api/reports/dashboard
        Headers: Authorization: Bearer {token}
        │
        Backend Middleware:
        ├─ Extract token from header
        ├─ Hash & query personal_access_tokens
        ├─ Find user (Admin)
        ├─ Attach user to request
        └─ Continue to controller
        │
        Backend: Check cache
        ├─ If hit → Return cached data
        └─ If miss → Query database:
           ├─ COUNT prospects: 28
           ├─ COUNT pending today: 5
           ├─ COUNT closing: 12
           ├─ Calculate conversion: 42.86%
           └─ GET recent activities
        │
        Backend: Return 200 OK + metrics
        │
        Frontend: setState with metrics
        │
        Dashboard renders:
        ├─ Card: Total Prospects = 28
        ├─ Card: Pending Today = 5
        ├─ Card: Closing = 12
        ├─ Card: Conversion = 42.86%
        └─ Activity Timeline


┌────────────────────────────────────────────────────────┐
│ STEP 4: VIEW PROSPECTS (Calon Jemaah)                  │
└────────────────────────────────────────────────────────┘
        │
        User clicks "Calon Jemaah" in sidebar
        │
        ProtectedRoute checks:
        ├─ Token exists? ✓
        ├─ Role authorized? ✓ (admin/staff)
        └─ Render <Jemaah /> component
        │
        Jemaah component mounts:
        │
        useEffect: Fetch prospects
        │
        Frontend: GET /api/calon-jemaah
        Headers: Authorization: Bearer {token}
        Query: ?status=all&staff_id=undefined
        │
        Backend:
        ├─ Verify token → User = Admin
        ├─ Build query (admin dapat lihat semua)
        ├─ Execute: SELECT * FROM calon_jemaah
        ├─ Load relationships: with('staff')
        └─ Return 200 OK + jemaah list
        │
        Frontend: setState(jemaahList)
        │
        Render table with prospects:
        ├─ Column: Nama
        ├─ Column: Kontak
        ├─ Column: Sumber
        ├─ Column: Paket
        ├─ Column: Status
        ├─ Column: Assigned Staff
        ├─ Column: Last Follow-up
        └─ Column: Actions (Edit, Delete, Follow-up)


┌────────────────────────────────────────────────────────┐
│ STEP 5: CREATE NEW PROSPECT                            │
└────────────────────────────────────────────────────────┘
        │
        User clicks "Tambah Jemaah" button
        │
        Modal form appears with fields:
        ├─ Nama
        ├─ Kontak
        ├─ Alamat
        ├─ Sumber
        ├─ Paket
        ├─ Assigned Staff
        └─ Notes
        │
        User fills form & clicks "Simpan"
        │
        Frontend: Validate form
        │
        Frontend: POST /api/calon-jemaah
        Headers: Authorization: Bearer {token}
        Body: { nama, kontak, alamat, ... }
        │
        Backend:
        ├─ Verify token
        ├─ Check role = admin
        ├─ Validate data
        ├─ INSERT into calon_jemaah
        ├─ INSERT into activity_logs
        └─ Return 201 Created
        │
        Frontend: Receive new prospect
        │
        Frontend: setState(jemaahList = [..., newProspect])
        │
        Table update → Show new prospect
        │
        Toast: "Prospect berhasil ditambahkan"


┌────────────────────────────────────────────────────────┐
│ STEP 6: CREATE FOLLOW-UP SCHEDULE                      │
└────────────────────────────────────────────────────────┘
        │
        User clicks prospect row
        │
        Detail modal opens
        │
        User clicks "Buat Jadwal"
        │
        Follow-up scheduling form:
        ├─ Select prospect
        ├─ Assign to staff
        ├─ Set date
        ├─ Select method (phone/email/visit)
        └─ Add notes
        │
        User fills form & submits
        │
        Frontend: POST /api/jadwal-follow-up
        Body: { calon_jemaah_id, staff_id, tanggal, metode, ... }
        │
        Backend:
        ├─ Verify token
        ├─ Check role = admin
        ├─ Validate data
        ├─ INSERT into jadwal_follow_up
        │  status = 'pending' (default)
        ├─ INSERT activity_log
        └─ Return 201 Created
        │
        Toast: "Jadwal berhasil dibuat"


┌────────────────────────────────────────────────────────┐
│ STEP 7: STAFF HANDLES FOLLOW-UP                        │
└────────────────────────────────────────────────────────┘
        │
        Staff (Eka) logs in
        │
        Staff navigates to /jadwal
        │
        Frontend: GET /api/jadwal-follow-up
        Query: ?status=pending&staff_id=2
        │
        Backend:
        ├─ Verify token → User = Eka (staff, id=2)
        ├─ Query: jadwal_follow_up WHERE staff_id=2 AND status=pending
        ├─ Load relationships
        └─ Return list
        │
        Staff sees 3 pending schedules for today
        │
        Staff clicks on Ahmad's schedule
        │
        Detail modal opens:
        ├─ Prospect: Ahmad Syaiful
        ├─ Contact: 089123456789
        ├─ Scheduled date: 2026-04-20
        ├─ Method: Phone Call
        ├─ Notes: "Follow up status minat"
        │
        Staff calls Ahmad
        │
        As a result, staff fills communication form:
        ├─ Status: "Tertarik"
        ├─ Method: "Phone Call"
        ├─ Notes: "Tertarik paket Umrah Plus, akan diskusi keluarga"
        └─ Clicks "Simpan"
        │
        Frontend: POST /api/status-komunikasi
        Body: { jadwal_follow_up_id, status, catatan, ... }
        │
        Backend: BEGIN TRANSACTION
        ├─ INSERT status_komunikasi
        ├─ UPDATE calon_jemaah status_komunikasi='Tertarik'
        ├─ UPDATE jadwal_follow_up status='done'
        ├─ INSERT activity_log
        └─ COMMIT
        │
        Frontend: setState(scheduleList = updated)
        │
        Toast: "Status berhasil diupdate"
        │
        Table shows updated status


┌────────────────────────────────────────────────────────┐
│ STEP 8: VIEW REPORTS (Admin)                           │
└────────────────────────────────────────────────────────┘
        │
        Admin clicks "Laporan" in sidebar
        │
        <Reports /> component loads
        │
        Frontend: GET /api/reports/dashboard
        │
        Display dashboard metrics with caching
        │
        Admin selects date range: 2026-04-01 to 2026-04-18
        │
        Frontend: GET /api/reports/closing?start_date=...&end_date=...
        │
        Backend:
        ├─ Query laporan_closing in date range
        ├─ Calculate summary:
        │  ├─ Total closing: 8
        │  ├─ Total value: 80.000.000
        │  └─ Average: 10.000.000
        ├─ Get detail records
        └─ Return 200 OK
        │
        Frontend renders:
        ├─ Summary cards
        ├─ Conversion chart
        └─ Detailed closing table


┌────────────────────────────────────────────────────────┐
│ STEP 9: LOGOUT                                         │
└────────────────────────────────────────────────────────┘
        │
        User clicks username in navbar
        │
        Dropdown menu appears:
        ├─ Profile
        ├─ Settings
        └─ Logout
        │
        User clicks "Logout"
        │
        Frontend: POST /api/logout
        Headers: Authorization: Bearer {token}
        │
        Backend:
        ├─ Verify token
        ├─ Find current token in personal_access_tokens
        ├─ DELETE token from table
        ├─ INSERT activity log
        └─ Return 200 OK
        │
        Frontend:
        ├─ localStorage.removeItem('api_token')
        ├─ setAuth(null, null, false)
        ├─ window.location = '/login'
        │
        User seen login page again
        │
        Session ended successfully ✓
```

---

# 13. SECURITY IMPLEMENTATION

## Authentication & Authorization

```
AUTHENTICATION (Membuktikan user adalah siapa):

1. Login
   ├─ User kirim email + password
   ├─ Backend hash password
   ├─ Bandingkan dengan hash di database
   ├─ Jika match → Generate token
   ├─ Token di-save hashed ke personal_access_tokens
   └─ Return token ke frontend

2. Token Usage
   ├─ Frontend simpan di localStorage
   ├─ Setiap request, attach di Authorization header
   ├─ Backend extract token dari header
   ├─ Backend hash token
   ├─ Query personal_access_tokens cek hash match
   ├─ Jika match → user verified
   └─ Attach user object ke request

3. Token Expiration
   ├─ Token punya created_at timestamp
   ├─ TTL bisa set (24 jam, 7 hari, etc)
   ├─ Jika expired → Token auto delete
   ├─ User harus login lagi
   └─ Prevents unauthorized access if token stolen


AUTHORIZATION (Memastikan user punya akses):

1. Role-Based Access Control (RBAC)
   ├─ User punya field: role (admin atau staff)
   ├─ Routes dilindungi: hanya admin bisa akses tertentu
   ├─ Controllers check role sebelum execute
   ├─ Frontend: ProtectedRoute check role
   └─ Frontend: Sidebar conditionally show menu items

2. Resource Authorization
   ├─ Staff hanya bisa akses prospek mereka
   ├─ Admin bisa akses semua prospek
   │
   Example di Jemaah Controller:
   if ($user->role === 'staff') {
     $query->where('staff_id', $user->id);
   }

3. Action Authorization
   ├─ Hanya admin bisa create/delete prospek
   ├─ Hanya assigned staff bisa update jadwal
   ├─ Hanya assigned staff bisa update status

4. Database-level Security
   ├─ Foreign keys untuk referential integrity
   ├─ NOT NULL constraints
   ├─ UNIQUE constraints (email)
   ├─ Check constraints
   └─ Ensure data consistency
```

## Data Protection

```
PASSWORD SECURITY:

1. Hashing (One-way encryption)
   ├─ User password hashed sebelum save
   ├─ Laravel menggunakan bcrypt algorithm
   ├─ Hash tidak bisa di-reverse
   ├─ Jika database kena hack, password tetap aman
   │
   Hash example:
   plain: "admin123"
   hashed: "$2y$10$abc...def..."

2. Token Hashing
   ├─ API token juga di-hash sebelum save
   ├─ Frontend punya plain token
   ├─ Database punya hashed token
   ├─ Jika database kena hack, token hashed tidak berguna
   └─ Masih aman untuk beberapa waktu


HTTPS/TLS SECURITY:

(In production)
├─ All traffic encrypted
├─ Prevent man-in-the-middle attacks
├─ Token tidak terlihat di network
└─ SSL certificate required


INPUT VALIDATION:

1. Server-side validation (WAJIB)
   ├─ Laravel: $request->validate([...])
   ├─ Check field requirement
   ├─ Check field type
   ├─ Check field format
   ├─ Check field length
   └─ Reject invalid requests

2. Client-side validation (Bonus)
   ├─ React form validation
   ├─ Show error message early
   ├─ Better user experience
   ├─ But NOT trusted
   └─ Must validate di backend juga
```

## Audit Trail

```
Activity Logging untuk Security:

Setiap action dicatat di activity_logs table:

CREATE activity_log pencatat:
├─ user_id (Who did it)
├─ action (create/read/update/delete)
├─ model_type (CalonJemaah, JadwalFollowUp, etc)
├─ model_id (Which record)
├─ description (What happened)
└─ created_at (When)

Examples:
├─ Admin create prospect
├─ Staff update status
├─ User login/logout
├─ User delete data
└─ Any modification

Benefits:
├─ Track user activities
├─ Detect suspicious behavior
├─ Compliance with regulations
├─ Investigation if issue occur
└─ Data change history
```

---

## 📊 SUMMARY DIAGRAM

```
COMPLETE FLOW:

┌──────────────────┐
│   User Browser   │ (Frontend)
│ React / TypeScript
│ Vite / Tailwind
└────────┬─────────┘
         │ HTTP Request
         │ Bearer Token
         │
         ↓
┌──────────────────────────────────┐
│      Laravel Backend           │ (API Layer)
│ ├─ Routes (API endpoints)
│ ├─ Controllers (business logic)
│ ├─ Middleware (auth, CORS)
│ ├─ Models (Eloquent ORM)
│ └─ Services (reusable logic)
└────────┬──────────────────────────┘
         │ SQL Queries
         │
         ↓
┌──────────────────────────────────┐
│      MySQL Database            │ (Data Layer)
│ ├─ users
│ ├─ calon_jemaah
│ ├─ jadwal_follow_up
│ ├─ status_komunikasi
│ ├─ laporan_closing
│ ├─ activity_logs
│ └─ personal_access_tokens
└────────────────────────────────────┘

KEY TECHNOLOGIES:
├─ Frontend: React, TypeScript, Vite, Tailwind
├─ Backend: Laravel 11, PHP 8.x
├─ Database: MySQL 8.0
├─ Authentication: Sanctum (token-based)
├─ Architecture: MVC Pattern
└─ Communication: REST API with JSON

CORE FEATURES:
├─ Role-Based Access Control (Admin/Staff)
├─ Prospect Management (CRUD)
├─ Follow-up Scheduling
├─ Communication Tracking
├─ Activity Logging (Audit Trail)
├─ Dashboard Analytics
├─ Reporting (Date Range, Conversion Rate)
└─ Transaction Handling (Data Integrity)

SECURITY:
├─ Authentication: Token-based (Sanctum)
├─ Authorization: Role-based
├─ Password: Bcrypt hashed
├─ Token: Hashed & expirable
├─ Input Validation: Server-side
├─ Error Handling: Proper HTTP codes
└─ Audit Trail: All activities logged
```

---

# PRESENTASI TIPS

## Slide 1: Overview
- Aplikasi CRM untuk bisnis travel umroh/haji
- Manage prospek, follow-up, reporting dalam 1 platform
- 2 role: Admin & Staff

## Slide 2: Tech Stack
- Frontend: React + TypeScript + Vite (modern, fast, type-safe)
- Backend: Laravel 11 (robust, feature-rich)
- Database: MySQL (reliable, scalable)

## Slide 3: Architecture
- 3 Layer: Frontend → Backend API → Database
- MVC pattern di backend
- Component-based di frontend

## Slide 4: DFD & ERD
- DFD menunjukkan data flow aplikasi
- ERD menunjukkan database relationships

## Slide 5: Main Features
- Manajemen prospek
- Penjadwalan follow-up
- Tracking komunikasi
- Reporting & analytics

## Slide 6: Security
- Token-based authentication
- Role-based authorization
- Activity logging
- Data validation

## Slide 7: Application Flow
- User login
- View/create data
- Perform follow-up
- View reports
- Logout

---

*Dokumentasi Lengkap - April 18, 2026*
*Siap untuk Presentasi Fundamental Understanding*