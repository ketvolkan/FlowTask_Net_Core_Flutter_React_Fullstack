import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../blocs/project/project_bloc.dart';
import '../../../blocs/project/project_event.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/custom_text_field.dart';

class CreateProjectModal extends StatefulWidget {
  final String locale;

  const CreateProjectModal({super.key, required this.locale});

  static void show(BuildContext context, String locale) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppDimensions.radius20)),
      ),
      builder: (sheetContext) => CreateProjectModal(locale: locale),
    );
  }

  @override
  State<CreateProjectModal> createState() => _CreateProjectModalState();
}

class _CreateProjectModalState extends State<CreateProjectModal> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _keyController = TextEditingController();
  final _descController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _keyController.dispose();
    _descController.dispose();
    super.dispose();
  }

  void _onCreate() {
    if (_formKey.currentState?.validate() ?? false) {
      context.read<ProjectBloc>().add(
            CreateProjectSubmittedEvent(
              name: _nameController.text.trim(),
              key: _keyController.text.trim().toUpperCase(),
              description: _descController.text.trim(),
            ),
          );
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: AppDimensions.spacing20,
        right: AppDimensions.spacing20,
        top: AppDimensions.spacing20,
        bottom: context.screenViewInsets.bottom + AppDimensions.spacing20,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  AppTranslations.get('create_project_title', locale: widget.locale),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, size: AppDimensions.iconDefault),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: AppDimensions.spacing16),
            CustomTextField(
              controller: _nameController,
              label: AppTranslations.get('project_name', locale: widget.locale),
              hintText: 'e.g. Mobile App Redesign',
              validator: (val) => (val == null || val.isEmpty) ? 'Name is required' : null,
              onChanged: (val) {
                if (_keyController.text.isEmpty && val.isNotEmpty) {
                  _keyController.text = val
                      .replaceAll(RegExp(r'[^a-zA-Z]'), '')
                      .toUpperCase()
                      .padRight(3, 'X')
                      .substring(0, 3);
                }
              },
            ),
            const SizedBox(height: AppDimensions.spacing14),
            CustomTextField(
              controller: _keyController,
              label: AppTranslations.get('project_key', locale: widget.locale),
              hintText: 'e.g. MOB',
              validator: (val) => (val == null || val.isEmpty) ? 'Key is required' : null,
            ),
            const SizedBox(height: AppDimensions.spacing14),
            CustomTextField(
              controller: _descController,
              label: AppTranslations.get('project_desc', locale: widget.locale),
              hintText: 'Project overview...',
              maxLines: 2,
            ),
            const SizedBox(height: AppDimensions.spacing20),
            CustomButton(
              text: AppTranslations.get('create', locale: widget.locale),
              onPressed: _onCreate,
            ),
          ],
        ),
      ),
    );
  }
}
