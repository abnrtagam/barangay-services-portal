import 'package:flutter/material.dart';
import '../models/appointment_model.dart';
import '../services/appointment_service.dart';

class AppointmentProvider with ChangeNotifier {
  List<Appointment> _appointments = [];
  List<String> _takenSlots = [];
  bool _isLoading = false;
  bool _isSubmitting = false;
  String? _errorMessage;

  List<Appointment> get appointments => _appointments;
  List<String> get takenSlots => _takenSlots;
  bool get isLoading => _isLoading;
  bool get isSubmitting => _isSubmitting;
  String? get errorMessage => _errorMessage;

  // Derived stats
  int get totalAppointments => _appointments.length;
  int get pendingAppointments => _appointments.where((a) => a.status == 'Pending').length;
  int get approvedAppointments => _appointments.where((a) => a.status == 'Approved').length;
  int get upcomingAppointments => _appointments.where((a) => a.isUpcoming && a.status == 'Approved').length;

  // Fetch all appointments
  Future<void> fetchAppointments() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await AppointmentService.getAppointments();
      if (result['success']) {
        final rawList = result['appointments'];
        if (rawList is List) {
          _appointments = List<Appointment>.from(rawList);
          _appointments.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        } else {
          _appointments = [];
        }
      } else {
        _errorMessage = result['message'];
      }
    } catch (e) {
      _errorMessage = 'Error fetching appointments: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch taken slots for a specific date
  Future<void> fetchTakenSlots(String date) async {
    try {
      final result = await AppointmentService.getTakenSlots(date);
      if (result['success']) {
        _takenSlots = result['slots'] as List<String>;
      } else {
        _takenSlots = [];
      }
    } catch (e) {
      _takenSlots = [];
    }
    notifyListeners();
  }

  // Book a new appointment
  Future<Map<String, dynamic>> bookAppointment({
    required String appointmentDate,
    required String timeSlot,
    required String purpose,
    String? notes,
  }) async {
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await AppointmentService.bookAppointment(
        appointmentDate: appointmentDate,
        timeSlot: timeSlot,
        purpose: purpose,
        notes: notes,
      );

      if (result['success']) {
        await fetchAppointments();
      }

      _isSubmitting = false;
      notifyListeners();
      return result;
    } catch (e) {
      _isSubmitting = false;
      _errorMessage = 'Error: $e';
      notifyListeners();
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  // Cancel an existing appointment
  Future<Map<String, dynamic>> cancelAppointment(int appointmentId) async {
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await AppointmentService.cancelAppointment(appointmentId);

      if (result['success']) {
        await fetchAppointments();
      }

      _isSubmitting = false;
      notifyListeners();
      return result;
    } catch (e) {
      _isSubmitting = false;
      _errorMessage = 'Error: $e';
      notifyListeners();
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
