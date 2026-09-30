import 'package:flutter/material.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/enums/issue_type.dart';

class TypeBadge extends StatelessWidget {
  final String type;
  final String? locale;

  const TypeBadge({
    super.key,
    required this.type,
    this.locale,
  });

  @override
  Widget build(BuildContext context) {
    final issueType = IssueType.fromString(type);
    final activeLocale = locale ?? 'tr';
    final label = issueType.getLocalizedLabel(activeLocale);

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.paddingSm,
        vertical: AppDimensions.paddingXs,
      ),
      decoration: BoxDecoration(
        color: issueType.backgroundColor,
        borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
        border: Border.all(
          color: issueType.color.withValues(alpha: 0.25),
          width: AppDimensions.borderWidthThin,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            issueType.icon,
            size: AppDimensions.iconXs,
            color: issueType.color,
          ),
          const SizedBox(width: AppDimensions.paddingXs),
          Text(
            label,
            style: TextStyle(
              color: issueType.color,
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
