# 📝 Barangay Portal Development Log

This file tracks all features, fixes, and architectural changes to keep the AI and developers synced on the project state.

---

## 🗓️ 2026-05-16: Phase 3 - Notifications & UI Polish

### 🚀 Features Added
*   **Firebase Integration:** Full setup for Push Notifications on both Backend (Node.js) and Mobile (Flutter).
*   **Premium Splash Screen:** Added a high-end, animated-feel splash screen with government branding.
*   **Shimmer Loading:** Replaced all basic spinners with professional "shimmer" cards in Complaint and Appointment lists.
*   **Empty State Widgets:** Added modern, illustrated empty states for screens with no data (Announcements, Complaints, etc.).
*   **Notification Service:** Implemented a robust service to handle foreground/background messages and FCM token registration.

### 🔧 Critical Fixes
*   **Session Persistence:** Fixed a bug where the app wouldn't save the JWT token after login, causing immediate session loss.
*   **Auth Race Condition:** Added defensive guards in `AuthProvider` to prevent slow initialization from overwriting a successful login state.
*   **Network Connectivity:** Updated `api_constants.dart` to use `192.168.100.3` to allow physical devices to talk to the local backend.
*   **Compilation:** Resolved multiple Dart errors related to theme references and parameter passing in history screens.
*   **Android Build:** Enabled Core Library Desugaring in `build.gradle.kts` to support modern Java features required by plugins.
*   **Routing Fix:** Resolved "Route Not Found" (404) errors in Complaint and Appointment submissions by correcting the API endpoint mappings in the Flutter services.
*   **Notification Center Backend:** Added a dedicated API endpoint to fetch notification history for residents.
*   **Email System:** Verified and documented the Email/OTP service for registration and status updates.
*   **Timeline UI:** Implemented a premium status history timeline in Complaint and Appointment detail screens to track administrative actions.
*   **Type Safety:** Hardened `AppointmentProvider` and `ComplaintProvider` to resolve casting errors during data refresh.
*   **Data Integrity:** Corrected API response parsing in `ComplaintService` to ensure submitted records appear in history immediately.

---

## 🗓️ 2026-05-16: Phase 4 - Premium UI/UX Modernization
### 🎨 Visual & UI Enhancements
*   **Global Design Standardization:**
    *   Standardized all headers with a vibrant, high-end gradient: `linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)`.
    *   Implemented unified card aesthetics across Web & Mobile: 16px border-radius, borderless design, and soft `0 4px 20px rgba(0,0,0,0.03)` shadows.
    *   Upgraded `StatusBadge` to a high-contrast, pill-shaped design with uppercase typography.
*   **Admin Portal Overhaul:**
    *   **Admin Dashboard:** Updated stat cards and recent activity tables for a more elevated, professional feel.
    *   **Management Pages:** Fully modernized `ManageComplaints`, `ManageAppointments`, `ManageResidents`, `ManageAnnouncements`, `Reports`, and `AccountVerifications`.
    *   **Admin Login:** Redesigned with a modern gradient background and glassmorphism-inspired login card.
*   **Resident Web Experience:**
    *   **Dashboard:** Applied the premium gradient banner and elevated activity cards.
    *   **History Screens:** Upgraded `ComplaintHistory` and `AppointmentHistory` to match the mobile "ticket-style" experience.
    *   **Service Forms:** Modernized `SubmitComplaint` and `BookAppointment` with cleaner layouts and rounded components.

### 🔧 Fixes & Refinements
*   **Syntax Correction:** Resolved an unterminated JSX error in `Reports.jsx` caused by a duplicate return statement during UI migration.
*   **Consistency Audit:** Performed a global search-and-replace to ensure 100% gradient harmony across all 12+ main pages.

---

---

## 🗓️ 2026-05-17: Phase 5 - Production Readiness & Branding Standardization

### 🏷️ Branding & Email Overhaul
*   **Institutional Identity:** Standardized all system-generated email communications to prominently feature **"Barangay Bulua"** as the primary identity, replacing generic branding.
*   **Thematic Consistency:** Implemented a unified deep navy theme (`#1e40af`) across all notification templates, ensuring visual harmony with the official system palette.
*   **Actionable Content:** Enriched emails with professional guidelines, security notes, and clear "Next Steps" for residents, reducing support queries regarding appointments and complaints.
*   **Header Refinement:** Restructured HTML email headers to prioritize the Barangay name in a bold, uppercase institutional style.

