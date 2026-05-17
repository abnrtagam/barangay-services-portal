import 'dart:convert';
import 'package:http/http.dart' as http;
import 'storage_service.dart';
import '../constants/api_constants.dart';

// ApiService is like the waiter at the restaurant - it handles all communication
// with the backend (kitchen), automatically attaching your VIP pass (JWT token)

class ApiService {
  // Make a GET request to the backend
  // Example: apiService.get('/complaints') gets your complaints
  static Future<Map<String, dynamic>> get(String endpoint) async {
    try {
      final token = await StorageService.getToken();
      final headers = _buildHeaders(token);

      final response = await http
          .get(
            Uri.parse(endpoint),
            headers: headers,
          )
          .timeout(
            const Duration(
                milliseconds: ApiConstants.receiveTimeout),
          );

      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Make a POST request to the backend
  // Example: apiService.post('/auth/login', {'email': '...', 'password': '...'})
  static Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> body, {
    bool isFormData = false,
  }) async {
    try {
      final token = await StorageService.getToken();
      final headers = _buildHeaders(token);

      late http.Response response;

      if (isFormData) {
        // For file uploads (multipart/form-data)
        var request = http.MultipartRequest('POST', Uri.parse(endpoint));
        request.headers.addAll(headers);

        // Add form fields
        for (var entry in body.entries) {
          if (entry.value is List<String> && entry.key == 'documents') {
            // Handle multiple file paths for registration
            List<String> filePaths = entry.value as List<String>;
            for (String path in filePaths) {
              request.files.add(await http.MultipartFile.fromPath(
                'documents',
                path,
              ));
            }
          } else if (entry.key == 'attachment' && entry.value is String) {
            // Handle single attachment for complaints
            request.files.add(await http.MultipartFile.fromPath(
              'attachment',
              entry.value as String,
            ));
          } else if (entry.value is String) {
            request.fields[entry.key] = entry.value;
          } else {
             request.fields[entry.key] = entry.value.toString();
          }
        }

        response = await request.send().then(http.Response.fromStream).timeout(
              const Duration(milliseconds: ApiConstants.receiveTimeout),
            );
      } else {
        // Regular JSON POST
        response = await http
            .post(
              Uri.parse(endpoint),
              headers: headers,
              body: jsonEncode(body),
            )
            .timeout(
              const Duration(milliseconds: ApiConstants.receiveTimeout),
            );
      }

      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Make a PATCH request to the backend
  // Example: apiService.patch('/admin/complaints/1/status', {'status': 'Approved'})
  static Future<Map<String, dynamic>> patch(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    try {
      final token = await StorageService.getToken();
      final headers = _buildHeaders(token);

      final response = await http
          .patch(
            Uri.parse(endpoint),
            headers: headers,
            body: jsonEncode(body),
          )
          .timeout(
            const Duration(milliseconds: ApiConstants.receiveTimeout),
          );

      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Make a DELETE request to the backend
  static Future<Map<String, dynamic>> delete(String endpoint) async {
    try {
      final token = await StorageService.getToken();
      final headers = _buildHeaders(token);

      final response = await http
          .delete(
            Uri.parse(endpoint),
            headers: headers,
          )
          .timeout(
            const Duration(milliseconds: ApiConstants.receiveTimeout),
          );

      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Build headers with JWT token
  // This is like showing your VIP pass to the backend
  static Map<String, String> _buildHeaders(String? token) {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // If we have a token, add it to the Authorization header
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  // Handle the response from the backend
  // Convert the response body (JSON) to a Dart Map
  static Map<String, dynamic> _handleResponse(http.Response response) {
    final jsonResponse = jsonDecode(response.body);

    // If status code is 2xx (200-299), it's a success
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return {
        'success': true,
        'data': jsonResponse,
        'statusCode': response.statusCode,
      };
    }

    // If status code is 4xx or 5xx, it's an error
    final errorMessage =
        jsonResponse['message'] ?? 'An error occurred';
    return {
      'success': false,
      'message': errorMessage,
      'statusCode': response.statusCode,
      'data': jsonResponse,
    };
  }
}
