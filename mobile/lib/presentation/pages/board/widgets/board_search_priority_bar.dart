import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/enums/issue_priority.dart';
import '../../../../core/localization/app_translations.dart';

class BoardSearchPriorityBar extends StatelessWidget {
  final String locale;
  final String searchQuery;
  final IssuePriority selectedPriority;
  final ValueChanged<String> onSearch;
  final ValueChanged<IssuePriority> onPrioritySelect;

  const BoardSearchPriorityBar({
    super.key,
    required this.locale,
    required this.searchQuery,
    required this.selectedPriority,
    required this.onSearch,
    required this.onPrioritySelect,
  });

  @override
  Widget build(BuildContext context) {
    final isFiltered = selectedPriority != IssuePriority.all;

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
      child: Row(
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.divider),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: TextField(
                decoration: InputDecoration(
                  hintText: AppTranslations.get('board_search_placeholder', locale: locale),
                  hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                  prefixIcon: const Icon(Icons.search_rounded, size: 18, color: AppColors.textSecondary),
                  contentPadding: const EdgeInsets.symmetric(vertical: 10),
                  isDense: true,
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                ),
                onChanged: (v) => onSearch(v.trim().toLowerCase()),
              ),
            ),
          ),
          const SizedBox(width: 10),
          GestureDetector(
            onTap: () => _showPrioritySheet(context),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: isFiltered ? selectedPriority.backgroundColor : Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isFiltered ? selectedPriority.color : AppColors.divider,
                  width: isFiltered ? 1.5 : 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    selectedPriority.icon,
                    size: 16,
                    color: isFiltered ? selectedPriority.color : AppColors.textSecondary,
                  ),
                  const SizedBox(width: 5),
                  Text(
                    selectedPriority.getLocalizedLabel(locale),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: isFiltered ? selectedPriority.color : AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showPrioritySheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.divider,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              locale == 'tr' ? 'Öncelik Filtresi' : 'Priority Filter',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: IssuePriority.values.map((p) {
                final isSelected = selectedPriority == p;
                return GestureDetector(
                  onTap: () {
                    Navigator.pop(ctx);
                    onPrioritySelect(p);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: isSelected ? p.backgroundColor : AppColors.background,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected ? p.color : AppColors.divider,
                        width: isSelected ? 1.5 : 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(p.icon, size: 16, color: isSelected ? p.color : AppColors.textMuted),
                        const SizedBox(width: 6),
                        Text(
                          p.getLocalizedLabel(locale),
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: isSelected ? p.color : AppColors.textSecondary,
                          ),
                        ),
                        if (isSelected) ...[
                          const SizedBox(width: 6),
                          Icon(Icons.check_rounded, size: 14, color: p.color),
                        ],
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
            SizedBox(height: MediaQuery.of(context).padding.bottom),
          ],
        ),
      ),
    );
  }
}
