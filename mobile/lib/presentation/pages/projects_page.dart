import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../blocs/project/project_bloc.dart';
import '../blocs/project/project_event.dart';
import '../blocs/project/project_state.dart';
import '../widgets/empty_state_widget.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';

class ProjectsPage extends StatelessWidget {
  const ProjectsPage({super.key});

  void _showCreateProjectDialog(BuildContext context) {
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
                    const Text(
                      'Create New Project',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
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
                  label: 'Project Name',
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
                  label: 'Key',
                  hintText: 'e.g. MOB',
                  validator: (val) => (val == null || val.isEmpty) ? 'Key is required' : null,
                ),
                const SizedBox(height: 14),
                CustomTextField(
                  controller: descController,
                  label: 'Description',
                  hintText: 'Project overview...',
                  maxLines: 2,
                ),
                const SizedBox(height: 20),
                CustomButton(
                  text: 'Create Project',
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
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Projects'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showCreateProjectDialog(context),
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
                title: 'No projects found',
                description: 'Get started by creating your first project workspace.',
                action: CustomButton(
                  text: 'Create Project',
                  onPressed: () => _showCreateProjectDialog(context),
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
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(
                        color: isSelected ? AppColors.primary : AppColors.divider,
                        width: isSelected ? 1.5 : 1,
                      ),
                    ),
                    child: InkWell(
                      onTap: () {
                        context.read<ProjectBloc>().add(
                              SelectProjectEvent(projectId: project.id),
                            );
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryLight,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    project.key,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ),
                                if (isSelected)
                                  const Icon(Icons.check_circle, size: 18, color: AppColors.primary),
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
                                const Icon(Icons.people_outline, size: 14, color: AppColors.textMuted),
                                const SizedBox(width: 4),
                                Text(
                                  '${project.memberCount} members',
                                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                ),
                                const SizedBox(width: 16),
                                const Icon(Icons.assignment_outlined, size: 14, color: AppColors.textMuted),
                                const SizedBox(width: 4),
                                Text(
                                  '${project.issueCount} issues',
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

          return const SizedBox.shrink();
        },
      ),
    );
  }
}
