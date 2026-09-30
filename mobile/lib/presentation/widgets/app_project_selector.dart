import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/localization/app_translations.dart';
import '../../domain/entities/project_entity.dart';
import '../blocs/issue/issue_bloc.dart';
import '../blocs/issue/issue_event.dart';
import '../blocs/project/project_bloc.dart';
import '../blocs/project/project_event.dart';
import '../blocs/project/project_state.dart';

class AppProjectSelector extends StatelessWidget {
  final ProjectsLoaded projState;
  final String locale;

  const AppProjectSelector({
    super.key,
    required this.projState,
    required this.locale,
  });

  void _showProjectSelectionSheet(BuildContext context) {
    HapticFeedback.selectionClick();
    final projects = projState.projects;
    final selectedProject = projState.selectedProject;
    final isAllSelected = selectedProject == null;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (sheetContext) {
        return Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(sheetContext).size.height * 0.7,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(AppDimensions.radius24)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Drag Handle
              Container(
                margin: const EdgeInsets.only(top: AppDimensions.spacing12, bottom: AppDimensions.spacing8),
                width: AppDimensions.dragHandleWidth,
                height: AppDimensions.dragHandleHeight,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(AppDimensions.radiusRound),
                ),
              ),

              // Title Row
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppDimensions.spacing20,
                  vertical: AppDimensions.spacing10,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      locale == 'tr' ? 'Proje Seçin' : 'Select Project',
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                        letterSpacing: -0.3,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, size: 20, color: AppColors.textSecondary),
                      onPressed: () => Navigator.of(sheetContext).pop(),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: AppColors.divider),

              // Projects List
              Flexible(
                child: ListView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppDimensions.spacing16,
                    vertical: AppDimensions.spacing12,
                  ),
                  shrinkWrap: true,
                  children: [
                    // "All Projects" Option
                    _buildOptionItem(
                      sheetContext: sheetContext,
                      context: context,
                      isSelected: isAllSelected,
                      title: AppTranslations.get('all_projects', locale: locale),
                      icon: Icons.grid_view_rounded,
                      badgeText: '${projects.length} ${locale == 'tr' ? 'Proje' : 'Projects'}',
                      onTap: () {
                        context.read<ProjectBloc>().add(const SelectProjectEvent(projectId: 'all'));
                        context.read<IssueBloc>().add(const LoadIssuesByProjectEvent(projectId: 'all'));
                        Navigator.of(sheetContext).pop();
                      },
                    ),
                    const SizedBox(height: AppDimensions.spacing8),
                    const Divider(height: 1, color: AppColors.divider),
                    const SizedBox(height: AppDimensions.spacing8),

                    // Individual Project Options
                    ...projects.map((p) {
                      final isSelected = selectedProject?.id == p.id;
                      return _buildProjectItem(
                        sheetContext: sheetContext,
                        context: context,
                        project: p,
                        isSelected: isSelected,
                        onTap: () {
                          context.read<ProjectBloc>().add(SelectProjectEvent(projectId: p.id));
                          context.read<IssueBloc>().add(LoadIssuesByProjectEvent(projectId: p.id));
                          Navigator.of(sheetContext).pop();
                        },
                      );
                    }),
                  ],
                ),
              ),
              SizedBox(height: MediaQuery.of(sheetContext).padding.bottom + AppDimensions.spacing12),
            ],
          ),
        );
      },
    );
  }

  Widget _buildOptionItem({
    required BuildContext sheetContext,
    required BuildContext context,
    required bool isSelected,
    required String title,
    required IconData icon,
    required String badgeText,
    required VoidCallback onTap,
  }) {
    return Material(
      color: isSelected ? AppColors.primaryLight : Colors.transparent,
      borderRadius: BorderRadius.circular(AppDimensions.radius12),
      child: InkWell(
        onTap: () {
          HapticFeedback.selectionClick();
          onTap();
        },
        borderRadius: BorderRadius.circular(AppDimensions.radius12),
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppDimensions.spacing14,
            vertical: AppDimensions.spacing12,
          ),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppDimensions.radius12),
            border: Border.all(
              color: isSelected ? AppColors.primary.withValues(alpha: 0.4) : AppColors.divider,
              width: isSelected ? AppDimensions.borderWidthActive : AppDimensions.borderWidthRegular,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary : AppColors.surface,
                  borderRadius: BorderRadius.circular(AppDimensions.radius10),
                ),
                child: Icon(
                  icon,
                  size: AppDimensions.iconDefault,
                  color: isSelected ? Colors.white : AppColors.textSecondary,
                ),
              ),
              const SizedBox(width: AppDimensions.spacing12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                        color: isSelected ? AppColors.primary : AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      badgeText,
                      style: TextStyle(
                        fontSize: 11,
                        color: isSelected ? AppColors.primary.withValues(alpha: 0.8) : AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              if (isSelected)
                const Icon(
                  Icons.check_circle_rounded,
                  color: AppColors.primary,
                  size: AppDimensions.iconLarge,
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProjectItem({
    required BuildContext sheetContext,
    required BuildContext context,
    required ProjectEntity project,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppDimensions.spacing8),
      child: Material(
        color: isSelected ? AppColors.primaryLight : Colors.transparent,
        borderRadius: BorderRadius.circular(AppDimensions.radius12),
        child: InkWell(
          onTap: () {
            HapticFeedback.selectionClick();
            onTap();
          },
          borderRadius: BorderRadius.circular(AppDimensions.radius12),
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppDimensions.spacing14,
              vertical: AppDimensions.spacing12,
            ),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppDimensions.radius12),
              border: Border.all(
                color: isSelected ? AppColors.primary.withValues(alpha: 0.4) : AppColors.divider,
                width: isSelected ? AppDimensions.borderWidthActive : AppDimensions.borderWidthRegular,
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppDimensions.spacing8,
                    vertical: AppDimensions.spacing6,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : AppColors.surface,
                    borderRadius: BorderRadius.circular(AppDimensions.radius8),
                    border: Border.all(
                      color: isSelected ? AppColors.primary : AppColors.border,
                      width: AppDimensions.borderWidthThin,
                    ),
                  ),
                  child: Text(
                    project.key,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: isSelected ? Colors.white : AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(width: AppDimensions.spacing12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        project.name,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                          color: isSelected ? AppColors.primary : AppColors.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (project.description != null && project.description!.isNotEmpty)
                        Text(
                          project.description!,
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.textSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                    ],
                  ),
                ),
                if (isSelected)
                  const Icon(
                    Icons.check_circle_rounded,
                    color: AppColors.primary,
                    size: AppDimensions.iconLarge,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final selectedProject = projState.selectedProject;
    final isAll = selectedProject == null;
    final displayText = isAll
        ? AppTranslations.get('all_projects', locale: locale)
        : '${selectedProject.key} – ${selectedProject.name}';

    return Container(
      color: AppColors.primary,
      padding: const EdgeInsets.fromLTRB(
        AppDimensions.spacing16,
        0,
        AppDimensions.spacing16,
        AppDimensions.spacing16,
      ),
      child: Material(
        color: Colors.white.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(AppDimensions.radius12),
        child: InkWell(
          onTap: () => _showProjectSelectionSheet(context),
          borderRadius: BorderRadius.circular(AppDimensions.radius12),
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppDimensions.spacing14,
              vertical: AppDimensions.spacing10,
            ),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppDimensions.radius12),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.3),
                width: AppDimensions.borderWidthThin,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  isAll ? Icons.grid_view_rounded : Icons.folder_open_rounded,
                  size: AppDimensions.iconRegular,
                  color: Colors.white,
                ),
                const SizedBox(width: AppDimensions.spacing10),
                Expanded(
                  child: Text(
                    displayText,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      letterSpacing: -0.1,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: AppDimensions.spacing6),
                Container(
                  padding: const EdgeInsets.all(AppDimensions.spacing2),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(AppDimensions.radius6),
                  ),
                  child: const Icon(
                    Icons.keyboard_arrow_down_rounded,
                    size: AppDimensions.iconSmall,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
