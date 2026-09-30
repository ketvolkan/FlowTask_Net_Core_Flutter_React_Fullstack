import 'package:flutter/material.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/enums/issue_priority.dart';

class PriorityBadge extends StatelessWidget {
  final String priority;
  final String? locale;

  const PriorityBadge({
    super.key,
    required this.priority,
    this.locale,
  });

  @override
  Widget build(BuildContext context) {
    final issuePriority = IssuePriority.fromString(priority);
    final activeLocale = locale ?? 'tr';
    final label = issuePriority.getLocalizedLabel(activeLocale);

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.spacing8,
        vertical: AppDimensions.spacing4,
      ),
      decoration: BoxDecoration(
        color: issuePriority.backgroundColor,
        borderRadius: AppDimensions.borderRadius6,
        border: Border.all(
          color: issuePriority.color.withValues(alpha: 0.25),
          width: AppDimensions.borderWidthRegular,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(issuePriority.icon, size: AppDimensions.iconExtraSmall, color: issuePriority.color),
          const SizedBox(width: AppDimensions.spacing4),
          Text(
            label,
            style: TextStyle(
              color: issuePriority.color,
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
