import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/companies.dart';
import '../../../../core/localization/app_translations.dart';

class RegisterCompanyDropdown extends StatelessWidget {
  final String selectedCompanyId;
  final String locale;
  final ValueChanged<String> onCompanyChanged;

  const RegisterCompanyDropdown({
    super.key,
    required this.selectedCompanyId,
    required this.locale,
    required this.onCompanyChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          AppTranslations.get('company_name', locale: locale),
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: AppDimensions.spacing6),
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppDimensions.spacing12,
            vertical: AppDimensions.spacing2,
          ),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: AppDimensions.borderRadius10,
            border: Border.all(color: AppColors.divider, width: AppDimensions.borderWidthRegular),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              key: ValueKey(selectedCompanyId),
              value: selectedCompanyId,
              isExpanded: true,
              isDense: true,
              dropdownColor: AppColors.surface,
              icon: const Icon(
                Icons.keyboard_arrow_down_rounded,
                color: AppColors.textSecondary,
              ),
              items: AppCompanies.list.map((c) {
                final color = Color(int.parse(c.color.replaceFirst('#', 'FF'), radix: 16));
                return DropdownMenuItem<String>(
                  value: c.id,
                  child: Row(
                    children: [
                      Container(
                        width: AppDimensions.spacing20,
                        height: AppDimensions.spacing20,
                        decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.15),
                          borderRadius: AppDimensions.borderRadius4,
                        ),
                        child: Center(
                          child: Text(
                            c.code,
                            style: TextStyle(
                              fontSize: 8,
                              fontWeight: FontWeight.w900,
                              color: color,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: AppDimensions.spacing8),
                      Expanded(
                        child: Text(
                          c.name,
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w500,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
              onChanged: (val) {
                if (val != null) onCompanyChanged(val);
              },
            ),
          ),
        ),
      ],
    );
  }
}
