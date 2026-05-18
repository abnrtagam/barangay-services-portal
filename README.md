# 🏛️ Barangay Bulua — Digital Service Portal

A full-stack digital governance system for **Barangay Bulua, Cagayan de Oro City**. Enables residents to file complaints, book appointments, and receive real-time updates through a modern web portal and mobile application.

> **Academic Project:** Developed as a capstone project demonstrating modern full-stack development, production-grade security, and digital governance practices.

---

## 📂 Project Structure

```
barangay-system/
├── backend/              # Node.js/Express REST API server
│   ├── controllers/      # Route handlers (admin, auth, complaint, appointment, etc.)
│   ├── middleware/        # JWT auth, role guard, rate limiting
│   ├── services/         # Email (Nodemailer), notifications (Firebase)
│   ├── config/           # Database pool, Firebase config
│   ├── routes/           # Express route definitions
│   └── uploads/          # User-uploaded files (complaints, verification docs)
├── frontend/             # React 18 (Vite) web portal
│   ├── src/pages/        # Page components (Dashboard, Complaints, Appointments, etc.)
│   ├── src/components/   # Reusable UI components (Sidebar, DashboardCard, StatusTimeline)
│   └── src/styles/       # Global CSS design system
├── flutter_app/          # Flutter mobile application (Android/iOS)
├── database/             # Base SQL schema + seed data
├── docs/                 # Migration scripts, progress logs, roadmap
├── ecosystem.config.js   # PM2 process manager config (production)
└── BarangaySystemAPI.postman_collection.json  # Postman API testing collection
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Web Frontend** | React 18, Vite, Recharts, React Icons, Vanilla CSS |
| **Mobile App** | Flutter, Provider, Firebase Cloud Messaging |
| **Backend API** | Node.js, Express, Helmet, XSS-Clean, Morgan |
| **Database** | MySQL 8 (XAMPP compatible) |
| **Auth** | JWT (jsonwebtoken), Bcrypt (bcryptjs), OTP Email Verification |
| **Email** | Nodemailer (Gmail SMTP) |
| **Process Manager** | PM2 (production deployment) |

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [XAMPP](https://www.apachefriends.org/) (MySQL + Apache)
- [Git](https://git-scm.com/)

### 1. Clone & Install

```bash
git clone https://github.com/VINSMOKE-69/barangay-system.git
cd barangay-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

