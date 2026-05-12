import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import ResidentLayout from '../layouts/ResidentLayout'
import AdminLayout from '../layouts/AdminLayout'

// Public pages
import LandingPage from '../pages/LandingPage'
import ResidentLogin from '../pages/ResidentLogin'
import ResidentRegister from '../pages/ResidentRegister'
import VerifyOTP from '../pages/VerifyOTP'
import AdminLogin from '../pages/AdminLogin'

// Resident pages
import ResidentDashboard from '../pages/ResidentDashboard'
import SubmitComplaint from '../pages/SubmitComplaint'
import ComplaintHistory from '../pages/ComplaintHistory'
import BookAppointment from '../pages/BookAppointment'
import AppointmentHistory from '../pages/AppointmentHistory'
import Announcements from '../pages/Announcements'

// Admin pages
import AdminDashboard from '../pages/AdminDashboard'
import AccountVerifications from '../pages/AccountVerifications'
import ManageComplaints from '../pages/ManageComplaints'
import ManageAppointments from '../pages/ManageAppointments'
import ManageResidents from '../pages/ManageResidents'
import ManageAnnouncements from '../pages/ManageAnnouncements'
import Reports from '../pages/Reports'

// Guards
const ResidentGuard = ({ children }) => {
  const token = localStorage.getItem('resident_token')
  return token ? children : <Navigate to="/login" replace />
}
const AdminGuard = ({ children }) => {
  const token = localStorage.getItem('admin_token')
  return token ? children : <Navigate to="/admin/login" replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<ResidentLogin />} />
      <Route path="/register" element={<ResidentRegister />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Resident Protected */}
      <Route path="/resident" element={<ResidentGuard><ResidentLayout /></ResidentGuard>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ResidentDashboard />} />
        <Route path="complaints/submit" element={<SubmitComplaint />} />
        <Route path="complaints/history" element={<ComplaintHistory />} />
        <Route path="appointments/book" element={<BookAppointment />} />
        <Route path="appointments/history" element={<AppointmentHistory />} />
        <Route path="announcements" element={<Announcements />} />
      </Route>

      {/* Admin Protected */}
      <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="verifications" element={<AccountVerifications />} />
        <Route path="complaints" element={<ManageComplaints />} />
        <Route path="appointments" element={<ManageAppointments />} />
        <Route path="residents" element={<ManageResidents />} />
        <Route path="announcements" element={<ManageAnnouncements />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
