import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../../providers/complaint_provider.dart';
import '../../models/auth_response_model.dart';
import '../../widgets/loading_overlay.dart';
import '../../constants/app_colors.dart';

class SubmitComplaintScreen extends StatefulWidget {
  const SubmitComplaintScreen({super.key});

  @override
  State<SubmitComplaintScreen> createState() => _SubmitComplaintScreenState();
}

class _SubmitComplaintScreenState extends State<SubmitComplaintScreen> {
  final _subjectController = TextEditingController();
  final _detailsController = TextEditingController();
  ComplaintCategory? _selectedCategory;
  XFile? _selectedImage;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    context.read<ComplaintProvider>().fetchCategories();
  }

  @override
  void dispose() {
    _subjectController.dispose();
    _detailsController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      setState(() => _selectedImage = image);
    }
  }

  void _handleSubmit() async {
    if (_selectedCategory == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a category')));
      return;
    }
    if (_subjectController.text.isEmpty || _detailsController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill in all fields')));
      return;
    }

    final result = await context.read<ComplaintProvider>().submitComplaint(
      categoryId: _selectedCategory!.id,
      subject: _subjectController.text,
      details: _detailsController.text,
      attachmentPath: _selectedImage?.path,
    );

    if (mounted) {
      if (result['success']) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Complaint submitted successfully!'), backgroundColor: AppColors.success),
        );
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['message'] ?? 'Failed to submit'), backgroundColor: AppColors.danger),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ComplaintProvider>(
      builder: (context, provider, _) {
        return LoadingOverlay(
          isLoading: provider.isSubmitting,
          message: 'SUBMITTING REPORT...',
          child: Scaffold(
            backgroundColor: AppColors.gray50,
            appBar: AppBar(
              title: const Text('SUBMIT COMPLAINT'),
            ),
            body: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('REPORT INCIDENT', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.gray500, letterSpacing: 1.2, fontFamily: 'Plus Jakarta Sans')),
                  const SizedBox(height: 16),
                  
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.gray200, width: 1),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _inputLabel('COMPLAINT CATEGORY'),
                        DropdownButtonFormField<ComplaintCategory>(
                          decoration: const InputDecoration(
                            hintText: 'Select category',
                            prefixIcon: Icon(Icons.category_outlined, size: 20),
                          ),
                          items: provider.categories.map((cat) => DropdownMenuItem(value: cat, child: Text(cat.name))).toList(),
                          onChanged: (val) => setState(() => _selectedCategory = val),
                          value: _selectedCategory,
                        ),
                        const SizedBox(height: 20),

                        _inputLabel('SUBJECT / TITLE'),
                        TextField(
                          controller: _subjectController,
                          decoration: const InputDecoration(
                            hintText: 'e.g. Noise complaint, Street light out',
                            prefixIcon: Icon(Icons.title_rounded, size: 20),
                          ),
                        ),
                        const SizedBox(height: 20),

                        _inputLabel('INCIDENT DETAILS'),
                        TextField(
                          controller: _detailsController,
                          maxLines: 5,
                          decoration: const InputDecoration(
                            hintText: 'Describe what happened, where, and when...',
                            alignLabelWithHint: true,
                          ),
                        ),
                        const SizedBox(height: 20),

                        _inputLabel('ATTACH PROOF / PHOTO (OPTIONAL)'),
                        const SizedBox(height: 8),
                        if (_selectedImage != null)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.primary50,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: AppColors.primary200),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.image_outlined, size: 20, color: AppColors.primary700),
                                  const SizedBox(width: 8),
                                  Expanded(child: Text(_selectedImage!.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary800), maxLines: 1, overflow: TextOverflow.ellipsis)),
                                  IconButton(
                                    icon: const Icon(Icons.close_rounded, size: 18, color: AppColors.danger),
                                    onPressed: () => setState(() => _selectedImage = null),
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        OutlinedButton.icon(
                          onPressed: _pickImage,
                          icon: const Icon(Icons.add_a_photo_outlined, size: 18),
                          label: const Text('SELECT INCIDENT PHOTO'),
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size(double.infinity, 48),
                            side: const BorderSide(color: AppColors.primary500),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, letterSpacing: 0.5),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  
                  ElevatedButton(
                    onPressed: provider.isSubmitting ? null : _handleSubmit,
                    child: const Text('SUBMIT OFFICIAL REPORT'),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _inputLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(text, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.gray700, letterSpacing: 1)),
    );
  }
}
