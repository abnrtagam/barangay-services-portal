import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../constants/app_colors.dart';
import '../../widgets/shimmer_loading.dart';
import '../../widgets/empty_state.dart';
import '../../services/api_service.dart';
import '../../services/notification_service.dart';
import '../../constants/api_constants.dart';
import 'package:intl/intl.dart';
import '../../providers/complaint_provider.dart';
import '../../providers/appointment_provider.dart';
import 'complaint_detail_screen.dart';
import 'appointment_detail_screen.dart';

class NotificationCenterScreen extends StatefulWidget {
  const NotificationCenterScreen({super.key});

  @override
  State<NotificationCenterScreen> createState() => _NotificationCenterScreenState();
}

class _NotificationCenterScreenState extends State<NotificationCenterScreen> {
  bool _isLoading = true;
  List<dynamic> _notifications = [];

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);
    try {
      final result = await NotificationService.getNotifications();
      if (result['success'] && mounted) {
        setState(() {
          _notifications = result['data'];
          _isLoading = false;
        });
      } else if (mounted) {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // Helper to format date
  String _getTimeAgo(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      final diff = DateTime.now().difference(date);
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      return DateFormat('MMM dd').format(date);
    } catch (e) {
      return 'Recently';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.gray50,
      appBar: AppBar(
        title: const Text('NOTIFICATIONS'),
        actions: [
          if (_notifications.isNotEmpty)
            TextButton(
              onPressed: () async {
                final success = await NotificationService.clearNotifications();
                if (success) {
                  setState(() => _notifications.clear());
                }
              },
              child: const Text('Clear All', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            ),
        ],
      ),
      body: _isLoading
          ? ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: 8,
              itemBuilder: (context, index) => const ShimmerCard(),
            )
          : _notifications.isEmpty
              ? const EmptyState(
                  icon: Icons.notifications_none_rounded,
                  title: 'No Notifications Yet',
                  message: 'Stay tuned! You will receive updates about your complaints and appointments here.',
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(20),
                  itemCount: _notifications.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final notification = _notifications[index];
                    return _buildNotificationCard(notification);
                  },
                ),
    );
  }

  Widget _buildNotificationCard(dynamic notification) {
    return InkWell(
      onTap: () {
        final type = notification['type']?.toString().toLowerCase();
        final refIdStr = notification['reference_id']?.toString();
        if (type == null || refIdStr == null || refIdStr == 'null') return;
        
        final refId = int.tryParse(refIdStr);
        if (refId == null) return;

        if (type == 'complaint') {
          final comps = context.read<ComplaintProvider>().complaints;
          final idx = comps.indexWhere((c) => c.id == refId);
          if (idx != -1) {
            Navigator.push(context, MaterialPageRoute(builder: (_) => ComplaintDetailScreen(complaint: comps[idx])));
          }
        } else if (type == 'appointment') {
          final apps = context.read<AppointmentProvider>().appointments;
          final idx = apps.indexWhere((a) => a.id == refId);
          if (idx != -1) {
            Navigator.push(context, MaterialPageRoute(builder: (_) => AppointmentDetailScreen(appointment: apps[idx])));
          }
        }
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.primary50,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.info_outline_rounded, color: AppColors.primary700, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      notification['title']?.toString().toUpperCase() ?? 'UPDATE',
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.primary700, letterSpacing: 1),
                    ),
                    Text(
                      _getTimeAgo(notification['created_at']?.toString() ?? ''),
                      style: TextStyle(fontSize: 10, color: AppColors.gray400),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  notification['message']?.toString() ?? 'No content',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.gray900),
                ),
                const SizedBox(height: 4),
                Text(
                  'Tap to view details',
                  style: TextStyle(fontSize: 12, color: AppColors.gray600, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
      ),
    );
  }
}
