import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';
import '../services/storage_service.dart';
import 'dart:convert';

// AuthProvider is like a bulletin board that remembers who's logged in
// When the user logs in, the provider updates, and all screens immediately know
// This is state management - shared state that multiple screens can access

class AuthProvider with ChangeNotifier {
  User? _user;
  String? _token;
  bool _isLoggedIn = false;
  bool _isLoading = false;
  String? _errorMessage;

  // Getters - other parts of the app read these
  User? get user => _user;
  String? get token => _token;
  bool get isLoggedIn => _isLoggedIn;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Check if user is admin
  bool get isAdmin => _user?.role == 'admin';
  bool get isResident => _user?.role == 'resident';

  // Initialize provider - restore login if token exists
  Future<void> initializeAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      final token = await StorageService.getToken();
      final userJson = await StorageService.getUserInfo();

      if (token != null && userJson != null) {
        _token = token;
        _user = User.fromJson(jsonDecode(userJson));
        _isLoggedIn = true;
      }
    } catch (e) {
      _errorMessage = 'Error loading auth: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Login method
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await AuthService.login(
        email: email,
        password: password,
      );

      if (result['success']) {
        _user = result['user'];
        _token = result['token'];
        _isLoggedIn = true;
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = result['message'] ?? 'Login failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = 'Error: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Register method
  Future<Map<String, dynamic>> register({
    required String firstName,
    required String lastName,
    required String email,
    required String phone,
    required String address,
    required String password,
    required List<String> documentPaths,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await AuthService.register(
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        address: address,
        password: password,
        documentPaths: documentPaths,
      );

      _isLoading = false;
      notifyListeners();
      return result;
    } catch (e) {
      _errorMessage = 'Error: $e';
      _isLoading = false;
      notifyListeners();
      return {
        'success': false,
        'message': 'Registration error: $e',
      };
    }
  }

  // Verify OTP
  Future<Map<String, dynamic>> verifyOtp({required String email, required String otpCode}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await AuthService.verifyOtp(
        email: email,
        otpCode: otpCode,
      );

      _isLoading = false;
      notifyListeners();
      return result;
    } catch (e) {
      _errorMessage = 'Error: $e';
      _isLoading = false;
      notifyListeners();
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  // Resend OTP
  Future<Map<String, dynamic>> resendOtp({required String email}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await AuthService.resendOtp(email: email);
      _isLoading = false;
      notifyListeners();
      return result;
    } catch (e) {
      _errorMessage = 'Error: $e';
      _isLoading = false;
      notifyListeners();
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  // Logout
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await AuthService.logout();
      _user = null;
      _token = null;
      _isLoggedIn = false;
      _errorMessage = null;
    } catch (e) {
      _errorMessage = 'Error logging out: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
