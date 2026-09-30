import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../../../domain/entities/issue_entity.dart';
import '../../../widgets/priority_badge.dart';

class IssueMetaCard extends StatelessWidget {
  final IssueEntity issue;
  final String locale;

  const IssueMetaCard({
    super.key,
    required this.issue,
    required this.locale,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      elevation: 0.5,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _buildDetailRow(
              icon: Icons.person_outline_rounded,
              label: AppTranslations.get('task_assignee', locale: locale),
              value: (issue.assigneeName != null && issue.assigneeName!.isNotEmpty)
                  ? issue.assigneeName!
                  : AppTranslations.get('task_unassigned', locale: locale),
            ),
            const Divider(height: 16),
            _buildDetailRow(
              icon: Icons.flag_outlined,
              label: AppTranslations.get('task_priority', locale: locale),
              customValue: PriorityBadge(priority: issue.priority, locale: locale),
            ),
            if (issue.storyPoints != null) ...[
              const Divider(height: 16),
              _buildDetailRow(
                icon: Icons.speed_rounded,
                label: AppTranslations.get('task_story_points', locale: locale),
                value: '${issue.storyPoints} pts',
              ),
            ],
            const Divider(height: 16),
            _buildDetailRow(
              icon: Icons.calendar_today_outlined,
              label: AppTranslations.get('task_created_at', locale: locale),
              value: DateFormatter.formatRelative(issue.createdAt, locale: locale),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow({
    required IconData icon,
    required String label,
    String? value,
    Widget? customValue,
  }) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.textSecondary),
        const SizedBox(width: 10),
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w500,
          ),
        ),
        const Spacer(),
        if (customValue != null)
          customValue
        else
          Text(
            value ?? '-',
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
      ],
    );
  }
}
