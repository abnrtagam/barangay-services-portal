import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/complaint_provider.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/empty_state.dart';
import '../../models/complaint_model.dart';
import '../../constants/app_colors.dart';
import 'complaint_detail_screen.dart';
import 'submit_complaint_screen.dart';
import 'package:intl/intl.dart';

class ComplaintHistoryScreen extends StatefulWidget {
  const ComplaintHistoryScreen({super.key});

  @override
  State<ComplaintHistoryScreen> createState() => _ComplaintHistoryScreenState();
}

class _ComplaintHistoryScreenState extends State<ComplaintHistoryScreen> {
  String _filterStatus = 'All';

  @override
  void initState() {
    super.initState();
    context.read<ComplaintProvider>().fetchComplaints();
  }

  List<Complaint> _getFilteredComplaints(List<Complaint> complaints) {
    if (_filterStatus == 'All') return complaints;
    return complaints.where((c) => c.status == _filterStatus).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.gray50,
      appBar: AppBar(
        title: const Text('MY COMPLAINTS'),
      ),
      body: Column(
        children: [
          // Professional filter chips
          Container(
            color: AppColors.white,
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['All', 'Pending', 'Approved', 'Scheduled', 'Resolved', 'Rejected']
                    .map((status) => Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: FilterChip(
                            label: Text(status.toUpperCase()),
                            selected: _filterStatus == status,
                            onSelected: (selected) {
                              setState(() => _filterStatus = status);
                            },
                            selectedColor: AppColors.primary100,
                            checkmarkColor: AppColors.primary700,
                            labelStyle: TextStyle(
                              color: _filterStatus == status ? AppColors.primary700 : AppColors.gray500,
                              fontWeight: _filterStatus == status ? FontWeight.w800 : FontWeight.w600,
                              fontSize: 10,
                              letterSpacing: 0.5,
                            ),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            side: BorderSide(
                              color: _filterStatus == status ? AppColors.primary200 : AppColors.gray200,
                              width: 1,
                            ),
                          ),
                        ))
                    .toList(),
              ),
            ),
          ),

          // Complaint list
          Expanded(
            child: Consumer<ComplaintProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                final filtered = _getFilteredComplaints(provider.complaints);

                if (filtered.isEmpty) {
                  return EmptyState(
                    icon: Icons.description_outlined,
                    title: 'No Records Found',
                    subtitle: 'You do not have any complaint records matches your current selection.',
                    actionLabel: _filterStatus == 'All' ? 'SUBMIT NEW COMPLAINT' : null,
                    onAction: _filterStatus == 'All'
                        ? () => Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const SubmitComplaintScreen()),
                            )
                        : null,
                  );
                }

                return RefreshIndicator(
                  onRefresh: () => provider.fetchComplaints(),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(20),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      return _buildComplaintCard(filtered[index]);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const SubmitComplaintScreen())).then((_) {
            context.read<ComplaintProvider>().fetchComplaints();
          });
        },
        backgroundColor: AppColors.primary900,
        foregroundColor: AppColors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('NEW COMPLAINT', style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: 0.5, fontSize: 13)),
      ),
    );
  }

  Widget _buildComplaintCard(Complaint complaint) {
    return GestureDetector(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (_) => ComplaintDetailScreen(complaint: complaint)));
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.gray200, width: 1),
          boxShadow: [
            BoxShadow(
              color: AppColors.gray950.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    complaint.subject,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.gray900,
                      fontFamily: 'Plus Jakarta Sans',
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                StatusBadge(status: complaint.status),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              complaint.details,
              style: const TextStyle(fontSize: 13, color: AppColors.gray600, height: 1.5, fontFamily: 'DM Sans'),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 12),
            const Divider(height: 1, color: AppColors.gray150),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.access_time_rounded, size: 14, color: AppColors.gray400),
                const SizedBox(width: 4),
                Text(
                  DateFormat('MMM d, y').format(complaint.createdAt),
                  style: const TextStyle(fontSize: 12, color: AppColors.gray500, fontWeight: FontWeight.w600),
                ),
                if (complaint.categoryName != null) ...[
                  const SizedBox(width: 12),
                  const Icon(Icons.category_outlined, size: 14, color: AppColors.gray400),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      complaint.categoryName!,
                      style: const TextStyle(fontSize: 12, color: AppColors.gray500, fontWeight: FontWeight.w600),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
                const Icon(Icons.chevron_right_rounded, size: 18, color: AppColors.gray300),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
