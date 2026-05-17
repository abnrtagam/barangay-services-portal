import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../constants/app_colors.dart';
import 'register_screen.dart';
import 'otp_verification_screen.dart';
import 'reactivation_request_screen.dart';
import 'forgot_password_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _showPassword = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin(BuildContext context) async {
    context.read<AuthProvider>().clearError();

    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')),
      );
      return;
    }

    final result = await context.read<AuthProvider>().login(
          _emailController.text,
          _passwordController.text,
        );

    if (mounted) {
      if (result['success']) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Login successful!'),
            backgroundColor: AppColors.success,
          ),
        );
      } else {
        final status = result['status'];
        final requiresOtp = result['requiresOtp'];

        if (status == 'suspended') {
          Navigator.push(
            context, 
            MaterialPageRoute(builder: (context) => ReactivationRequestScreen(email: _emailController.text))
          );
        } else if (requiresOtp == true) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => OtpVerificationScreen(email: _emailController.text))
          );
        } else {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('LOGIN FAILED'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(result['message'] ?? 'Unknown error occurred'),
                  const SizedBox(height: 16),
                  const Text('Diagnostic Info:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  Text('Status: ${result['status']}', style: const TextStyle(fontSize: 12)),
                  Text('Success: ${result['success']}', style: const TextStyle(fontSize: 12)),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('OK'),
                ),
              ],
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.primary900, AppColors.primary700],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
              child: Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 24, offset: const Offset(0, 12))
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Identity Header
                    Center(
                      child: Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          color: Colors.transparent,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 10, offset: const Offset(0, 4))
                          ],
                        ),
                        child: ClipOval(
                          child: Image.asset(
                            'assets/images/logo.png',
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => const Icon(Icons.account_balance_rounded, color: AppColors.primary800, size: 48),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'BARANGAY BULUA',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: AppColors.primary900,
                        fontFamily: 'Plus Jakarta Sans',
                        letterSpacing: -0.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Online Appointment &\nComplaint System',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.gray500,
                        fontFamily: 'DM Sans',
                        height: 1.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 40),

                    // Form Section
                    const Text(
                      'EMAIL ADDRESS',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.gray700, letterSpacing: 1),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _emailController,
                      decoration: InputDecoration(
                        hintText: 'e.g. resident@example.com',
                        prefixIcon: const Icon(Icons.mail_outline_rounded, size: 20, color: AppColors.primary600),
                        filled: true,
                        fillColor: AppColors.gray50,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                        contentPadding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 20),

                    const Text(
                      'PASSWORD',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.gray700, letterSpacing: 1),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _passwordController,
                      obscureText: !_showPassword,
                      decoration: InputDecoration(
                        hintText: 'Enter your password',
                        prefixIcon: const Icon(Icons.lock_outline_rounded, size: 20, color: AppColors.primary600),
                        suffixIcon: IconButton(
                          icon: Icon(_showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 20, color: AppColors.gray500),
                          onPressed: () => setState(() => _showPassword = !_showPassword),
                        ),
                        filled: true,
                        fillColor: AppColors.gray50,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                        contentPadding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => const ForgotPasswordScreen()),
                          );
                        },
                        child: const Text('Forgot Password?', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.primary700)),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Action
                    Consumer<AuthProvider>(
                      builder: (context, authProvider, _) {
                        return ElevatedButton(
                          onPressed: authProvider.isLoading ? null : () => _handleLogin(context),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            backgroundColor: AppColors.primary600,
                            foregroundColor: AppColors.white,
                            elevation: 0,
                          ),
                          child: authProvider.isLoading
                              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : const Text('SIGN IN TO ACCOUNT', style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: 1)),
                        );
                      },
                    ),
                    const SizedBox(height: 24),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text("New resident?", style: TextStyle(color: AppColors.gray600, fontSize: 13)),
                        TextButton(
                          onPressed: () {
                            Navigator.push(context, MaterialPageRoute(builder: (context) => const RegisterScreen()));
                          },
                          child: const Text('Create an Account', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppColors.primary700)),
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
    );
  }
}
