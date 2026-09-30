import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/enums/issue_priority.dart';
import '../../domain/entities/issue_entity.dart';
import 'priority_badge.dart';
import 'status_badge.dart';
import 'type_badge.dart';

class IssueCardWidget extends StatelessWidget {
  final IssueEntity issue;
  final VoidCallback? onTap;

  const IssueCardWidget({
    super.key,
    required this.issue,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final priorityColor = IssuePriority.fromString(issue.priority).color;

    return Card(
      margin: const EdgeInsets.only(bottom: AppDimensions.spacing10),
      child: InkWell(
        onTap: onTap,
        borderRadius: AppDimensions.borderRadius14,
        child: ClipRRect(
          borderRadius: AppDimensions.borderRadius14,
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  width: AppDimensions.borderWidthStrip,
                  color: priorityColor.withValues(alpha: 0.8),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(AppDimensions.spacing14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                TypeBadge(type: issue.type),
                                const SizedBox(width: AppDimensions.spacing8),
                                Text(
                                  issue.issueKey,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                            StatusBadge(status: issue.status),
                          ],
                        ),
                        const SizedBox(height: AppDimensions.spacing8),
                        Text(
                          issue.title,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (issue.description != null && issue.description!.isNotEmpty) ...[
                          const SizedBox(height: AppDimensions.spacing4),
                          Text(
                            issue.description!,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                        const SizedBox(height: AppDimensions.spacing12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            PriorityBadge(priority: issue.priority),
                            Row(
                              children: [
                                if (issue.storyPoints != null) ...[
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: AppDimensions.spacing6,
                                      vertical: AppDimensions.spacing2,
                                    ),
                                    decoration: BoxDecoration(
                                      color: AppColors.background,
                                      borderRadius: AppDimensions.borderRadius4,
                                      border: Border.all(
                                        color: AppColors.divider,
                                        width: AppDimensions.borderWidthRegular,
                                      ),
                                    ),
                                    child: Text(
                                      '${issue.storyPoints} pts',
                                      style: const TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: AppDimensions.spacing8),
                                ],
                                if (issue.assigneeName != null && issue.assigneeName!.trim().isNotEmpty) ...[
                                  CircleAvatar(
                                    radius: AppDimensions.spacing14 - 1,
                                    backgroundColor: AppColors.primaryLight,
                                    child: Text(
                                      issue.assigneeName!.trim()[0].toUpperCase(),
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                  ),
                                ] else ...[
                                  const Icon(
                                    Icons.account_circle_outlined,
                                    size: AppDimensions.iconLarge,
                                    color: AppColors.textMuted,
                                  ),
                                ],
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
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
