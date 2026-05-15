import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import 'resident/dashboard_screen.dart';
import 'resident/complaint_history_screen.dart';
import 'resident/appointment_history_screen.dart';
import 'resident/announcements_screen.dart';
import 'resident/profile_screen.dart';

class NavigationShell extends StatefulWidget {
  const NavigationShell({super.key});

  @override
  State<NavigationShell> createState() => _NavigationShellState();
}

class _NavigationShellState extends State<NavigationShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    DashboardScreen(),
    ComplaintHistoryScreen(),
    AppointmentHistoryScreen(),
    AnnouncementsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: const Border(top: BorderSide(color: AppColors.gray200, width: 1)),
          boxShadow: [
            BoxShadow(
              color: AppColors.gray950.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: NavigationBar(
          selectedIndex: _currentIndex,
          onDestinationSelected: (index) {
            setState(() => _currentIndex = index);
          },
          backgroundColor: AppColors.white,
          surfaceTintColor: Colors.transparent,
          indicatorColor: AppColors.primary100,
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          height: 70,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined, color: AppColors.gray500),
              selectedIcon: Icon(Icons.home_rounded, color: AppColors.primary700),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.description_outlined, color: AppColors.gray500),
              selectedIcon: Icon(Icons.description_rounded, color: AppColors.primary700),
              label: 'Complaints',
            ),
            NavigationDestination(
              icon: Icon(Icons.calendar_today_outlined, color: AppColors.gray500),
              selectedIcon: Icon(Icons.calendar_today_rounded, color: AppColors.primary700),
              label: 'Schedule',
            ),
            NavigationDestination(
              icon: Icon(Icons.campaign_outlined, color: AppColors.gray500),
              selectedIcon: Icon(Icons.campaign_rounded, color: AppColors.primary700),
              label: 'News',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline_rounded, color: AppColors.gray500),
              selectedIcon: Icon(Icons.person_rounded, color: AppColors.primary700),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
