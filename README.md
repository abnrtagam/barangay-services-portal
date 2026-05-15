# 🏛️ Barangay Services Portal (Multi-Platform)

A comprehensive, production-ready government service ecosystem designed to digitize barangay operations. This system provides a seamless experience for both administrators and residents across Web and Mobile platforms.

---

## 📱 Platform Ecosystem

### 👨‍💼 Admin Dashboard (Web)
The central nerve center for barangay officials to monitor and manage the community.
*   **Verification Management**: Review resident registrations and verify proof of residency.
*   **Complaint Resolution**: track, update, and resolve resident complaints.
*   **Appointment Scheduling**: Approve or reschedule resident appointments.
*   **Announcements**: Post news and updates that sync instantly to the mobile app.
*   **Account Control**: Suspend or reactivate accounts based on community guidelines.

### 🏠 Resident Portal (Web & Mobile)
Empowering residents with on-the-go access to essential services.
*   **Mobile App (Flutter)**: A premium, native experience for Android and iOS.
*   **Secure Registration**: Sign up with document verification (Proof of Residency).
*   **Incident Reporting**: Submit complaints with photo attachments directly from the camera.
*   **Real-time Booking**: Schedule appointments with real-time slot validation.
*   **Instant Updates**: Receive the latest barangay news and track the status of your requests.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (Relational) |
| **Web Frontend** | React.js, Vanilla CSS |
| **Mobile App** | Flutter (Dart), Provider State Management |
| **Legacy Services** | Laravel |
| **Authentication** | JWT (JSON Web Tokens), OTP (One-Time Password) |

---

## 🚀 Getting Started

### 1. Prerequisites
*   [Node.js](https://nodejs.org/) (v16+)
*   [Flutter SDK](https://docs.flutter.dev/get-started/install)
*   [XAMPP](https://www.apachefriends.org/index.html) (for MySQL)

### 2. Database Setup
1. Start **Apache** and **MySQL** in XAMPP.
2. Create a database named `barangay_complaint_system` in phpMyAdmin.
3. Import `barangay_complaint_system.sql` located in the root directory.

### 3. Backend Configuration (`/backend`)
1. Create a `.env` file in the `backend/` folder:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=barangay_complaint_system
   JWT_SECRET=your_secret_key
   ```
2. Install dependencies and start:
   ```bash
   npm install
   npm start
   ```

### 4. Mobile App Setup (`/flutter_app`)
1.  **Configure API Connection**: 
    Open `lib/constants/api_constants.dart` and set the `baseUrl`:
    *   **Emulator**: `http://10.0.2.2:5000/api`
    *   **Physical Device**: `http://YOUR_LOCAL_IP:5000/api`
2.  **Run the App**:
    ```bash
    flutter pub get
    flutter run
    ```

---

## 📑 System Workflows

### Resident Verification
`Register` ➔ `OTP Verification` ➔ `Admin Document Review` ➔ `Approved/Rejected`

### Complaint Handling
`Resident Submission (with Photos)` ➔ `Admin Review` ➔ `Status Update (In Progress/Resolved)`

### Account Reactivation
`Suspended User` ➔ `Submit Appeal Reason` ➔ `Admin Review` ➔ `Reactivation`

---

## 📸 Screen Preview (Coming Soon)
*(Add your screenshots here to make your GitHub profile stand out!)*

---

## 🤝 Support & Contribution
This system is designed to improve community service efficiency. If you encounter any bugs or have feature suggestions, please open an issue in the repository.

---
© 2024 Barangay Services Portal. All Rights Reserved.
