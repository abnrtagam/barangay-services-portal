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
      backgroundColor: AppColors.white,
      appBar: AppBar(title: const Text('CREATE ACCOUNT')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Personal Information', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.primary900, fontFamily: 'Plus Jakarta Sans')),
            const SizedBox(height: 4),
            const Text('Please provide your real information for verification.', style: TextStyle(fontSize: 13, color: AppColors.gray500, fontFamily: 'DM Sans')),
            const SizedBox(height: 24),

            _inputLabel('FIRST NAME'),
            TextField(controller: _firstNameController, decoration: const InputDecoration(hintText: 'e.g. Juan')),
            const SizedBox(height: 16),

            _inputLabel('LAST NAME'),
            TextField(controller: _lastNameController, decoration: const InputDecoration(hintText: 'e.g. Dela Cruz')),
            const SizedBox(height: 16),

            _inputLabel('EMAIL ADDRESS'),
            TextField(controller: _emailController, decoration: const InputDecoration(hintText: 'e.g. juan@example.com'), keyboardType: TextInputType.emailAddress),
            const SizedBox(height: 16),

            _inputLabel('PHONE NUMBER'),
            TextField(controller: _phoneController, decoration: const InputDecoration(hintText: 'e.g. 09123456789'), keyboardType: TextInputType.phone),
            const SizedBox(height: 16),

            _inputLabel('HOME ADDRESS'),
            TextField(controller: _addressController, decoration: const InputDecoration(hintText: 'e.g. Phase 1, Blk 2, Lot 3')),
            const SizedBox(height: 16),

            _inputLabel('ACCOUNT PASSWORD'),
            TextField(controller: _passwordController, obscureText: true, decoration: const InputDecoration(hintText: 'At least 5 characters')),
            const SizedBox(height: 24),

            const Text('Proof of Residency', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.primary900, fontFamily: 'Plus Jakarta Sans')),
            const SizedBox(height: 4),
            const Text('Upload Valid ID or Brgy. Certificate (Max 3)', style: TextStyle(fontSize: 13, color: AppColors.gray500, fontFamily: 'DM Sans')),
            const SizedBox(height: 12),
            
            OutlinedButton.icon(
              onPressed: _pickDocuments,
              icon: const Icon(Icons.upload_file_rounded),
              label: const Text('Select Images'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12),
                side: const BorderSide(color: AppColors.primary500),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            if (_selectedDocuments.isNotEmpty) ...[
              const SizedBox(height: 12),
              Column(
                children: _selectedDocuments.map((doc) => Padding(
                  padding: const EdgeInsets.only(bottom: 8.0),
                  child: Row(
                    children: [
                      const Icon(Icons.image_outlined, size: 20, color: AppColors.gray500),
                      const SizedBox(width: 8),
                      Expanded(child: Text(doc.name, style: const TextStyle(fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis)),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 20, color: AppColors.danger),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: () {
                          setState(() {
                            _selectedDocuments.remove(doc);
                          });
                        },
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
                  child: auth.isLoading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('CREATE RESIDENT ACCOUNT'),
                );
              },
            ),
            const SizedBox(height: 24),
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
