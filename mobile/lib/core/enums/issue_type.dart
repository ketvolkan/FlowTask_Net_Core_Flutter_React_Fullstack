import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../localization/app_translations.dart';

enum IssueType {
  task,
  bug,
  story,
  epic;

  static IssueType fromString(String? value) {
    if (value == null || value.isEmpty) return IssueType.task;
    final normalized = value.toLowerCase().trim();
    switch (normalized) {
      case 'bug':
        return IssueType.bug;
      case 'story':
        return IssueType.story;
      case 'epic':
        return IssueType.epic;
      case 'task':
      default:
        return IssueType.task;
    }
  }

  String toApiValue() {
    switch (this) {
      case IssueType.task:
        return 'Task';
      case IssueType.bug:
        return 'Bug';
      case IssueType.story:
        return 'Story';
      case IssueType.epic:
        return 'Epic';
    }
  }

  String getLocalizedLabel(String locale) {
    switch (this) {
      case IssueType.task:
        return AppTranslations.get('type_task', locale: locale);
      case IssueType.bug:
        return AppTranslations.get('type_bug', locale: locale);
      case IssueType.story:
        return AppTranslations.get('type_story', locale: locale);
      case IssueType.epic:
        return AppTranslations.get('type_epic', locale: locale);
    }
  }

  Color get color {
    switch (this) {
      case IssueType.task:
        return AppColors.typeTask;
      case IssueType.bug:
        return AppColors.typeBug;
      case IssueType.story:
        return AppColors.typeStory;
      case IssueType.epic:
        return AppColors.typeEpic;
    }
  }

  Color get backgroundColor {
    switch (this) {
      case IssueType.task:
        return AppColors.typeTaskBg;
      case IssueType.bug:
        return AppColors.typeBugBg;
      case IssueType.story:
        return AppColors.typeStoryBg;
      case IssueType.epic:
        return AppColors.typeEpicBg;
    }
  }

  IconData get icon {
    switch (this) {
      case IssueType.task:
        return Icons.check_box_outlined;
      case IssueType.bug:
        return Icons.bug_report_rounded;
      case IssueType.story:
        return Icons.bookmark_rounded;
      case IssueType.epic:
        return Icons.bolt_rounded;
    }
  }
}
