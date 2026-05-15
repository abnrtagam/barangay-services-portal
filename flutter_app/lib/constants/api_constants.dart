class ApiConstants {
  // TO TEST ON REAL DEVICE: Change '10.0.2.2' to your PC's IP address
  static const String baseUrl = 'http://192.168.100.3:5000/api';

  // Authentication Endpoints
  static const String register = '$baseUrl/auth/register';
  static const String login = '$baseUrl/auth/login';
  static const String verifyOtp = '$baseUrl/auth/verify-otp';
  static const String resendOtp = '$baseUrl/auth/resend-otp';
  static const String forgotPassword = '$baseUrl/auth/forgot-password';
  static const String resetPassword = '$baseUrl/auth/reset-password';
  static const String reactivate = '$baseUrl/auth/reactivate';

  // Resident Endpoints
  static const String dashboardStats = '$baseUrl/residents/dashboard-stats';
  static const String complaints = '$baseUrl/residents/complaints';
  static const String appointments = '$baseUrl/residents/appointments';
  static const String complaintSubmit = '$baseUrl/complaints';
  static const String appointmentBook = '$baseUrl/appointments';
  static const String appointmentSlots = '$baseUrl/appointments/taken-slots';
  static const String complaintCategories = '$baseUrl/complaints/categories';

  // Announcements
  static const String announcements = '$baseUrl/announcements';

  // Health Check
  static const String health = '$baseUrl/health';

  // Timeouts
  static const int connectTimeout = 30000; // 30 seconds
  static const int receiveTimeout = 30000; // 30 seconds
}
