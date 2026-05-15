import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../constants/app_colors.dart';

class ReactivationRequestScreen extends StatefulWidget {
  final String email;
  const ReactivationRequestScreen({super.key, required this.email});

  @override
  State<ReactivationRequestScreen> createState() => _ReactivationRequestScreenState();
}

class _ReactivationRequestScreenState extends State<ReactivationRequestScreen> {
  final _reasonController = TextEditingController();

  void _handleSubmit() async {
    if (_reasonController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please provide a reason for reactivation')));
      return;
    }

    final result = await context.read<AuthProvider>().requestReactivation(
      email: widget.email,
      reason: _reasonController.text,
    );

    if (mounted) {
      if (result['success']) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            title: const Text('REQUEST SUBMITTED'),
            content: Text(result['message']),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context); // Close dialog
                  Navigator.pop(context); // Back to login
                },
                child: const Text('BACK TO LOGIN'),
              ),
            ],
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result['message'] ?? 'Failed to submit request'), backgroundColor: AppColors.danger));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(title: const Text('APPEAL SUSPENSION')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.gavel_rounded, size: 64, color: AppColors.danger),
            const SizedBox(height: 24),
            const Text(
              'Account Reactivation',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.primary900, fontFamily: 'Plus Jakarta Sans'),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'Your account has been suspended by the administrator. If you believe this is a mistake, please provide your appeal below.',
              style: TextStyle(fontSize: 14, color: AppColors.gray500, fontFamily: 'DM Sans', height: 1.5),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),

            _inputLabel('APPEAL REASON'),
            TextField(
              controller: _reasonController,
              maxLines: 6,
              decoration: const InputDecoration(
                hintText: 'Explain why your account should be reactivated...',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 32),

            Consumer<AuthProvider>(
              builder: (context, auth, _) {
                return ElevatedButton(
                  onPressed: auth.isLoading ? null : _handleSubmit,
                  child: auth.isLoading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('SUBMIT REACTIVATION REQUEST'),
                );
              },
            ),
            const SizedBox(height: 24),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('CANCEL AND GO BACK', style: TextStyle(color: AppColors.gray500, fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _inputLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(text, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.gray700, letterSpacing: 1)),
    );
  }
}
