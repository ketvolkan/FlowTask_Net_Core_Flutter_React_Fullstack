import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/localization/app_translations.dart';
import '../blocs/language/language_cubit.dart';
import '../blocs/project/project_bloc.dart';
import '../blocs/project/project_event.dart';
import '../blocs/project/project_state.dart';
import '../blocs/issue/issue_bloc.dart';
import '../blocs/issue/issue_event.dart';
import '../widgets/empty_state_widget.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';

class ProjectsPage extends StatelessWidget {
  const ProjectsPage({super.key});

  void _showCreateProjectDialog(BuildContext context, String locale) {
    final nameController = TextEditingController();
    final keyController = TextEditingController();
    final descController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(sheetContext).viewInsets.bottom + 20,
          ),
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      AppTranslations.get('create_project_title', locale: locale),
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 20),
                      onPressed: () => Navigator.of(sheetContext).pop(),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: nameController,
                  label: AppTranslations.get('project_name', locale: locale),
                  hintText: 'e.g. Mobile App Redesign',
                  validator: (val) => (val == null || val.isEmpty) ? 'Name is required' : null,
                  onChanged: (val) {
                    if (keyController.text.isEmpty && val.isNotEmpty) {
                      keyController.text = val
                          .replaceAll(RegExp(r'[^a-zA-Z]'), '')
                          .toUpperCase()
                          .padRight(3, 'X')
                          .substring(0, 3);
                    }
                  },
                ),
                const SizedBox(height: 14),
                CustomTextField(
                  controller: keyController,
                  label: AppTranslations.get('project_key', locale: locale),
                  hintText: 'e.g. MOB',
                  validator: (val) => (val == null || val.isEmpty) ? 'Key is required' : null,
                ),
                const SizedBox(height: 14),
                CustomTextField(
                  controller: descController,
                  label: AppTranslations.get('project_desc', locale: locale),
                  hintText: 'Project overview...',
                  maxLines: 2,
                ),
                const SizedBox(height: 20),
                CustomButton(
                  text: AppTranslations.get('create', locale: locale),
                  onPressed: () {
                    if (formKey.currentState?.validate() ?? false) {
                      context.read<ProjectBloc>().add(
                            CreateProjectSubmittedEvent(
                              name: nameController.text.trim(),
                              key: keyController.text.trim().toUpperCase(),
                              description: descController.text.trim(),
                            ),
                          );
                      Navigator.of(sheetContext).pop();
                    }
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
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
          AppTranslations.get('projects_title', locale: locale),
          style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.textPrimary),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: AppColors.primary),
            tooltip: AppTranslations.get('new_project', locale: locale),
            onPressed: () => _showCreateProjectDialog(context, locale),
          ),
        ],
      ),
      body: BlocBuilder<ProjectBloc, ProjectState>(
        builder: (context, state) {
          if (state is ProjectLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is ProjectsLoaded) {
            if (state.projects.isEmpty) {
              return EmptyStateWidget(
                icon: Icons.folder_open_outlined,
                title: AppTranslations.get('no_projects_title', locale: locale),
                description: AppTranslations.get('no_projects_desc', locale: locale),
                action: CustomButton(
                  text: AppTranslations.get('create_project_title', locale: locale),
                  onPressed: () => _showCreateProjectDialog(context, locale),
                ),
              );
            }

            return RefreshIndicator(
              onRefresh: () async {
                context.read<ProjectBloc>().add(LoadProjectsEvent());
              },
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: state.projects.length,
                itemBuilder: (context, index) {
                  final project = state.projects[index];
                  final isSelected = state.selectedProject?.id == project.id;

                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    elevation: isSelected ? 2 : 0.5,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                      side: BorderSide(
                        color: isSelected ? AppColors.primary : AppColors.divider,
                        width: isSelected ? 1.8 : 1,
                      ),
                    ),
                    child: InkWell(
                      onTap: () {
                        context.read<ProjectBloc>().add(
                              SelectProjectEvent(projectId: project.id),
                            );
                        context.read<IssueBloc>().add(
                              LoadIssuesByProjectEvent(projectId: project.id),
                            );
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('${project.name} (${project.key}) aktif proje olarak seçildi.'),
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      },
                      borderRadius: BorderRadius.circular(14),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryLight,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    project.key,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ),
                                if (isSelected)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Colors.green.shade50,
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: Colors.green.shade200),
                                    ),
                                    child: const Row(
                                      children: [
                                        Icon(Icons.check_circle, size: 14, color: AppColors.success),
                                        SizedBox(width: 4),
                                        Text(
                                          'Aktif',
                                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.success),
                                        ),
                                      ],
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(
                              project.name,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            if (project.description != null && project.description!.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Text(
                                project.description!,
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: AppColors.textSecondary,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                const Icon(Icons.people_outline, size: 15, color: AppColors.textMuted),
                                const SizedBox(width: 4),
                                Text(
                                  '${project.memberCount} ${AppTranslations.get('project_members', locale: locale)}',
                                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                ),
                                const SizedBox(width: 16),
                                const Icon(Icons.assignment_outlined, size: 15, color: AppColors.textMuted),
                                const SizedBox(width: 4),
                                Text(
                                  '${project.issueCount} ${AppTranslations.get('project_tasks', locale: locale)}',
                                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            );
          }

          if (state is ProjectError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.error_outline, color: AppColors.danger, size: 36),
                    const SizedBox(height: 8),
                    Text(state.message, style: const TextStyle(color: AppColors.textSecondary)),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () => context.read<ProjectBloc>().add(LoadProjectsEvent()),
                      child: Text(AppTranslations.get('refresh', locale: locale)),
                    ),
                  ],
                ),
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }
}
