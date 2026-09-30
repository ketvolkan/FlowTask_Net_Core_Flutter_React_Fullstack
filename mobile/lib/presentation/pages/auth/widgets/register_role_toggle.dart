import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/localization/app_translations.dart';

class RegisterRoleToggle extends StatelessWidget {
  final String registerType;
  final String locale;
  final ValueChanged<String> onRoleChanged;

  const RegisterRoleToggle({
    super.key,
    required this.registerType,
    required this.locale,
    required this.onRoleChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.spacing4),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: AppDimensions.borderRadius14,
        border: Border.all(color: AppColors.divider, width: AppDimensions.borderWidthRegular),
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildItem(
              type: 'employee',
              icon: Icons.person_outline_rounded,
              label: AppTranslations.get('role_member', locale: locale),
            ),
          ),
          Expanded(
            child: _buildItem(
              type: 'company',
              icon: Icons.business_outlined,
              label: AppTranslations.get('role_manager', locale: locale),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildItem({
    required String type,
    required IconData icon,
    required String label,
  }) {
    final isSelected = registerType == type;

    return GestureDetector(
      onTap: () => onRoleChanged(type),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: AppDimensions.spacing10),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: AppDimensions.borderRadius10,
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.shadow.withValues(alpha: 0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: AppDimensions.iconMedium,
              color: isSelected ? AppColors.primary : AppColors.textSecondary,
            ),
            const SizedBox(width: AppDimensions.spacing6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