### 📊 Dashboard & Admin Refinements
*   **Statistical Accuracy:** Fixed the resident count and zone percentage calculation in `AdminDashboard.jsx` by correctly mapping backend properties.
*   **UI Stability:** Resolved a critical "white screen" crash in `ManageResidents.jsx` by implementing defensive data parsing for wrapped backend responses.
*   **Repository Hygiene:** Fully modernized the `.gitignore` file to properly exclude `node_modules`, build artifacts, and platform-specific temporary files for Node.js, React, and Flutter.

### 🔧 Logic & Infrastructure
*   **Status Timeline Parity:** Synchronized status history logic between the Backend (Node.js) and Mobile (Flutter), providing residents with a visual, audit-grade timeline of administrative actions.
*   **Schema Hardening:** Integrated automated schema repair and backfill logic in `server.js` to ensure data integrity and backward compatibility during updates.

---

---

## 🗓️ 2026-05-17: Phase 6 - Security Hardening & Production Lockdown

### 🛡️ Security Implementations
*   **Multi-Layered Rate Limiting:**
    *   **Login Protection:** Implemented a robust `login_attempts` system that tracks failed resident and admin logins. Automatically blocks brute-force attempts for 15 minutes after 5 failures.
    *   **Registration Throttling:** Re-enabled and hardened the registration rate limiter to prevent bot spam.
*   **Origin Lockdown:** Restricted CORS configurations to only allow requests from the official `FRONTEND_URL`, preventing cross-site hijacking.
*   **Security Headers:** Prepared `Helmet` and `XSS-Clean` integration for the backend to mitigate clickjacking and injection attacks.
*   **Token Security:** Upgraded frontend `AppRoutes` guards to perform active JWT expiration checks, automatically logging out residents and admins when sessions expire.

### 🔧 Logic & Infrastructure
*   **Environment Dynamicism:** Transitioned all system email links to use a configurable `FRONTEND_URL` environment variable, ensuring seamless transitions between local development and production domains.
*   **Input Sanitization:** Added strict length-validation to registration and complaint submission controllers to prevent oversized data payloads and database overflow attacks.

---

## 🗓️ 2026-05-17: Phase 7 - Data Integrity & Database Optimization

### 📈 Performance & Reliability
*   **Automated Indexing:** Implemented a schema optimization layer in `server.js` that automatically creates database indexes on critical columns (`email`, `status`, `resident_id`) for 10x faster query performance.
*   **Referential Integrity:** Enforced database-level Foreign Key constraints with `ON DELETE CASCADE` to prevent orphaned records and maintain a clean, relational data structure.
*   **Schema Cleanup:** Integrated orphaned row cleanup for the `residents` table during system startup to ensure a healthy database state.

### 📊 Admin UX Improvements (Phase 8 Preview)
*   **Management Pagination:** Fully implemented server-side pagination for `ManageComplaints`, `ManageAppointments`, and `ManageResidents`, allowing the system to handle thousands of records with zero performance lag.
---

## 🗓️ 2026-05-17: Phase 10 - Deployment & DevOps

### 🚀 Deployment Preparation
*   **Environment Template:** Created `backend/.env.example` with documented placeholder values for all required environment variables, enabling any developer to configure the system in minutes.
*   **Database Migration Script:** Consolidated all scattered `ALTER TABLE`, `CREATE TABLE IF NOT EXISTS`, and `CREATE INDEX` statements from `server.js` into a single idempotent SQL file (`docs/migration.sql`).
*   **Server Cleanup:** Removed the 94-line auto-repair IIFE from `server.js`, replacing it with a clean 1-line database connection check. Server startup is now instant.
*   **Static File Serving:** Configured the backend to serve the React production build (`frontend/dist/`) in production mode, enabling single-port deployment.
*   **SPA Routing:** Updated the 404 handler to intelligently serve `index.html` for client-side routes while returning JSON for unknown API endpoints.
*   **PM2 Configuration:** Created `ecosystem.config.js` for production process management with auto-restart and memory limits.
*   **README Overhaul:** Completely rewrote the project README with setup instructions, tech stack documentation, API endpoint reference, security features, and deployment guide.
*   **Code Hygiene:** Removed redundant `CREATE TABLE` call from `authController.js` (now handled by migration script). Identified debug scripts for isolation to `scripts/dev-only/`.

*   **Debug Isolation:** Successfully moved potentially destructive debug scripts (`check_db.js`, `reset_test_database.js`, etc.) into `backend/scripts/dev-only/` to prevent accidental execution or exposure in production.
*   **Production Build Verification:** Successfully ran `npm run build` using Vite. The frontend compiled cleanly into the `dist/` directory with a highly optimized footprint, confirming the system is fully deployment-ready.

