import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

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
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      TypeBadge(type: issue.type),
                      const SizedBox(width: 8),
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
              const SizedBox(height: 8),
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
                const SizedBox(height: 4),
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
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  PriorityBadge(priority: issue.priority),
                  Row(
                    children: [
                      if (issue.storyPoints != null) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.background,
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: AppColors.divider),
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
                        const SizedBox(width: 8),
                      ],
                      if (issue.assigneeName != null) ...[
                        CircleAvatar(
                          radius: 12,
                          backgroundColor: AppColors.primaryLight,
                          child: Text(
                            issue.assigneeName![0].toUpperCase(),
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ] else ...[
                        const Icon(
                          Icons.account_circle_outlined,
                          size: 20,
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
    );
  }
}
