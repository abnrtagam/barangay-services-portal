import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../constants/app_colors.dart';
import 'package:image_picker/image_picker.dart';
import 'otp_verification_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _passwordController = TextEditingController();
  final List<XFile> _selectedDocuments = [];
  final ImagePicker _picker = ImagePicker();

  Future<void> _pickDocuments() async {
    try {
      final List<XFile> pickedFiles = await _picker.pickMultiImage();
      if (pickedFiles.isNotEmpty) {
        setState(() {
          _selectedDocuments.addAll(pickedFiles);
          // Backend expects max 3 documents
          if (_selectedDocuments.length > 3) {
            _selectedDocuments.removeRange(3, _selectedDocuments.length);
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Maximum of 3 documents allowed')));
          }
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error picking images: $e')));
    }
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleRegister() async {
    if (_firstNameController.text.isEmpty || _lastNameController.text.isEmpty || _emailController.text.isEmpty || _phoneController.text.isEmpty || _addressController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill in all fields')));
      return;
    }

    final result = await context.read<AuthProvider>().register(
      firstName: _firstNameController.text,
      lastName: _lastNameController.text,
      email: _emailController.text,
      phone: _phoneController.text,
      address: _addressController.text,
      password: _passwordController.text,
      documentPaths: _selectedDocuments.map((f) => f.path).toList(),
    );

    if (mounted) {
      if (result['success']) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result['message']), backgroundColor: AppColors.success));
        if (result['requiresOtp'] == true) {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => OtpVerificationScreen(email: _emailController.text)));
        } else {
          Navigator.pop(context);
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result['message'] ?? 'Registration failed'), backgroundColor: AppColors.danger));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.gray50,
      appBar: AppBar(title: const Text('CREATE ACCOUNT')),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Dynamic Header Banner
            Container(
              padding: const EdgeInsets.fromLTRB(24, 32, 24, 48),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.primary900, AppColors.primary700],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Join the Community',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppColors.white, fontFamily: 'Plus Jakarta Sans'),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Create your account to access barangay services online. Exclusively for residents of Barangay Bulua.',
                    style: TextStyle(fontSize: 14, color: AppColors.primary100, fontFamily: 'DM Sans', height: 1.5),
                  ),
                ],
              ),
            ),

            // Overlapping Form Card
            Transform.translate(
              offset: const Offset(0, -24),
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 20),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 24, offset: const Offset(0, 8))
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _sectionHeader('PERSONAL INFORMATION'),
                    const SizedBox(height: 16),

                    _inputLabel('FIRST NAME'),
                    _textField(
                      controller: _firstNameController,
                      hint: 'e.g. Juan',
                      icon: Icons.person_outline_rounded,
                    ),
                    const SizedBox(height: 20),

                    _inputLabel('LAST NAME'),
                    _textField(
                      controller: _lastNameController,
                      hint: 'e.g. Dela Cruz',
                      icon: Icons.person_outline_rounded,
                    ),
                    const SizedBox(height: 20),

                    _inputLabel('EMAIL ADDRESS'),
                    _textField(
                      controller: _emailController,
                      hint: 'e.g. juan@example.com',
                      icon: Icons.alternate_email_rounded,
                      type: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 20),

                    _inputLabel('PHONE NUMBER'),
                    _textField(
                      controller: _phoneController,
                      hint: 'e.g. 09123456789',
                      icon: Icons.phone_android_rounded,
                      type: TextInputType.phone,
                    ),
                    const SizedBox(height: 20),

                    _inputLabel('HOME ADDRESS'),
                    _textField(
                      controller: _addressController,
                      hint: 'e.g. Phase 1, Blk 2, Lot 3',
                      icon: Icons.location_on_outlined,
                    ),
                    const SizedBox(height: 20),

                    _inputLabel('ACCOUNT PASSWORD'),
                    _textField(
                      controller: _passwordController,
                      hint: 'At least 5 characters',
                      icon: Icons.lock_outline_rounded,
                      isPassword: true,
                    ),
                    const SizedBox(height: 32),

                    _sectionHeader('PROOF OF RESIDENCY'),
                    const SizedBox(height: 8),
                    const Text('Upload Valid ID or Brgy. Certificate (Max 3)', style: TextStyle(fontSize: 12, color: AppColors.gray500, fontFamily: 'DM Sans')),
                    const SizedBox(height: 16),
                    
                    OutlinedButton.icon(
                      onPressed: _pickDocuments,
                      icon: const Icon(Icons.add_photo_alternate_outlined, size: 20),
                      label: const Text('SELECT IMAGES'),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 52),
                        side: const BorderSide(color: AppColors.primary400, width: 1.5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        foregroundColor: AppColors.primary700,
                        textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, letterSpacing: 0.5),
                      ),
                    ),
                    if (_selectedDocuments.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      Column(
                        children: _selectedDocuments.map((doc) => Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          decoration: BoxDecoration(
                            color: AppColors.primary50,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.primary100),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.image_outlined, size: 18, color: AppColors.primary700),
                              const SizedBox(width: 10),
                              Expanded(child: Text(doc.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary800), maxLines: 1, overflow: TextOverflow.ellipsis)),
                              IconButton(
                                icon: const Icon(Icons.close_rounded, size: 18, color: AppColors.danger),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                                onPressed: () => setState(() => _selectedDocuments.remove(doc)),
                              ),
                            ],
                          ),
                        )).toList(),
                      ),
                    ],
                    const SizedBox(height: 32),

                    Consumer<AuthProvider>(
                      builder: (context, auth, _) {
                        return ElevatedButton(
                          onPressed: auth.isLoading ? null : _handleRegister,
                          style: ElevatedButton.styleFrom(
                            minimumSize: const Size(double.infinity, 56),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            backgroundColor: AppColors.primary600,
                            foregroundColor: AppColors.white,
                            elevation: 0,
                          ),
                          child: auth.isLoading
                              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : const Text('CREATE RESIDENT ACCOUNT', style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: 1)),
                        );
                      },
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Row(
      children: [
        Container(width: 4, height: 16, decoration: BoxDecoration(color: AppColors.primary600, borderRadius: BorderRadius.circular(2))),
        const SizedBox(width: 10),
        Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.primary900, letterSpacing: 0.5)),
      ],
    );
  }

  Widget _textField({required TextEditingController controller, required String hint, required IconData icon, bool isPassword = false, TextInputType type = TextInputType.text}) {
    return TextField(
      controller: controller,
      obscureText: isPassword,
      keyboardType: type,
      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.primary900),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: AppColors.gray400, fontWeight: FontWeight.w500),
        prefixIcon: Icon(icon, size: 20, color: AppColors.primary600),
        filled: true,
        fillColor: AppColors.gray50,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
        contentPadding: const EdgeInsets.symmetric(vertical: 16),
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
