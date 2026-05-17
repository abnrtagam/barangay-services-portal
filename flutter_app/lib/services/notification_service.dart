import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'dart:convert';
import 'api_service.dart';
import '../constants/api_constants.dart';

class NotificationService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  static Future<void> initialize() async {
    // Request permission for iOS/Android
    await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // Initialize local notifications for foreground display
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const initSettings = InitializationSettings(android: androidSettings);
    await _localNotificationsPlugin.initialize(initSettings);

    // Handle messages when app is in foreground
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      _showLocalNotification(message);
    });
  }

  static Future<String?> getToken() async {
    try {
      return await _firebaseMessaging.getToken();
    } catch (e) {
      print('Failed to get FCM token: $e');
      return null;
    }
  }

  static Future<void> _showLocalNotification(RemoteMessage message) async {
    const androidDetails = AndroidNotificationDetails(
      'barangay_channel',
      'Barangay Notifications',
      channelDescription: 'Notifications from Barangay Portal',
      importance: Importance.max,
      priority: Priority.high,
    );
    const details = NotificationDetails(android: androidDetails);

    await _localNotificationsPlugin.show(
      message.hashCode,
      message.notification?.title,
      message.notification?.body,
      details,
      payload: jsonEncode(message.data),
    );
  }

  // Fetch notifications from the backend for the Notification Center
  static Future<Map<String, dynamic>> getNotifications() async {
    try {
      final response = await ApiService.get(ApiConstants.notifications);
      if (response['success']) {
        return {
          'success': true,
          'data': response['data'] ?? [],
        };
      } else {
        return {
          'success': false,
          'message': response['message'] ?? 'Failed to fetch notifications',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error: $e',
      };
    }
  }
  // Clear all notifications
  static Future<bool> clearNotifications() async {
    try {
      final response = await ApiService.delete(ApiConstants.notifications);
      return response['success'] == true;
    } catch (e) {
      return false;
    }
  }
}
