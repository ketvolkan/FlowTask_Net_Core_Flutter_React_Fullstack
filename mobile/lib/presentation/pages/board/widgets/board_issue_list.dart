import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/enums/issue_status.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../domain/entities/issue_entity.dart';
import '../../../widgets/empty_state_widget.dart';
import '../../../widgets/issue_card_widget.dart';
import '../../issue_detail_page.dart';

class BoardIssueSectionHeader extends StatelessWidget {
  final List<IssueEntity> filteredIssues;
  final IssueStatus selectedStatus;
  final String locale;

  const BoardIssueSectionHeader({
    super.key,
    required this.filteredIssues,
    required this.selectedStatus,
    required this.locale,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: selectedStatus.backgroundColor,
            borderRadius: BorderRadius.circular(6),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(selectedStatus.icon, size: 13, color: selectedStatus.color),
              const SizedBox(width: 4),
              Text(
                selectedStatus.getLocalizedLabel(locale),
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: selectedStatus.color,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        Text(
          '${filteredIssues.length} ${locale == "tr" ? "görev" : "tasks"}',
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.textMuted,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

class BoardIssueList extends StatelessWidget {
  final List<IssueEntity> filteredIssues;
  final String locale;

  const BoardIssueList({
    super.key,
    required this.filteredIssues,
    required this.locale,
  });

  @override
  Widget build(BuildContext context) {
    if (filteredIssues.isEmpty) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.only(top: 32),
          child: EmptyStateWidget(
            icon: Icons.task_alt_rounded,
            title: AppTranslations.get('no_tasks_title', locale: locale),
            description: AppTranslations.get('no_tasks_desc', locale: locale),
          ),
        ),
      );
    }

    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, index) {
          final issue = filteredIssues[index];
          return IssueCardWidget(
            issue: issue,
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => IssueDetailPage(issue: issue),
                ),
              );
            },
          );
        },
        childCount: filteredIssues.length,
      ),
    );
  }
}
