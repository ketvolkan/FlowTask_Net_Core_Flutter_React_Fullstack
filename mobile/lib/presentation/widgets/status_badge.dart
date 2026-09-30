import 'package:flutter/material.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/enums/issue_status.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final String? locale;

  const StatusBadge({
    super.key,
    required this.status,
    this.locale,
  });

  @override
  Widget build(BuildContext context) {
    final issueStatus = IssueStatus.fromString(status);
    final activeLocale = locale ?? 'tr';
    final label = issueStatus.getLocalizedLabel(activeLocale);

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.spacing8,
        vertical: AppDimensions.spacing4,
      ),
      decoration: BoxDecoration(
        color: issueStatus.backgroundColor,
        borderRadius: AppDimensions.borderRadius6,
        border: Border.all(
          color: issueStatus.color.withValues(alpha: 0.25),
          width: AppDimensions.borderWidthRegular,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(issueStatus.icon, size: AppDimensions.iconExtraSmall, color: issueStatus.color),
          const SizedBox(width: AppDimensions.spacing4),
          Text(
            label,
            style: TextStyle(
              color: issueStatus.color,
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
