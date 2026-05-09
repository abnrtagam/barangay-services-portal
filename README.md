# 🏛️ Barangay Complaint & Appointment System

A full-stack web application for barangay offices to manage resident complaints and appointment bookings.

## 📁 Project Structure

```
barangay-system/
├── frontend/               ← React.js (Vite) — Port 3000
├── backend/                ← Node.js + Express — Port 5000
├── laravel-backend/        ← Laravel — Port 8000
└── barangay_complaint_system.sql  ← MySQL schema (import in phpMyAdmin)
```

## ⚙️ TECH STACK

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | React.js (Vite), React Router v6 |
| Middleware | Node.js + Express       |
| Backend   | Laravel 10 + Sanctum    |
| Database  | MySQL via XAMPP         |

---

## 🚀 SETUP INSTRUCTIONS

### STEP 1 — Start XAMPP
1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL**

### STEP 2 — Import the Database
1. Open **phpMyAdmin** → `http://localhost/phpmyadmin`
2. Click **Import** tab
3. Choose file: `barangay_complaint_system.sql`
4. Click **Go**

This creates the database with all tables, categories, and the admin account.

**Admin Login:**
- Email: `admin@barangay.gov.ph`
- Password: `admin1234`

---

### STEP 3 — Set up Laravel Backend

```bash
cd laravel-backend

# Copy environment file
cp .env.example .env

# Install dependencies
composer install

# Generate app key
php artisan key:generate

# Run migrations (if not using the SQL file)
php artisan migrate --seed

# Link storage
php artisan storage:link

# Start server
php artisan serve --port=8000
```

**laravel-backend/.env key values:**
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=barangay_complaint_system
DB_USERNAME=root
DB_PASSWORD=
```

---

### STEP 4 — Set up Node.js Backend

```bash
cd backend

# Install dependencies
npm install

# Check .env (already configured for XAMPP)
# Make sure DB credentials match

# Start development server
npm run dev
# or
node server.js
```

Node runs on **port 5000** and connects directly to MySQL.

---

### STEP 5 — Set up React Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

React runs on **port 3000** and proxies `/api` → `http://localhost:5000`.

---

## 🌐 Access the System

| URL                              | Description          |
|----------------------------------|----------------------|
| `http://localhost:3000`          | Landing page         |
| `http://localhost:3000/register` | Resident register    |
| `http://localhost:3000/login`    | Resident login       |
| `http://localhost:3000/admin/login` | Admin login       |

---

## 👥 USER ROLES

### Resident
- Register / Login
- Submit complaints with file attachment
- Book appointments with time slot selection
- Track complaint and appointment status
- View barangay announcements

### Admin
- Dashboard with statistics
- Manage all complaints (Approve / Reject / Schedule / Resolve)
- Manage all appointments (Approve / Reject / Complete)
- Manage residents
- Post announcements
- Generate and export reports (CSV)

---

## 📊 Database Tables

| Table                  | Purpose                              |
|------------------------|--------------------------------------|
| `users`                | All user accounts (residents + admin)|
| `residents`            | Resident profile linked to user      |
| `admins`               | Admin profile linked to user         |
| `complaint_categories` | Predefined complaint types           |
| `complaints`           | Resident complaints                  |
| `appointments`         | Resident appointment bookings        |
| `announcements`        | Barangay announcements               |
| `notifications`        | System notifications (future use)    |

---

## 🔐 Default Credentials

| Role     | Email                       | Password   |
|----------|-----------------------------|------------|
| Admin    | admin@barangay.gov.ph       | admin1234  |
| Resident | (register via /register)    | your choice|

---

## 📦 Complaint Statuses
`Pending` → `Approved` → `Scheduled` → `Resolved`  
`Pending` → `Rejected`

## 📅 Appointment Statuses
`Pending` → `Approved` → `Completed`  
`Pending` → `Rejected`  
`Approved` → `Cancelled`

---

## 🎨 Theme
- **Primary:** Blue (`#2563eb`)
- **Background:** White (`#ffffff`)
- **Font:** Plus Jakarta Sans (headings) + DM Sans (body)
- **Design:** Clean government portal aesthetic

---

## 📂 Key Source Files

```
frontend/src/
├── pages/
│   ├── LandingPage.jsx        — public homepage
│   ├── ResidentLogin.jsx      — resident login
│   ├── ResidentRegister.jsx   — registration form
│   ├── ResidentDashboard.jsx  — resident home
│   ├── SubmitComplaint.jsx    — complaint form + file upload
│   ├── ComplaintHistory.jsx   — resident complaint tracker
│   ├── BookAppointment.jsx    — slot picker + booking form
│   ├── AppointmentHistory.jsx — resident appointment tracker
│   ├── Announcements.jsx      — public announcements
│   ├── AdminDashboard.jsx     — admin stats overview
│   ├── ManageComplaints.jsx   — admin complaint management
│   ├── ManageAppointments.jsx — admin appointment management
│   ├── ManageResidents.jsx    — admin resident directory
│   ├── ManageAnnouncements.jsx— admin announcements CRUD
│   └── Reports.jsx            — admin reports + CSV export
│
backend/
├── controllers/
│   ├── authController.js      — register, login, admin-login
│   ├── complaintController.js — categories, submit, list
│   ├── appointmentController.js — slots, book, list
│   ├── adminController.js     — all admin endpoints + reports
│   └── announcementController.js — CRUD announcements
│
laravel-backend/app/Http/Controllers/
│   ├── AuthController.php
│   ├── ComplaintController.php
│   ├── AppointmentController.php
│   ├── AdminController.php
│   ├── AnnouncementController.php
│   └── ResidentController.php
```
