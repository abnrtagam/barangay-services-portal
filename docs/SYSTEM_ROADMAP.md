# 🗺️ Barangay Bulua System — Development Roadmap

> **Prepared:** 2026-05-17  
> **System:** Barangay Online Appointment & Complaint System  
> **Stack:** Node.js/Express • React (Vite) • Flutter • MySQL (XAMPP)

---

## 📊 Current System Inventory

### What Exists Today

| Layer | Component | Status |
|-------|-----------|--------|
| **Backend** | Auth (Register, Login, OTP, Password Reset) | ✅ Complete |
| **Backend** | Complaint CRUD + Status Transitions | ✅ Complete |
| **Backend** | Appointment CRUD + Status Transitions | ✅ Complete |
| **Backend** | Announcement CRUD | ✅ Complete |
| **Backend** | Account Verification (Admin) | ✅ Complete |
| **Backend** | Email Notifications (Nodemailer/Gmail) | ✅ Complete |
| **Backend** | Push Notifications (Firebase FCM) | ✅ Complete |
| **Backend** | Admin Dashboard Stats + Zone Stats | ✅ Complete |
| **Backend** | Reports + CSV Export | ✅ Complete |
| **Backend** | Real-Time Account Suspension API & Middleware | ✅ Complete |
| **Backend** | Status History Tracking | ✅ Complete |
| **Web (React)** | Landing Page, Login, Register, OTP, Forgot Password | ✅ Complete |
| **Web (React)** | Resident Dashboard, Profile, Complaints, Appointments | ✅ Complete |
| **Web (React)** | Real-Time Suspension Dialog & Countdown | ✅ Complete |
| **Web (React)** | Admin Dashboard + Live Audit Activity Log | ✅ Complete |
| **Mobile (Flutter)** | Auth, Dashboard, Complaints, Appointments, Announcements | ✅ Complete |
| **Mobile (Flutter)** | Real-Time Suspension Check & Alert Dialog | ✅ Complete |
| **Mobile (Flutter)** | Appointment Cancellation & Additional Notes | ✅ Complete |
| **Mobile (Flutter)** | Status Timeline, Profile, Notification Center | ✅ Complete |
| **Branding** | Email templates with Barangay Bulua institutional identity | ✅ Complete |

### Known Gaps & Risks

| Issue | Severity | Location |
|-------|----------|----------|
| Rate limiting disabled in registration | 🔴 Critical | `authController.js:98` |
| Auth guards are token-existence-only (no expiry check client-side) | 🟠 High | `AppRoutes.jsx:35-42` |
| CORS set to allow all origins (`cors()`) | 🟠 High | `server.js:85` |
| JWT secret from `.env` (no rotation strategy) | 🟡 Medium | `authController.js:7` |
| No input sanitization middleware (XSS risk) | 🟡 Medium | Global |
| `localhost:3000` hardcoded in email templates | 🟡 Medium | `emailService.js` |
| No pagination UI on admin management pages | 🟢 Low | Frontend |
| Debug scripts left in `backend/scripts/` | 🟢 Low | Repository |
| `node_modules` still tracked in Git history | 🟢 Low | Repository |

---

## 🛣️ Phased Roadmap

### Phase 6: Security Hardening
**Priority:** 🔴 Must-do before any public deployment  
**Estimated Effort:** 1–2 days

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 6.1 | Re-enable rate limiting | `authController.js` | Uncomment the `checkRateLimit()` call at line 98. Test with rapid registration attempts. |
| 6.2 | Add login rate limiting | `authController.js` | Implement a similar `checkLoginRateLimit()` to prevent brute-force password guessing (max 5 failed attempts → 15min block). |
| 6.3 | Restrict CORS origins | `server.js` | Replace `app.use(cors())` with `app.use(cors({ origin: ['http://localhost:3000', 'YOUR_PRODUCTION_DOMAIN'], credentials: true }))`. |
| 6.4 | Add input sanitization | New middleware | Install `express-validator` or `xss-clean`. Create `sanitizeMiddleware.js` to strip HTML/script tags from all user inputs. |
| 6.5 | Client-side token validation | `AppRoutes.jsx` | Decode the JWT in the guard to check `exp` before granting access. Redirect to login if expired. |
| 6.6 | Helmet headers | `server.js` | Install `helmet` and add `app.use(helmet())` to set security-related HTTP headers. |
| 6.7 | Environment-based URLs | `emailService.js` | Replace all `http://localhost:3000` references with `process.env.FRONTEND_URL`. |

**Commit message:** `Harden authentication security and restrict CORS for production`

---

### Phase 7: Data Integrity & Database Optimization
**Priority:** 🟠 Important for reliability  
**Estimated Effort:** 1 day

| # | Task | Details |
|---|------|---------|
| 7.1 | Add database indexes | Add indexes on frequently queried columns: `complaints(resident_id, status)`, `appointments(resident_id, appointment_date, status)`, `users(email, zone)`. |
| 7.2 | Add foreign key constraints | Ensure all `resident_id` references have proper `ON DELETE CASCADE` or `ON DELETE RESTRICT` constraints. |
| 7.3 | Transaction wrapping | Wrap multi-step operations (e.g., complaint creation + status history insert) in database transactions to prevent partial writes. |
| 7.4 | Input length validation | Add server-side max-length checks for `subject` (255), `details` (5000), `admin_remarks` (1000) to prevent oversized payloads. |
| 7.5 | Cleanup debug artifacts | Remove `check_db.js`, `check_db_tables.js`, `reset-admin.js`, `reset_test_database.js`, `database_reset.sql` from production, or move to a `scripts/dev-only/` directory excluded from deployment. |

**Commit message:** `Add database indexes and transaction safety for production reliability`

---

