# Installation & Setup Guide

This guide provides instructions to get the **Barangay Bulua System** up and running on your local machine for evaluation.

## 📋 Prerequisites
- **Node.js** (v18 or higher)
- **PHP** (v8.1 or higher) & **Composer**
- **MySQL** (XAMPP / WAMP recommended)
- **Flutter SDK** (for the mobile app)

---

## 1. Database Setup
1. Open **phpMyAdmin** or your preferred MySQL client.
2. Create a new database named `barangay_bulua`.
3. Import the SQL file located at `/database/barangay_complaint_system.sql`.

---

## 2. Backend Setup (Node.js)
1. Navigate to the `/backend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and configure your database credentials and JWT secret.
4. Start the server:
   ```bash
   npm start
   ```

---

## 3. Administrative Backend (Laravel)
1. Navigate to the `/laravel-backend` directory.
2. Install PHP dependencies:
   ```bash
   composer install
   ```
3. Copy `.env.example` to `.env` and configure your database connection.
4. Generate app key:
   ```bash
   php artisan key:generate
   ```
5. Start the Laravel server:
   ```bash
   php artisan serve
   ```

---

## 4. Frontend Portal (React)
1. Navigate to the `/frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the portal at `http://localhost:5173` (or the port shown in your terminal).

---

## 5. Mobile Application (Flutter)
1. Navigate to the `/flutter_app` directory.
2. Get packages:
   ```bash
   flutter pub get
   ```
3. Run the app on an emulator or physical device:
   ```bash
   flutter run
   ```

---
*Note: Ensure both backends (Node and Laravel) are running for full functionality.*
