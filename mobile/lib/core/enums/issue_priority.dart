import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../localization/app_translations.dart';

enum IssuePriority {
  all,
  low,
  medium,
  high,
  urgent;

  static IssuePriority fromString(String? value) {
    if (value == null || value.isEmpty) return IssuePriority.medium;
    final normalized = value.toLowerCase().trim();
    switch (normalized) {
      case 'all':
        return IssuePriority.all;
      case 'low':
        return IssuePriority.low;
      case 'medium':
        return IssuePriority.medium;
      case 'high':
        return IssuePriority.high;
      case 'urgent':
      case 'critical':
        return IssuePriority.urgent;
      default:
        return IssuePriority.medium;
    }
  }

  String toApiValue() {
    switch (this) {
      case IssuePriority.all:
        return 'All';
      case IssuePriority.low:
        return 'Low';
      case IssuePriority.medium:
        return 'Medium';
      case IssuePriority.high:
        return 'High';
      case IssuePriority.urgent:
        return 'Urgent';
    }
  }

  String getLocalizedLabel(String locale) {
    switch (this) {
      case IssuePriority.all:
        return locale == 'tr' ? 'Tümü' : 'All';
      case IssuePriority.low:
        return AppTranslations.get('priority_low', locale: locale);
      case IssuePriority.medium:
        return AppTranslations.get('priority_medium', locale: locale);
      case IssuePriority.high:
        return AppTranslations.get('priority_high', locale: locale);
      case IssuePriority.urgent:
        return AppTranslations.get('priority_urgent', locale: locale);
    }
  }

  Color get color {
    switch (this) {
      case IssuePriority.all:
        return AppColors.textSecondary;
      case IssuePriority.low:
        return AppColors.priorityLow;
      case IssuePriority.medium:
        return AppColors.priorityMedium;
      case IssuePriority.high:
        return AppColors.priorityHigh;
      case IssuePriority.urgent:
        return AppColors.priorityUrgent;
    }
  }

  Color get backgroundColor {
    switch (this) {
      case IssuePriority.all:
        return AppColors.background;
      case IssuePriority.low:
        return AppColors.priorityLowBg;
      case IssuePriority.medium:
        return AppColors.priorityMediumBg;
      case IssuePriority.high:
        return AppColors.priorityHighBg;
      case IssuePriority.urgent:
        return AppColors.priorityUrgentBg;
    }
  }

  IconData get icon {
    switch (this) {
      case IssuePriority.all:
        return Icons.filter_list_rounded;
      case IssuePriority.low:
        return Icons.keyboard_arrow_down_rounded;
      case IssuePriority.medium:
        return Icons.drag_handle_rounded;
      case IssuePriority.high:
        return Icons.keyboard_arrow_up_rounded;
      case IssuePriority.urgent:
        return Icons.priority_high_rounded;
    }
  }

  bool matches(String rawPriority) {
    if (this == IssuePriority.all) return true;
    return IssuePriority.fromString(rawPriority) == this;
  }
}
