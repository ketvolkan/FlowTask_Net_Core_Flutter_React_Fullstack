import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/enums/issue_priority.dart';
import '../../core/enums/issue_type.dart';
import '../../core/localization/app_translations.dart';
import '../blocs/issue/issue_bloc.dart';
import '../blocs/issue/issue_event.dart';
import '../blocs/language/language_cubit.dart';
import '../blocs/project/project_bloc.dart';
import '../blocs/project/project_state.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';

class CreateIssuePage extends StatefulWidget {
  final String? projectId;

  const CreateIssuePage({super.key, this.projectId});

  @override
  State<CreateIssuePage> createState() => _CreateIssuePageState();
}

class _CreateIssuePageState extends State<CreateIssuePage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _storyPointsController = TextEditingController();

  String? _selectedProjectId;
  IssueType _selectedType = IssueType.task;
  IssuePriority _selectedPriority = IssuePriority.medium;

  @override
  void initState() {
    super.initState();
    if (widget.projectId != null &&
        widget.projectId!.isNotEmpty &&
        widget.projectId != 'all') {
      _selectedProjectId = widget.projectId;
    } else {
      final projectState = context.read<ProjectBloc>().state;
      if (projectState is ProjectsLoaded) {
        _selectedProjectId = projectState.selectedProject?.id ??
            (projectState.projects.isNotEmpty ? projectState.projects.first.id : null);
      }
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _storyPointsController.dispose();
    super.dispose();
  }

  void _onCreatePressed(String locale) {
    if (_selectedProjectId == null || _selectedProjectId!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(locale == 'tr' ? 'Lütfen bir proje seçin.' : 'Please select a project.'),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    if (_formKey.currentState?.validate() ?? false) {
      final points = int.tryParse(_storyPointsController.text.trim());
      context.read<IssueBloc>().add(
            CreateIssueSubmittedEvent(
              title: _titleController.text.trim(),
              description: _descController.text.trim(),
              type: _selectedType.toApiValue(),
              priority: _selectedPriority.toApiValue(),
              projectId: _selectedProjectId!,
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
    final locale = context.watch<LanguageCubit>().state.locale;

    // Filter out 'all' for actionable priority choice
    final selectablePriorities = [
      IssuePriority.low,
      IssuePriority.medium,
      IssuePriority.high,
      IssuePriority.urgent,
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          AppTranslations.get('create_task_title', locale: locale),
          style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Project Selector Dropdown
              BlocBuilder<ProjectBloc, ProjectState>(
                builder: (context, projectState) {
                  if (projectState is ProjectsLoaded && projectState.projects.isNotEmpty) {
                    final validSelected = projectState.projects.any((p) => p.id == _selectedProjectId)
                        ? _selectedProjectId
                        : projectState.projects.first.id;

                    if (_selectedProjectId != validSelected) {
                      _selectedProjectId = validSelected;
                    }

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          AppTranslations.get('active_project', locale: locale),
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.divider),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              key: ValueKey(_selectedProjectId),
                              value: validSelected,
                              isExpanded: true,
                              isDense: true,
                              dropdownColor: Colors.white,
                              icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textSecondary),
                              items: projectState.projects.map((p) {
                                return DropdownMenuItem<String>(
                                  value: p.id,
                                  child: Row(
                                    children: [
                                      const Icon(Icons.folder_rounded, size: 16, color: AppColors.primary),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          '${p.key} – ${p.name}',
                                          style: const TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w600,
                                            color: AppColors.textPrimary,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              }).toList(),
                              onChanged: (val) {
                                if (val != null) {
                                  setState(() => _selectedProjectId = val);
                                }
                              },
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                    );
                  }
                  return const SizedBox.shrink();
                },
              ),

              CustomTextField(
                controller: _titleController,
                label: AppTranslations.get('task_title', locale: locale),
                hintText: locale == 'tr'
                    ? 'örn: Mobil uygulama giriş akışı optimizasyonu'
                    : 'e.g. Implement login flow',
                validator: (val) =>
                    (val == null || val.isEmpty) ? (locale == 'tr' ? 'Başlık zorunludur' : 'Title is required') : null,
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
                        _buildEnumDropdown<IssueType>(
                          value: _selectedType,
                          items: IssueType.values,
                          getLabel: (t) => t.getLocalizedLabel(locale),
                          getIcon: (t) => t.icon,
                          getColor: (t) => t.color,
                          onChanged: (val) => setState(() => _selectedType = val),
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
                        _buildEnumDropdown<IssuePriority>(
                          value: _selectedPriority,
                          items: selectablePriorities,
                          getLabel: (p) => p.getLocalizedLabel(locale),
                          getIcon: (p) => p.icon,
                          getColor: (p) => p.color,
                          onChanged: (val) => setState(() => _selectedPriority = val),
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
                hintText: locale == 'tr'
                    ? 'Görev detayları, kabul kriterleri...'
                    : 'Detailed requirements, acceptance criteria...',
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

  Widget _buildEnumDropdown<T>({
    required T value,
    required List<T> items,
    required String Function(T) getLabel,
    required IconData Function(T) getIcon,
    required Color Function(T) getColor,
    required ValueChanged<T> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.divider),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<T>(
          key: ValueKey(value),
          value: items.contains(value) ? value : items.first,
          isExpanded: true,
          isDense: true,
          dropdownColor: Colors.white,
          icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textSecondary),
          items: items
              .map((item) => DropdownMenuItem<T>(
                    value: item,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(getIcon(item), size: 14, color: getColor(item)),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            getLabel(item),
                            style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ))
              .toList(),
          onChanged: (val) {
            if (val != null) onChanged(val);
          },
        ),
      ),
    );
  }
}
