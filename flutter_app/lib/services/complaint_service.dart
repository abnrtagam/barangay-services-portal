import 'api_service.dart';
import '../constants/api_constants.dart';
import '../models/complaint_model.dart';
import '../models/auth_response_model.dart';

class ComplaintService {
  // Get all complaints for the logged-in resident
  static Future<Map<String, dynamic>> getComplaints() async {
    try {
      final response = await ApiService.get(ApiConstants.complaints);
      if (response['success']) {
        final data = response['data'];
        List<Complaint> complaints = [];

        if (data is List) {
          complaints = data.map((c) => Complaint.fromJson(c)).toList();
        } else if (data is Map && data['complaints'] != null) {
          complaints = (data['complaints'] as List)
              .map((c) => Complaint.fromJson(c))
              .toList();
        }

        return {'success': true, 'complaints': complaints};
      } else {
        return {'success': false, 'message': response['message'] ?? 'Failed to fetch complaints'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  // Submit a new complaint
  static Future<Map<String, dynamic>> submitComplaint({
    required int categoryId,
    required String subject,
    required String details,
    String? attachmentPath,
  }) async {
    try {
      final response = await ApiService.post(
        ApiConstants.complaints,
        {
          'category_id': categoryId.toString(),
          'subject': subject,
          'details': details,
          if (attachmentPath != null) 'attachment': attachmentPath,
        },
        isFormData: true,
      );

      if (response['success']) {
        return {
          'success': true,
          'message': response['data']['message'] ?? 'Complaint submitted successfully',
        };
      } else {
        return {
          'success': false,
          'message': response['message'] ?? 'Failed to submit complaint',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  // Get complaint categories
  static Future<Map<String, dynamic>> getCategories() async {
    try {
      final response = await ApiService.get(ApiConstants.complaintCategories);
      if (response['success']) {
        final data = response['data'];
        List<ComplaintCategory> categories = [];

        if (data is List) {
          categories = data.map((c) => ComplaintCategory.fromJson(c)).toList();
        } else if (data is Map && data['categories'] != null) {
          categories = (data['categories'] as List)
              .map((c) => ComplaintCategory.fromJson(c))
              .toList();
        }

        return {'success': true, 'categories': categories};
      } else {
        return {'success': false, 'message': response['message'] ?? 'Failed to fetch categories'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }
}
