import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/enums/issue_status.dart';
import '../../../../domain/entities/issue_entity.dart';

class DashboardQuickStatsGrid extends StatelessWidget {
  final List<IssueEntity> issues;
  final String locale;

  const DashboardQuickStatsGrid({
    super.key,
    required this.issues,
    required this.locale,
  });

  @override
  Widget build(BuildContext context) {
    final todoCount = issues.where((i) => IssueStatus.todo.matches(i.status)).length;
    final inReviewCount = issues.where((i) => IssueStatus.inReview.matches(i.status)).length;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Row(
        children: [
          Expanded(
            child: _buildCard(
              icon: IssueStatus.todo.icon,
              label: IssueStatus.todo.getLocalizedLabel(locale),
              value: '$todoCount',
              color: IssueStatus.todo.color,
              bg: IssueStatus.todo.backgroundColor,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildCard(
              icon: IssueStatus.inReview.icon,
              label: IssueStatus.inReview.getLocalizedLabel(locale),
              value: '$inReviewCount',
              color: IssueStatus.inReview.color,
              bg: IssueStatus.inReview.backgroundColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCard({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
    required Color bg,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: AppColors.textPrimary,
                    height: 1,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
