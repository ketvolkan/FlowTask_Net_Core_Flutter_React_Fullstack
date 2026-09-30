import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../localization/app_translations.dart';

enum IssueStatus {
  all,
  todo,
  inProgress,
  inReview,
  done;

  static IssueStatus fromString(String? value) {
    if (value == null || value.isEmpty) return IssueStatus.todo;
    final normalized = value.toLowerCase().replaceAll('_', '').replaceAll(' ', '');
    switch (normalized) {
      case 'all':
        return IssueStatus.all;
      case 'todo':
      case 'backlog':
        return IssueStatus.todo;
      case 'inprogress':
      case 'active':
        return IssueStatus.inProgress;
      case 'inreview':
      case 'review':
        return IssueStatus.inReview;
      case 'done':
      case 'completed':
        return IssueStatus.done;
      default:
        return IssueStatus.todo;
    }
  }

  String toApiValue() {
    switch (this) {
      case IssueStatus.all:
        return 'All';
      case IssueStatus.todo:
        return 'Todo';
      case IssueStatus.inProgress:
        return 'InProgress';
      case IssueStatus.inReview:
        return 'InReview';
      case IssueStatus.done:
        return 'Done';
    }
  }

  String getLocalizedLabel(String locale) {
    switch (this) {
      case IssueStatus.all:
        return AppTranslations.get('status_all', locale: locale);
      case IssueStatus.todo:
        return AppTranslations.get('status_todo', locale: locale);
      case IssueStatus.inProgress:
        return AppTranslations.get('status_inprogress', locale: locale);
      case IssueStatus.inReview:
        return AppTranslations.get('status_inreview', locale: locale);
      case IssueStatus.done:
        return AppTranslations.get('status_done', locale: locale);
    }
  }

  Color get color {
    switch (this) {
      case IssueStatus.all:
        return AppColors.statusAll;
      case IssueStatus.todo:
        return AppColors.statusTodo;
      case IssueStatus.inProgress:
        return AppColors.statusInProgress;
      case IssueStatus.inReview:
        return AppColors.statusInReview;
      case IssueStatus.done:
        return AppColors.statusDone;
    }
  }

  Color get backgroundColor {
    switch (this) {
      case IssueStatus.all:
        return AppColors.statusAllBg;
      case IssueStatus.todo:
        return AppColors.statusTodoBg;
      case IssueStatus.inProgress:
        return AppColors.statusInProgressBg;
      case IssueStatus.inReview:
        return AppColors.statusInReviewBg;
      case IssueStatus.done:
        return AppColors.statusDoneBg;
    }
  }

  IconData get icon {
    switch (this) {
      case IssueStatus.all:
        return Icons.grid_view_rounded;
      case IssueStatus.todo:
        return Icons.radio_button_unchecked_rounded;
      case IssueStatus.inProgress:
        return Icons.pending_rounded;
      case IssueStatus.inReview:
        return Icons.rate_review_rounded;
      case IssueStatus.done:
        return Icons.check_circle_rounded;
    }
  }

  bool matches(String rawStatus) {
    if (this == IssueStatus.all) return true;
    return IssueStatus.fromString(rawStatus) == this;
  }
}