### Phase 8: Admin Experience Improvements
**Priority:** 🟡 Quality of life  
**Estimated Effort:** 2–3 days

| # | Task | Details |
|---|------|---------|
| 8.1 | Pagination controls | Add page navigation UI to `ManageComplaints`, `ManageAppointments`, and `ManageResidents`. The backend already supports `limit` and `page` params. |
| 8.2 | Admin activity log | Create an `admin_activity_log` table to record who did what and when (e.g., "Admin John approved complaint #45"). Display in a new admin page. |
| 8.3 | Bulk status updates | Allow admins to select multiple complaints/appointments and update their status in one action. |
| 8.4 | Dashboard charts | The `getDailyStats` endpoint already returns 7-day trends. Wire it up to a line chart (e.g., Recharts) on the admin dashboard for visual trend analysis. |
| 8.5 | Search improvements | Add date-range filters and category filters to complaint and appointment management pages. |
| 8.6 | Admin profile management | Allow admins to update their own password and profile info. Currently no admin profile page exists. |

**Commit messages:**
- `Add pagination controls to admin management pages`
- `Implement admin activity logging and audit trail`
- `Add 7-day trend charts to admin dashboard`

---

### Phase 9: Resident Experience Polish
**Priority:** 🟡 Quality of life  
**Estimated Effort:** 2–3 days

| # | Task | Details |
|---|------|---------|
| 9.1 | Notification center (Web) | The mobile app has `notification_center_screen.dart`, but the web portal has no equivalent. Add a notification bell + dropdown in `ResidentLayout`. |
| 9.2 | Real-time status updates | Implement WebSocket or Server-Sent Events (SSE) to push status changes to the resident dashboard without requiring a page refresh. |
| 9.3 | Appointment cancellation | Allow residents to cancel their own pending/approved appointments from the history page. Backend should enforce a 24-hour-before-date rule. |
| 9.4 | Complaint attachments gallery | Display uploaded complaint images in a lightbox/gallery instead of raw file links. |
| 9.5 | Profile photo upload | Allow residents to upload and display a profile photo. |
| 9.6 | Accessibility audit | Ensure all pages have proper `aria-labels`, keyboard navigation, and sufficient color contrast ratios. |

**Commit messages:**
- `Add web notification center with real-time updates`
- `Allow residents to cancel appointments within policy window`

---

### Phase 10: Deployment & DevOps
**Priority:** 🔴 Required for go-live  
**Estimated Effort:** 1–2 days

| # | Task | Details |
|---|------|---------|
| 10.1 | Production `.env` template | Create `.env.example` with all required variables documented (DB credentials, JWT secret, Gmail credentials, frontend URL). |
| 10.2 | Frontend production build | Run `npm run build` in `frontend/`, verify the output, and configure the backend to serve the static files from `frontend/dist/`. |
| 10.3 | Process manager | Use PM2 to manage the Node.js process in production (`pm2 start server.js --name barangay-api`). |
| 10.4 | Database migration script | Consolidate all the `ALTER TABLE` statements from `server.js` into a proper migration file that can be run once, then remove the auto-repair logic from the server startup. |
| 10.5 | HTTPS setup | Configure SSL/TLS for production. If using a VPS, set up Nginx as a reverse proxy with Let's Encrypt. |
| 10.6 | Backup strategy | Set up automated daily MySQL backups with `mysqldump` via a cron job. |
| 10.7 | Flutter APK build | Run `flutter build apk --release` and test on physical devices. Configure the API base URL for the production server. |
| 10.8 | Domain & DNS | Point a domain to the production server. Update all email template URLs and CORS origins. |

**Commit messages:**
- `Add production environment template and deployment configuration`
- `Consolidate database migrations and remove auto-repair from server startup`

---

### Phase 11: Post-Launch & Maintenance
**Priority:** 🟢 Ongoing  
**Estimated Effort:** Continuous

| # | Task | Details |
|---|------|---------|
| 11.1 | Error monitoring | Integrate a service like Sentry or a simple error logging middleware that writes to a `logs/` directory. |
| 11.2 | User feedback mechanism | Add a simple "Was this helpful?" or "Rate your experience" after appointment completion. |
| 11.3 | Analytics dashboard | Track login frequency, peak appointment hours, most common complaint categories over time. |
| 11.4 | Regular dependency updates | Schedule monthly `npm audit` and `npm update` cycles to patch vulnerabilities. |
| 11.5 | Documentation for Barangay staff | Create a user manual (PDF or web page) explaining how to use the admin portal. |

---

## 📋 Execution Priority Matrix

```
 URGENT + IMPORTANT          IMPORTANT (not urgent)
┌─────────────────────┐    ┌─────────────────────────┐
│ Phase 6: Security   │    │ Phase 8: Admin UX       │
│ Phase 10: Deploy    │    │ Phase 9: Resident UX    │
│                     │    │ Phase 11: Maintenance   │
└─────────────────────┘    └─────────────────────────┘

 URGENT (not important)     NEITHER
┌─────────────────────┐    ┌─────────────────────────┐
│ Phase 7: Database   │    │ Future feature requests  │
│ (quick wins)        │    │ from Barangay officials  │
└─────────────────────┘    └─────────────────────────┘
```

---

## 🎯 Recommended Execution Order

1. **Phase 6** → Security (blocks deployment)
2. **Phase 7** → Database integrity (quick, high-impact)
3. **Phase 10** → Deployment preparation
4. **Phase 8** → Admin improvements (post-launch iteration)
5. **Phase 9** → Resident experience (post-launch iteration)
6. **Phase 11** → Ongoing maintenance

---

*This roadmap is a living document. Update it as phases are completed or priorities shift.*  
*Last Updated: 2026-05-18 09:15 AM*
