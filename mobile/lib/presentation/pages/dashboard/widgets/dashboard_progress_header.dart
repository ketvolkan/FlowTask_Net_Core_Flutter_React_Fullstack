import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/enums/issue_priority.dart';
import '../../../../core/enums/issue_status.dart';
import '../../../../domain/entities/issue_entity.dart';

class DashboardProgressHeader extends StatelessWidget {
  final List<IssueEntity> issues;
  final String locale;

  const DashboardProgressHeader({
    super.key,
    required this.issues,
    required this.locale,
  });

  @override
  Widget build(BuildContext context) {
    final total = issues.length;
    final inProgress = issues.where((i) => IssueStatus.inProgress.matches(i.status)).length;
    final done = issues.where((i) => IssueStatus.done.matches(i.status)).length;
    final urgent = issues.where((i) => IssuePriority.urgent.matches(i.priority)).length;

    final completion = total == 0 ? 0.0 : (done / total).clamp(0.0, 1.0);

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: AppColors.primaryGradient,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                locale == 'tr' ? 'Proje İlerlemesi' : 'Project Progress',
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                '${(completion * 100).toStringAsFixed(0)}%',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: completion,
              backgroundColor: Colors.white.withValues(alpha: 0.2),
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.success),
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              _miniStat(
                '$total',
                locale == 'tr' ? 'Toplam' : 'Total',
                Icons.task_alt_rounded,
                Colors.white,
              ),
              const SizedBox(width: 12),
              _miniStat(
                '$inProgress',
                locale == 'tr' ? 'Devam' : 'Active',
                Icons.pending_rounded,
                AppColors.statBlue,
              ),
              const SizedBox(width: 12),
              _miniStat(
                '$done',
                locale == 'tr' ? 'Bitti' : 'Done',
                Icons.check_circle_rounded,
                AppColors.statGreen,
              ),
              const SizedBox(width: 12),
              _miniStat(
                '$urgent',
                locale == 'tr' ? 'Acil' : 'Urgent',
                Icons.priority_high_rounded,
                AppColors.statRed,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _miniStat(String value, String label, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
        ),
        child: Column(
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                color: Colors.white,
              ),
            ),
            Text(
              label,
              style: const TextStyle(
                fontSize: 10,
                color: Colors.white60,
                fontWeight: FontWeight.w500,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
