import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/appointment_model.dart';
import '../../providers/appointment_provider.dart';
import '../../widgets/status_badge.dart';
import '../../constants/app_colors.dart';
import 'package:intl/intl.dart';

class AppointmentDetailScreen extends StatelessWidget {
  final Appointment appointment;

  const AppointmentDetailScreen({super.key, required this.appointment});

  void _confirmCancel(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Cancel Appointment', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.danger)),
        content: const Text('Are you sure you want to cancel this appointment? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('NO, KEEP IT', style: TextStyle(color: AppColors.gray500, fontWeight: FontWeight.bold)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () async {
              Navigator.pop(dialogCtx); // Close dialog
              
              // Show a loading dialog
              showDialog(
                context: context,
                barrierDismissible: false,
                builder: (loadingCtx) => const Center(
                  child: CircularProgressIndicator(color: AppColors.primary600),
                ),
              );

              final result = await context.read<AppointmentProvider>().cancelAppointment(appointment.id);
              
              if (context.mounted) {
                Navigator.pop(context); // Close loading dialog
                
                if (result['success']) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Appointment cancelled successfully!'),
                      backgroundColor: AppColors.success,
                    ),
                  );
                  Navigator.pop(context); // Go back to history screen
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(result['message'] ?? 'Failed to cancel appointment'),
                      backgroundColor: AppColors.danger,
                    ),
                  );
                }
              }
            },
            child: const Text('YES, CANCEL', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: const Text('Appointment Details'),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF2D3748),
        elevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2))]),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Expanded(child: Text(appointment.purpose, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Color(0xFF2D3748)))),
                  StatusBadge(status: appointment.status, fontSize: 13),
                ]),
                const SizedBox(height: 8),
                Text('Appointment #${appointment.id}', style: TextStyle(fontSize: 12, color: Colors.grey[400])),
              ]),
            ),
            const SizedBox(height: 16),

            // Schedule info
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2))]),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [const Icon(Icons.event_rounded, size: 18, color: Color(0xFF8B5CF6)), const SizedBox(width: 8), const Text('Schedule', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF2D3748)))]),
                const SizedBox(height: 16),
                _row(Icons.calendar_today_rounded, 'Date', appointment.appointmentDate),
                _row(Icons.access_time_rounded, 'Time Slot', appointment.timeSlot),
                _row(Icons.event_note_rounded, 'Booked On', DateFormat('MMM d, y • h:mm a').format(appointment.createdAt)),
                if (appointment.isUpcoming)
                  _row(Icons.timer_outlined, 'Days Until', '${appointment.daysUntil} day${appointment.daysUntil == 1 ? "" : "s"}'),
              ]),
            ),

            // Notes
            if (appointment.notes != null && appointment.notes!.isNotEmpty) ...[
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2))]),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [const Icon(Icons.notes_rounded, size: 18, color: Color(0xFF8B5CF6)), const SizedBox(width: 8), const Text('Your Notes', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF2D3748)))]),
                  const SizedBox(height: 12),
                  Text(appointment.notes!, style: TextStyle(fontSize: 14, color: Colors.grey[700], height: 1.5)),
                ]),
              ),
            ],

            // Admin remarks
            if (appointment.adminRemarks != null && appointment.adminRemarks!.isNotEmpty) ...[
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2))]),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [const Icon(Icons.admin_panel_settings_outlined, size: 18, color: Color(0xFF8B5CF6)), const SizedBox(width: 8), const Text('Admin Remarks', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF2D3748)))]),
                  const SizedBox(height: 12),
                  Text(appointment.adminRemarks!, style: TextStyle(fontSize: 14, color: Colors.grey[700], fontStyle: FontStyle.italic)),
                ]),
              ),
            ],

            const SizedBox(height: 16),
            // Timeline
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2))]),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [const Icon(Icons.history_rounded, size: 18, color: Color(0xFF8B5CF6)), const SizedBox(width: 8), const Text('Status History', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF2D3748)))]),
                const SizedBox(height: 16),
                _buildTimeline(appointment.history ?? []),
              ]),
            ),

            if (['pending', 'approved'].contains(appointment.status.toLowerCase())) ...[
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => _confirmCancel(context),
                  icon: const Icon(Icons.cancel_outlined, color: AppColors.danger),
                  label: const Text(
                    'CANCEL APPOINTMENT',
                    style: TextStyle(
                      color: AppColors.danger,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.0,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    side: const BorderSide(color: AppColors.danger, width: 1.5),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ],

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  bool _isFinalStatus(String status) {
    return ['resolved', 'completed', 'cancelled', 'rejected'].contains(status.toLowerCase());
  }

  Widget _buildTimeline(List<dynamic> history) {
    if (history.isEmpty) {
      return const Text('No history available', style: TextStyle(fontSize: 13, color: AppColors.gray400));
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: history.length,
      itemBuilder: (context, index) {
        final item = history[index];
        final isLast = index == history.length - 1;
        final isLatest = index == 0;
        final finalStatus = _isFinalStatus(item.newStatus);
        
        return IntrinsicHeight(
          child: Row(
            children: [
              Column(
                children: [
                  if (isLatest && finalStatus)
                    const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 16)
                  else
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: isLatest ? AppColors.primary600 : AppColors.gray300,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                        boxShadow: isLatest ? [BoxShadow(color: AppColors.primary600.withValues(alpha: 0.3), blurRadius: 4)] : null,
                      ),
                    ),
                  if (!isLast)
                    Expanded(
                      child: Container(width: 2, color: AppColors.gray200),
                    ),
                ],
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(bottom: isLast ? 0 : 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            item.newStatus.toUpperCase(),
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: _getStatusColor(item.newStatus)),
                          ),
                          Text(
                            DateFormat('MMM d, y • h:mm a').format(item.changedAt),
                            style: TextStyle(fontSize: 10, color: AppColors.gray400),
                          ),
                        ],
                      ),
                      if (item.notes != null && item.notes!.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          item.notes!,
                          style: TextStyle(fontSize: 13, color: AppColors.gray600, height: 1.4),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending': return AppColors.warning;
      case 'approved': return AppColors.success;
      case 'scheduled': return AppColors.accentTeal;
      case 'completed': return AppColors.success;
      case 'cancelled': return AppColors.danger;
      case 'rejected': return AppColors.danger;
      default: return AppColors.gray500;
    }
  }

  Widget _row(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(children: [
        Icon(icon, size: 16, color: Colors.grey[400]),
        const SizedBox(width: 10),
        SizedBox(width: 100, child: Text(label, style: TextStyle(fontSize: 13, color: Colors.grey[500]))),
        Expanded(child: Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Colors.grey[700]))),
      ]),
    );
  }
}
