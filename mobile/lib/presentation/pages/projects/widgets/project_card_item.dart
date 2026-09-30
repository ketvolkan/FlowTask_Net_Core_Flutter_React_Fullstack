import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../../../domain/entities/project_entity.dart';

class ProjectCardItem extends StatelessWidget {
  final ProjectEntity project;
  final bool isSelected;
  final String locale;
  final VoidCallback onTap;

  const ProjectCardItem({
    super.key,
    required this.project,
    required this.isSelected,
    required this.locale,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppDimensions.spacing12),
      elevation: isSelected ? 2 : 0.5,
      shape: RoundedRectangleBorder(
        borderRadius: AppDimensions.borderRadius14,
        side: BorderSide(
          color: isSelected ? AppColors.primary : AppColors.divider,
          width: isSelected ? AppDimensions.borderWidthActive : AppDimensions.borderWidthRegular,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: AppDimensions.borderRadius14,
        child: Padding(
          padding: const EdgeInsets.all(AppDimensions.spacing16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppDimensions.spacing10,
                      vertical: AppDimensions.spacing4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius: AppDimensions.borderRadius6,
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
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppDimensions.spacing8,
                        vertical: AppDimensions.spacing2,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.successLight,
                        borderRadius: AppDimensions.borderRadius12,
                        border: Border.all(
                          color: AppColors.success.withValues(alpha: 0.3),
                          width: AppDimensions.borderWidthRegular,
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.check_circle_rounded,
                            size: AppDimensions.iconSmall,
                            color: AppColors.success,
                          ),
                          const SizedBox(width: AppDimensions.spacing4),
                          Text(
                            AppTranslations.get('active_project', locale: locale),
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: AppColors.success,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
              const SizedBox(height: AppDimensions.spacing10),
              Text(
                project.name,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              if (project.description != null && project.description!.isNotEmpty) ...[
                const SizedBox(height: AppDimensions.spacing4),
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
              const SizedBox(height: AppDimensions.spacing14),
              const Divider(height: 1),
              const SizedBox(height: AppDimensions.spacing10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(
                        Icons.group_outlined,
                        size: AppDimensions.iconMedium,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(width: AppDimensions.spacing4),
                      Text(
                        '${project.memberCount} ${AppTranslations.get("project_members", locale: locale)}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      const Icon(
                        Icons.calendar_today_outlined,
                        size: AppDimensions.iconSmall,
                        color: AppColors.textMuted,
                      ),
                      const SizedBox(width: AppDimensions.spacing4),
                      Text(
                        DateFormatter.formatShort(project.createdAt),
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
