import 'api_service.dart';
import '../constants/api_constants.dart';
import '../models/appointment_model.dart';

class AppointmentService {
  // Get all appointments for the logged-in resident
  static Future<Map<String, dynamic>> getAppointments() async {
    try {
      final response = await ApiService.get(ApiConstants.appointments);
      if (response['success']) {
        final data = response['data']['data'];
        List<Appointment> appointments = [];
        if (data is List) {
          appointments = data.map((a) => Appointment.fromJson(a)).toList();
        }
        return {'success': true, 'appointments': appointments};
      } else {
        return {'success': false, 'message': response['message'] ?? 'Failed to fetch appointments'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  // Get taken slots for a specific date
  static Future<Map<String, dynamic>> getTakenSlots(String date) async {
    try {
      // Backend route is /api/appointments/taken-slots?date=YYYY-MM-DD
      final response = await ApiService.get('${ApiConstants.appointmentBook}/taken-slots?date=$date');
      if (response['success']) {
        final List<dynamic> data = response['data'];
        return {'success': true, 'slots': data.cast<String>()};
      } else {
        return {'success': false, 'message': response['message'] ?? 'Failed to fetch slots'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  // Book a new appointment
  static Future<Map<String, dynamic>> bookAppointment({
    required String appointmentDate,
    required String timeSlot,
    required String purpose,
    String? notes,
  }) async {
    try {
      final response = await ApiService.post(
        ApiConstants.appointmentBook,
        {
          'appointment_date': appointmentDate,
          'time_slot': timeSlot,
          'purpose': purpose,
          'notes': notes,
        },
      );

      if (response['success']) {
        return {
          'success': true,
          'message': response['data']['message'] ?? 'Appointment booked successfully',
        };
      } else {
        return {
          'success': false,
          'message': response['message'] ?? 'Failed to book appointment',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  // Cancel an appointment
  static Future<Map<String, dynamic>> cancelAppointment(int appointmentId) async {
    try {
      final response = await ApiService.patch(
        '${ApiConstants.appointments}/$appointmentId/cancel',
        {},
      );
      if (response['success']) {
        return {
          'success': true,
          'message': response['data']['message'] ?? 'Appointment cancelled successfully',
        };
      } else {
        return {
          'success': false,
          'message': response['message'] ?? 'Failed to cancel appointment',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }
}
