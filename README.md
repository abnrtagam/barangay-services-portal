# 🏛️ Barangay Bulua — Digital Service Portal

A full-stack digital governance system for **Barangay Bulua, Cagayan de Oro City**. Enables residents to file complaints, book appointments, and receive real-time updates through a modern web portal and mobile application.

> **Academic Project:** Developed as a capstone project demonstrating modern full-stack development, production-grade security, and digital governance practices.

---

## 📂 Project Structure

```
barangay-system/
├── backend/              # Node.js/Express API server
├── frontend/             # React (Vite) web portal
├── flutter_app/          # Flutter mobile application
├── database/             # Base SQL schema + seed data
├── docs/                 # Migration scripts, progress logs, roadmap
└── ecosystem.config.js   # PM2 process manager config
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Web Frontend** | React 18, Vite, Recharts, React Icons |
| **Mobile App** | Flutter, Provider, Firebase Cloud Messaging |
| **Backend API** | Node.js, Express, Helmet, XSS-Clean |
| **Database** | MySQL 8 (XAMPP compatible) |
| **Auth** | JWT, Bcrypt, OTP Email Verification |
| **Email** | Nodemailer (Gmail SMTP) |

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [XAMPP](https://www.apachefriends.org/) (MySQL + Apache)
- [Git](https://git-scm.com/)

### 1. Clone & Install

```bash
git clone <repository-url>
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
3. Import `database/barangay_complaint_system.sql` (creates database + seed data)
4. Import `docs/migration.sql` (adds Phase 5–7 extensions)

### 3. Environment Configuration

```bash
cd backend
copy .env.example .env
```

Edit `backend/.env` with your values:
- **Database:** Usually no changes needed for XAMPP defaults
- **JWT_SECRET:** Change to any strong random string
- **Gmail:** Set your Gmail address and [App Password](https://myaccount.google.com/apppasswords)

### 4. Run (Development)

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:3000

### 5. Default Admin Login

| Field | Value |
|-------|-------|
| Email | `admin@barangay.gov.ph` |
| Password | `admin1234` |

---

## 🏗️ Production Deployment

### Build Frontend
```bash
cd frontend
npm run build      # Creates frontend/dist/
```

### Configure for Production
```bash
# In backend/.env, set:
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
```

### Run with PM2
```bash
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup    # Auto-start on system boot
```

In production mode, the backend serves the React build from `frontend/dist/` — **no separate frontend server needed.**

---

## 🛡️ Security Features

- **Rate Limiting:** Registration (20 attempts/hour) and login (5 attempts → 15min block)
- **CORS:** Restricted to configured `FRONTEND_URL`
- **Helmet:** 11 HTTP security headers (X-Frame-Options, CSP, etc.)
- **XSS-Clean:** Input sanitization on all request bodies
- **JWT Expiry:** Client-side guards actively check token expiration
- **Input Validation:** Server-side length limits on all user inputs
- **Database Integrity:** Foreign key constraints with cascading deletes
- **OTP Verification:** Email verification required during registration

---

## 📊 System Features

### Resident Portal (Web + Mobile)
- Account registration with OTP email verification
- Submit and track complaints with file attachments
- Book barangay hall appointments with time slot availability
- View announcements and status history timeline
- Password reset via email OTP

### Admin Dashboard
- Real-time statistics and 7-day trend charts
- Manage complaints with status workflow (Pending → Approved → Resolved)
- Manage appointments with scheduling controls
- Resident management with zone filtering
- Account verification and approval system
- CSV report export
- Push notifications to mobile users

---

## 📁 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Resident registration |
| POST | `/api/auth/login` | Resident login |
| POST | `/api/auth/admin-login` | Admin login |
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/complaints` | List complaints (paginated) |
| PATCH | `/api/admin/complaints/:id/status` | Update complaint status |
| GET | `/api/admin/appointments` | List appointments (paginated) |
| GET | `/api/health` | Server health check |

> Full API collection available in `BarangaySystemAPI.postman_collection.json`

---

## 📝 Documentation

- [`docs/PROGRESS_LOG.md`](docs/PROGRESS_LOG.md) — Development changelog (Phases 1–8)
- [`docs/SYSTEM_ROADMAP.md`](docs/SYSTEM_ROADMAP.md) — Feature roadmap and priority matrix
- [`docs/migration.sql`](docs/migration.sql) — Database migration script

---

*© 2026 Barangay Bulua Digital Team. All Rights Reserved.*