1. Start **XAMPP** → Start **MySQL**
2. Open **phpMyAdmin** (http://localhost/phpmyadmin)
3. Import `database/barangay_complaint_system.sql` (creates database + tables + seed data)
4. Import `docs/migration.sql` (adds all feature extensions from Phase 5–9)

> **Note:** The migration script is idempotent — safe to run multiple times.

### 3. Environment Configuration

```bash
cd backend
copy .env.example .env
```

Edit `backend/.env` with your values:

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | `127.0.0.1` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | *(empty for XAMPP)* |
| `DB_NAME` | Database name | `barangay_complaint_system` |
| `JWT_SECRET` | Token signing key | *Change this!* |
| `GMAIL_USER` | Gmail for OTP emails | Your Gmail |
| `GMAIL_APP_PASSWORD` | Gmail App Password | [Generate here](https://myaccount.google.com/apppasswords) |
| `FRONTEND_URL` | CORS origin | `http://localhost:3000` |

### 4. Run (Development)

```bash
# Terminal 1: Backend (port 5000)
cd backend
npm run dev

# Terminal 2: Frontend (port 3000)
cd frontend
npm run dev
```

### 5. Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@bulua.gov.ph` | `admin1234` |
| **Resident** | *(Register via the portal)* | — |

---

## 🏗️ Production Deployment

```bash
# 1. Build frontend static assets
cd frontend
npm run build

# 2. Set environment
# In backend/.env → NODE_ENV=production

# 3. Start with PM2
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup    # Auto-start on system boot
```

In production mode, the backend serves the React build from `frontend/dist/` — **no separate frontend server needed.**

---

## 🛡️ Security Features

| Feature | Implementation |
|---------|---------------|
| **Rate Limiting** | Registration (20 attempts/hour), Login (5 attempts → 15min block) |
| **CORS** | Restricted to configured `FRONTEND_URL` |
| **Helmet** | 11 HTTP security headers (X-Frame-Options, CSP, HSTS, etc.) |
| **XSS-Clean** | Input sanitization on all request bodies |
| **JWT Expiry** | 7-day token expiry with client-side guards |
| **Password Hashing** | bcryptjs with 12 salt rounds |
| **Input Validation** | Server-side length limits and type checks |
| **Status Transitions** | Enforced workflow: complaints/appointments cannot skip steps |
| **OTP Verification** | 6-digit email verification required for registration |
| **Admin Audit Trail** | All admin actions logged to `admin_activity_log` table |

---

## 📊 System Features

### Resident Portal (Web + Mobile)
- 📝 Account registration with OTP email verification and document upload
- 📋 Submit and track complaints with file attachments and status timeline
- 📅 Book barangay hall appointments with real-time slot availability
- 🚫 Cancel appointments (Pending/Approved, ≥24hrs before scheduled date)
- 📢 View barangay announcements and notification history
- 🔑 Password reset via email OTP

### Admin Dashboard
- 📈 Real-time statistics with 7-day trend charts (Recharts)
- 📋 Manage complaints with enforced status workflow (Pending → Approved → Scheduled → Resolved)
- 📅 Manage appointments with scheduling controls (Pending → Approved → Completed)
- 👥 Resident management with zone filtering and search
- ✅ Account verification and approval system with document review
- 📊 CSV report export (complaints and appointments)
- 📝 Admin Activity Audit Log — searchable, filterable, paginated
- 👤 Admin Profile management (edit details, change password, 2FA toggle)
- 🔔 Push notifications to mobile users (Firebase Cloud Messaging)

---

## 📁 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register resident (multipart/form-data) |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/resend-otp` | Resend OTP code |
| POST | `/api/auth/login` | Resident login → JWT |
| POST | `/api/auth/admin-login` | Admin login → JWT |
| POST | `/api/auth/forgot-password` | Send password reset OTP |
| POST | `/api/auth/reset-password` | Reset password with OTP |

### Admin (requires `admin` role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/daily-stats` | 7-day trend data |
| GET | `/api/admin/complaints` | List complaints (paginated, filterable) |
| PATCH | `/api/admin/complaints/:id/status` | Update complaint status |
| GET | `/api/admin/appointments` | List appointments (paginated) |
| PATCH | `/api/admin/appointments/:id/status` | Update appointment status |
| GET | `/api/admin/residents` | List residents |
| GET | `/api/admin/residents/zone-stats` | Zone distribution stats |
| GET | `/api/admin/reports` | Generate report data |
| GET | `/api/admin/reports/export` | Export CSV |
| GET | `/api/admin/activity-log` | Admin audit log (paginated) |
| PATCH | `/api/admin/profile` | Update admin profile |
| PATCH | `/api/admin/profile/password` | Change admin password |

### Resident (requires `resident` role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/residents/dashboard-stats` | Resident dashboard data |
| GET | `/api/residents/complaints` | My complaints |
| GET | `/api/residents/complaints/:id` | Complaint detail + status history |
| GET | `/api/residents/appointments` | My appointments |
| GET | `/api/residents/appointments/:id` | Appointment detail + history |
| PATCH | `/api/residents/appointments/:id/cancel` | Cancel own appointment |
| PATCH | `/api/residents/profile` | Update resident profile |
| GET | `/api/residents/notifications` | Notification history |

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/announcements` | Public announcements |
| GET | `/api/complaints/categories` | Complaint categories |
| GET | `/api/appointments/taken-slots?date=YYYY-MM-DD` | Taken time slots |

> 📬 Full API collection available in [`BarangaySystemAPI.postman_collection.json`](BarangaySystemAPI.postman_collection.json) — import into Postman for testing.

---

## 🧪 API Testing with Postman

1. Import `BarangaySystemAPI.postman_collection.json` into Postman
2. The collection uses variables `{{base_url}}`, `{{admin_token}}`, and `{{resident_token}}`
3. Run **Admin Login** first — the token is auto-saved via test scripts
4. All authenticated endpoints will use the saved token automatically

---

## 📝 Documentation

| Document | Description |
|----------|-------------|
| [`docs/PROGRESS_LOG.md`](docs/PROGRESS_LOG.md) | Development changelog (Phases 1–9) |
| [`docs/SYSTEM_ROADMAP.md`](docs/SYSTEM_ROADMAP.md) | Feature roadmap and priority matrix |
| [`docs/migration.sql`](docs/migration.sql) | Database migration script |
| [`docs/INSTALLATION.md`](docs/INSTALLATION.md) | Detailed installation guide |

---

---

*© 2026 Barangay Bulua. All Rights Reserved.*
