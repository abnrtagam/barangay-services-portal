import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/complaint_provider.dart';
import '../../constants/app_colors.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/shimmer_loading.dart';
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
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ComplaintProvider>().fetchComplaints();
    });
  }

  List<dynamic> _getFilteredComplaints(List<dynamic> complaints) {
    if (_filterStatus == 'All') return complaints;
    return complaints.where((c) => c.status == _filterStatus).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.gray50,
      body: Column(
        children: [
          // Dynamic Header Banner
          Container(
            padding: const EdgeInsets.fromLTRB(24, 64, 24, 24),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.primary900, AppColors.primary700],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'My Complaints',
                      style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.white, fontFamily: 'Plus Jakarta Sans'),
                    ),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), shape: BoxShape.circle),
                      child: const Icon(Icons.assignment_late_outlined, color: AppColors.white),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  'Track and manage your filed reports.',
                  style: TextStyle(fontSize: 14, color: AppColors.primary100, fontFamily: 'DM Sans'),
                ),
              ],
            ),
          ),

          // Professional filter chips
          Container(
            color: AppColors.white,
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['All', 'Pending', 'Approved', 'Scheduled', 'Resolved', 'Rejected']
                    .map((status) => Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: FilterChip(
                            label: Text(status.toUpperCase(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: _filterStatus == status ? AppColors.white : AppColors.gray600, letterSpacing: 0.5)),
                            selected: _filterStatus == status,
                            onSelected: (selected) {
                              setState(() => _filterStatus = status);
                            },
                            backgroundColor: AppColors.gray100,
                            selectedColor: AppColors.primary600,
                            showCheckmark: false,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30), side: BorderSide.none),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                        ))
                    .toList(),
              ),
            ),
          ),
          
          Expanded(
            child: Consumer<ComplaintProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading && provider.complaints.isEmpty) {
                  return ListView.builder(
                    padding: const EdgeInsets.all(20),
                    itemCount: 5,
                    itemBuilder: (context, index) => const ShimmerCard(),
                  );
                }

                final complaints = _getFilteredComplaints(provider.complaints);

                if (complaints.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(color: AppColors.primary50, shape: BoxShape.circle),
                          child: const Icon(Icons.assignment_late_outlined, size: 48, color: AppColors.primary300),
                        ),
                        const SizedBox(height: 16),
                        const Text('No complaints found', style: TextStyle(color: AppColors.gray500, fontSize: 16, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () => provider.fetchComplaints(),
                  color: AppColors.primary600,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(20),
                    itemCount: complaints.length,
                    itemBuilder: (context, index) {
                      final complaint = complaints[index];
                      return _buildComplaintCard(context, complaint);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const SubmitComplaintScreen())),
        backgroundColor: AppColors.primary600,
        elevation: 4,
        label: const Text('FILE COMPLAINT', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12, letterSpacing: 1, color: AppColors.white)),
        icon: const Icon(Icons.add_rounded, color: AppColors.white),
      ),
    );
  }

  Widget _buildComplaintCard(BuildContext context, dynamic complaint) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: InkWell(
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => ComplaintDetailScreen(complaint: complaint))),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  StatusBadge(status: complaint.status),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: AppColors.gray50, borderRadius: BorderRadius.circular(8)),
                    child: Text(
                      DateFormat('MMM dd, yyyy').format(complaint.createdAt),
                      style: const TextStyle(color: AppColors.gray600, fontWeight: FontWeight.w800, fontSize: 11),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                complaint.subject,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primary900, fontFamily: 'Plus Jakarta Sans'),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
              Text(
                complaint.details,
                style: const TextStyle(color: AppColors.gray600, fontSize: 13, height: 1.5),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 12),
                child: Divider(color: AppColors.gray100, thickness: 1.5),
              ),
              Row(
                children: [
                  const Icon(Icons.category_rounded, size: 16, color: AppColors.primary400),
                  const SizedBox(width: 6),
                  Text(
                    complaint.categoryName ?? 'General',
                    style: const TextStyle(color: AppColors.primary700, fontSize: 12, fontWeight: FontWeight.w700),
                  ),
                  const Spacer(),
                  const Text(
                    'View Details',
                    style: TextStyle(color: AppColors.primary600, fontWeight: FontWeight.w800, fontSize: 12, letterSpacing: 0.5),
                  ),
                  const SizedBox(width: 4),
                  const Icon(Icons.arrow_forward_rounded, size: 16, color: AppColors.primary600),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
