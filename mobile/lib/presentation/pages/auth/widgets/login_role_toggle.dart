import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/localization/app_translations.dart';

class LoginRoleToggle extends StatelessWidget {
  final String selectedRoleType;
  final String locale;
  final ValueChanged<String> onRoleSelected;

  const LoginRoleToggle({
    super.key,
    required this.selectedRoleType,
    required this.locale,
    required this.onRoleSelected,
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
            child: _buildRoleButton(
              roleKey: 'manager',
              icon: Icons.admin_panel_settings_outlined,
              label: AppTranslations.get('role_manager', locale: locale),
            ),
          ),
          Expanded(
            child: _buildRoleButton(
              roleKey: 'employee',
              icon: Icons.person_outline_rounded,
              label: AppTranslations.get('role_member', locale: locale),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleButton({
    required String roleKey,
    required IconData icon,
    required String label,
  }) {
    final isSelected = selectedRoleType == roleKey;

    return GestureDetector(
      onTap: () => onRoleSelected(roleKey),
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
