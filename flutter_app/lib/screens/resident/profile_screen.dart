import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../constants/app_colors.dart';
import '../../widgets/status_badge.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;

    return Scaffold(
      backgroundColor: AppColors.gray50,
      body: CustomScrollView(
        slivers: [
          // Header with background and profile info
          SliverAppBar(
            expandedHeight: 240,
            pinned: true,
            automaticallyImplyLeading: false,
            backgroundColor: AppColors.primary900,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                color: AppColors.primary900,
                child: SafeArea(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Colors.white24,
                          shape: BoxShape.circle,
                        ),
                        child: CircleAvatar(
                          radius: 44,
                          backgroundColor: AppColors.primary100,
                          child: Text(
                            user?.firstName.isNotEmpty == true ? user!.firstName[0].toUpperCase() : '?',
                            style: const TextStyle(color: AppColors.primary700, fontSize: 32, fontWeight: FontWeight.w800, fontFamily: 'Plus Jakarta Sans'),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        user?.fullName.toUpperCase() ?? 'RESIDENT',
                        style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: 1, fontFamily: 'Plus Jakarta Sans'),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user?.email ?? '',
                        style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 14, fontFamily: 'DM Sans'),
                      ),
                      const SizedBox(height: 12),
                      StatusBadge(status: user?.status ?? 'pending'),
                    ],
                  ),
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('ACCOUNT DETAILS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.gray500, letterSpacing: 1.2)),
                  const SizedBox(height: 12),
                  
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.gray200),
                    ),
                    child: Column(
                      children: [
                        _infoRow(Icons.person_outline_rounded, 'FIRST NAME', user?.firstName ?? '--'),
                        _divider(),
                        _infoRow(Icons.person_outline_rounded, 'LAST NAME', user?.lastName ?? '--'),
                        _divider(),
                        _infoRow(Icons.phone_iphone_rounded, 'PHONE NUMBER', user?.phone ?? '--'),
                        _divider(),
                        _infoRow(Icons.home_outlined, 'HOME ADDRESS', user?.address ?? '--'),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 24),
                  const Text('SECURITY & VERIFICATION', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.gray500, letterSpacing: 1.2)),
                  const SizedBox(height: 12),
                  
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.gray200),
                    ),
                    child: Column(
                      children: [
                        _infoRow(Icons.mail_outline_rounded, 'EMAIL VERIFIED', user?.emailVerified == true ? 'YES' : 'NO'),
                        _divider(),
                        _infoRow(Icons.security_rounded, 'ACCOUNT ROLE', user?.role.toUpperCase() ?? 'RESIDENT'),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),
                  
                  OutlinedButton.icon(
                    onPressed: () => _showLogoutDialog(context),
                    icon: const Icon(Icons.logout_rounded, size: 18),
                    label: const Text('SIGN OUT OF PORTAL'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.danger,
                      side: const BorderSide(color: AppColors.danger),
                      minimumSize: const Size(double.infinity, 52),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, letterSpacing: 0.5),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.primary600),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.gray400, letterSpacing: 0.5)),
              const SizedBox(height: 4),
              Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.primary900, fontFamily: 'DM Sans')),
            ],
          ),
        ],
      ),
    );
  }

  Widget _divider() {
    return const Divider(height: 1, indent: 52, color: AppColors.gray100);
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('SIGN OUT'),
        content: const Text('Are you sure you want to end your session? You will need to log in again to access your dashboard.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              context.read<AuthProvider>().logout();
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            child: const Text('SIGN OUT'),
          ),
        ],
      ),
    );
  }
}
