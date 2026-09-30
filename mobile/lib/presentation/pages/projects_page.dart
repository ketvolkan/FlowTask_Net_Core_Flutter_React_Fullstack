import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/localization/app_translations.dart';
import '../blocs/issue/issue_bloc.dart';
import '../blocs/issue/issue_event.dart';
import '../blocs/language/language_cubit.dart';
import '../blocs/project/project_bloc.dart';
import '../blocs/project/project_event.dart';
import '../blocs/project/project_state.dart';
import '../widgets/custom_button.dart';
import '../widgets/empty_state_widget.dart';
import 'projects/widgets/create_project_modal.dart';
import 'projects/widgets/project_card_item.dart';

class ProjectsPage extends StatelessWidget {
  const ProjectsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final locale = context.watch<LanguageCubit>().state.locale;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          AppTranslations.get('projects_title', locale: locale),
          style: const TextStyle(
            fontSize: 19,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
            letterSpacing: -0.3,
          ),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: AppDimensions.spacing12),
            child: TextButton.icon(
              onPressed: () => CreateProjectModal.show(context, locale),
              icon: const Icon(Icons.add_rounded, size: AppDimensions.iconRegular),
              label: Text(
                locale == 'tr' ? 'Yeni' : 'New',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
              ),
              style: TextButton.styleFrom(
                foregroundColor: AppColors.primary,
                backgroundColor: AppColors.primaryLight,
                padding: const EdgeInsets.symmetric(
                  horizontal: AppDimensions.spacing12,
                  vertical: AppDimensions.spacing6,
                ),
                shape: RoundedRectangleBorder(borderRadius: AppDimensions.borderRadius10),
              ),
            ),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: AppColors.divider, height: 1),
        ),
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
                  onPressed: () => CreateProjectModal.show(context, locale),
                ),
              );
            }

            return RefreshIndicator(
              color: AppColors.primary,
              onRefresh: () async {
                context.read<ProjectBloc>().add(LoadProjectsEvent());
              },
              child: ListView.builder(
                padding: EdgeInsets.symmetric(
                  horizontal: context.responsiveHorizontalPadding,
                  vertical: AppDimensions.spacing16,
                ),
                itemCount: state.projects.length,
                itemBuilder: (context, index) {
                  final project = state.projects[index];
                  final isSelected = state.selectedProject?.id == project.id;

                  return ProjectCardItem(
                    project: project,
                    isSelected: isSelected,
                    locale: locale,
                    onTap: () {
                      context.read<ProjectBloc>().add(
                            SelectProjectEvent(projectId: project.id),
                          );
                      context.read<IssueBloc>().add(
                            LoadIssuesByProjectEvent(projectId: project.id),
                          );
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            locale == 'tr'
                                ? '${project.name} (${project.key}) aktif proje olarak seçildi.'
                                : '${project.name} (${project.key}) selected as active project.',
                          ),
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(borderRadius: AppDimensions.borderRadius10),
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    },
                  );
                },
              ),
            );
          }

          if (state is ProjectError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(AppDimensions.spacing24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.error_outline_rounded,
                      color: AppColors.danger,
                      size: AppDimensions.iconHero,
                    ),
                    const SizedBox(height: AppDimensions.spacing12),
                    Text(
                      state.message,
                      style: const TextStyle(color: AppColors.textSecondary),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AppDimensions.spacing16),
                    ElevatedButton.icon(
                      icon: const Icon(Icons.refresh_rounded, size: AppDimensions.iconMedium),
                      label: Text(AppTranslations.get('refresh', locale: locale)),
                      onPressed: () => context.read<ProjectBloc>().add(LoadProjectsEvent()),
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
