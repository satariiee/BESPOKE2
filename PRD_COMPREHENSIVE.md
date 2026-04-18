# Product Requirements Document (PRD)
## Jemaah Follow Up Management System

**Version:** 1.0  
**Date:** April 17, 2026  
**Author:** AI Assistant  

---

## 1. Executive Summary

The Jemaah Follow Up Management System is a comprehensive web-based CRM (Customer Relationship Management) application designed specifically for travel agencies specializing in Umrah and Hajj pilgrimages. The system enables efficient management of prospective pilgrims (Calon Jemaah), scheduled follow-ups, communication tracking, and performance monitoring for marketing teams.

### Business Value
- Centralized data management for prospective pilgrims
- Automated follow-up scheduling and tracking
- Improved conversion rates through systematic communication
- Real-time performance analytics for marketing teams
- Streamlined workflow for both admin and staff users

---

## 2. Product Overview

### 2.1 Problem Statement
Travel agencies managing Umrah/Hajj pilgrimages face significant challenges in:
- Managing scattered prospect data across multiple channels
- Tracking follow-up activities without proper scheduling
- Monitoring communication progress and outcomes
- Evaluating marketing team performance
- Generating insights for business decision-making

### 2.2 Solution
A unified web application that provides:
- Centralized prospect database
- Automated follow-up scheduling system
- Real-time communication status tracking
- Role-based access control (Admin/Staff)
- Comprehensive reporting and analytics
- Modern, responsive user interface

### 2.3 Target Users
- **Marketing Managers/Admins**: Oversee all operations, manage users, view comprehensive reports
- **Marketing Staff**: Handle assigned prospects, perform follow-ups, update communication status

---

## 3. Functional Requirements

### 3.1 User Management
- **User Registration & Authentication**
  - Email/password-based authentication
  - Role-based access control (Admin, Staff)
  - Secure token-based API authentication (Laravel Sanctum)
  - User profile management

- **Role Permissions**
  - **Admin**: Full system access, user management, all data access
  - **Staff**: Limited access to assigned prospects and personal activities

### 3.2 Prospect Management (Calon Jemaah)
- **CRUD Operations**
  - Create new prospect records
  - View prospect details with full history
  - Update prospect information
  - Delete prospects (admin only)

- **Prospect Data Fields**
  - Full name (nama)
  - Contact information (kontak)
  - Address (alamat)
  - Source of lead (sumber)
  - Package interest (paket)
  - Assigned staff member
  - Communication status
  - Last follow-up date
  - Notes

- **Search & Filtering**
  - Search by name, contact, or source
  - Filter by staff assignment, status, date range
  - Sort by various criteria

### 3.3 Follow-Up Scheduling (Jadwal Follow Up)
- **Schedule Management**
  - Create follow-up schedules for prospects
  - Assign schedules to specific staff members
  - Set follow-up dates and methods (phone, email, visit, etc.)
  - Update schedule status (Pending, In Progress, Done)

- **Schedule Features**
  - Date-based scheduling
  - Method specification
  - Notes and comments
  - Status tracking with color coding

### 3.4 Communication Tracking (Status Komunikasi)
- **Status Management**
  - Track communication outcomes
  - Update status after each interaction
  - Maintain communication history

- **Communication Status Types**
  - Prospek Baru (New Prospect) - Purple
  - Dihubungi (Contacted) - Blue
  - Tertarik (Interested) - Yellow
  - Closing (Closed) - Green
  - Tidak Jadi (Not Proceeding) - Red

### 3.5 Reporting & Analytics
- **Dashboard Analytics**
  - Total prospects count
  - Today's follow-ups
  - Total closings
  - Conversion rate calculations
  - Activity charts and graphs

- **Closing Reports (Laporan Closing)**
  - Period-based filtering
  - Conversion rate analysis
  - Performance insights
  - Export capabilities

### 3.6 Activity Logging
- **Audit Trail**
  - Log all user activities
  - Track follow-up history
  - Maintain data integrity
  - Activity timeline view

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Response time < 2 seconds for standard operations
- Support for concurrent users (up to 50 simultaneous users)
- Efficient database queries with proper indexing

### 4.2 Security
- Secure authentication with token-based API
- Role-based access control
- Data encryption for sensitive information
- CSRF protection
- Input validation and sanitization

### 4.3 Usability
- Intuitive user interface
- Responsive design (desktop-first, tablet support)
- Consistent navigation and layout
- Clear error messages and feedback
- Loading states for better UX

### 4.4 Reliability
- 99% uptime requirement
- Data backup and recovery procedures
- Error handling and logging
- Graceful degradation for network issues

### 4.5 Scalability
- Modular architecture for future enhancements
- Database design supporting growth
- API-first approach for potential mobile apps

---

## 5. Technical Requirements

### 5.1 Backend (Laravel)
- **Framework**: Laravel 11.31
- **Language**: PHP 8.x
- **Database**: MySQL 8.0
- **Authentication**: Laravel Sanctum
- **API**: RESTful API endpoints
- **Testing**: PHPUnit for unit and feature tests

### 5.2 Frontend (React + TypeScript)
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router with role-based protection

### 5.3 Infrastructure
- **Web Server**: Nginx/Apache
- **Database Server**: MySQL
- **Development Environment**: Local development servers
- **Deployment**: Docker support (future)

---

## 6. Database Schema

### 6.1 Core Tables

#### Users
- id (Primary Key)
- name (String)
- email (String, Unique)
- password (Hashed)
- phone (String, Optional)
- role (Enum: admin, staff)
- is_active (Boolean)
- email_verified_at (Timestamp)
- created_at, updated_at

