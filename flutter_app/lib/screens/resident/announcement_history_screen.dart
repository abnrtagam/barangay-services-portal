import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/announcement_provider.dart';
import '../../models/announcement_model.dart';
import '../../constants/app_colors.dart';

class AnnouncementHistoryScreen extends StatefulWidget {
  const AnnouncementHistoryScreen({super.key});

  @override
  State<AnnouncementHistoryScreen> createState() => _AnnouncementHistoryScreenState();
}

class _AnnouncementHistoryScreenState extends State<AnnouncementHistoryScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<AnnouncementProvider>().fetchAnnouncements());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.gray50,
      appBar: AppBar(
        title: const Text('ANNOUNCEMENTS'),
      ),
      body: Consumer<AnnouncementProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final announcements = provider.announcements;
          if (announcements.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.campaign_outlined, size: 64, color: AppColors.gray300),
                  const SizedBox(height: 16),
                  const Text('No announcements yet', style: TextStyle(color: AppColors.gray500, fontSize: 16, fontWeight: FontWeight.w600)),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => provider.fetchAnnouncements(),
            child: ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: announcements.length,
              itemBuilder: (context, index) {
                final announcement = announcements[index];
                return _buildAnnouncementItem(announcement);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildAnnouncementItem(Announcement announcement) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.gray200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary50,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text('GENERAL', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.primary700)),
              ),
              Text(
                announcement.daysAgo == 0 ? "TODAY" : "${announcement.daysAgo}D AGO",
                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.gray400),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            announcement.title,
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w800,
              color: AppColors.primary900,
              fontFamily: 'Plus Jakarta Sans',
            ),
          ),
          const SizedBox(height: 8),
          Text(
            announcement.content,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.gray600,
              height: 1.6,
              fontFamily: 'DM Sans',
            ),
          ),
          if (announcement.createdAt != null) ...[
            const SizedBox(height: 16),
            const Divider(color: AppColors.gray100),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.access_time_rounded, size: 14, color: AppColors.gray400),
                const SizedBox(width: 6),
                Text(
                  "Posted on ${announcement.createdAt.toString().split(' ')[0]}",
                  style: const TextStyle(fontSize: 12, color: AppColors.gray400, fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
