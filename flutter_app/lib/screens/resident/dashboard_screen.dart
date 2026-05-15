import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/complaint_provider.dart';
import '../../providers/appointment_provider.dart';
import '../../providers/announcement_provider.dart';
import '../../widgets/stat_card.dart';
import '../../models/announcement_model.dart';
import '../../constants/app_colors.dart';
import 'announcement_history_screen.dart';
import 'notification_center_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final complaintProvider = context.read<ComplaintProvider>();
    final appointmentProvider = context.read<AppointmentProvider>();
    final announcementProvider = context.read<AnnouncementProvider>();

    await Future.wait([
      complaintProvider.fetchComplaints(),
      appointmentProvider.fetchAppointments(),
      announcementProvider.fetchAnnouncements(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;

    return Scaffold(
      backgroundColor: AppColors.gray50,
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: CustomScrollView(
          slivers: [
            // Professional App Bar
            SliverAppBar(
              expandedHeight: 140,
              floating: false,
              pinned: true,
              automaticallyImplyLeading: false,
              backgroundColor: AppColors.primary800,
              surfaceTintColor: Colors.transparent,
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppColors.primary900, AppColors.primary600],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'BARANGAY BULUA',
                                      style: TextStyle(
                                        color: Colors.white70,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: 2,
                                        fontFamily: 'Plus Jakarta Sans',
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      user?.fullName ?? 'Resident',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 24,
                                        fontWeight: FontWeight.w800,
                                        fontFamily: 'Plus Jakarta Sans',
                                        letterSpacing: -0.5,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    const Text(
                                      'An Online Appointment and Complaint System',
                                      style: TextStyle(
                                        color: Colors.white70,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                        fontFamily: 'DM Sans',
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              InkWell(
                                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const NotificationCenterScreen())),
                                borderRadius: BorderRadius.circular(12),
                                child: Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: Colors.white.withValues(alpha: 0.1), width: 1),
                                  ),
                                  child: const Icon(Icons.notifications_active_rounded, color: Colors.white, size: 22),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // Main Content
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'SYSTEM OVERVIEW',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: AppColors.gray500,
                        letterSpacing: 1.2,
                        fontFamily: 'Plus Jakarta Sans',
                      ),
                    ),
                    const SizedBox(height: 16),
                    Consumer2<ComplaintProvider, AppointmentProvider>(
                      builder: (context, complaints, appointments, _) {
                        return GridView.count(
                          crossAxisCount: 2,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          mainAxisSpacing: 16,
                          crossAxisSpacing: 16,
                          childAspectRatio: 1.3,
                          children: [
                            StatCard(
                              icon: Icons.description_outlined,
                              value: '${complaints.totalComplaints}',
                              label: 'Total Complaints',
                              color: AppColors.primary600,
                            ),
                            StatCard(
                              icon: Icons.hourglass_empty_rounded,
                              value: '${complaints.pendingComplaints}',
                              label: 'Pending Actions',
                              color: AppColors.warning,
                            ),
                            StatCard(
                              icon: Icons.calendar_today_rounded,
                              value: '${appointments.totalAppointments}',
                              label: 'Scheduled Visits',
                              color: AppColors.accentTeal,
                            ),
                            StatCard(
                              icon: Icons.check_circle_outline_rounded,
                              value: '${complaints.resolvedComplaints}',
                              label: 'Resolved Issues',
                              color: AppColors.success,
                            ),
                          ],
                        );
                      },
                    ),

                    const SizedBox(height: 32),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'LATEST ANNOUNCEMENTS',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: AppColors.gray500,
                            letterSpacing: 1.2,
                            fontFamily: 'Plus Jakarta Sans',
                          ),
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const AnnouncementHistoryScreen()),
                            );
                          },
                          child: const Text('View All', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                  ],
                ),
              ),
            ),

            // Announcement List
            Consumer<AnnouncementProvider>(
              builder: (context, announcementProvider, _) {
                if (announcementProvider.isLoading) {
                  return const SliverToBoxAdapter(
                    child: Center(child: CircularProgressIndicator()),
                  );
                }

                final announcements = announcementProvider.announcements;
                if (announcements.isEmpty) {
                  return const SliverToBoxAdapter(
                    child: Center(child: Text('No recent announcements')),
                  );
                }

                return SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final announcement = announcements[index];
                      return _buildAnnouncementCard(announcement);
                    },
                    childCount: announcements.length > 3 ? 3 : announcements.length,
                  ),
                );
              },
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  Widget _buildAnnouncementCard(Announcement announcement) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.gray200, width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    announcement.title,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.gray900,
                      fontFamily: 'Plus Jakarta Sans',
                    ),
                  ),
                ),
                Text(
                  announcement.daysAgo == 0 ? "TODAY" : "${announcement.daysAgo}D AGO",
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.gray400),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              announcement.content,
              style: const TextStyle(fontSize: 13, color: AppColors.gray600, height: 1.5, fontFamily: 'DM Sans'),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