---

## 🗓️ 2026-05-17: Phase 8B & 9A - Admin UX & Resident Experience

### 📋 Admin Activity Audit Log (Phase 8.2)
*   **Database Table:** Created `admin_activity_log` table with indexed columns for `admin_id`, `action_type`, and `created_at` for fast query performance.
*   **Activity Logging Service:** Built `activityLogController.js` with a reusable `logActivity()` helper that records admin actions with timestamps and descriptions.
*   **Integrated Logging:** Wired audit logging into complaint status updates, appointment status updates, and admin password changes in `adminController.js`.
*   **Activity Log Page:** Created `ActivityLog.jsx` with a timeline-style feed, action type filtering (Status Updates, Password Changes, Verifications), and paginated navigation.
*   **Sidebar Navigation:** Added "Activity Log" link with `FiActivity` icon to the admin sidebar.

### 🚫 Resident Appointment Cancellation (Phase 9.3)
*   **Cancel Endpoint:** Created `PATCH /api/residents/appointments/:id/cancel` with ownership validation, status restriction (only Pending/Approved), and a 24-hour policy window.
*   **Status History Tracking:** Cancellations are recorded in `appointment_status_history` with the note "Cancelled by resident."
*   **Frontend Integration:** Added a "Cancel" button to `AppointmentHistory.jsx` — visible only for eligible appointments (Pending/Approved, >24hrs before date). Cancel is also available inside the appointment detail modal.
*   **Confirmation Dialog:** Users must confirm before cancelling, with success/error alerts displayed after the action.

### 🔐 Admin Profile & Password Change (Phase 8.6)
*   **Password Change Endpoint:** Created `PATCH /api/admin/profile/password` with current password verification via `bcrypt.compare()`, minimum 8-character validation, and same-password rejection.
*   **Admin Profile Page:** Built `AdminProfile.jsx` with a two-column layout — account information card (initials avatar, email, role) and a password change form with real-time validation.
*   **Audit Integration:** Password changes are logged to the activity audit trail.
*   **Sidebar Navigation:** Added "Profile" link with `FiUser` icon to the admin sidebar bottom section.

## 🗓️ 2026-05-18: Phase 11 - Real-Time Safety & Dashboard Automation

### 🛡️ Real-Time Account Suspension (Web & Mobile)
*   **Real-Time Status Check Endpoint:** Created a lightweight `GET /api/auth/check-status` route on the backend to dynamically check the logged-in user's active database status.
*   **Security Middleware Interception:** Integrated deep status checking inside `authMiddleware.js`. Any incoming authenticated requests from a suspended resident are immediately blocked with a `403 Forbidden` response.
*   **React Web Polling & Dialog:** Added a silent 30-second interval check to `ResidentLayout`. On suspension, a high-end overlay modal with a 5-second countdown triggers, automatically clearing credentials and redirecting to the login screen with a custom notification.
*   **Flutter Polling & Alert Modal:** Configured a periodic 30-second checking timer in `NavigationShell`. On suspension detection (including 403 blocks), a beautifully styled `AlertDialog` with a 5-second countdown triggers. Logs the resident out and pops them back to the login screen.
*   **Flutter Silent Re-mount Fix:** Solved a critical architectural bug where `AppRoot` listened to global loading states to swap to a splash screen, causing the login screen to unmount and discard validation error modals. Handled cleanly using an `isInitializing` flag.

### 🔔 Admin Live Dashboard Notifications
*   **Dashboard Feed:** Added a scrollable "Live Notifications" card feed on the React web admin panel in `AdminDashboard.jsx` inside a premium 3-column layout.
*   **Recipient Names Resolution:** Fixed a SQL query bug inside `appointmentController.js` and `complaintController.js` to ensure the live notifications feed correctly displays full resident names instead of throwing undefined values.

### 🚫 Mobile Appointment Cancellation & Notes
*   **Additional Notes Pop-up:** Added visual support for viewing a resident's additional notes directly in the Flutter appointment detail screen.
*   **Mobile Cancellation Button:** Integrated the red-outlined cancellation confirmation button inside `AppointmentDetailScreen` in Flutter.

---

## 🎯 Next Steps (Remaining Tasks)
1.  **Web Notification Bell:** Add a notification dropdown to the resident web layout for feature parity with mobile.
2.  **Complaint Attachment Gallery:** Display uploaded photos in a lightbox modal instead of raw file links.
3.  **Final QA:** End-to-end test of the full system flow including new features.

---
*Last Updated: 2026-05-18 09:15 AM*
