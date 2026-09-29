import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/localization/app_translations.dart';
import '../blocs/language/language_cubit.dart';
import '../blocs/issue/issue_bloc.dart';
import '../blocs/issue/issue_event.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';

class CreateIssuePage extends StatefulWidget {
  final String projectId;

  const CreateIssuePage({super.key, required this.projectId});

  @override
  State<CreateIssuePage> createState() => _CreateIssuePageState();
}

class _CreateIssuePageState extends State<CreateIssuePage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _storyPointsController = TextEditingController();

  String _selectedType = 'Task';
  String _selectedPriority = 'Medium';
  final List<String> _types = ['Task', 'Bug', 'Story', 'Epic'];
  final List<String> _priorities = ['Low', 'Medium', 'High', 'Urgent'];

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _storyPointsController.dispose();
    super.dispose();
  }

  String _getTypeLabel(String type, String locale) {
    switch (type) {
      case 'Task':
        return AppTranslations.get('type_task', locale: locale);
      case 'Bug':
        return AppTranslations.get('type_bug', locale: locale);
      case 'Story':
        return AppTranslations.get('type_story', locale: locale);
      case 'Epic':
        return AppTranslations.get('type_epic', locale: locale);
      default:
        return type;
    }
  }

  String _getPriorityLabel(String priority, String locale) {
    switch (priority) {
      case 'Low':
        return AppTranslations.get('priority_low', locale: locale);
      case 'Medium':
        return AppTranslations.get('priority_medium', locale: locale);
      case 'High':
        return AppTranslations.get('priority_high', locale: locale);
      case 'Urgent':
      case 'Critical':
        return AppTranslations.get('priority_urgent', locale: locale);
      default:
        return priority;
    }
  }

  void _onCreatePressed(String locale) {
    if (_formKey.currentState?.validate() ?? false) {
      final points = int.tryParse(_storyPointsController.text.trim());
      context.read<IssueBloc>().add(
            CreateIssueSubmittedEvent(
              title: _titleController.text.trim(),
              description: _descController.text.trim(),
              type: _selectedType,
              priority: _selectedPriority,
              projectId: widget.projectId,
              storyPoints: points,
            ),
          );
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(AppTranslations.get('task_created_success', locale: locale)),
          duration: const Duration(seconds: 2),
        ),
      );
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final langState = context.watch<LanguageCubit>().state;
    final locale = langState.locale;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          AppTranslations.get('create_task_title', locale: locale),
          style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.textPrimary),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              CustomTextField(
                controller: _titleController,
                label: AppTranslations.get('task_title', locale: locale),
                hintText: locale == 'tr' ? 'örn: Mobil uygulama giriş akışı optimizasyonu' : 'e.g. Implement login flow',
                validator: (val) => (val == null || val.isEmpty) ? (locale == 'tr' ? 'Başlık zorunludur' : 'Title is required') : null,
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          AppTranslations.get('task_type', locale: locale),
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          initialValue: _selectedType,
                          decoration: InputDecoration(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          items: _types
                              .map((t) => DropdownMenuItem(value: t, child: Text(_getTypeLabel(t, locale), style: const TextStyle(fontSize: 12))))
                              .toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedType = val);
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          AppTranslations.get('task_priority', locale: locale),
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          initialValue: _selectedPriority,
                          decoration: InputDecoration(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          items: _priorities
                              .map((p) => DropdownMenuItem(value: p, child: Text(_getPriorityLabel(p, locale), style: const TextStyle(fontSize: 12))))
                              .toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedPriority = val);
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: _storyPointsController,
                label: AppTranslations.get('task_story_points', locale: locale),
                hintText: 'örn: 3, 5, 8...',
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: _descController,
                label: AppTranslations.get('task_description', locale: locale),
                hintText: locale == 'tr' ? 'Görev detayları, kabul kriterleri...' : 'Detailed requirements, acceptance criteria...',
                maxLines: 4,
              ),
              const SizedBox(height: 28),
              CustomButton(
                text: AppTranslations.get('create', locale: locale),
                onPressed: () => _onCreatePressed(locale),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
