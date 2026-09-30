import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/enums/issue_status.dart';
import '../../../../domain/entities/issue_entity.dart';

class BoardStatusGrid extends StatelessWidget {
  final IssueStatus selected;
  final String locale;
  final List<IssueEntity> issues;
  final ValueChanged<IssueStatus> onSelect;

  const BoardStatusGrid({
    super.key,
    required this.selected,
    required this.locale,
    required this.issues,
    required this.onSelect,
  });

  int _countForStatus(IssueStatus status) {
    if (status == IssueStatus.all) return issues.length;
    return issues.where((i) => status.matches(i.status)).length;
  }

  @override
  Widget build(BuildContext context) {
    final statuses = IssueStatus.values;

    return Container(
      color: AppColors.primary,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Text(
              locale == 'tr' ? 'DURUM FİLTRESİ' : 'STATUS FILTER',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: Colors.white70,
                letterSpacing: 1.2,
              ),
            ),
          ),
          // Row 1: All, Todo, InProgress (3 items)
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: statuses.take(3).map((s) => Expanded(child: _buildStatusCard(s))).toList(),
          ),
          const SizedBox(height: 10),
          // Row 2: InReview, Done (2 items centered with equal width)
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Expanded(child: _buildStatusCard(statuses[3])),
              Expanded(child: _buildStatusCard(statuses[4])),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatusCard(IssueStatus status) {
    final isSelected = selected == status;
    final count = _countForStatus(status);

    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onSelect(status);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.white.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? Colors.white : Colors.white.withValues(alpha: 0.2),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.15),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ]
              : [],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(
                    color: isSelected ? status.backgroundColor : Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    status.icon,
                    size: 16,
                    color: isSelected ? status.color : Colors.white,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: isSelected ? status.color.withValues(alpha: 0.1) : Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '$count',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: isSelected ? status.color : Colors.white,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              status.getLocalizedLabel(locale),
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: isSelected ? AppColors.textPrimary : Colors.white,
                height: 1.2,
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
