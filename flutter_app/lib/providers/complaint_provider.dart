import 'package:flutter/material.dart';
import '../models/complaint_model.dart';
import '../models/auth_response_model.dart';
import '../services/complaint_service.dart';

class ComplaintProvider with ChangeNotifier {
  List<Complaint> _complaints = [];
  List<ComplaintCategory> _categories = [];
  bool _isLoading = false;
  bool _isSubmitting = false;
  String? _errorMessage;

  List<Complaint> get complaints => _complaints;
  List<ComplaintCategory> get categories => _categories;
  bool get isLoading => _isLoading;
  bool get isSubmitting => _isSubmitting;
  String? get errorMessage => _errorMessage;

  // Derived stats
  int get totalComplaints => _complaints.length;
  int get pendingComplaints => _complaints.where((c) => c.status == 'Pending').length;
  int get resolvedComplaints => _complaints.where((c) => c.status == 'Resolved').length;
  int get activeComplaints => _complaints.where((c) => c.status != 'Resolved' && c.status != 'Rejected').length;

  // Fetch all complaints
  Future<void> fetchComplaints() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await ComplaintService.getComplaints();
      if (result['success']) {
        _complaints = result['complaints'] as List<Complaint>;
        // Sort by most recent first
        _complaints.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      } else {
        _errorMessage = result['message'];
      }
    } catch (e) {
      _errorMessage = 'Error fetching complaints: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch complaint categories
  Future<void> fetchCategories() async {
    try {
      final result = await ComplaintService.getCategories();
      if (result['success']) {
        _categories = result['categories'] as List<ComplaintCategory>;
      }
    } catch (e) {
      // Silently fail — categories are not critical for display
    }
    notifyListeners();
  }

  // Submit a new complaint
  Future<Map<String, dynamic>> submitComplaint({
    required int categoryId,
    required String subject,
    required String details,
    String? attachmentPath,
  }) async {
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await ComplaintService.submitComplaint(
        categoryId: categoryId,
        subject: subject,
        details: details,
        attachmentPath: attachmentPath,
      );

      if (result['success']) {
        // Refresh the complaint list after successful submission
        await fetchComplaints();
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