#### Calon Jemaah (Prospects)
- id (Primary Key)
- nama (String)
- kontak (String)
- alamat (Text)
- sumber (String)
- paket (String)
- staff_id (Foreign Key to Users)
- status_komunikasi (Enum)
- last_follow_up_at (Timestamp)
- notes (Text)
- created_at, updated_at

#### Jadwal Follow Up (Follow-up Schedules)
- id (Primary Key)
- calon_jemaah_id (Foreign Key to Calon Jemaah)
- staff_id (Foreign Key to Users)
- tanggal (Date)
- metode (String: phone, email, visit, etc.)
- status (Enum: pending, in_progress, done)
- catatan (Text)
- created_at, updated_at

#### Status Komunikasi (Communication Status)
- id (Primary Key)
- jadwal_follow_up_id (Foreign Key to Jadwal Follow Up)
- metode (String)
- status (Enum: prospek_baru, dihubungi, tertarik, closing, tidak_jadi)
- catatan (Text)
- follow_up_at (Timestamp)
- created_at, updated_at

#### Laporan Closing (Closing Reports)
- id (Primary Key)
- calon_jemaah_id (Foreign Key to Calon Jemaah)
- closing_date (Date)
- package_value (Decimal)
- notes (Text)
- created_at, updated_at

#### Activity Logs
- id (Primary Key)
- user_id (Foreign Key to Users)
- action (String)
- model_type (String)
- model_id (Integer)
- description (Text)
- created_at

### 6.2 Relationships
- User has many Calon Jemaah (staff assignment)
- Calon Jemaah belongs to User (staff)
- Calon Jemaah has many Jadwal Follow Up
- Jadwal Follow Up belongs to Calon Jemaah
- Jadwal Follow Up belongs to User (staff)
- Jadwal Follow Up has many Status Komunikasi
- Status Komunikasi belongs to Jadwal Follow Up
- Calon Jemaah has one Laporan Closing

---

## 7. User Interface Requirements

### 7.1 Design Principles
- Clean and modern interface
- Consistent color scheme and typography
- Intuitive navigation with sidebar and navbar
- Responsive grid layouts
- Status indicators with color coding

### 7.2 Key Screens
- **Login Page**: Email/password form with error handling
- **Dashboard**: Analytics cards and charts
- **Prospect List**: Table with search, filter, and pagination
- **Prospect Detail**: Full prospect information with history
- **Schedule Management**: Calendar view and list view
- **Reports**: Charts and data tables
- **User Management** (Admin only): User CRUD interface

### 7.3 Navigation Structure
- **Public Routes**: /login
- **Protected Routes**:
  - / (Dashboard)
  - /jemaah (Prospect Management)
  - /jadwal (Follow-up Schedules)
  - /laporan (Reports)
  - /pengguna (User Management - Admin only)

---

## 8. API Specifications

### 8.1 Authentication Endpoints
- POST /api/login
- POST /api/logout
- GET /api/profile

### 8.2 Prospect Endpoints
- GET /api/calon-jemaah
- POST /api/calon-jemaah
- GET /api/calon-jemaah/{id}
- PUT /api/calon-jemaah/{id}
- DELETE /api/calon-jemaah/{id}

### 8.3 Schedule Endpoints
- GET /api/jadwal-follow-up
- POST /api/jadwal-follow-up
- PUT /api/jadwal-follow-up/{id}
- DELETE /api/jadwal-follow-up/{id}

### 8.4 Status Endpoints
- POST /api/status-komunikasi
- GET /api/status-komunikasi/{jadwal_id}

### 8.5 Report Endpoints
- GET /api/reports/dashboard
- GET /api/reports/closing

---

## 9. Testing Requirements

### 9.1 Unit Tests
- Model validation and relationships
- Business logic functions
- API response formatting

### 9.2 Feature Tests
- Authentication flows
- CRUD operations
- Authorization checks
- API integration tests

### 9.3 Integration Tests
- End-to-end user workflows
- Database operations
- External service integrations

### 9.4 User Acceptance Testing
- Admin user workflows
- Staff user workflows
- Data accuracy and integrity
- Performance under load

---

## 10. Deployment & Maintenance

### 10.1 Development Environment
- Local Laravel server (php artisan serve)
- Local MySQL database
- Vite development server
- Environment configuration files

### 10.2 Production Deployment
- Web server configuration
- Database migration and seeding
- Environment variable setup
- SSL certificate configuration

### 10.3 Monitoring & Maintenance
- Error logging and monitoring
- Database backup procedures
- Performance monitoring
- Regular security updates

---

## 11. Future Enhancements

### Phase 2 Features
- Mobile application (React Native)
- Email automation for follow-ups
- SMS integration
- Advanced analytics and AI insights
- Multi-agency support
- API documentation (Swagger/OpenAPI)

### Technical Improvements
- Docker containerization
- CI/CD pipeline
- Automated testing suite
- Performance optimization
- Caching layer implementation

---

## 12. Success Metrics

### Key Performance Indicators (KPIs)
- User adoption rate (target: 100% of marketing team)
- Data entry accuracy (target: >95%)
- Follow-up completion rate (target: >80%)
- Conversion rate improvement (target: +20% from baseline)
- System uptime (target: 99.9%)
- User satisfaction score (target: >4.5/5)

### Business Impact
- Reduced administrative overhead
- Improved lead management efficiency
- Enhanced marketing team productivity
- Better customer relationship management
- Data-driven decision making capabilities

---

*This PRD serves as the comprehensive guide for the development and implementation of the Jemaah Follow Up Management System. All requirements are derived from the existing codebase analysis and business needs assessment.*